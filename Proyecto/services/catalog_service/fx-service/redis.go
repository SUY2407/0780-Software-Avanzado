package main

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

type RedisClient struct {
	client *redis.Client
}

func NewRedisClient(addr string) *RedisClient {
	rdb := redis.NewClient(&redis.Options{
		Addr: addr,
	})

	return &RedisClient{client: rdb}
}

func (r *RedisClient) SaveRate(currency string, rate float64) error {
	key := "FX_USD_" + currency
	return r.client.Set(context.Background(), key, rate, 5*time.Minute).Err()
}

func (r *RedisClient) LoadRate(currency string) (float64, error) {
	key := "FX_USD_" + currency
	return r.client.Get(context.Background(), key).Float64()
}
