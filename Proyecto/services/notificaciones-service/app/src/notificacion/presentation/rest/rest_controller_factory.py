from fastapi import FastAPI
from notificacion.presentation.rest import notificacion_controller

class RESTControllerFactory:
    def __init__(self, app: FastAPI):
        self.app = app
        self._register_routes()
    
    def _register_routes(self):
        self.app.include_router(notificacion_controller.router)