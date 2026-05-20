package main

import (
	"context"
	"encoding/json"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
)

type RedisCache struct {
	client *redis.Client
	ctx    context.Context
}

func NewRedisCache() *RedisCache {
	addr := os.Getenv("REDIS_HOST") + ":" + os.Getenv("REDIS_PORT")

	rdb := redis.NewClient(&redis.Options{
		Addr: addr,
	})

	return &RedisCache{
		client: rdb,
		ctx:    context.Background(),
	}
}

/*
=====================
IMPLEMENTA Cache
=====================
*/

// Save DEBE coincidir con la interfaz (NO devuelve error)
func (r *RedisCache) Save(data interface{}) {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return
	}

	_ = r.client.Set(
		r.ctx,
		"external_catalog",
		jsonData,
		10*time.Minute,
	).Err()
}

// Load IMPLEMENTA la interfaz Cache
func (r *RedisCache) Load() ([]map[string]interface{}, error) {
	val, err := r.client.Get(r.ctx, "external_catalog").Result()
	if err != nil {
		return nil, err
	}

	var data []map[string]interface{}
	if err := json.Unmarshal([]byte(val), &data); err != nil {
		return nil, err
	}

	return data, nil
}
