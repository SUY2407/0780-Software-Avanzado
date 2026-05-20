from typing import Optional
from ....domain.repositories.interfaces.notificacion_repository import NotificacionRepositoryInterface
from ....domain.entities.proveedor import NotificacionProveedor
from ....domain.entities.cliente import NotificacionCliente
from ....domain.entities.producto import ProductoNotificacion
from typing import List, Optional
import datetime


class NotificacionSqlRepository(NotificacionRepositoryInterface):
    def __init__(self, db_connection):
        self.db_connection = db_connection

    def crear_cliente_notificacion(
        self, 
        notificacion_cliente: NotificacionCliente
    ) -> None:
        """Crea una notificación para cliente en persistencia."""
        
        insert_query = """
            INSERT INTO dbo.notificacionCliente (id_usuario, id_carro, estado, tipo,id_orden)
            VALUES (?, ?, ?, ?,?)
        """
        
        with self.db_connection.get_connection() as conn:
            with conn.cursor() as cursor:
                try:
                    cursor.execute(insert_query, (
                        notificacion_cliente.id_usuario,
                        notificacion_cliente.id_carro,
                        notificacion_cliente.estado,
                        notificacion_cliente.tipo,
                        notificacion_cliente.id_orden
                    ))
                    conn.commit()
                except Exception as e:
                    conn.rollback()  # ← CRÍTICO: deshace INSERT parcial
                    print(f"Error al crear notificación cliente: {e}")
                    raise  # Re-lanza para capas superiores

    def obtener_cliente_notificacion(
        self,
        notificacion_cliente: NotificacionCliente
    ) -> Optional[NotificacionCliente]:
        """Obtiene notificación de cliente usando -1 para compras sin carrito."""
        
        query = """
            SELECT id_notificacion, id_usuario, id_carro, estado, tipo, created_at
            FROM dbo.notificacionCliente
            WHERE id_usuario = ?
            AND estado = ?
            AND tipo = ?
            AND (id_carro = ? OR id_orden = ?)
        """
        
        with self.db_connection.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    query,
                    (
                        notificacion_cliente.id_usuario,
                        notificacion_cliente.estado,
                        notificacion_cliente.tipo,
                        notificacion_cliente.id_carro,   # -1 para compra sin carro
                        notificacion_cliente.id_orden,
                    ),
                )
                row = cursor.fetchone()
                if row:
                    return NotificacionCliente(
                        id_notificacion=row[0],
                        id_usuario=row[1],
                        id_carro=row[2],
                        estado=row[3],
                        tipo=row[4],
                        created_at=self.to_iso(row[5]),
                    )
                return None
    
    def to_iso(self, dt):
        if dt is None:
            return None
        # Mantiene microsegundos en formato ISO 8601
        return dt.isoformat(timespec="microseconds")
    
    def crear_proveedor_notificacion(
        self, 
        notificacion_proveedor: NotificacionProveedor
    ) -> None:
        """Crea una notificación para proveedor en persistencia."""
        
        insert_query = """
            INSERT INTO dbo.notificacionProveedor (id_proveedor, estado, created_at, mensaje)
            OUTPUT INSERTED.id_notificacion
            VALUES (?, ?, ?, ?)
        """
        
        productos_query = """
            INSERT INTO dbo.productoNotificacion (id_notificacion, id_producto)
            VALUES (?, ?)
        """
        
        with self.db_connection.get_connection() as conn:
            with conn.cursor() as cursor:
                try:
                    # Insertar notificación principal CON OUTPUT clause
                    cursor.execute(insert_query, (
                        notificacion_proveedor.id_proveedor,
                        notificacion_proveedor.estado,
                        notificacion_proveedor.created_at,
                        notificacion_proveedor.mensaje
                    ))
                    
                    # OUTPUT devuelve el ID directamente
                    result = cursor.fetchone()
                    if not result:
                        raise Exception("No se pudo obtener ID de notificación")
                    id_notificacion = result[0]
                    
                    # Insertar productos asociados
                    for producto in notificacion_proveedor.productos:
                        cursor.execute(productos_query, (id_notificacion, producto.id_producto))
                    
                    conn.commit()
                except Exception as e:
                    conn.rollback()
                    print(f"Error al crear notificación proveedor: {e}")
                    raise

    def obtener_proveedor_notificacion(
        self, 
        notificacion_proveedor: NotificacionProveedor
    ) -> Optional[NotificacionProveedor]:
        """Obtiene notificación de proveedor por ID o filtros."""
        
        query = """
            SELECT id_notificacion, id_proveedor, estado, created_at, mensaje
            FROM dbo.notificacionProveedor
            WHERE id_proveedor = ? AND estado = ?
        """
        
        with self.db_connection.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, (
                    notificacion_proveedor.id_proveedor,
                    notificacion_proveedor.estado
                ))
                row = cursor.fetchone()
                if row:
                    return NotificacionProveedor(
                        id_notificacion=row[0],
                        id_proveedor=row[1],
                        estado=row[2],
                        created_at=self.to_iso(row[3]),
                        mensaje=row[4],
                        productos=[]  # Se cargan por separado si es necesario
                    )
                return None

    def to_iso(self, dt):
        if isinstance(dt, str):
            dt = datetime.fromisoformat(dt.replace('Z', '+00:00'))
        return dt.isoformat(timespec="microseconds")