package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()

	externalURL := os.Getenv("EXTERNAL_CATALOG_URL")
	log.Println("Using external catalog URL:", externalURL)

	if externalURL == "" {
		externalURL = "http://136.112.243.96/external-catalog/v1/products"
	}

	client := NewExternalClient(externalURL)
	redisClient := NewRedisCache()
	handler := NewIntegrationHandler(client, redisClient)

	// 🔐 VOS ves el catálogo de ELLOS (PROTEGIDO)
	v1 := router.Group("/integrations/v1")
	//v1.Use(middleware.JWTAuth())
	{
		v1.GET("/products", handler.GetIntegratedCatalog)
	}

	// 🌍 ELLOS ven TU catálogo (PÚBLICO)
	router.GET("/external-catalog/v1/products", GetExternalCatalog)

	// 🟢 HEALTHCHECKS (PÚBLICOS)
	router.GET("/health/live", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "live"})
	})

	router.GET("/health/ready", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ready"})
	})

	router.Run(":8091")
}
