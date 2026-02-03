# DATABASE SCHEMA (Supabase/PostgreSQL)

Use this exact schema for any backend integrations.

**Critical Context:**
* Use UUIDs for all primary keys.
* The relationship between `activity_logs` and `drill_bits` is crucial for the business goal of predictive maintenance.

```sql
-- Table: rigs
-- Lookups for available rigs
CREATE TABLE rigs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL -- e.g., "Rig 001 (Comacchio)"
);

-- Table: crew_members
-- Lookups for staff on site
CREATE TABLE crew_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, -- e.g., "John Smith"
    role TEXT NOT NULL -- e.g., "Lead Driller", "Second Man"
);

-- Table: drill_bits
-- CRITICAL: Tracks individual assets for lifecyle analysis.
CREATE TABLE drill_bits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    serial_number TEXT UNIQUE NOT NULL, -- e.g., "SN-B555"
    type TEXT NOT NULL, -- e.g., "PDC 150mm"
    status TEXT NOT NULL -- e.g., "Available", "In Use", "Retired"
);

-- Table: shifts
-- The 'Header' record for a single day's work on one rig.
CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE DEFAULT CURRENT_DATE,
    rig_id UUID REFERENCES rigs(id),
    lead_driller_id UUID REFERENCES crew_members(id),
    safety_check_completed BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'In Progress' -- "In Progress", "Submitted"
);

-- Table: activity_logs
-- The detailed timeline entries. CRITICAL for Revenue and Bit Life data.
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE,
    sequence_order INT NOT NULL, -- To keep logs in chronological order
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    activity_type TEXT NOT NULL, -- MUST be either "DRILLING" or "STANDBY"
    -- Fields used ONLY if activity_type is DRILLING:
    start_depth DECIMAL,
    end_depth DECIMAL,
    drill_bit_id UUID REFERENCES drill_bits(id),
    -- Fields used ONLY if activity_type is STANDBY:
    standby_reason TEXT -- e.g., "Weather", "Client Delay", "Maintenance"
);
```

## Sample Data

```sql
-- Insert sample rigs
INSERT INTO rigs (name) VALUES
    ('Rig 001 (Comacchio)'),
    ('Rig 002 (Atlas Copco)');

-- Insert sample crew members
INSERT INTO crew_members (name, role) VALUES
    ('John Smith', 'Lead Driller'),
    ('Sarah Johnson', 'Second Man'),
    ('Mike Chen', 'Supervisor');

-- Insert sample drill bits
INSERT INTO drill_bits (serial_number, type, status) VALUES
    ('SN-B555', 'PDC 150mm', 'Available'),
    ('SN-B556', 'PDC 150mm', 'In Use'),
    ('SN-C221', 'Tricone 200mm', 'Available');
```
