# app/tests/test_carro_entity.py

from src.carro.domain.entities.carro import Carro, ProductoCarro

def test_producto_carro_defaults():
    p = ProductoCarro()
    assert p.id_producto is None
    assert p.cantidad is None
    assert p.precio is None

def test_carro_defaults():
    c = Carro()
    assert c.id_carro is None
    assert c.id_usuario is None
    assert c.estado is None
    assert c.created_at is None
    assert c.check_out is False
    assert c.total == 0.0
    assert c.updated_at is None
    # Como lo tienes ahora, productos será None
    assert c.productos is None
    assert c.token is None

def test_carro_with_products():
    productos = [
        ProductoCarro(id_producto=1, cantidad=2, precio=10.0),
        ProductoCarro(id_producto=2, cantidad=1, precio=5.0),
    ]
    c = Carro(
        id_carro=1,
        id_usuario=123,
        estado="ABIERTO",
        created_at="2025-12-12T10:00:00Z",
        check_out=False,
        total=25.0,
        updated_at="2025-12-12T10:00:00Z",
        productos=productos,
    )

    assert c.id_carro == 1
    assert c.id_usuario == 123
    assert c.estado == "ABIERTO"
    assert len(c.productos) == 2
    assert c.productos[0].id_producto == 1
