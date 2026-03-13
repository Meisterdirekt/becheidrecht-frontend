/**
 * Shared Interfaces für das Multi-Agent-System (AG01–AG18)
 */

// ---------------------------------------------------------------------------
// Agent IDs
// ---------------------------------------------------------------------------

export type AgentId =
  | "AG01" // Orchestrator
  | "AG02" // Analyst
  | "AG03" // Kritiker
  | "AG04" // Rechts-Rechercheur
  | "AG05" // Wissens-Verwalter
  | "AG06" // Prompt-Optimierer
  | "AG07" // Musterschreiben
  | "AG08" // Security Gate
  | "AG09" // Frontend-Agent
  | "AG10" // Backend-Agent
  | "AG11" // DevOps-Agent
  | "AG12" // Dokumenten-Prozessor
  | "AG13" // Nutzer-Erklärer
  | "AG14" // Präzedenzfall-Analyzer
  | "AG15" // Rechts-Monitor (monatlicher Cron)
  | "AG16" // Vercel-Ops-Agent (täglich 06:00 UTC)
  | "AG17" // Agent-Auditor (mittwochs 05:00 UTC)
  | "AG18" // Content-Auditor (15. des Monats, 01:00 UTC)
  | "AG19"; // Design-Guardian (donnerstags 05:00 UTC)

export type RoutingStufe = "NORMAL" | "HOCH" | "NOTFALL";

// ---------------------------------------------------------------------------
// Token & Kosten
// ---------------------------------------------------------------------------

export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
  cache_read_tokens: number;
  cache_creation_tokens: number;
}

export function emptyTokenUsage(): TokenUsage {
  return { input_tokens: 0, output_tokens: 0, cache_read_tokens: 0, cache_creation_tokens: 0 };
}

export function mergeTokenUsage(a: TokenUsage, b: TokenUsage): TokenUsage {
  return {
    input_tokens: a.input_tokens + b.input_tokens,
    output_tokens: a.output_tokens + b.output_tokens,
    cache_read_tokens: a.cache_read_tokens + b.cache_read_tokens,
    cache_creation_tokens: a.cache_creation_tokens + b.cache_creation_tokens,
  };
}

// ---------------------------------------------------------------------------
// Agent Context (Input für jeden Agent)
// ---------------------------------------------------------------------------

export interface AgentContext {
  /** Pseudonymisierter Dokument-Text */
  documentText: string;
  /** Vorab erkannte Routing-Stufe (aus detectUrgency) */
  routingStufe: RoutingStufe;
  /** Vorab erkannte Frist-Tage (null = nicht erkannt) */
  fristTage: number | null;
  /** Ergebnisse vorheriger Agenten — Pipeline-übergreifend */
  pipeline: PipelineState;
}

export interface PipelineState {
  /** AG08 Security Gate */
  security?: SecurityResult;
  /** AG12 Dokumentstruktur */
  dokumentstruktur?: DokumentstrukturResult;
  /** AG01 Triage */
  triage?: TriageResult;
  /** AG02 Analyse */
  analyse?: AnalyseResult;
  /** AG03 Kritik */
  kritik?: KritikResult;
  /** AG04 Recherche */
  recherche?: RechercheResult;
  /** AG07 Musterschreiben */
  musterschreiben?: MusterschreibenResult;
  /** AG13 Erklärung */
  erklaerung?: ErklaerungResult;
  /** AG14 Präzedenzfall-Analyse */
  praezedenz?: PraezedenzResult;
}

// ---------------------------------------------------------------------------
// Agent Result (Output pro Agent)
// ---------------------------------------------------------------------------

export interface AgentResult<T = unknown> {
  agentId: AgentId;
  success: boolean;
  data: T;
  tokens: TokenUsage;
  durationMs: number;
  error?: string;
  /** Konfidenzwert 0–1: Wie sicher ist der Agent in seinem Ergebnis */
  confidence?: number;
}

// ---------------------------------------------------------------------------
// Agent Interface
// ---------------------------------------------------------------------------

export interface Agent<T = unknown> {
  id: AgentId;
  name: string;
  model: (stufe: RoutingStufe) => string;
  execute: (ctx: AgentContext) => Promise<AgentResult<T>>;
}

// ---------------------------------------------------------------------------
// Spezifische Result-Types pro Agent
// ---------------------------------------------------------------------------

export interface SecurityResult {
  freigabe: boolean;
  grund?: string;
}

export interface DokumentstrukturResult {
  rubrum: string;
  begruendung: string;
  rechtsbehelfsbelehrung: string;
  volltext: string;
}

export interface TriageResult {
  behoerde: string;
  rechtsgebiet: string;
  untergebiet: string;
  bescheid_datum?: string;
  frist_datum?: string;
  frist_tage?: number;
  bg_nummer?: string;
  routing_stufe: RoutingStufe;
}

export interface AnalyseResult {
  fehler: FehlerItem[];
  auffaelligkeiten: string[];
}

export interface FehlerItem {
  id: string;
  titel: string;
  beschreibung: string;
  rechtsbasis?: string[];
  severity?: string;
  musterschreiben_hinweis?: string;
  prueflogik?: {
    bedingungen?: string[];
    suchbegriffe?: string[];
  };
}

