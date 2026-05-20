package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

/*
========================================================
HANDLER
Proveedor Externo (OBLIGATORIO – Consigna 3.7.1)
========================================================
*/
func GetExternalCatalog(c *gin.Context) {

	products := []gin.H{
		{
			"sku":           "SKU-001",
			"name":          "Producto Ejemplo",
			"image":         "https://example.com/image.jpg",
			"price":         1500,
			"stock":         20,
			"category":      "Electrónica",
			"externalLabel": "Proveedor Externo",
			"groupNumber":   12,
		},
		{
			"sku":           "SKU-002",
			"name":          "Producto Demo",
			"image":         "https://example.com/image2.jpg",
			"price":         999,
			"stock":         5,
			"category":      "Hogar",
			"externalLabel": "Proveedor Externo",
			"groupNumber":   12,
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"total":    len(products),
		"products": products,
	})
}

/*
========================================================
INTERFACES (CLAVE PARA TESTS)
========================================================
*/

type ExternalCatalogClient interface {
	FetchExternalCatalog() ([]map[string]interface{}, error)
}

type Cache interface {
	Save(data interface{})
	Load() ([]map[string]interface{}, error)
}

/*
========================================================
HANDLER PRIVADO (CONSUMO + FALLBACK)
========================================================
*/

type IntegrationHandler struct {
	client      ExternalCatalogClient
	redisClient Cache
}

func NewIntegrationHandler(c ExternalCatalogClient, r Cache) *IntegrationHandler {
	return &IntegrationHandler{
		client:      c,
		redisClient: r,
	}
}

func (h *IntegrationHandler) GetIntegratedCatalog(c *gin.Context) {

	// 1️⃣ Proveedor externo
	products, err := h.client.FetchExternalCatalog()
	if err == nil && products != nil {
		h.redisClient.Save(products)
		c.JSON(http.StatusOK, gin.H{
			"status":   "LIVE",
			"products": products,
		})
		return
	}

	// 2️⃣ Fallback a Redis
	cached, cacheErr := h.redisClient.Load()
	if cacheErr == nil && cached != nil {
		c.JSON(http.StatusOK, gin.H{
			"status":   "CACHED_FALLBACK",
			"products": cached,
		})
		return
	}

	// 3️⃣ No disponible
	c.JSON(http.StatusServiceUnavailable, gin.H{
		"status":  "UNAVAILABLE",
		"message": "Provider unreachable and no cached data",
	})
}
