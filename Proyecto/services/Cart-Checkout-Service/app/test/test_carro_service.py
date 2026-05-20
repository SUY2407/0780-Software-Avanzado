import unittest
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime, timedelta
from carro.application.services.carro_service import CarroService
from carro.domain.entities.carro import Carro  # Usa carro.py original

class FakeCarroRepository:
    def __init__(self):
        self.guardado = None
        self.actualizado_estado = None
        self.actualizado_fecha = None
        self.carro_para_obtener = None

    def guardar(self, carro):
        self.guardado = carro
        return "OK"

    def obtener_carro(self, carro):
        return self.carro_para_obtener

    def actualizar_fecha(self, carro):
        self.actualizado_fecha = carro
        return "FECHA_OK"

class TestCarroService(unittest.TestCase):
    
    def setUp(self):
        self.repo = FakeCarroRepository()
        self.auth_mock = Mock()
        self.notif_mock = Mock()
        self.service = CarroService(self.repo, self.notif_mock, self.auth_mock)


    def test_actualizar_fecha_carro_no_encontrado(self):
        datos = {"token": "valid", "id_usuario": 1}
        self.repo.carro_para_obtener = None
        self.auth_mock.validate_token.return_value.valid = True
        
        resultado = self.service.actualizar_fecha(datos)
        
        self.assertEqual(resultado, "Carro no encontrado")

if __name__ == '__main__':
    unittest.main()
