package main

type FXService struct {
	redis  FXCache
	client FXRateClient
}

func NewFXService(redis FXCache, client FXRateClient) *FXService {
	return &FXService{redis, client}
}

func (s *FXService) GetRate(currency string) (float64, string, error) {

	// 1. LIVE
	live, err := s.client.FetchRate(currency)
	if err == nil {
		s.redis.SaveRate(currency, live)
		return live, "LIVE", nil
	}

	// 2. CACHE
	cached, err := s.redis.LoadRate(currency)
	if err == nil {
		return cached, "CACHE", nil
	}

	// 3. UNAVAILABLE
	return 0, "UNAVAILABLE", err
}
