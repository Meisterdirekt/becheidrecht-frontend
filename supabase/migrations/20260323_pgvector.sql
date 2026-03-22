-- ============================================================================
-- pgvector — Semantische Suche fuer Urteile und Fehlerkatalog
-- Ermoeglicht Vector Similarity Search statt reinem Keyword-Matching
-- ============================================================================

-- Extension aktivieren (Supabase unterstuetzt pgvector nativ)
CREATE EXTENSION IF NOT EXISTS vector;

-- Embedding-Spalten hinzufuegen (OpenAI text-embedding-3-small = 1536 Dimensionen)
ALTER TABLE urteile ADD COLUMN IF NOT EXISTS embedding vector(1536);
ALTER TABLE behoerdenfehler ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- RPC-Funktion fuer Vector Similarity Search auf urteile
CREATE OR REPLACE FUNCTION match_urteile(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 5,
  filter_rechtsgebiet text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  gericht text,
  aktenzeichen text,
  entscheidungsdatum date,
  leitsatz text,
  volltext_url text,
  rechtsgebiet text,
  stichwort text[],
  relevanz_score int,
  similarity float
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.gericht,
    u.aktenzeichen,
    u.entscheidungsdatum,
    u.leitsatz,
    u.volltext_url,
    u.rechtsgebiet,
    u.stichwort,
    u.relevanz_score,
    (1 - (u.embedding <=> query_embedding))::float AS similarity
  FROM urteile u
  WHERE u.embedding IS NOT NULL
    AND (filter_rechtsgebiet IS NULL OR u.rechtsgebiet = filter_rechtsgebiet)
    AND (1 - (u.embedding <=> query_embedding)) > match_threshold
  ORDER BY u.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- HNSW-Index (statt IVFFlat — weniger Build-Memory, bessere Qualitaet auf Hobby-Plan)
-- Ausfuehren nach `npx tsx scripts/backfill-embeddings.ts`:
CREATE INDEX IF NOT EXISTS urteile_embedding_idx
  ON urteile USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
