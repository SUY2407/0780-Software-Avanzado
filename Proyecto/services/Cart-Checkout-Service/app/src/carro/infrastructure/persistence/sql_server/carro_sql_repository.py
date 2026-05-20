from typing import Optional
from ....domain.repositories.interfaces.carro_repository import CarroRepositoryInterface
from ....domain.entities.carro import Carro
from ....domain.entities.carro import ProductoCarro
from typing import List, Optional

class CarroSqlRepository(CarroRepositoryInterface):
    def __init__(self, db_connection):
        self.db_connection = db_connection
    
    def guardar(self, carro: Carro) -> int:
        """Guarda un carro (actualiza si existe) y retorna el id_carro"""
        print("Guardando/Actualizando carro en SQL Server:", carro)
        
        with self.db_connection.get_connection() as conn:
            cursor = conn.cursor()
            try:
                # 1. Buscar carro existente por id_usuario, estado y check_out
                query_buscar = """
                SELECT id_carro FROM [dbo].[carro] 
                WHERE id_usuario = ? AND estado = ? AND check_out = ?
                """
                cursor.execute(query_buscar, (
                    carro.id_usuario,
                    carro.estado,
                    carro.check_out
                ))
                existing_carro = cursor.fetchone()
                
                if existing_carro:
                    # 2. Carro existe: borrar productos anteriores y actualizar carro
                    id_carro = existing_carro[0]
                    print(f"Carro existente encontrado (ID: {id_carro}), actualizando...")
                    
                    # Borrar productos anteriores
                    query_borrar_productos = """
                    DELETE FROM [dbo].[productoCarrito] WHERE id_carro = ?
                    """
                    cursor.execute(query_borrar_productos, (id_carro,))
                    
                    # Actualizar carro
                    query_update = """
                    UPDATE [dbo].[carro] 
                    SET total = ?, updated_at = ?
                    WHERE id_carro = ?
                    """
                    cursor.execute(query_update, (
                        carro.total,
                        carro.updated_at,
                        id_carro
                    ))
                else:
                    # 3. Carro nuevo: insertar
                    query_insert = """
                    INSERT INTO [dbo].[carro] ([id_usuario], [estado], [created_at], [check_out], [total], [updated_at])
                    OUTPUT INSERTED.id_carro
                    VALUES (?, ?, ?, ?, ?, ?)
                    """
                    cursor.execute(query_insert, (
                        carro.id_usuario,
                        carro.estado,
                        carro.created_at,
                        carro.check_out,
                        carro.total,
                        carro.updated_at
                    ))
                    id_carro = cursor.fetchone()[0]
                    print(f"Carro nuevo creado con ID: {id_carro}")
                
                # 4. Insertar productos (siempre, después de carro)
                for producto in carro.productos:
                    print("Guardando producto en carro:", producto)
                    query_producto = """
                    INSERT INTO [dbo].[productoCarrito] ([id_carro], [id_producto], [cantidad], [precio])
                    VALUES (?, ?, ?, ?)
                    """
                    cursor.execute(query_producto, (
                        id_carro,
                        producto["id_producto"],
                        producto["cantidad"],
                        producto["precio"],
                    ))
                
                conn.commit()
                print(f"Carro procesado exitosamente con ID: {id_carro}")
                return id_carro
                
            except Exception as e:
                conn.rollback()
                print(f"Error al guardar carro: {e}")
                raise
            finally:
                cursor.close()
    
    def obtener_carro(self, carro: Carro) -> Optional[Carro]:
        """Obtener un carro abierto (check_out) para un usuario"""
        
        with self.db_connection.get_connection() as conn:
            cursor = conn.cursor()
            try:
                carro_encontrado: Optional[Carro] = None

                
                query_carro = """
                    SELECT id_carro, id_usuario, estado, created_at, check_out, total, updated_at
                    FROM carro
                    WHERE id_usuario = ? AND estado = ? AND check_out = ?
                """
                cursor.execute(query_carro, (carro.id_usuario, carro.estado, carro.check_out))
                row = cursor.fetchone()

                if not row:
                    return None

                carro_encontrado = Carro(
                    id_carro=row[0],
                    id_usuario=row[1],
                    estado=row[2],
                    created_at=self.to_iso(row[3]),
                    check_out=row[4],
                    total=float(row[5]) if row[5] is not None else 0.0,
                    updated_at=self.to_iso(row[6]),
                    productos=[]
                )

                
                query_productos = """
                    SELECT id_carro, id_producto, cantidad, precio
                    FROM productoCarrito
                    WHERE id_carro = ?
                """
                cursor.execute(query_productos, (carro_encontrado.id_carro,))
                rows = cursor.fetchall()

                productos: List[ProductoCarro] = []
                for producto_row in rows:
                    producto = ProductoCarro(
                        id_producto=producto_row[1],
                        cantidad=producto_row[2],
                        precio=float(producto_row[3]) if producto_row[3] is not None else 0.0
                    )
                    productos.append(producto)

                carro_encontrado.productos = productos
                return carro_encontrado

            except Exception as e:
                conn.rollback()
                print(f"Error al obtener carro: {e}")
                raise
            finally:
                cursor.close()

    def to_iso(self, dt):
        if dt is None:
            return None
        # Mantiene microsegundos en formato ISO 8601
        return dt.isoformat(timespec="microseconds")
    
    def actualizar_estados(self, carro: Carro) -> bool:
        """Actualiza el estado de pago del carro"""
        print("Actualizando estado de pago del carro en SQL Server:", carro)
        
        with self.db_connection.get_connection() as conn:
            cursor = conn.cursor()
            try:
                query = """
                UPDATE [dbo].[carro]
                SET [estado] = ?, [check_out] = ?
                WHERE [id_carro] = ?
                """
                cursor.execute(query, (
                    carro.estado,
                    carro.check_out,
                    carro.id_carro
                ))
                
                conn.commit()
                
                print(f"Carro actualizado exitosamente con ID: {carro.id_carro}")
                return True
                
            except Exception as e:
                conn.rollback()
                print(f"Error al actualizar carro: {e}")
                raise
            finally:
                cursor.close()

    def actualizar_fecha(self, carro: Carro) -> bool:
        """Actualiza la fecha de actualización del carro"""
        print("Actualizando fecha de actualización del carro en SQL Server:", carro)
        
        with self.db_connection.get_connection() as conn:
            cursor = conn.cursor()
            try:
                query = """
                UPDATE [dbo].[carro]
                SET [updated_at] = ?
                WHERE [id_usuario] = ? and [estado] = ? and [check_out] = ? 
                """
                cursor.execute(query, (
                    carro.updated_at,
                    carro.id_usuario,
                    carro.estado,
                    carro.check_out
                ))
                
                conn.commit()
                
                print(f"Fecha de carro actualizada exitosamente del usuario: {carro.id_usuario}")
                return True
                
            except Exception as e:
                conn.rollback()
                print(f"Error al actualizar fecha del carro: {e}")
                raise
            finally:
                cursor.close()