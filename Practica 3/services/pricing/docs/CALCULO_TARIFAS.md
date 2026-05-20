# Cálculo Tarifario – Pricing Service

## Principios
El cálculo tarifario del sistema QuetzalShip es:
- Determinista
- Reproducible
- Centralizado exclusivamente en el Pricing Service

Ningún otro servicio realiza cálculos monetarios.

## Peso Volumétrico
Para cada paquete se calcula el peso volumétrico usando la fórmula:

volumetricKg = (alto × ancho × largo) / 5000

Las dimensiones se expresan en centímetros.

## Peso Tarifable
El peso tarifable por paquete corresponde al máximo entre:
- Peso real
- Peso volumétrico

El peso tarifable total de la orden es la suma de los pesos tarifables
de todos los paquetes.

## Tarifa Base
La tarifa base depende de la zona destino:

- METRO: Q8 por kg
- INTERIOR: Q12 por kg
- FRONTERA: Q16 por kg

## Tipo de Servicio
El subtotal base se multiplica por un factor según el tipo de servicio:

- STANDARD: 1.00
- EXPRESS: 1.35
- SAME_DAY: 1.80

## Recargos
Se aplican los siguientes recargos:

### Frágil
Q7 por cada paquete marcado como frágil.

### Seguro
Si el seguro está habilitado, se aplica un recargo del 2.5% sobre
la suma del valor declarado de todos los paquetes.

## Descuentos
Los descuentos se aplican sobre el subtotal con recargos.

### Descuento Porcentual
- Máximo permitido: 35%
- Valores superiores se consideran inválidos.

### Descuento Fijo
- Se descuenta un monto fijo en quetzales.
- El total nunca puede ser negativo.

## Redondeo
El total final se redondea a dos decimales.
Internamente se recomienda el uso de centavos para evitar errores
de precisión.
