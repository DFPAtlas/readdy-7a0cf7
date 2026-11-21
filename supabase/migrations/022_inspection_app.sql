-- 022: fields the inspection app needs to save a full inspection.
--
-- inspection_rooms gains its checklist (pass/fail/N/A per item, with notes)
-- and a display order; inspections gain the overall rating, the start time
-- and the inspector's signature. inspection_photos gains the time the photo
-- was taken, and deleting a room now removes its photo rows with it (the
-- inspection itself already cascaded).
--
-- Non-destructive: only adds columns, indexes and a CHECK, and recreates one
-- foreign key with ON DELETE CASCADE. Existing rows keep their data.

ALTER TABLE public.inspection_rooms
  ADD COLUMN IF NOT EXISTS checklist jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS template_id text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.inspections
  ADD COLUMN IF NOT EXISTS overall_rating text,
  ADD COLUMN IF NOT EXISTS started_at timestamptz,
  ADD COLUMN IF NOT EXISTS signature_path text,
  ADD COLUMN IF NOT EXISTS signed_by_name text,
  ADD COLUMN IF NOT EXISTS signed_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inspections_overall_rating_check') THEN
    ALTER TABLE public.inspections
      ADD CONSTRAINT inspections_overall_rating_check
      CHECK (overall_rating IS NULL OR overall_rating IN ('Excellent', 'Good', 'Fair', 'Poor'));
  END IF;
END $$;

ALTER TABLE public.inspection_photos
  ADD COLUMN IF NOT EXISTS taken_at timestamptz;

ALTER TABLE public.inspection_photos DROP CONSTRAINT IF EXISTS inspection_photos_room_id_fkey;
ALTER TABLE public.inspection_photos
  ADD CONSTRAINT inspection_photos_room_id_fkey
  FOREIGN KEY (room_id) REFERENCES public.inspection_rooms(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS inspection_rooms_inspection_id_idx ON public.inspection_rooms (inspection_id, sort_order);
CREATE INDEX IF NOT EXISTS inspection_photos_inspection_id_idx ON public.inspection_photos (inspection_id);
CREATE INDEX IF NOT EXISTS inspection_photos_room_id_idx ON public.inspection_photos (room_id);
