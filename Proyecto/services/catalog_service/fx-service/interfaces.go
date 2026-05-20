package main

type FXRateClient interface {
	FetchRate(to string) (float64, error)
}

type FXCache interface {
	SaveRate(currency string, rate float64) error
	LoadRate(currency string) (float64, error)
}
