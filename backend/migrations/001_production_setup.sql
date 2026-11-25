CREATE UNIQUE INDEX IF NOT EXISTS usuario_email_lower_unique
    ON usuario (lower(email));

CREATE UNIQUE INDEX IF NOT EXISTS colegio_nome_lower_unique
    ON colegio (lower(nome));

CREATE TABLE IF NOT EXISTS colegio_dispositivo (
    id_colegio INTEGER NOT NULL REFERENCES colegio (id_colegio) ON DELETE CASCADE,
    id_dispositivo INTEGER NOT NULL REFERENCES dispositivo (id_dispositivo) ON DELETE CASCADE,
    PRIMARY KEY (id_colegio, id_dispositivo)
);

CREATE INDEX IF NOT EXISTS colegio_dispositivo_device_idx
    ON colegio_dispositivo (id_dispositivo);

INSERT INTO colegio (nome, endereco, telefone)
SELECT 'E.E.E.F.M. Prof. Nagib Coelho Matni', 'Belém - PA', '91992515147'
WHERE NOT EXISTS (
    SELECT 1 FROM colegio
    WHERE lower(nome) = lower('E.E.E.F.M. Prof. Nagib Coelho Matni')
);

INSERT INTO colegio (nome, endereco, telefone)
SELECT 'Colégio Santo Antônio', 'Belém - PA', '91992515147'
WHERE NOT EXISTS (
    SELECT 1 FROM colegio
    WHERE lower(nome) = lower('Colégio Santo Antônio')
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM dispositivo WHERE id_dispositivo = 1
    ) THEN
        RAISE EXCEPTION 'O dispositivo ID 1 não existe em dispositivo.';
    END IF;
END
$$;

INSERT INTO colegio_dispositivo (id_colegio, id_dispositivo)
SELECT c.id_colegio, 1
FROM colegio AS c
WHERE lower(c.nome) IN (
    lower('E.E.E.F.M. Prof. Nagib Coelho Matni'),
    lower('Colégio Santo Antônio')
)
ON CONFLICT (id_colegio, id_dispositivo) DO NOTHING;
