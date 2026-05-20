package main

import (
	"errors"
	"testing"
)

type mockFXClient struct {
	rate float64
	err  error
}

func (m *mockFXClient) FetchRate(to string) (float64, error) {
	return m.rate, m.err
}

type mockRedis struct {
	rate float64
	err  error
}

func (m *mockRedis) SaveRate(currency string, rate float64) error {
	return nil
}

func (m *mockRedis) LoadRate(currency string) (float64, error) {
	return m.rate, m.err
}

func TestGetRate_Live(t *testing.T) {
	service := NewFXService(
		&mockRedis{},
		&mockFXClient{rate: 18.5},
	)

	rate, source, err := service.GetRate("MXN")

	if err != nil || source != "LIVE" || rate != 18.5 {
		t.Fatal("live rate failed")
	}
}

func TestGetRate_Cache(t *testing.T) {
	service := NewFXService(
		&mockRedis{rate: 17.9},
		&mockFXClient{err: errors.New("api down")},
	)

	rate, source, _ := service.GetRate("MXN")

	if source != "CACHE" || rate != 17.9 {
		t.Fatal("cache fallback failed")
	}
}

func TestGetRate_Unavailable(t *testing.T) {
	service := NewFXService(
		&mockRedis{err: errors.New("redis down")},
		&mockFXClient{err: errors.New("api down")},
	)

	_, source, err := service.GetRate("MXN")

	if err == nil || source != "UNAVAILABLE" {
		t.Fatal("expected unavailable")
	}
}
