package main

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"
)

type FXClient struct {
	url string
}

func NewFXClient(url string) *FXClient {
	return &FXClient{url}
}

func (c *FXClient) FetchRate(to string) (float64, error) {

	client := http.Client{Timeout: 4 * time.Second}

	resp, err := client.Get(c.url)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return 0, errors.New("invalid response from FX provider")
	}

	var data map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return 0, err
	}

	ratesRaw, ok := data["rates"].(map[string]interface{})
	if !ok {
		return 0, errors.New("invalid rates format")
	}

	value, ok := ratesRaw[to]
	if !ok {
		return 0, errors.New("currency not supported")
	}

	rate, ok := value.(float64)
	if !ok {
		return 0, errors.New("invalid currency value")
	}

	return rate, nil
}
