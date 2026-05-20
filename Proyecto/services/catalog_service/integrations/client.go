package main

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"
)

type ExternalClient struct {
	url string
}

func NewExternalClient(url string) *ExternalClient {
	return &ExternalClient{url: url}
}

type externalAPIResponse struct {
	Success  bool                     `json:"success"`
	Total    int                      `json:"total"`
	Products []map[string]interface{} `json:"products"`
}

func (c *ExternalClient) FetchExternalCatalog() ([]map[string]interface{}, error) {
	client := http.Client{Timeout: 3 * time.Second}

	// 1️⃣ Intento principal
	resp, err := client.Get(c.url)
	if err == nil && resp.StatusCode == http.StatusOK {
		defer resp.Body.Close()

		var apiResp externalAPIResponse
		if decErr := json.NewDecoder(resp.Body).Decode(&apiResp); decErr != nil {
			return nil, decErr
		}
		return apiResp.Products, nil
	}

	// 2️⃣ Retry simple
	time.Sleep(300 * time.Millisecond)

	resp, retryErr := client.Get(c.url)
	if retryErr == nil && resp.StatusCode == http.StatusOK {
		defer resp.Body.Close()

		var apiResp externalAPIResponse
		if decErr := json.NewDecoder(resp.Body).Decode(&apiResp); decErr != nil {
			return nil, decErr
		}
		return apiResp.Products, nil
	}

	return nil, errors.New("external provider unavailable after retry")
}
