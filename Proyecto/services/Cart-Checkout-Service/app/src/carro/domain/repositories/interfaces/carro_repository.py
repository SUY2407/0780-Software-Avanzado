from abc import ABC, abstractmethod
from typing import Optional
from ...entities.carro import Carro

class CarroRepositoryInterface(ABC):  # ← Interface oficial
    @abstractmethod
    def guardar(self, carro: Carro) -> None:
        pass
    
    @abstractmethod
    def obtener_carro(self, carro: Carro) -> Optional[Carro]:
        pass

    @abstractmethod
    def actualizar_estados(self, carro: Carro) -> str:
        pass
    
    @abstractmethod
    def actualizar_fecha(self, carro: Carro) -> str:
        pass