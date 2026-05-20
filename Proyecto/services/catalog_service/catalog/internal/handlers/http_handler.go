package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"catalog/internal/models"
	"catalog/internal/service"
)

type ProductHandler struct {
	service *service.ProductService
}

func NewProductHandler(s *service.ProductService) *ProductHandler {
	return &ProductHandler{s}
}

// ==============================
// VALIDACIONES
// ==============================
func validateProductInput(p *models.Product) error {

	if p.SKU == "" {
		return errors.New("sku is required")
	}
	if p.Name == "" {
		return errors.New("name is required")
	}
	if p.Price < 0 {
		return errors.New("price must be >= 0")
	}
	if p.Stock < 0 {
		return errors.New("stock must be >= 0")
	}
	if p.Category == "" {
		return errors.New("category is required")
	}
	if p.ProviderID <= 0 {
		return errors.New("providerId must be > 0")
	}

	return nil
}

// ==============================
// GET ALL PRODUCTS
// ==============================
func (h *ProductHandler) GetAll(c *gin.Context) {
	products, err := h.service.GetAllProducts()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error fetching products"})
		return
	}
	c.JSON(http.StatusOK, products)
}

// ==============================
// GET PRODUCT BY ID
// ==============================
func (h *ProductHandler) GetByID(c *gin.Context) {

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product ID"})
		return
	}

	product, err := h.service.GetProductByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "product not found"})
		return
	}

	c.JSON(http.StatusOK, product)
}

// ==============================
// CREATE PRODUCT
// ==============================
func (h *ProductHandler) Create(c *gin.Context) {

	var p models.Product

	if err := c.ShouldBindJSON(&p); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid JSON"})
		return
	}

	if err := validateProductInput(&p); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.CreateProduct(&p); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error creating product"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "product created"})
}

// ==============================
// UPDATE PRODUCT
// ==============================
func (h *ProductHandler) Update(c *gin.Context) {

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product ID"})
		return
	}

	var p models.Product

	if err := c.ShouldBindJSON(&p); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid JSON"})
		return
	}

	if err := validateProductInput(&p); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.UpdateProduct(id, &p); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "product not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "product updated"})
}

// ==============================
// DELETE PRODUCT
// ==============================
func (h *ProductHandler) Delete(c *gin.Context) {

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product ID"})
		return
	}

	if err := h.service.DeleteProduct(id); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "product not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "product deleted"})
}

// ==============================
// EXTERNAL PROVIDER CATALOG
// ==============================
func (h *ProductHandler) GetExternalCatalog(c *gin.Context) {

	products, err := h.service.GetExternalProducts()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not fetch external catalog"})
		return
	}

	c.JSON(http.StatusOK, products)
}
