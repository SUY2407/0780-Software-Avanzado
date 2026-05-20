from ...domain.repositories.interfaces.notificacion_repository import NotificacionRepositoryInterface
from ...domain.entities.cliente import NotificacionCliente
from ...domain.entities.proveedor import NotificacionProveedor
from ...domain.entities.producto import ProductoNotificacion
from ...presentation.grpc.auth.auth_controller import AuthGrpcClient
from ...presentation.grpc.catalog.catalog_controller import CatalogGrpcClient
from ...presentation.grpc.orders.orders_controller import OrdersGrpcClient

from datetime import datetime, timedelta

from .email_service import EmailService
from ...application.dtos.email_dto import EmailDTO

import grpc

class NotificacionService:
    def __init__(self, 
                 notificacion_repository: NotificacionRepositoryInterface,
                 email_service: EmailService,
                 auth_client: AuthGrpcClient,
                 catalog_client: CatalogGrpcClient, 
                 orders_client: OrdersGrpcClient):
        self.notificacion_repository = notificacion_repository
        self.email_service = email_service
        self.auth_client = auth_client
        self.catalog_client = catalog_client
        self.orders_client = orders_client

    def crear_proveedor_notificacion(self, notificacionProveedor: NotificacionProveedor) -> tuple[None, str]:
        """Crea notificación solo si cumple reglas de negocio de bajo stock."""
        notificacion_actual = self.obtener_proveedor_notificacion(notificacionProveedor)
        print("Creando notificación de proveedor:", notificacionProveedor)
        print("Notificación actual encontrada:", notificacion_actual)
        
        if notificacion_actual and notificacion_actual.created_at:
            if not self._es_inactivo_mas_dia(notificacion_actual.created_at):
                return None, "Cooldown activo - espera 24h"
        email_dto = self._construir_email_proveedor(notificacionProveedor)
        self.email_service.send(email_dto)
        
        self.notificacion_repository.crear_proveedor_notificacion(notificacionProveedor)
        return None, "Notificación creada exitosamente"

    def crear_cliente_notificacion(self, notificacionCliente: NotificacionCliente) -> tuple:
        notificacion_actual = self.notificacion_repository.obtener_cliente_notificacion(notificacionCliente)
        
        if notificacion_actual:
            # Si existe y está inactiva hace más de un día, crear nueva
            if (notificacion_actual.id_carro > -1 and 
                self._es_inactivo_mas_dia(notificacion_actual.created_at)):
                print("Notificación de cliente inactiva por más de un día, creando nueva.")
                self.notificacion_repository.crear_cliente_notificacion(notificacionCliente)
                email_dto = self._construir_email_cliente(notificacionCliente)
                self.email_service.send(email_dto)
                return notificacionCliente, "Notificación creada"
            
            
            print("Notificación de cliente ya existe, no se crea una nueva.")
            return notificacion_actual, "Notificación existente"
        email_dto = self._construir_email_cliente(notificacionCliente)
        self.email_service.send(email_dto)
        # No existe, crear nueva
        self.notificacion_repository.crear_cliente_notificacion(notificacionCliente)
        return notificacionCliente, "Notificación creada"

    def obtener_proveedor_notificacion(self, notificacionProveedor: NotificacionProveedor) -> None:
        return self.notificacion_repository.obtener_proveedor_notificacion(notificacionProveedor)
    
    def obtener_cliente_notificacion(self, notificacionCliente: NotificacionCliente) -> None:
        return self.notificacion_repository.obtener_cliente_notificacion(notificacionCliente)
    
    def _es_inactivo_mas_dia(self, updated_at: str) -> bool:
        try:
            ultima_actualizacion = datetime.fromisoformat(updated_at.replace('Z', '+00:00'))
            print("Ultima actualizacion:", datetime.utcnow() - ultima_actualizacion)
            return datetime.utcnow() - ultima_actualizacion > timedelta(days=1)
        except:
            return False
        
    def _debe_enviar_email_proveedor(self, notif: NotificacionProveedor) -> bool:
        """Reglas anti-spam y de negocio para proveedores."""
        return True  # Implementa tu lógica aquí

    def _construir_email_proveedor(self, notif: NotificacionProveedor) -> EmailDTO:
        """Construye EmailDTO para proveedor con TODOS los datos reales del catálogo."""
        try:
            usuario = self.auth_client.get_user_by_id(notif.id_proveedor)
            print("Usuario proveedor:", f"{usuario.first_name} {usuario.last_name} <{usuario.email}>")
            nombre_completo = f"{usuario.first_name} {usuario.last_name}"
            to_email = usuario.email
        except grpc.RpcError as e:
            print("Error gRPC GetUserById proveedor:", e)
            nombre_completo = "Proveedor"
            to_email = "gonzalezerickenrique21@gmail.com"

        if notif.productos:
            filas_productos = ""
            total_stock_bajo = 0
            productos_bajo_stock = []
            for producto in notif.productos:
                prod_detalle = None
                try:
                    # Obtener datos COMPLETOS del producto desde catalog service
                    prod_detalle = self.catalog_client.get_product(producto.id_producto)
                    
                    # Verificar si realmente está bajo stock (ej: < 10)
                    if prod_detalle.stock < 10:
                        productos_bajo_stock.append(prod_detalle)
                        total_stock_bajo += prod_detalle.stock
                    
                    filas_productos += f"""
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 12px; font-weight: bold;">#{prod_detalle.id}</td>
                        <td style="padding: 12px;">
                            <strong>{prod_detalle.name}</strong><br>
                            <small>SKU: {prod_detalle.sku} | {prod_detalle.category}</small>
                        </td>
                        <td style="padding: 12px; text-align: right;">${prod_detalle.price:.2f}</td>
                    </tr>
                    """
                except grpc.RpcError as e:
                    print(f"Error obteniendo producto {producto.id_producto}: {e}")

            # Header profesional
            header_html = f"""
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="margin: 0; font-size: 28px;">🔔 Oportunidades de Reabastecimiento</h1>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">Tienes productos con stock bajo</p>
            </div>
            """

            tabla_html = f"""
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 700px; margin: 0 auto; 
                        background: #f8f9fa; padding: 20px; border-radius: 0 0 12px 12px;">
                {header_html}
                
                <div style="background: white; margin: 20px 0; padding: 25px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <h2 style="color: #333; margin-top: 0;">Hola {nombre_completo} 👋</h2>
                    <p style="color: #666; line-height: 1.6;">
                        Revisa estos productos que necesitan reabastecimiento urgente:
                    </p>

                    <div style="overflow-x: auto;">
                    <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; width: 100%; margin: 20px 0;">
                        <thead>
                            <tr style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white;">
                                <th style="padding: 15px 12px; text-align: left; font-weight: 600;">ID</th>
                                <th style="padding: 15px 12px; text-align: left; font-weight: 600;">Stuck</th>
                                <th style="padding: 15px 12px; text-align: right; font-weight: 600;">Precio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filas_productos}
                        </tbody>
                    </table>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; 
                            background: #e3f2fd; padding: 20px; border-radius: 8px; margin-top: 20px;">
                        <div>
                            <strong>Total productos: {len(notif.productos)}</strong><br>
                            <small>{len(productos_bajo_stock)} con stock crítico (<10)</small>
                        </div>
                        <div style="text-align: right;">
                            <strong>Stock total bajo: {total_stock_bajo}</strong>
                        </div>
                    </div>
                </div>

                <div style="text-align: center; padding: 20px; background: #4caf50; color: white; border-radius: 12px;">
                    <h3>🚀 ¡Accede a tu panel y reabastece ahora!</h3>
                    <p>Evita perder ventas por falta de stock.</p>
                </div>
            </div>
            """
        else:
            tabla_html = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1>Hola {nombre_completo}</h1>
                <p>Por ahora no hay productos disponibles, te avisaremos cuando haya cambios.</p>
            </div>
            """

        return EmailDTO(
            from_email="no-reply@tudominio.com",
            to_email=to_email,
            subject=f"🔔 {nombre_completo} - {len(notif.productos or [])} productos bajo stock ⏰",
            body=tabla_html,
        )
    
    def _construir_email_cliente(self, notif: NotificacionCliente) -> EmailDTO:
        """Construye EmailDTO para cliente con diseño profesional."""
        try:
            usuario = self.auth_client.get_user_by_id(notif.id_usuario)
            print("Usuario cliente:", f"{usuario.first_name} {usuario.last_name} <{usuario.email}>")
            nombre_completo = f"{usuario.first_name} {usuario.last_name}"
            to_email = usuario.email
        except grpc.RpcError as e:
            print("Error gRPC GetUserById cliente:", e)
            nombre_completo = "Cliente"
            to_email = "gonzalezerickenrique21@gmail.com"

        tipo_notif = notif.tipo.lower() if notif.tipo else "recordatorio"

        if tipo_notif == "compra":
            # Si es compra, obtener siempre los productos desde OrdersService usando id_orden
            try:
                print("Obteniendo orden para notificación de compra, ID orden:", notif.id_orden)
                order = self.orders_client.get_order(str(notif.id_orden))
                productos_proto = order.items or []

                productos = [
                    ProductoNotificacion(
                        id_producto=item.product_id,
                        cantidad=item.quantity,
                    )
                    for item in productos_proto
                ]
            except grpc.RpcError as e:
                print(f"Error obteniendo orden {notif.id_orden}:", e)
                productos = notif.productos or []

            tabla_html = self._crear_tabla_compra_completada(productos, nombre_completo)
            subject = f"✅ {nombre_completo}, ¡compra confirmada! {len(productos)} productos"
        else:
            # Recordatorio: usa productos que ya vienen en la notificación (carrito)
            tabla_html = self._crear_tabla_recordatorio_carrito(notif, nombre_completo)
            subject = f"🛒 {nombre_completo}, tu carrito te espera - {len(notif.productos or [])} productos"

        return EmailDTO(
            from_email="no-reply@tudominio.com",
            to_email=to_email,
            subject=subject,
            body=tabla_html,
        )


    def _crear_tabla_recordatorio_carrito(self, notif: NotificacionCliente, nombre_completo: str) -> str:
        """Genera tabla HTML para recordatorio con datos reales de productos."""
        productos = notif.productos or []
        if not productos:
            return f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1>🛒 Hola {nombre_completo}, tu carrito te está esperando</h1>
                <p>Revisa tu carrito y completa tu compra.</p>
            </div>
            """

        filas_productos = ""
        total_carrito = 0
        for producto in productos:
            try:
                prod_detalle = self.catalog_client.get_product(producto.id_producto)
                precio_venta = prod_detalle.price*1.10
                subtotal = precio_venta * (producto.cantidad or 1)
                total_carrito += subtotal
                filas_productos += f"""
                <tr>
                    <td style="padding: 12px;">{prod_detalle.name}</td>
                    <td style="padding: 12px;">{producto.cantidad}</td>
                    <td style="padding: 12px;">${precio_venta:.2f}</td>
                    <td style="padding: 12px;">${subtotal:.2f}</td>
                </tr>
                """
            except grpc.RpcError:
                filas_productos += f"""
                <tr>
                    <td style="padding: 12px;">Producto {producto.id_producto}</td>
                    <td style="padding: 12px;">1</td>
                    <td style="padding: 12px;">$0.00</td>
                    <td style="padding: 12px;">$0.00</td>
                </tr>
                """

        return f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #4CAF50;">🛒 Hola {nombre_completo}, no olvides tu carrito</h1>
            <p>Tienes <strong>{len(productos)}</strong> productos esperando en tu carrito.</p>

            <table border="1" cellpadding="12" cellspacing="0" style="border-collapse: collapse; width: 100%; font-size: 14px;">
                <thead>
                    <tr style="background-color: #4CAF50; color: white;">
                        <th style="padding: 12px;">Producto</th>
                        <th style="padding: 12px;">Cantidad</th>
                        <th style="padding: 12px;">Precio Unit.</th>
                        <th style="padding: 12px;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {filas_productos}
                </tbody>
                <tfoot>
                    <tr style="background-color: #f9f9f9; font-weight: bold;">
                        <td colspan="3" style="padding: 12px;">TOTAL CARRITO</td>
                        <td style="padding: 12px;">${total_carrito:.2f}</td>
                    </tr>
                </tfoot>
            </table>

            <div style="margin-top: 20px; padding: 20px; background-color: #e3f2fd; border-radius: 8px; text-align: center;">
                <h3>¡Completa tu compra ahora! 🚀</h3>
            </div>
        </div>
        """

    def _crear_tabla_compra_completada(
        self,
        productos: list[ProductoNotificacion],
        nombre_completo: str,
    ) -> str:
        """Genera tabla HTML para compra completada con datos reales."""
        productos = productos or []
        if not productos:
            return f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2196F3;">✅ ¡Compra confirmada, {nombre_completo}!</h1>
                <p>Gracias por tu compra. Detalles del pedido procesados correctamente.</p>
            </div>
            """

        filas_productos = ""
        total_compra = 0.0

        for producto in productos:
            try:
                prod_detalle = self.catalog_client.get_product(producto.id_producto)
                cantidad = producto.cantidad or 1
                precio_venta = prod_detalle.price*1.10
                subtotal = precio_venta * cantidad
                total_compra += subtotal

                filas_productos += f"""
                <tr>
                    <td style="padding: 12px;">{prod_detalle.name}</td>
                    <td style="padding: 12px; text-align: center;">{cantidad}</td>
                    <td style="padding: 12px; text-align: right;">${precio_venta:.2f}</td>
                    <td style="padding: 12px; text-align: right;">${subtotal:.2f}</td>
                </tr>
                """
            except grpc.RpcError:
                cantidad = producto.cantidad or 1
                filas_productos += f"""
                <tr style="opacity: 0.7;">
                    <td style="padding: 12px;">Producto {producto.id_producto} (no disponible)</td>
                    <td style="padding: 12px; text-align: center;">{cantidad}</td>
                    <td style="padding: 12px; text-align: right;">$0.00</td>
                    <td style="padding: 12px; text-align: right;">$0.00</td>
                </tr>
                """

        return f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2196F3;">✅ ¡Compra confirmada, {nombre_completo}!</h1>
            <p>Gracias por tu compra. Aquí tienes el detalle completo:</p>

            <table border="1" cellpadding="12" cellspacing="0" style="border-collapse: collapse; width: 100%; font-size: 14px;">
                <thead>
                    <tr style="background-color: #2196F3; color: white;">
                        <th style="padding: 12px;">Producto</th>
                        <th style="padding: 12px;">Cantidad</th>
                        <th style="padding: 12px;">Precio Unit.</th>
                        <th style="padding: 12px;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {filas_productos}
                </tbody>
                <tfoot>
                    <tr style="background-color: #e8f5e8; font-weight: bold; font-size: 18px;">
                        <td colspan="3" style="padding: 15px; text-align: right;">TOTAL COMPRA</td>
                        <td style="padding: 15px; text-align: right;">${total_compra:.2f}</td>
                    </tr>
                </tfoot>
            </table>

            <div style="margin-top: 25px; padding: 20px; background-color: #e8f5e8; border-radius: 8px; text-align: center;">
                <h3>¡Recibirás tu pedido pronto! 🎉</h3>
                <p>Gracias por confiar en nosotros.</p>
            </div>
        </div>
        """