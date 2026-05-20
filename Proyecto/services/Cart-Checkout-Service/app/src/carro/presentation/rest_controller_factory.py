from fastapi import FastAPI
from carro.presentation.rest import carro_controller


class RESTControllerFactory:
    def __init__(self, app: FastAPI, prefix: str = "/v1"):
        self.app = app
        self.prefix = prefix
        self._register_routes()
    
    def _register_routes(self):
        # El prefix /v1 se aplica aquí
        self.app.include_router(carro_controller.router, prefix=self.prefix)