export interface KritikResult {
  gegenargumente: string[];
  erfolgschance_prozent: number;
  schwachstellen: string[];
}

export interface RechercheResult {
  urteile: UrteilItem[];
  quellen: string[];
}

export interface UrteilItem {
  gericht: string;
  aktenzeichen: string;
  datum: string;
  leitsatz: string;
  relevanz: string;
  url?: string;
}

export interface MusterschreibenResult {
  volltext: string;
  auffaelligkeiten: string[];
  forderung: string;
}

export interface ErklaerungResult {
  klartext: string;
}

export interface MonitorResult {
  /** Neue Urteile in die DB eingefügt */
  urteile_neu: number;
  /** Kennzahlen die aktualisiert wurden (Regelbedarfe, Freibeträge etc.) */
  kennzahlen_geaendert: number;
  /** Neue Fehlertypen in behoerdenfehler-Tabelle eingefügt */
  fehler_hinzugefuegt: number;
  /** Neue Weisungen erkannt */
  weisungen_neu: number;
  /** Anzahl geprüfter Quellen */
  quellen_gecheckt: number;
  /** Quellen die nicht erreichbar waren */
  fehler_quellen: string[];
  /** Zusammenfassung des Laufs für Audit */
  zusammenfassung: string;
}

export interface PraezedenzResult {
  /** Anzahl ähnlicher Fälle in der Datenbank (gleiche Behörde + Rechtsgebiet) */
  aehnliche_faelle: number;
  /** Durchschnittliche Erfolgsquote ähnlicher Fälle (null wenn keine Daten) */
  erfolgsquote_prozent: number | null;
  /** Häufigste Fehler in ähnlichen Fällen */
  haeufigste_fehler: string[];
  /** Kontextueller Hinweis für AG07 + AG13 */
  hinweis: string;
}

// ---------------------------------------------------------------------------
// AG16 — Vercel-Ops-Agent Result
// ---------------------------------------------------------------------------

export interface VercelMonitorResult {
  /** Anzahl geprüfter Deployments */
  deployments_checked: number;
  /** Anzahl fehlgeschlagener Deployments (state=ERROR) */
  failed_deployments: number;
  /** Liste fehlender Required-Env-Vars */
  env_vars_missing: string[];
  /** URLs der erstellten GitHub Issues */
  issues_created: string[];
  /** Gesamtstatus: healthy | degraded | critical */
  health_status: "healthy" | "degraded" | "critical";
  /** Kurze Zusammenfassung des Laufs */
  summary: string;
}

// ---------------------------------------------------------------------------
// AG17 — Agent-Auditor Result
// ---------------------------------------------------------------------------

export interface AnomalyItem {
  agent_id: string;
  type: "success_rate" | "duration" | "cost" | "error_rate";
  severity: "warning" | "critical";
  value: number;
  threshold: number;
  message: string;
}

export interface AgentAuditResult {
  /** Analysedatensätze die ausgewertet wurden */
  analyses_checked: number;
  /** Anzahl auditierter Agenten */
  agents_audited: number;
  /** Gefundene Anomalien */
  anomalies: AnomalyItem[];
  /** URLs der erstellten GitHub Issues */
  issues_created: string[];
  /** Gesamtstatus: healthy | degraded | critical */
  health_status: "healthy" | "degraded" | "critical";
  /** Zusammenfassung des Audit-Reports */
  report: string;
}

// ---------------------------------------------------------------------------
// AG18 — Content-Auditor Result
// ---------------------------------------------------------------------------

export interface ContentAuditResult {
  kennzahlen_abweichungen: { schluessel: string; hardcoded_wert: number | string; db_wert: number | string | null; quelle: string; severity: string }[];
  veraltete_eintraege: { id: string; titel: string; problem: string; severity: string }[];
  weisungen_luecken: string[];
  internal_rules_abweichungen: { schluessel: string; hardcoded_wert: number | string; db_wert: number | string | null; quelle: string; severity: string }[];
  gesamt_status: "ok" | "warnung" | "kritisch";
  issues_created: string[];
  zusammenfassung: string;
}

// ---------------------------------------------------------------------------
// Erweitertes AgentAnalysisResult (rückwärtskompatibel)
// ---------------------------------------------------------------------------

export interface AgentAnalysisResult {
  zuordnung?: { behoerde: string; rechtsgebiet: string; untergebiet: string };
  fehler: string[];
  musterschreiben: string;
  frist_datum?: string;
  frist_tage?: number;
  routing_stufe: RoutingStufe;
  agenten_aktiv: string[];
  token_kosten_eur?: number;
  // Neue optionale Felder
  kritik?: KritikResult;
  recherche?: RechercheResult;
  erklaerung?: string;
  security_check?: SecurityResult;
  dokumentstruktur?: DokumentstrukturResult;
  agenten_details?: Record<string, { success: boolean; durationMs: number; error?: string }>;
  model_used?: string;
  praezedenz?: PraezedenzResult;
}
