import grpc
from . import catalog_pb2
from . import catalog_pb2_grpc
import os

class CatalogGrpcClient:
    def __init__(self):
        target_host = os.getenv('CATALOG_SERVICE_HOST', 'catalog-service')
        target_port = os.getenv('CATALOG_SERVICE_PORT', '50051')
        target = f"{target_host}:{target_port}"
        self.channel = grpc.insecure_channel(target)
        self.stub = catalog_pb2_grpc.CatalogServiceStub(self.channel)

    def get_product(self, product_id: int):
        """Obtiene un producto por ID"""
        request = catalog_pb2.ProductIdRequest(id=product_id)
        return self.stub.GetProduct(request)

    def update_product(self, product_id: int, sku: str, name: str, description: str, 
                      price: float, stock: int, category: str, image_url: str, provider_id: int):
        """Actualiza un producto por ID"""
        request = catalog_pb2.UpdateProductRequest(
            id=product_id,
            sku=sku,
            name=name,
            description=description,
            price=price,
            stock=stock,
            category=category,
            imageUrl=image_url,
            providerId=provider_id
        )
        return self.stub.UpdateProduct(request)

    def delete_product(self, product_id: int):
        """Elimina un producto por ID"""
        request = catalog_pb2.ProductIdRequest(id=product_id)
        return self.stub.DeleteProduct(request)
