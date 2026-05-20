package main

import (
	//"fx-service/middleware"

	"log"
	"os"

	"github.com/gin-gonic/gin"
)

func main() {

	fxURL := os.Getenv("FX_API_URL")
	if fxURL == "" {
		fxURL = "https://open.er-api.com/v6/latest/USD"
	}

	redisClient := NewRedisClient("redis:6379")
	fxClient := NewFXClient(fxURL)
	fxService := NewFXService(redisClient, fxClient)
	fxHandler := NewFXHandler(fxService)

	router := gin.Default()

	// 🔐 RUTAS PROTEGIDAS CON JWT
	v1 := router.Group("/fx/v1")
	//
	{
		v1.GET("/rate", fxHandler.GetRate)
	}

	router.GET("/health/live", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "live"})
	})

	router.GET("/health/ready", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ready"})
	})

	log.Println("FX Service listening on :8083")
	router.Run(":8083")
}
