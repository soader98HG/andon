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

-- Sample defect codes per station (with conflict handling)
INSERT INTO defect_code (code, station_id, description) VALUES
  ('A1', 1, 'Defecto est1 A1'),
  ('B1', 1, 'Defecto est1 B1'),
  ('A2', 2, 'Defecto est2 A2'),
  ('AR', NULL,  'Arrugado'),
  ('CHO', NULL, 'Choque'),
  ('DEF', NULL, 'Deformado'),
  ('DES', NULL, 'Desgarrado'),
  ('FJO', NULL, 'Fijo'),
  ('INC', NULL, 'Incompleto'),
  ('MAN', NULL, 'Manchas'),
  ('NEN', NULL, 'No Enfriado'),
  ('NOC', NULL, 'No Conectado'),
  ('RUI', NULL, 'Ruido'),
  ('SAC', NULL, 'Sin Aceite'),
  ('SAI', NULL, 'Sin Aislar'),
  ('SCO', NULL, 'Sin Colocar'),
  ('SIN', NULL, 'Sin'),
  ('SRE', NULL, 'Sin Refrigerante'),
  ('SRT', NULL, 'Sin Retirar'),
  ('TEX', NULL, 'Torque Excesivo'),
  ('TIN', NULL, 'Torque Insuficiente'),

  ('AGU', NULL, 'Agujero'),
  ('AMP', NULL, 'Ampolla'),
  ('BEX', NULL, 'Base Expuesta'),
  ('CHC', NULL, 'Chorreado Base'),
  ('CHF', NULL, 'Chorreado Fondo'),
  ('CHR', NULL, 'Chorreado'),
  ('COP', NULL, 'Contaminación en la Pintura'),
  ('CRA', NULL, 'Craqueado'),
  ('ENR', NULL, 'Enrrojado'),
  ('ESC', NULL, 'Escurrido'),
  ('EST', NULL, 'Estampado Defectuoso'),
  ('FBR', NULL, 'Falta Brillo'),
  ('FIS', NULL, 'Fisura'),
  ('FIB', NULL, 'Fibra Mal Ubicada'),
  ('FOM', NULL, 'Fondo Mal Lijado'),
  ('GOT', NULL, 'Goteo'),
  ('GRM', NULL, 'Granulometría'),
  ('MAD', NULL, 'Mal Adherencia'),
  ('MDS', NULL, 'Malas Condiciones de Sellante'),
  ('MEP', NULL, 'Mal Empaque'),
  ('MFL', NULL, 'Mal Flujo'),
  ('MFO', NULL, 'Mal Formado'),
  ('MHE', NULL, 'Mal Herramienta'),
  ('MIM', NULL, 'Mal Impreso'),
  ('MLP', NULL, 'Mal Limpieza'),
  ('MPD', NULL, 'Mal Pegado'),
  ('MPO', NULL, 'Mal Posicionado'),
  ('MR',  NULL, 'Mal Ruteado'),
  ('MS',  NULL, 'Mal Sellado'),
  ('MSB', NULL, 'Mal Soplado'),
  ('MSE', NULL, 'Mal Secado'),
  ('MSJ', NULL, 'Mal Sujetado'),
  ('MTR', NULL, 'Mal Tratamiento'),
  ('OXO', NULL, 'Oxidado'),
  ('PHR', NULL, 'Pintura Hervida'),
  ('PNR', NULL, 'Pintura con Vetas'),
  ('PSB', NULL, 'Pintura Suelta'),
  ('PSE', NULL, 'Pintura con Sustancia Extraña'),
  ('PTP', NULL, 'Pintura Porosa'),
  ('PVF', NULL, 'Pintura con Falta de Brillo'),
  ('RAY', NULL, 'Rayado'),
  ('SOM', NULL, 'Sombra'),
  ('SSB', NULL, 'Sin Sellante'),
  ('SSE', NULL, 'Sin Secado'),
  ('STR', NULL, 'Sin Tratamiento'),
  ('SUE', NULL, 'Suelo'),
  ('SME', NULL, 'Suelo Mal Empacado'),
  ('SMI', NULL, 'Suelo Mal Impreso'),
  ('SML', NULL, 'Suelo Mal Lijado'),
  ('TDF', NULL, 'Tono Diferente'),

  ('FAL', NULL, 'Falta de Penetración'),
  ('GRI', NULL, 'Grieta'),
  ('P',   NULL, 'Poros'),
  ('PNF', NULL, 'Porosidad en la Fusión'),
  ('SLD', NULL, 'Soldadura Deficiente')
  ON CONFLICT (code) DO NOTHING;
