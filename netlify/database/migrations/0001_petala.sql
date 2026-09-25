CREATE TABLE IF NOT EXISTS products (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price integer NOT NULL CHECK (price >= 0),
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  category text NOT NULL DEFAULT 'Ramos',
  season text NOT NULL DEFAULT 'Todo el año',
  featured boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  image_data bytea,
  image_type text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_products_active_featured ON products(active, featured);

CREATE TABLE IF NOT EXISTS admin_users (
  id bigserial PRIMARY KEY,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  password_hash text NOT NULL,
  password_salt text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash text PRIMARY KEY,
  user_id bigint NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);

INSERT INTO products (name,description,price,stock,category,season,featured)
SELECT * FROM (VALUES
  ('Sol de septiembre','Girasoles, rosas amarillas y follaje de estación.',129,8,'Ramos','Flores amarillas',true),
  ('Jardín crema','Rosas marfil, lisianthus y eucalipto fresco.',149,5,'Ramos','Todo el año',true),
  ('Abrazo silvestre','Flores de campo con una composición libre y delicada.',99,0,'Silvestres','Primavera',false),
  ('Caja de luz','Selección amarilla presentada en caja de autor.',169,3,'Cajas','Flores amarillas',true)
) AS seed(name,description,price,stock,category,season,featured)
WHERE NOT EXISTS (SELECT 1 FROM products);
