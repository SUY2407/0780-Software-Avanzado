package main

import (
	"database/sql"
	"fmt"
	"log"
	"net"
	"payment-service/config"
	"payment-service/internal/cliente"
	"payment-service/internal/handler"
	"payment-service/internal/repository"
	"payment-service/internal/routes"
	"payment-service/internal/service"
	pb "payment-service/pb"
	"sync"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/grpc"

	_ "github.com/denisenkom/go-mssqldb"
)

// @title Payment Service API
// @version 1.0
// @description API REST del servicio de pagos
// @host localhost:8000
// @BasePath /api
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
func main() {

	configuracion := config.LoadConfig()

	db, error := sql.Open("sqlserver", configuracion.GetDBConnectionString())

	if error != nil {
		log.Fatalf("error al conectar a sqlserver: %v", error)
	}

	defer db.Close()

	if error := db.Ping(); error != nil {
		log.Fatalf("error verificando conexion a db: %v", error)
	}

	ordersClient, err := cliente.NewOrdersClient("orders-service:50052")
	if err != nil {
		log.Fatalf("error al crear cliente de órdenes: %v", err)
	}
	defer ordersClient.Close()

	notificacionClient, errorNoti := cliente.NewNotificacionClient("notificaciones-service:50056")

	if errorNoti != nil {
		log.Fatalf("error al crear cliente de órdenes: %v", err)
	}

	defer notificacionClient.Close()

	repo := repository.NewPaymentRepository(db)

	servicio := service.NewPaymentService(repo, ordersClient, notificacionClient)

	grpchandler := handler.NewGrpcHandler(servicio)
	resthandler := handler.NewRestHandler(servicio)

	var wg sync.WaitGroup
	wg.Add(2)

	go func() {
		defer wg.Done()
		IniciarGrpcServer(configuracion.GRPCPort, grpchandler)
	}()

	go func() {
		defer wg.Done()
		IniciarRestServer(configuracion.RESTPort, configuracion.Secret, resthandler)
	}()

	wg.Wait()
}

func IniciarGrpcServer(port string, handler *handler.GrpcHandler) {
	listen, error := net.Listen("tcp", ":"+port)
	if error != nil {
		log.Printf("error iniciando el servidor gRPC: %v", error)
	}

	grpcServer := grpc.NewServer()
	pb.RegisterPaymentServiceServer(grpcServer, handler)

	if error := grpcServer.Serve(listen); error != nil {
		log.Printf("error sirviendo gRPC: %v", error)
		return
	}

}

func IniciarRestServer(port, secret string, handler *handler.RestHandler) {
	app := fiber.New()

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusOK)
	})

	routes.SetUpRoutes(app, handler, secret)

	if error := app.Listen(fmt.Sprintf(":%s", port)); error != nil {
		log.Fatalf("error iniciando el servidor REST: %v", error)
	}
}
