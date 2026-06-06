-- Enable trigram extension for fuzzy/morphology-friendly search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN indexes for fast trigram lookups on searchable text columns
CREATE INDEX IF NOT EXISTS materials_title_trgm
  ON materials USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS materials_short_desc_trgm
  ON materials USING GIN ("shortDescription" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS materials_full_text_trgm
  ON materials USING GIN ("fullText" gin_trgm_ops);

-- Indexes on name columns in related tables (also searched)
CREATE INDEX IF NOT EXISTS regions_name_trgm
  ON regions USING GIN (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS peoples_name_trgm
  ON peoples USING GIN (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS genres_name_trgm
  ON genres USING GIN (name gin_trgm_ops);
