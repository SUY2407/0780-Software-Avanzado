package service

import (
	"context"
	"errors"
	"fmt"
	"log"

	notificacionpb "catalog/internal/grpc"
	"catalog/internal/models"
)

/* =========================
   INTERFACES (CLAVE PARA TESTS)
========================= */

// Interfaz del repositorio (permite mocks)
type ProductRepository interface {
	GetAll() ([]models.Product, error)
	GetByID(id int) (*models.Product, error)
	Create(p *models.Product) error
	Update(id int, p *models.Product) error
	Delete(id int) error
	GetExternalProducts() ([]models.ExternalProduct, error)
}

/* =========================
   SERVICE
========================= */

type ProductService struct {
	repo        ProductRepository
	notifClient notificacionpb.NotificacionClient
}

/* =========================
   CONSTRUCTORES
========================= */

func NewProductService(
	repo ProductRepository,
	notifClient notificacionpb.NotificacionClient,
) *ProductService {
	return &ProductService{
		repo:        repo,
		notifClient: notifClient,
	}
}

/* =========================
   HELPERS
========================= */

func applyMarkup(base float64) float64 {
	return base * 1.10
}

/* =========================
   METHODS
========================= */

// GET ALL
func (s *ProductService) GetAllProducts() ([]models.Product, error) {
	products, err := s.repo.GetAll()
	if err != nil {
		return nil, err
	}

	for i := range products {
		products[i].Price = applyMarkup(products[i].Price)
	}

	return products, nil
}

// GET BY ID
func (s *ProductService) GetProductByID(id int) (*models.Product, error) {
	product, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	product.Price = applyMarkup(product.Price)
	return product, nil
}

// CREATE
func (s *ProductService) CreateProduct(p *models.Product) error {
	return s.repo.Create(p)
}

// UPDATE (SKU NO MODIFICABLE + NOTIFICACIÓN)
func (s *ProductService) UpdateProduct(id int, p *models.Product) error {
	existing, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}

	if p.SKU != "" && p.SKU != existing.SKU {
		return errors.New("SKU no se puede modificar")
	}

	// Forzar SKU original
	p.SKU = existing.SKU

	// 🔔 Notificación por bajo stock
	if p.Stock < 10 {
		fmt.Printf(
			"WARNING: el producto ID %d (SKU: %s) tiene bajo stock (%d unidades)\n",
			id, p.SKU, p.Stock,
		)

		_, err := s.notifClient.ProveedorNotificacion(
			context.Background(),
			&notificacionpb.ProveedorNotificacionRequest{
				IdProveedor: int32(p.ProviderID),
				Estado:      "STOCK_BAJO",
				Mensaje: fmt.Sprintf(
					"Producto %s (ID:%d) bajo stock: %d",
					p.SKU, id, p.Stock,
				),
				Productos: []*notificacionpb.ProductoNotificacion{
					{IdProducto: int32(id)},
				},
			},
		)

		if err != nil {
			log.Printf("Warning: no se pudo notificar bajo stock: %v", err)
		}
	}

	return s.repo.Update(id, p)
}

// DELETE
func (s *ProductService) DeleteProduct(id int) error {
	return s.repo.Delete(id)
}

// EXTERNAL PRODUCTS
func (s *ProductService) GetExternalProducts() ([]models.ExternalProduct, error) {
	return s.repo.GetExternalProducts()
}
