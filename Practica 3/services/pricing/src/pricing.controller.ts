import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

// Definimos interfaces para tener autocompletado y claridad
interface Package {
  weight_kg: number;
  height_cm: number;
  width_cm: number;
  length_cm: number;
  fragile: boolean;
  declared_value_q: number;
}

interface Discount {
  type: string;
  value: number;
}

interface CalculatePriceRequest {
  origin_zone: string;
  destination_zone: string;
  service_type: string;
  packages: Package[];
  insurance_enabled: boolean;
  discount?: Discount;
}

@Controller()
export class PricingController {
  private readonly logger = new Logger(PricingController.name);
  @GrpcMethod('PricingService', 'CalculatePrice')
  calculatePrice(data: CalculatePriceRequest) {
    // --- DEBUG: Imprimir lo que recibimos para detectar campos perdidos ---
    console.log('PricingService recibió:', JSON.stringify(data, null, 2));
    this.logger.log(`CalculatePrice received: ${JSON.stringify(data)}`);

    const packages = data.packages || [];
    
    // --- 1. Calcular Peso Tarifable Total ---
    let orderBillableKg = 0;
    
    // Validar y calcular cada paquete
    packages.forEach(pkg => {
        // Conversión defensiva a Número (si llega undefined o string, lo convierte a 0)
        const h = Number(pkg.height_cm) || 0;
        const w = Number(pkg.width_cm) || 0;
        const l = Number(pkg.length_cm) || 0;
        const weight = Number(pkg.weight_kg) || 0;

        // Fórmula volumétrica: (Alto x Ancho x Largo) / 5000
        const volKg = (h * w * l) / 5000;
        
        // Peso tarifable es el mayor entre peso real y volumétrico
        const billable = Math.max(weight, volKg);
        
        orderBillableKg += billable;
    });

    console.log(`Peso Tarifable Total: ${orderBillableKg} kg`);
    this.logger.log(`Total billable weight: ${orderBillableKg} kg`);

    // --- 2. Tarifa Base por Zona Destino ---
    const rates: Record<string, number> = { 
        'METRO': 8, 
        'INTERIOR': 12, 
        'FRONTERA': 16 
    };
    // Si la zona no coincide, usamos 0 (o podríamos lanzar error)
    const rate = rates[data.destination_zone] || 0;
    
    const baseSubtotal = orderBillableKg * rate;

    // --- 3. Multiplicador por Tipo de Servicio ---
    const multipliers: Record<string, number> = { 
        'STANDARD': 1.00, 
        'EXPRESS': 1.35, 
        'SAME_DAY': 1.80 
    };
    const multiplier = multipliers[data.service_type] || 1.00;
    
    const serviceSubtotal = baseSubtotal * multiplier;

    // --- 4. Recargos (Frágil y Seguro) ---
    let fragileSurcharge = 0;
    let totalDeclaredValue = 0;
    
    packages.forEach(pkg => {
        if (pkg.fragile) {
            fragileSurcharge += 7; // 7Q fijos por paquete frágil
        }
        totalDeclaredValue += (Number(pkg.declared_value_q) || 0);
    });

    let insuranceSurcharge = 0;
    if (data.insurance_enabled) {
        insuranceSurcharge = 0.025 * totalDeclaredValue; // 2.5% del valor declarado
    }

    const subtotalWithSurcharges = serviceSubtotal + fragileSurcharge + insuranceSurcharge;

    // --- 5. Descuentos ---
    let discountAmount = 0;
    
    if (data.discount) {
        const discountVal = Number(data.discount.value) || 0;
        const discountType = data.discount.type;

        if (discountType === 'PERCENT') {
            // Regla: Tope del 35%
            // Si el valor enviado es > 35, es inválido según regla. Aquí lo ignoramos o aplicamos tope.
            // Asumiremos que si es <= 35 se aplica.
            if (discountVal <= 35) {
                discountAmount = (discountVal / 100) * subtotalWithSurcharges;
            }
        } else if (discountType === 'FIXED') {
            discountAmount = discountVal;
        }
    }
    
    // --- 6. Total Final ---
    let total = subtotalWithSurcharges - discountAmount;
    
    // Regla: El total no puede ser negativo
    if (total < 0) {
        total = 0;
    }

    // Redondeo a 2 decimales
    total = Math.round(total * 100) / 100;
    
    // Redondear desgloses también para que sumen bonito en la UI
    const breakdown = {
        base_subtotal: Math.round(baseSubtotal * 100) / 100,
        service_subtotal: Math.round(serviceSubtotal * 100) / 100,
        fragile_surcharge: Math.round(fragileSurcharge * 100) / 100,
        insurance_surcharge: Math.round(insuranceSurcharge * 100) / 100,
        subtotal_with_surcharges: Math.round(subtotalWithSurcharges * 100) / 100,
        discount_amount: Math.round(discountAmount * 100) / 100,
        total: total
    };

    console.log('Cálculo final:', JSON.stringify({ total, breakdown }));
    this.logger.log(`Calculation finished: ${JSON.stringify({ total })}`);
    return {
      breakdown: breakdown,
      total: total
    };
  }
}
