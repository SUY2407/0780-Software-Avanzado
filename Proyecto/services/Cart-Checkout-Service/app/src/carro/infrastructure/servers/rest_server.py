import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from carro.presentation.rest_controller_factory import RESTControllerFactory
from carro.application.services.carro_service import CarroService
from carro.presentation.rest import carro_controller

def start_rest_server(host: str = "0.0.0.0", port: int = 8086, carro_service: CarroService = None):
    # FastAPI with OpenAPI v1 configuration
    app = FastAPI(
        title="Cart-Checkout Service API",
        description="EconoMarket Cart-Checkout microservice - REST endpoints v1.0.0",
        version="1.0.0",
        openapi_url="/v1/openapi.json",
        docs_url="/v1/docs",      # Swagger UI at /v1/docs
        redoc_url="/v1/redoc"
    )
    
    
    # Health check endpoint
    @app.get("/v1/health")
    async def health_check():
        return {"status": "healthy", "service": "cart-checkout"}
    
    # Dependency configuration
    def get_carro_service() -> CarroService:
        if carro_service is None:
            raise RuntimeError("CarroService not provided")
        return carro_service
    
    carro_controller.configure_dependencies(get_carro_service)
    
    # Include REST controllers with v1 prefix
    RESTControllerFactory(app, prefix="/v1")
    
    # Startup event for logging
    @app.on_event("startup")
    async def startup_event():
        print("🚀 Cart-Checkout Service REST v1.0.0 starting...")
        print("📖 Swagger UI: http://localhost:8086/v1/docs")
        print("🔍 OpenAPI JSON: http://localhost:8086/v1/openapi.json")
    
    uvicorn.run(app, host=host, port=port, log_level="info")
