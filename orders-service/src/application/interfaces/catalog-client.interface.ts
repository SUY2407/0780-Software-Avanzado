export interface UpdateProductStockRequest {
  id: number;
  stock: number;
}

export interface UpdateProductResponse {
  message: string;
}

export interface ICatalogClient {
  updateProductStock(id: number, quantity: number): Promise<UpdateProductResponse>;
}

export const CATALOG_CLIENT = Symbol('ICatalogClient');
