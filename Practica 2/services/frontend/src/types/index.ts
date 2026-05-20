// services/frontend/src/types/index.ts

export interface Package {
  weight_kg: number;
  height_cm: number;
  width_cm: number;
  length_cm: number;
  fragile: boolean;
  declared_value_q: number;
}

export interface Discount {
  type: string;
  value: number;
}

export interface Breakdown {
  base_subtotal: number;
  service_subtotal: number;
  fragile_surcharge: number;
  insurance_surcharge: number;
  discount_amount: number;
  total: number;
}

export interface Order {
  order_id?: string;
  status?: string;
  created_at?: string;
  origin_zone: string;
  destination_zone: string;
  service_type: string;
  packages: Package[];
  discount?: Discount;
  insurance_enabled: boolean;
  breakdown?: Breakdown;
  total?: number;
}
