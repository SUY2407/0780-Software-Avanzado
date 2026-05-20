package grpc

import (
	"catalog/internal/models"
	"catalog/internal/repository"
	"context"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// ============================
// APLICAR MARKUP +10%
// ============================
func applyMarkup(base float64) float64 {
	return base * 1.10
}

type CatalogGRPCServer struct {
	UnimplementedCatalogServiceServer
	repo *repository.ProductRepository
}

func NewCatalogGRPCServer(r *repository.ProductRepository) *CatalogGRPCServer {
	return &CatalogGRPCServer{repo: r}
}

// ============================
// LISTA TODOS LOS PRODUCTOS
// ============================
func (s *CatalogGRPCServer) ListProducts(ctx context.Context, req *Empty) (*ListProductsResponse, error) {

	products, err := s.repo.GetAll()
	if err != nil {
		return nil, status.Errorf(codes.Internal, "database error: %v", err)
	}

	var response []*Product

	for _, p := range products {
		response = append(response, &Product{
			Id:          int32(p.ID),
			Sku:         p.SKU,
			Name:        p.Name,
			Description: p.Description,
			Price:       applyMarkup(p.Price),
			Stock:       int32(p.Stock),
			Category:    p.Category,
			ImageUrl:    p.ImageURL,
			ProviderId:  int32(p.ProviderID),
		})
	}

	return &ListProductsResponse{Products: response}, nil
}

// ============================
// OBTENER PRODUCTO POR ID
// ============================
func (s *CatalogGRPCServer) GetProduct(ctx context.Context, req *ProductIdRequest) (*Product, error) {

	if req.Id <= 0 {
		return nil, status.Error(codes.InvalidArgument, "invalid product ID")
	}

	p, err := s.repo.GetByID(int(req.Id))
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "product with ID %d not found", req.Id)
	}

	return &Product{
		Id:          int32(p.ID),
		Sku:         p.SKU,
		Name:        p.Name,
		Description: p.Description,
		Price:       applyMarkup(p.Price),
		Stock:       int32(p.Stock),
		Category:    p.Category,
		ImageUrl:    p.ImageURL,
		ProviderId:  int32(p.ProviderID),
	}, nil
}

// ============================
// CREAR PRODUCTO
// ============================
func (s *CatalogGRPCServer) CreateProduct(ctx context.Context, req *CreateProductRequest) (*GenericResponse, error) {

	if req.Sku == "" || req.Name == "" {
		return nil, status.Error(codes.InvalidArgument, "sku and name are required")
	}
	if req.Price < 0 || req.Stock < 0 {
		return nil, status.Error(codes.InvalidArgument, "price and stock must be positive")
	}

	p := models.Product{
		SKU:         req.Sku,
		Name:        req.Name,
		Description: req.Description,
		Price:       req.Price,
		Stock:       int(req.Stock),
		Category:    req.Category,
		ImageURL:    req.ImageUrl,
		ProviderID:  int(req.ProviderId),
	}

	if err := s.repo.Create(&p); err != nil {
		return nil, status.Errorf(codes.Internal, "database error: %v", err)
	}

	return &GenericResponse{Message: "Product created"}, nil
}

// ============================
// ACTUALIZAR PRODUCTO
// ============================
func (s *CatalogGRPCServer) UpdateProduct(ctx context.Context, req *UpdateProductRequest) (*GenericResponse, error) {

	if req.Id <= 0 {
		return nil, status.Error(codes.InvalidArgument, "invalid product ID")
	}

	// comprobar si existe
	_, err := s.repo.GetByID(int(req.Id))
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "product %d not found", req.Id)
	}

	p := models.Product{
		SKU:         req.Sku,
		Name:        req.Name,
		Description: req.Description,
		Price:       req.Price,
		Stock:       int(req.Stock),
		Category:    req.Category,
		ImageURL:    req.ImageUrl,
		ProviderID:  int(req.ProviderId),
	}

	if err := s.repo.Update(int(req.Id), &p); err != nil {
		return nil, status.Errorf(codes.Internal, "database error: %v", err)
	}

	return &GenericResponse{Message: "Product updated"}, nil
}

// ============================
// ELIMINAR PRODUCTO
// ============================
func (s *CatalogGRPCServer) DeleteProduct(ctx context.Context, req *ProductIdRequest) (*GenericResponse, error) {

	if req.Id <= 0 {
		return nil, status.Error(codes.InvalidArgument, "invalid product ID")
	}

	_, err := s.repo.GetByID(int(req.Id))
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "product %d not found", req.Id)
	}

	if err := s.repo.Delete(int(req.Id)); err != nil {
		return nil, status.Errorf(codes.Internal, "database error: %v", err)
	}

	return &GenericResponse{Message: "Product deleted"}, nil
}
