package models

type ExternalProduct struct {
	SKU           string  `json:"sku"`
	Image         string  `json:"image"`
	Name          string  `json:"name"`
	Price         float64 `json:"price"`
	Stock         int     `json:"stock"`
	Category      string  `json:"category"`
	ExternalLabel string  `json:"externalLabel"`
	GroupNumber   int     `json:"groupNumber"`
}
