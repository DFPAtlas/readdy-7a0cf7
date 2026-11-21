-- 020: shared rate limiter for public Edge Functions.
--
-- Edge Functions run on many instances, so in-memory counters don't work.
-- consume_rate_limit() counts hits per key in fixed windows and returns true
-- while the caller is under the limit. Only the service role (Edge Functions)
-- may call it; the table has RLS on and no policies, so clients can't read it.
--
-- Non-destructive: creates one table and one function.

CREATE TABLE IF NOT EXISTS public.rate_limit_buckets (
  bucket_key text NOT NULL,
  window_start timestamptz NOT NULL,
  hits integer NOT NULL DEFAULT 0,
  PRIMARY KEY (bucket_key, window_start)
);

ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.rate_limit_buckets FROM anon, authenticated;

CREATE INDEX IF NOT EXISTS rate_limit_buckets_window_start_idx ON public.rate_limit_buckets (window_start);

CREATE OR REPLACE FUNCTION public.consume_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window timestamptz;
  v_hits integer;
BEGIN
  IF p_key IS NULL OR p_limit < 1 OR p_window_seconds < 1 THEN
    RAISE EXCEPTION 'invalid rate limit arguments';
  END IF;

  v_window := to_timestamp(floor(extract(epoch FROM now()) / p_window_seconds) * p_window_seconds);

  INSERT INTO public.rate_limit_buckets (bucket_key, window_start, hits)
  VALUES (left(p_key, 200), v_window, 1)
  ON CONFLICT (bucket_key, window_start)
  DO UPDATE SET hits = public.rate_limit_buckets.hits + 1
  RETURNING hits INTO v_hits;

  -- Occasional housekeeping keeps the table small without a cron job.
  IF random() < 0.02 THEN
    DELETE FROM public.rate_limit_buckets WHERE window_start < now() - interval '1 day';
  END IF;

  RETURN v_hits <= p_limit;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.consume_rate_limit(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(text, integer, integer) TO service_role;
