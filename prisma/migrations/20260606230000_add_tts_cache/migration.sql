CREATE TABLE "tts_cache" (
  "id"        SERIAL NOT NULL,
  "textHash"  TEXT NOT NULL,
  "audio"     BYTEA NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tts_cache_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tts_cache_textHash_key" ON "tts_cache"("textHash");
