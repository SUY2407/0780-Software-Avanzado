package service

import (
	"testing"

	"catalog/internal/models"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

/* =====================
   MOCK REPOSITORIO
===================== */

type MockProductRepository struct {
	mock.Mock
}

func (m *MockProductRepository) GetAll() ([]models.Product, error) {
	args := m.Called()
	return args.Get(0).([]models.Product), args.Error(1)
}

func (m *MockProductRepository) GetByID(id int) (*models.Product, error) {
	args := m.Called(id)
	return args.Get(0).(*models.Product), args.Error(1)
}

func (m *MockProductRepository) Create(p *models.Product) error {
	args := m.Called(p)
	return args.Error(0)
}

func (m *MockProductRepository) Update(id int, p *models.Product) error {
	args := m.Called(id, p)
	return args.Error(0)
}

func (m *MockProductRepository) Delete(id int) error {
	args := m.Called(id)
	return args.Error(0)
}

func (m *MockProductRepository) GetExternalProducts() ([]models.ExternalProduct, error) {
	args := m.Called()
	return args.Get(0).([]models.ExternalProduct), args.Error(1)
}

/* =====================
   TESTS
===================== */

func TestGetAllProducts(t *testing.T) {
	mockRepo := new(MockProductRepository)

	products := []models.Product{
		{ID: 1, Name: "Product A", Price: 100},
		{ID: 2, Name: "Product B", Price: 200},
	}

	mockRepo.On("GetAll").Return(products, nil)

	svc := NewProductService(mockRepo, nil)

	result, err := svc.GetAllProducts()

	assert.NoError(t, err)
	assert.InDelta(t, 110.0, result[0].Price, 0.001)
	assert.InDelta(t, 220.0, result[1].Price, 0.001)

	mockRepo.AssertExpectations(t)
}

func TestCreateProduct(t *testing.T) {
	mockRepo := new(MockProductRepository)

	product := &models.Product{
		SKU:   "SKU123",
		Name:  "Product C",
		Price: 150,
	}

	mockRepo.On("Create", product).Return(nil)

	svc := NewProductService(mockRepo, nil)

	err := svc.CreateProduct(product)

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestUpdateProduct_SKUNoModificable(t *testing.T) {
	mockRepo := new(MockProductRepository)

	existing := &models.Product{ID: 1, SKU: "SKU123"}
	update := &models.Product{SKU: "NEW_SKU"}

	mockRepo.On("GetByID", 1).Return(existing, nil)

	svc := NewProductService(mockRepo, nil)

	err := svc.UpdateProduct(1, update)

	assert.Error(t, err)
	assert.Equal(t, "SKU no se puede modificar", err.Error())
}
