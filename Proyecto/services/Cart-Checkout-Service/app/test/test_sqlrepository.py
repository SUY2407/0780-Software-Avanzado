from carro.infrastructure.persistence.sql_server.carro_sql_repository import CarroSqlRepository
from carro.domain.entities.carro import Carro


class FakeCursor:
    def __init__(self):
        self.executed = []
        self.to_fetchone = None
        self.to_fetchall = None

    def execute(self, query, params=None):
        self.executed.append((query.strip(), params))

    def fetchone(self):
        return self.to_fetchone

    def fetchall(self):
        return self.to_fetchall or []

    def close(self):
        pass


class FakeConnection:
    def __init__(self):
        self.cursor_obj = FakeCursor()
        self.commits = 0
        self.rollbacks = 0

    def cursor(self):
        return self.cursor_obj

    def commit(self):
        self.commits += 1

    def rollback(self):
        self.rollbacks += 1

    # para usar `with conn as c:`
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        pass


class FakeDbConnection:
    def __init__(self):
        self.conn = FakeConnection()

    def get_connection(self):
        return self.conn


def test_guardar_inserta_nuevo_carro():
    db = FakeDbConnection()
    repo = CarroSqlRepository(db_connection=db)

    # Simula que no existe carro previo
    db.conn.cursor_obj.to_fetchone = None

    carro = Carro(
        id_usuario=1,
        estado="ABIERTO",
        created_at="2025-12-12T10:00:00Z",
        check_out=False,
        total=100.0,
        updated_at="2025-12-12T10:00:00Z",
        productos=[
            {"id_producto": 1, "cantidad": 2, "precio": 10.0},
        ],
    )

    # Para el INSERT OUTPUT, simulamos que devuelve un id
    def fake_fetchone():
        return [42]
    db.conn.cursor_obj.fetchone = fake_fetchone  # monkey patch

    result = repo.guardar(carro)

    assert result == 42
    # al menos un commit
    assert db.conn.commits == 1
    # primer query debería ser el SELECT de búsqueda
    first_query, first_params = db.conn.cursor_obj.executed[0]
    assert "SELECT id_carro FROM [dbo].[carro]" in first_query
    assert first_params == (1, "ABIERTO", False)
