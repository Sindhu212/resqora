-- ============================================================
--  RESQORA – LifeLine AI
--  schema.sql – Supabase (PostgreSQL) Database Schema
--
--  SETUP INSTRUCTIONS:
--  1. Create a new Supabase project at https://supabase.com
--  2. Open the SQL Editor in your Supabase dashboard
--  3. Paste and run this entire script
--  4. Copy your project URL and anon public key from
--     Settings → API into your frontend config block
--
--  SECURITY:
--  - Row Level Security (RLS) is enabled on all tables
--  - Only the anon key goes in frontend code
--  - The service_role key must NEVER be in frontend files
-- ============================================================

-- ── Enable UUID extension ──────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ══════════════════════════════════════════════════════════
--  USER ROLES  (extend auth.users metadata)
-- ══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id            UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  role          TEXT        NOT NULL DEFAULT 'citizen'
                            CHECK (role IN ('citizen','ambulance','hospital','admin')),
  ambulance_id  TEXT,       -- filled for ambulance role
  hospital_id   TEXT,       -- filled for hospital role
  contact       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════
--  HOSPITALS
-- ══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.hospitals (
  id                    TEXT        PRIMARY KEY,   -- e.g. HOSP-201
  name                  TEXT        NOT NULL,
  address               TEXT,
  city                  TEXT,
  contact               TEXT,
  emergency_dept        BOOLEAN     NOT NULL DEFAULT TRUE,
  emergency_beds        INTEGER     NOT NULL DEFAULT 0,
  total_emergency_beds  INTEGER     NOT NULL DEFAULT 0,
  icu_beds              INTEGER     NOT NULL DEFAULT 0,
  total_icu_beds        INTEGER     NOT NULL DEFAULT 0,
  trauma_care           BOOLEAN     NOT NULL DEFAULT FALSE,
  cardiac_care          BOOLEAN     NOT NULL DEFAULT FALSE,
  stroke_care           BOOLEAN     NOT NULL DEFAULT FALSE,
  receiving_capacity    INTEGER     NOT NULL DEFAULT 0,
  lat                   NUMERIC(10,6),
  lng                   NUMERIC(10,6),
  status                TEXT        NOT NULL DEFAULT 'Accepting Emergency Patients'
                                    CHECK (status IN (
                                      'Accepting Emergency Patients',
                                      'Limited Emergency Capacity',
                                      'Emergency Department Full',
                                      'Temporarily Unavailable'
                                    )),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════
--  AMBULANCES
-- ══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.ambulances (
  id                  TEXT        PRIMARY KEY,   -- e.g. AMB-101
  reg_no              TEXT,
  type                TEXT        NOT NULL,
  driver              TEXT,
  driver_contact      TEXT,
  medical_staff       TEXT,
  location            TEXT,
  lat                 NUMERIC(10,6),
  lng                 NUMERIC(10,6),
  equipment           TEXT,
  assigned_emergency  TEXT,       -- FK to emergency_requests.id
  status              TEXT        NOT NULL DEFAULT 'Available'
                                  CHECK (status IN (
                                    'Available','On Emergency Duty','Dispatched',
                                    'Transporting Patient','At Hospital','Maintenance'
                                  )),
  last_gps_update     TIMESTAMPTZ,
  gps_accuracy        NUMERIC,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════
--  GPS LOCATION UPDATES  (one row per ambulance, upserted)
-- ══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.gps_updates (
  ambulance_id  TEXT        PRIMARY KEY REFERENCES public.ambulances(id) ON DELETE CASCADE,
  lat           NUMERIC(10,6) NOT NULL,
  lng           NUMERIC(10,6) NOT NULL,
  accuracy      NUMERIC,
  recorded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════
--  EMERGENCY REQUESTS
-- ══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.emergency_requests (
  id                  TEXT        PRIMARY KEY,   -- e.g. RESQ-1001
  patient_name        TEXT        NOT NULL,
  age                 INTEGER,
  gender              TEXT,
  contact             TEXT,
  emergency_type      TEXT,
  description         TEXT,
  condition           TEXT,
  priority            TEXT        NOT NULL DEFAULT 'Medium'
                                  CHECK (priority IN ('Critical','High','Medium','Low')),
  location            TEXT,
  lat                 NUMERIC(10,6),
  lng                 NUMERIC(10,6),
  assigned_ambulance  TEXT        REFERENCES public.ambulances(id) ON DELETE SET NULL,
  assigned_hospital   TEXT        REFERENCES public.hospitals(id) ON DELETE SET NULL,
  eta                 TEXT,
  status              TEXT        NOT NULL DEFAULT 'Pending'
                                  CHECK (status IN (
                                    'Pending','Ambulance Assigned','Ambulance Dispatched',
                                    'Patient Picked Up','Hospital Assigned','Patient In Transit',
                                    'Arrived at Hospital','Completed','Cancelled'
                                  )),
  submitted_by        TEXT        DEFAULT 'admin',  -- 'citizen' | 'admin'
  family_contact      TEXT,
  date                DATE        NOT NULL DEFAULT CURRENT_DATE,
  time                TIME        NOT NULL DEFAULT CURRENT_TIME,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════
--  PATIENTS
-- ══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.patients (
  id                      TEXT        PRIMARY KEY,   -- e.g. PAT-301
  name                    TEXT        NOT NULL,
  age                     INTEGER,
  gender                  TEXT,
  contact                 TEXT,
  emergency_type          TEXT,
  condition               TEXT,
  assigned_emergency_id   TEXT        REFERENCES public.emergency_requests(id) ON DELETE SET NULL,
  assigned_ambulance      TEXT        REFERENCES public.ambulances(id) ON DELETE SET NULL,
  assigned_hospital       TEXT        REFERENCES public.hospitals(id) ON DELETE SET NULL,
  status                  TEXT        NOT NULL DEFAULT 'Awaiting Ambulance'
                                      CHECK (status IN (
                                        'Awaiting Ambulance','Ambulance Assigned','In Transit',
                                        'Admitted','Under Emergency Care','Discharged'
                                      )),
  reg_date                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════
--  EMERGENCY ASSIGNMENTS
-- ══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.assignments (
  id              TEXT        PRIMARY KEY,   -- e.g. ASGN-401
  emergency_id    TEXT        REFERENCES public.emergency_requests(id) ON DELETE CASCADE,
  ambulance_id    TEXT        REFERENCES public.ambulances(id) ON DELETE SET NULL,
  driver          TEXT,
  medical_staff   TEXT,
  hospital        TEXT        REFERENCES public.hospitals(id) ON DELETE SET NULL,
  date            DATE,
  time            TIME,
  eta             TEXT,
  status          TEXT        NOT NULL DEFAULT 'Active'
                              CHECK (status IN ('Active','Completed','Cancelled')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════
--  EMERGENCY HISTORY  (completed requests archived here)
-- ══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.emergency_history (
  id                  TEXT        PRIMARY KEY,
  patient_name        TEXT,
  age                 INTEGER,
  gender              TEXT,
  emergency_type      TEXT,
  condition           TEXT,
  priority            TEXT,
  location            TEXT,
  assigned_ambulance  TEXT,
  assigned_hospital   TEXT,
  hospital_name       TEXT,
  date                DATE,
  time                TIME,
  eta                 TEXT,
  response_time       TEXT,
  status              TEXT        NOT NULL DEFAULT 'Completed',
  completed_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════
--  NOTIFICATIONS
-- ══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.notifications (
  id            TEXT        PRIMARY KEY,
  type          TEXT,
  emergency_id  TEXT,
  patient       TEXT,
  message       TEXT,
  read          BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════
--  CORPORATE EMERGENCIES
-- ══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.corporate (
  id                TEXT        PRIMARY KEY,
  org_name          TEXT        NOT NULL,
  location          TEXT,
  contact_person    TEXT,
  contact           TEXT,
  emergency_type    TEXT,
  employee_count    INTEGER,
  emergency_status  TEXT        DEFAULT 'Active',
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════
--  ACTIVITY LOG
-- ══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.activity_log (
  id          TEXT        PRIMARY KEY,
  msg         TEXT,
  type        TEXT,       -- 'red','orange','blue','green','purple'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════
--  UPDATED_AT TRIGGER  (auto-update updated_at columns)
-- ══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'hospitals','ambulances','emergency_requests','patients',
    'assignments','corporate','user_profiles'
  ] LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON public.%s
       FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
      tbl, tbl
    );
  END LOOP;
END
$$;

-- ══════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE public.user_profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambulances          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gps_updates         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_requests  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_history   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corporate           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log        ENABLE ROW LEVEL SECURITY;

-- ── Helper: get current user's role from user_profiles ──
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- ── HOSPITALS ──────────────────────────────────────────────
-- Anyone can read hospitals (needed for AI recommendation)
CREATE POLICY "hospitals_read_all"    ON public.hospitals FOR SELECT USING (true);
-- Only admin and hospital staff can write
CREATE POLICY "hospitals_write_admin" ON public.hospitals FOR ALL
  USING (get_my_role() IN ('admin','hospital'))
  WITH CHECK (get_my_role() IN ('admin','hospital'));

-- ── AMBULANCES ────────────────────────────────────────────
CREATE POLICY "ambulances_read_all"   ON public.ambulances FOR SELECT USING (true);
CREATE POLICY "ambulances_write"      ON public.ambulances FOR ALL
  USING (get_my_role() IN ('admin','ambulance'))
  WITH CHECK (get_my_role() IN ('admin','ambulance'));

-- ── GPS UPDATES ───────────────────────────────────────────
-- Ambulances can upsert their own GPS; everyone can read
CREATE POLICY "gps_read_all"          ON public.gps_updates FOR SELECT USING (true);
CREATE POLICY "gps_write_ambulance"   ON public.gps_updates FOR ALL
  USING (
    get_my_role() = 'admin' OR
    (get_my_role() = 'ambulance' AND
     ambulance_id IN (SELECT ambulance_id FROM public.user_profiles WHERE id = auth.uid()))
  );

-- ── EMERGENCY REQUESTS ────────────────────────────────────
-- Citizens can insert their own; admin sees all; others see assigned
CREATE POLICY "req_insert_citizen"    ON public.emergency_requests FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "req_select_admin"      ON public.emergency_requests FOR SELECT
  USING (
    get_my_role() = 'admin' OR
    submitted_by = auth.uid()::text OR
    assigned_ambulance IN (SELECT ambulance_id FROM public.user_profiles WHERE id = auth.uid()) OR
    assigned_hospital  IN (SELECT hospital_id  FROM public.user_profiles WHERE id = auth.uid())
  );
CREATE POLICY "req_update_admin"      ON public.emergency_requests FOR UPDATE
  USING (get_my_role() IN ('admin','ambulance','hospital'));
CREATE POLICY "req_delete_admin"      ON public.emergency_requests FOR DELETE
  USING (get_my_role() = 'admin');

-- ── PATIENTS ──────────────────────────────────────────────
CREATE POLICY "patients_admin_all"    ON public.patients FOR ALL
  USING (get_my_role() IN ('admin','hospital'))
  WITH CHECK (get_my_role() IN ('admin','hospital'));

-- ── ASSIGNMENTS ───────────────────────────────────────────
CREATE POLICY "assign_read"           ON public.assignments FOR SELECT USING (true);
CREATE POLICY "assign_write_admin"    ON public.assignments FOR ALL
  USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');

-- ── HISTORY ───────────────────────────────────────────────
CREATE POLICY "history_read_all"      ON public.emergency_history FOR SELECT USING (true);
CREATE POLICY "history_insert_admin"  ON public.emergency_history FOR INSERT
  WITH CHECK (get_my_role() IN ('admin','hospital'));

-- ── NOTIFICATIONS ─────────────────────────────────────────
CREATE POLICY "notif_read_own"        ON public.notifications FOR SELECT USING (true);
CREATE POLICY "notif_insert"          ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "notif_delete_admin"    ON public.notifications FOR DELETE
  USING (get_my_role() = 'admin');

-- ── CORPORATE ─────────────────────────────────────────────
CREATE POLICY "corp_admin_all"        ON public.corporate FOR ALL
  USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');

-- ── ACTIVITY LOG ──────────────────────────────────────────
CREATE POLICY "activity_read_admin"   ON public.activity_log FOR SELECT
  USING (get_my_role() = 'admin');
CREATE POLICY "activity_insert_all"   ON public.activity_log FOR INSERT WITH CHECK (true);

-- ── USER PROFILES ─────────────────────────────────────────
CREATE POLICY "profiles_own"          ON public.user_profiles FOR ALL
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_admin_read"   ON public.user_profiles FOR SELECT
  USING (get_my_role() = 'admin');

-- ══════════════════════════════════════════════════════════
--  REALTIME PUBLICATIONS
--  Enable realtime for tables that need live updates
-- ══════════════════════════════════════════════════════════
BEGIN;
  -- Remove tables from default publication first if needed
  ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_requests;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.ambulances;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.gps_updates;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.hospitals;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
COMMIT;

-- ══════════════════════════════════════════════════════════
--  INDEXES  (performance)
-- ══════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_req_status    ON public.emergency_requests(status);
CREATE INDEX IF NOT EXISTS idx_req_priority  ON public.emergency_requests(priority);
CREATE INDEX IF NOT EXISTS idx_req_ambulance ON public.emergency_requests(assigned_ambulance);
CREATE INDEX IF NOT EXISTS idx_req_hospital  ON public.emergency_requests(assigned_hospital);
CREATE INDEX IF NOT EXISTS idx_pat_hospital  ON public.patients(assigned_hospital);
CREATE INDEX IF NOT EXISTS idx_pat_ambulance ON public.patients(assigned_ambulance);
CREATE INDEX IF NOT EXISTS idx_gps_recorded  ON public.gps_updates(recorded_at DESC);

-- ══════════════════════════════════════════════════════════
--  SAMPLE DATA  (optional – for initial testing)
--  Run this block separately if you want sample data in DB.
-- ══════════════════════════════════════════════════════════
/*
INSERT INTO public.hospitals (id,name,address,city,contact,emergency_dept,emergency_beds,total_emergency_beds,icu_beds,total_icu_beds,trauma_care,cardiac_care,stroke_care,receiving_capacity,lat,lng,status) VALUES
  ('HOSP-201','City Care Hospital','No. 45, MG Road','Bengaluru','080-22001100',true,8,12,3,6,true,true,true,10,12.9716,77.5946,'Accepting Emergency Patients'),
  ('HOSP-202','Apollo Emergency Centre','154/11, Bannerghatta Road','Bengaluru','080-26304050',true,5,10,2,5,true,true,false,8,12.9011,77.5973,'Accepting Emergency Patients'),
  ('HOSP-203','Fortis Trauma Unit','154/9, Bannerghatta Road','Bengaluru','080-66214444',true,2,8,0,4,true,false,false,4,12.8980,77.5977,'Limited Emergency Capacity'),
  ('HOSP-204','Narayana Health','258/A, Hosur Road','Bengaluru','1800-102-0112',true,10,15,5,8,true,true,true,15,12.8456,77.6603,'Accepting Emergency Patients'),
  ('HOSP-205','Manipal Hospital','98, HAL Airport Road','Bengaluru','080-25024444',true,6,10,1,4,false,true,true,8,12.9592,77.6484,'Accepting Emergency Patients');

INSERT INTO public.ambulances (id,reg_no,type,driver,driver_contact,medical_staff,location,lat,lng,equipment,assigned_emergency,status) VALUES
  ('AMB-101','KA01AB1234','Advanced Life Support (ALS)','Raj Kumar','9876541001','Dr. Priya Singh','MG Road, Bengaluru',12.9741,77.6097,'Defibrillator, Oxygen, IV Kit, Stretcher','RESQ-1001','On Emergency Duty'),
  ('AMB-102','KA01AB5678','Basic Life Support (BLS)','Suresh Patil','9876541002','Nurse Kavitha','Whitefield, Bengaluru',12.9698,77.7499,'First Aid, Oxygen, Stretcher','','Available'),
  ('AMB-103','KA01AB9012','Advanced Life Support (ALS)','Meena Reddy','9876541003','Dr. Arjun Das','Indiranagar, Bengaluru',12.9784,77.6408,'Defibrillator, Ventilator, IV Kit','RESQ-1002','On Emergency Duty'),
  ('AMB-104','KA01AB3456','Neonatal Ambulance','Arjun Das','9876541004','Dr. Sunita Rao','HSR Layout, Bengaluru',12.9116,77.6474,'Incubator, Neonatal Ventilator','','Available'),
  ('AMB-105','KA01AB7890','Basic Life Support (BLS)','Priya Nair','9876541005','Nurse Ramesh','Koramangala, Bengaluru',12.9352,77.6245,'First Aid, Oxygen, Stretcher','','Available');
*/

-- ══════════════════════════════════════════════════════════
-- END OF SCHEMA
-- ══════════════════════════════════════════════════════════
