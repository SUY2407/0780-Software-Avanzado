package main

import (
	"log"
	"net"

	"catalog/internal/database"
	"catalog/internal/handlers"

	//"catalog/internal/middleware"
	"catalog/internal/repository"
	"catalog/internal/service"

	catalogpb "catalog/internal/grpc"
	notificacionpb "catalog/internal/grpc"

	grpc "google.golang.org/grpc"

	"github.com/gin-gonic/gin"
)

func main() {

	// ============================
	// 1. CONECTAR A BASE DE DATOS
	// ============================
	db, err := database.Connect()
	if err != nil {
		log.Fatalf("Error connecting to database: %v", err)
	}
	defer db.Close()

	notificacionConn, err := grpc.Dial("notificaciones-service:50056", grpc.WithInsecure())
	if err != nil {
		log.Fatalf("Failed to connect to notificaciones service: %v", err)
	}
	defer notificacionConn.Close()

	notificacionClient := notificacionpb.NewNotificacionClient(notificacionConn)

	// Repositorio, servicio y handlers

	repo := repository.NewProductRepository(db)
	productService := service.NewProductService(repo, notificacionClient) // ✅ Pasar el cliente gRPC
	handler := handlers.NewProductHandler(productService)

	// ============================
	// 2. LEVANTAR SERVIDOR gRPC
	// ============================
	go func() {
		lis, err := net.Listen("tcp", ":50058")
		if err != nil {
			log.Fatalf("failed to listen: %v", err)
		}

		// Registrar servicio Catalog
		s := grpc.NewServer()
		catalogpb.RegisterCatalogServiceServer(s, catalogpb.NewCatalogGRPCServer(repo))

		log.Println("gRPC server listening on :50058")

		if err := s.Serve(lis); err != nil {
			log.Fatalf("failed to serve gRPC: %v", err)
		}
	}()

	// ============================
	// 3. LEVANTAR SERVIDOR REST
	// ============================
	router := gin.Default()

	// ============================
	// SWAGGER ESTÁTICO
	// ============================
	router.StaticFile("/swagger.yaml", "./docs/swagger.yaml")

	// ============================
	// RUTAS VERSIONADAS /v1
	// ============================
	v1 := router.Group("/v1")
	//v1.Use(middleware.JWTAuth())
	{
		v1.GET("/products", handler.GetAll)
		v1.GET("/products/:id", handler.GetByID)
		v1.POST("/products", handler.Create)
		v1.PUT("/products/:id", handler.Update)
		v1.DELETE("/products/:id", handler.Delete)
	}

	// ============================
	// PROVEEDOR EXTERNO HOMOLOGADO
	// ============================
	router.GET("/external-catalog/v1/products", handler.GetExternalCatalog)

	// ============================
	// HEALTHCHECK (OBLIGATORIO)
	// ============================
	router.GET("/health/live", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "live"})
	})

	router.GET("/health/ready", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ready"})
	})

	// ============================
	// INICIAR SERVIDOR REST
	// ============================
	log.Println("REST API listening on :8081")
	router.Run(":8081")
}
