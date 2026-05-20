package main

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

type mockExternalClient struct {
	mock.Mock
}

func (m *mockExternalClient) FetchExternalCatalog() ([]map[string]interface{}, error) {
	args := m.Called()
	return args.Get(0).([]map[string]interface{}), args.Error(1)
}

type mockRedisCache struct {
	mock.Mock
}

func (m *mockRedisCache) Save(data interface{}) {
	m.Called(data)
}

func (m *mockRedisCache) Load() ([]map[string]interface{}, error) {
	args := m.Called()
	return args.Get(0).([]map[string]interface{}), args.Error(1)
}

func TestGetIntegratedCatalog_Live(t *testing.T) {
	client := new(mockExternalClient)
	redis := new(mockRedisCache)

	handler := NewIntegrationHandler(client, redis)

	products := []map[string]interface{}{
		{"sku": "ABC123"},
	}

	client.On("FetchExternalCatalog").Return(products, nil)
	redis.On("Save", products).Return()

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	handler.GetIntegratedCatalog(c)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), `"status":"LIVE"`)
}

func TestGetIntegratedCatalog_Fallback(t *testing.T) {
	client := new(mockExternalClient)
	redis := new(mockRedisCache)

	handler := NewIntegrationHandler(client, redis)

	cached := []map[string]interface{}{
		{"sku": "CACHED123"},
	}

	client.On("FetchExternalCatalog").
		Return([]map[string]interface{}{}, errors.New("timeout"))

	redis.On("Load").Return(cached, nil)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	handler.GetIntegratedCatalog(c)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), `"status":"CACHED_FALLBACK"`)
}

func TestGetIntegratedCatalog_Unavailable(t *testing.T) {
	client := new(mockExternalClient)
	redis := new(mockRedisCache)

	handler := NewIntegrationHandler(client, redis)

	client.On("FetchExternalCatalog").
		Return([]map[string]interface{}{}, errors.New("timeout"))

	redis.On("Load").
		Return([]map[string]interface{}{}, errors.New("no cache"))

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	handler.GetIntegratedCatalog(c)

	assert.Equal(t, http.StatusServiceUnavailable, w.Code)
	assert.Contains(t, w.Body.String(), `"UNAVAILABLE"`)
}
