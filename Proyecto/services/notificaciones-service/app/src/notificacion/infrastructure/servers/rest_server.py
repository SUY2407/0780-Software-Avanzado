import uvicorn
from fastapi import FastAPI
from notificacion.presentation.rest.rest_controller_factory import RESTControllerFactory
from notificacion.application.services.notificacion_service import NotificacionService
from notificacion.presentation.rest import notificacion_controller


def start_rest_server(host: str = "0.0.0.0", port: int = 8000, notificacion_service: NotificacionService=None):
    
    app = FastAPI(
        title="Notificacion API",
        description="API para notificaciones",
        version="1.0.0",
        openapi_url="/openapi.json",
        docs_url="/v1/docs",      # Swagger UI at /v1/docs
        redoc_url="/v1/redoc"
    )

    

    # dependencia que devuelve SIEMPRE el mismo service
    def get_notificacion_service() -> NotificacionService:
        return notificacion_service
    


    notificacion_controller.configure_dependencies(get_notificacion_service)

    RESTControllerFactory(app)

    import uvicorn
    uvicorn.run(app, host=host, port=port)