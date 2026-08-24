-- ==============================================================================
-- Supabase / PostgreSQL Schema: Personal Live Dashboard
-- Table: daily_market_snapshots
-- Standard: Asia/Seoul (KST) date anchoring with idempotent composite unique key
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.daily_market_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,                                       -- Anchored strictly to Asia/Seoul (YYYY-MM-DD)
    data_type VARCHAR(64) NOT NULL,                           -- e.g. 'fear_and_greed', 'sp500', 'qqq'
    score NUMERIC(12, 2) NOT NULL,                            -- Exact decimal score / price
    rating VARCHAR(32),                                       -- e.g. 'extreme_fear', 'fear', 'neutral', 'greed', 'extreme_greed'
    unit VARCHAR(32) NOT NULL DEFAULT '0-100 scale',          -- e.g. '0-100 scale', 'pts', 'USD'
    raw_timestamp TIMESTAMPTZ,                                -- Original timestamp from raw source payload
    source_name VARCHAR(128) NOT NULL,                        -- e.g. 'CNN Business Markets'
    raw_payload JSONB,                                        -- Complete raw JSON response for 100% data audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    -- Card 4 Deduplication Constraint: Idempotent upsert target
    CONSTRAINT uq_daily_snapshot UNIQUE (date, data_type)
);

-- Indices for rapid querying & descending date history scans
CREATE INDEX IF NOT EXISTS idx_snapshots_date_type 
    ON public.daily_market_snapshots (data_type, date DESC);

-- Enable Row-Level Security (RLS)
ALTER TABLE public.daily_market_snapshots ENABLE ROW LEVEL SECURITY;

-- Policy 1: Zero-Secret Public Read Access (Anon / Public Client)
CREATE POLICY "Allow public read access on daily snapshots"
    ON public.daily_market_snapshots
    FOR SELECT
    TO public
    USING (true);

-- Policy 2: Service Role / Authenticated Ingestion Writes
CREATE POLICY "Allow service role upsert on daily snapshots"
    ON public.daily_market_snapshots
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Auto-update updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS tr_daily_snapshots_updated_at ON public.daily_market_snapshots;
CREATE TRIGGER tr_daily_snapshots_updated_at
    BEFORE UPDATE ON public.daily_market_snapshots
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
