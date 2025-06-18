-- Example schema for Andon system
CREATE TABLE IF NOT EXISTS station (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS defect_code (
  code        TEXT PRIMARY KEY,
  station_id  INTEGER REFERENCES station(id),
  description TEXT
);

CREATE TABLE IF NOT EXISTS incident (
  id          SERIAL PRIMARY KEY,
  station_id  INTEGER REFERENCES station(id),
  defect_code TEXT REFERENCES defect_code(code),
  vehicle_id  TEXT,
  problem     TEXT,
  status      TEXT DEFAULT 'open',
  opened_at   TIMESTAMP DEFAULT NOW(),
  received_at TIMESTAMP,
  reprocess_at TIMESTAMP,
  closed_at   TIMESTAMP
);

-- Ensure newer columns exist when re-running the script
ALTER TABLE incident
  ADD COLUMN IF NOT EXISTS problem TEXT;

-- Sample stations
INSERT INTO station (name) VALUES ('ESTACION 1'), ('ESTACION 2')
  ON CONFLICT DO NOTHING;

-- Sample defect codes per station
INSERT INTO defect_code (code, station_id, description) VALUES
  ('A1', 1, 'Defecto est1 A1'),
  ('B1', 1, 'Defecto est1 B1'),
  ('A2', 2, 'Defecto est2 A2');
