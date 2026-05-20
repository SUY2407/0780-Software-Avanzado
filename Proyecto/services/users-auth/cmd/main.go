package main

import (
	"log"
	"net"
	"os"

	grpcHandlerPkg "users-auth-service/internal/handlers/grpc"
	httpHandlerPkg "users-auth-service/internal/handlers/http"
	"users-auth-service/internal/repository"
	"users-auth-service/internal/service"
	"users-auth-service/pkg/database"
	pb "users-auth-service/proto"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"google.golang.org/grpc"

	// IMPORTANTE PARA SWAGGER
	// Si la carpeta docs no existe aún, corre 'swag init' primero
	docs "users-auth-service/docs"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title           Users Auth Service API
// @version         1.0
// @description     Servicio de autenticación y gestión de usuarios para EconoMarket.
// @termsOfService  http://swagger.io/terms/

// @contact.name   Soporte EconoMarket
// @contact.url    http://www.economarket.com/support
// @contact.email  support@economarket.com

// @license.name  Apache 2.0
// @license.url   http://www.apache.org/licenses/LICENSE-2.0.html

// @host      localhost:8080
// @BasePath  /api/v1

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	db, err := database.Connect()
	if err != nil {
		log.Fatal("❌ Database connection failed:", err)
	}
	defer db.Close()

	if err := database.InitSchema(db); err != nil {
		log.Fatal("❌ Schema initialization failed:", err)
	}
	log.Println("✅ Database and schema ready")

	repo := repository.NewUserRepository(db)
	authService := service.NewAuthService(repo)

	httpHandler := httpHandlerPkg.NewAuthHandler(authService)
	grpcHandler := grpcHandlerPkg.NewAuthGRPCHandler(authService)

	// gRPC server
	go startGRPCServer(grpcHandler)

	// HTTP server
	startHTTPServer(httpHandler)
}

func startGRPCServer(handler *grpcHandlerPkg.AuthGRPCHandler) {
	port := os.Getenv("GRPC_PORT")
	if port == "" {
		port = "50051"
	}

	lis, err := net.Listen("tcp", ":"+port)
	if err != nil {
		log.Fatalf("❌ gRPC listen failed: %v", err)
	}

	server := grpc.NewServer()
	pb.RegisterAuthServiceServer(server, handler)

	log.Printf("🚀 gRPC server listening on :%s", port)
	if err := server.Serve(lis); err != nil {
		log.Fatalf("❌ gRPC server failed: %v", err)
	}
}

func startHTTPServer(handler *httpHandlerPkg.AuthHandler) {
	port := os.Getenv("HTTP_PORT")
	if port == "" {
		port = "8080"
	}

	r := gin.Default()

	// Configuración dinámica del Host para Swagger (útil en K8s)
	docs.SwaggerInfo.Host = os.Getenv("SWAGGER_HOST")
	if docs.SwaggerInfo.Host == "" {
		docs.SwaggerInfo.Host = "localhost:" + port
	}

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "healthy",
			"service": "users-auth-service",
		})
	})

	// Ruta para ver la documentación visualmente (http://localhost:8080/swagger/index.html)
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	api := r.Group("/api/v1")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", handler.Register)
			auth.POST("/login", handler.Login)
			auth.GET("/me", handler.AuthMiddleware(), handler.Me)
		}
	}

	log.Printf("🚀 HTTP server listening on :%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("❌ HTTP server failed: %v", err)
	}
}
