/**
 * Auth-Guard-Tests — API-Route-Authentifizierung
 *
 * Testet dass alle geschützten API-Routen bei fehlendem/ungültigem
 * Auth-Header korrekt 401 zurückgeben.
 *
 * Mocking-Strategie:
 *   - @supabase/supabase-js wird gemockt → kein Netzwerk-Aufruf
 *   - Schwere Dependencies (pdf2json, openai, etc.) werden gemockt
 *   - vi.stubEnv() setzt Supabase-Env-Vars für den Auth-Helper-Test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks — müssen VOR Importen der Route-Handler stehen (Vitest-Hoisting)
// ---------------------------------------------------------------------------

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/logic/agent_engine', () => ({
  runAgentAnalysis: vi.fn(),
}));

vi.mock('@/lib/logic/engine', () => ({
  runForensicAnalysis: vi.fn(),
}));

vi.mock('@/lib/privacy/pseudonymizer', () => ({
  pseudonymizeText: vi.fn().mockReturnValue({ pseudonymized: '', map: {} }),
  depseudonymizeText: vi.fn().mockReturnValue(''),
}));

vi.mock('pdf2json', () => ({
  default: class PDFParser {
    on(_event: string, _cb: unknown) { return this; }
    parseBuffer(_buf: unknown) {}
  },
}));

vi.mock('openai', () => ({
  default: class OpenAI {
    chat = { completions: { create: vi.fn() } };
  },
}));

vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>();
  return {
    ...actual,
    default: {
      ...actual,
      readFileSync: vi.fn().mockImplementation(() => { throw new Error('vault not found'); }),
      existsSync: vi.fn().mockReturnValue(false),
    },
  };
});

// ---------------------------------------------------------------------------
// Imports nach den Mocks
// ---------------------------------------------------------------------------

import { createClient } from '@supabase/supabase-js';
import { POST as analyzePost } from '@/app/api/analyze/route';
import { GET as fristenGet } from '@/app/api/fristen/route';
import { POST as useAnalysisPost } from '@/app/api/use-analysis/route';
import { getAuthenticatedUser } from '@/lib/supabase/auth';

// ---------------------------------------------------------------------------
// Hilfsfunktionen
// ---------------------------------------------------------------------------

function makeRequest(url: string, options?: RequestInit): Request {
  return new Request(url, options);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Auth-Guard: API-Routen', () => {
  beforeEach(() => {
    // Supabase-Konfiguration muss vorhanden sein damit auth-Prüfung greift
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

    // createClient mock → gibt ungültige Antwort zurück (kein echter Netzwerkaufruf)
    (createClient as ReturnType<typeof vi.fn>).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: { message: 'unauthorized' } }),
      },
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  // Test 1
  it('/api/analyze POST ohne Auth-Header → 401', async () => {
    const req = makeRequest('http://localhost/api/analyze', { method: 'POST' });
    const res = await analyzePost(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  // Test 2
  it('/api/analyze POST mit leerem Bearer → 401', async () => {
    const req = makeRequest('http://localhost/api/analyze', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' },
    });
    const res = await analyzePost(req);
    expect(res.status).toBe(401);
  });

  // Test 3
  it('/api/fristen GET ohne Auth-Header → 401', async () => {
    const { NextRequest } = await import('next/server');
    const req = new NextRequest('http://localhost/api/fristen');
    const res = await fristenGet(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  // Test 4
  it('/api/use-analysis POST ohne Auth-Header → 401', async () => {
    const { NextRequest } = await import('next/server');
    const req = new NextRequest('http://localhost/api/use-analysis', { method: 'POST' });
    const res = await useAnalysisPost(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Unit-Test: Auth-Helper
// ---------------------------------------------------------------------------

describe('getAuthenticatedUser', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  // Test 5
  it('gültiger Token + User-Antwort → gibt { id, token } zurück', async () => {
    const mockGetUser = vi.fn().mockResolvedValue({
      data: { user: { id: 'user-abc-123' } },
      error: null,
    });
    (createClient as ReturnType<typeof vi.fn>).mockReturnValue({
      auth: { getUser: mockGetUser },
    });

    const req = makeRequest('http://localhost/api/test', {
      headers: { Authorization: 'Bearer valid-jwt-token' },
    });

    const result = await getAuthenticatedUser(req);

    expect(result).toEqual({ id: 'user-abc-123', token: 'valid-jwt-token' });
    expect(mockGetUser).toHaveBeenCalledOnce();
  });

  it('kein Auth-Header → null', async () => {
    const req = makeRequest('http://localhost/api/test');
    const result = await getAuthenticatedUser(req);
    expect(result).toBeNull();
  });

  it('ungültiger Token (Supabase gibt null user) → null', async () => {
    const mockGetUser = vi.fn().mockResolvedValue({
      data: { user: null },
      error: { message: 'invalid token' },
    });
    (createClient as ReturnType<typeof vi.fn>).mockReturnValue({
      auth: { getUser: mockGetUser },
    });

    const req = makeRequest('http://localhost/api/test', {
      headers: { Authorization: 'Bearer invalid-token' },
    });

    const result = await getAuthenticatedUser(req);
    expect(result).toBeNull();
  });

  it('fehlende Env-Vars → null (kein Supabase-Aufruf)', async () => {
    vi.unstubAllEnvs();
    // Keine Env-Vars gesetzt → url und anonKey leer

    const req = makeRequest('http://localhost/api/test', {
      headers: { Authorization: 'Bearer some-token' },
    });

    const result = await getAuthenticatedUser(req);
    expect(result).toBeNull();
    expect(createClient).not.toHaveBeenCalled();
  });
});
