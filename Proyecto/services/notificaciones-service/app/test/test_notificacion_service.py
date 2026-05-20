from datetime import datetime, timedelta, timezone

from notificacion.application.services.notificacion_service import NotificacionService
from notificacion.domain.entities.cliente import NotificacionCliente
from notificacion.domain.entities.proveedor import NotificacionProveedor
from notificacion.domain.entities.producto import ProductoNotificacion
from notificacion.application.dtos.email_dto import EmailDTO


class FakeNotifRepo:
    def __init__(self) -> None:
        self.ultima_proveedor: NotificacionProveedor | None = None
        self.ultima_cliente: NotificacionCliente | None = None
        self.proveedor_existente: NotificacionProveedor | None = None
        self.cliente_existente: NotificacionCliente | None = None

    def crear_proveedor_notificacion(self, notif: NotificacionProveedor) -> None:
        self.ultima_proveedor = notif

    def crear_cliente_notificacion(self, notif: NotificacionCliente) -> None:
        self.ultima_cliente = notif

    def obtener_proveedor_notificacion(self, notif: NotificacionProveedor) -> NotificacionProveedor | None:
        return self.proveedor_existente

    def obtener_cliente_notificacion(self, notif: NotificacionCliente) -> NotificacionCliente | None:
        return self.cliente_existente


class FakeEmailService:
    def __init__(self) -> None:
        self.enviados: list[EmailDTO] = []

    def send(self, email_dto: EmailDTO) -> bool:
        self.enviados.append(email_dto)
        return True


class FakeAuthClient:
    def get_user_by_id(self, user_id: int):
        class U:
            first_name = "Test"
            last_name = "User"
            email = "test@example.com"

        return U()


class FakeCatalogClient:
    def get_product(self, product_id: int):
        class P:
            id = product_id
            name = f"Producto {product_id}"
            sku = f"SKU-{product_id}"
            category = "Test"
            price = 10.0
            stock = 5

        return P()


class FakeOrdersClient:
    def get_order(self, order_id: int):
        return None


def _build_service(repo: FakeNotifRepo, email: FakeEmailService) -> NotificacionService:
    return NotificacionService(
        notificacion_repository=repo,
        email_service=email,
        auth_client=FakeAuthClient(),
        catalog_client=FakeCatalogClient(),
        orders_client=FakeOrdersClient(),
    )


def test_crear_proveedor_notificacion_cooldown_activo():
    repo = FakeNotifRepo()
    email = FakeEmailService()
    service = _build_service(repo, email)

    ahora = datetime.now(timezone.utc)
    # Notificación existente hace menos de 1 día
    repo.proveedor_existente = NotificacionProveedor(
        id_proveedor=1,
        productos=[],
        created_at=ahora.isoformat().replace("+00:00", "Z"),
    )

    nueva = NotificacionProveedor(
        id_proveedor=1,
        productos=[],
        created_at=ahora.isoformat().replace("+00:00", "Z"),
    )

    result, msg = service.crear_proveedor_notificacion(nueva)

    assert result is None
    assert msg.startswith("Cooldown")
    assert repo.ultima_proveedor is None
    assert len(email.enviados) == 0


def test_crear_proveedor_notificacion_envia_email_y_guarda():
    repo = FakeNotifRepo()
    email = FakeEmailService()
    service = _build_service(repo, email)

    # No hay notificación previa => debe crear y enviar email
    repo.proveedor_existente = None

    nueva = NotificacionProveedor(
        id_proveedor=1,
        productos=[ProductoNotificacion(id_producto=1, cantidad=1)],
        created_at=datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
    )

    result, msg = service.crear_proveedor_notificacion(nueva)

    assert result is None
    assert msg.startswith("Notificación creada")
    assert repo.ultima_proveedor is nueva
    assert len(email.enviados) == 1


def test_crear_cliente_notificacion_nueva_sin_existente():
    repo = FakeNotifRepo()
    email = FakeEmailService()
    service = _build_service(repo, email)

    repo.cliente_existente = None

    notif = NotificacionCliente(
        id_carro=10,
        tipo="recordatorio",
        productos=[ProductoNotificacion(id_producto=1, cantidad=1)],
        created_at=datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
    )

    result, msg = service.crear_cliente_notificacion(notif)

    assert msg == "Notificación creada"
    assert result is notif
    assert repo.ultima_cliente is notif
    assert len(email.enviados) == 1


def test_crear_cliente_notificacion_existente_sin_crear_nueva():
    repo = FakeNotifRepo()
    email = FakeEmailService()
    service = _build_service(repo, email)

    existente = NotificacionCliente(
        id_carro=10,
        tipo="recordatorio",
        productos=[],
        created_at=datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
    )
    repo.cliente_existente = existente

    notif = NotificacionCliente(
        id_carro=10,
        tipo="recordatorio",
        productos=[],
        created_at=datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
    )

    result, msg = service.crear_cliente_notificacion(notif)

    assert result is existente
    assert msg == "Notificación existente"
    assert repo.ultima_cliente is None
    assert len(email.enviados) == 0
