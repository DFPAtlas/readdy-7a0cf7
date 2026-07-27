-- LetHub Security Containment Migration 003
-- Purpose: remove browser-side credential mutation and normalise legacy secrets.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Hash any legacy raw API keys or webhook secrets that were stored directly.
UPDATE api_keys
SET key_hash = encode(digest(key_hash, 'sha256'), 'hex')
WHERE key_hash IS NOT NULL
  AND key_hash !~ '^[0-9a-f]{64}$';

UPDATE webhook_endpoints
SET secret_hash = encode(digest(secret_hash, 'sha256'), 'hex')
WHERE secret_hash IS NOT NULL
  AND secret_hash !~ '^[0-9a-f]{64}$';

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;

-- Browser clients may read their agency metadata, but all credential creation,
-- revocation and webhook mutation now goes through api-security-admin.
DROP POLICY IF EXISTS "Allow insert on api_keys" ON api_keys;
DROP POLICY IF EXISTS "Allow update on api_keys" ON api_keys;
DROP POLICY IF EXISTS "Allow delete on api_keys" ON api_keys;
DROP POLICY IF EXISTS "api_keys_insert_own" ON api_keys;
DROP POLICY IF EXISTS "api_keys_update_own" ON api_keys;
DROP POLICY IF EXISTS "api_keys_delete_own" ON api_keys;

DROP POLICY IF EXISTS "Allow insert on webhook_endpoints" ON webhook_endpoints;
DROP POLICY IF EXISTS "Allow update on webhook_endpoints" ON webhook_endpoints;
DROP POLICY IF EXISTS "Allow delete on webhook_endpoints" ON webhook_endpoints;
DROP POLICY IF EXISTS "webhooks_insert_own" ON webhook_endpoints;
DROP POLICY IF EXISTS "webhooks_update_own" ON webhook_endpoints;
DROP POLICY IF EXISTS "webhooks_delete_own" ON webhook_endpoints;

-- Prevent accidental direct grants from bypassing the RLS-only mutation model.
REVOKE INSERT, UPDATE, DELETE ON api_keys FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON webhook_endpoints FROM authenticated;

-- Reject obvious SSRF targets. The webhook delivery worker must also resolve DNS
-- and reject private/reserved IP addresses immediately before making a request.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'webhook_endpoints_public_https_url'
  ) THEN
    ALTER TABLE webhook_endpoints
      ADD CONSTRAINT webhook_endpoints_public_https_url
      CHECK (
        url ~* '^https://'
        AND url !~* '^https://[^/]*@'
        AND url !~* '^https://(localhost|0\.0\.0\.0|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2[0-9]|3[01])\.|\[?::1\]?|[^/]+\.local([:/]|$))'
      ) NOT VALID;
  END IF;
END $$;

COMMENT ON COLUMN api_keys.key_hash IS
  'SHA-256 hash of the API key. The raw key is returned once by api-security-admin and is never stored.';
COMMENT ON COLUMN webhook_endpoints.secret_hash IS
  'SHA-256 hash of the webhook signing secret. The raw secret is returned once and is never stored.';
