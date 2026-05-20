package http

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

// helper
func setupRouter(handler gin.HandlerFunc) (*gin.Engine, *httptest.ResponseRecorder) {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	rr := httptest.NewRecorder()
	r.POST("/test", handler)
	return r, rr
}

func TestRegister_InvalidEmail(t *testing.T) {
	h := &AuthHandler{service: nil} // ✅ no se usa porque falla antes

	body := map[string]any{
		"email":      "invalid-email",
		"password":   "password123",
		"first_name": "John",
		"last_name":  "Doe",
		"nit":        "123",
		"phone":      "123",
		"role":       "cliente",
	}
	b, _ := json.Marshal(body)

	router, rr := setupRouter(h.Register)
	req := httptest.NewRequest(http.MethodPost, "/test", bytes.NewBuffer(b))
	req.Header.Set("Content-Type", "application/json")

	router.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusBadRequest, rr.Code)
}

func TestRegister_ShortPassword(t *testing.T) {
	h := &AuthHandler{service: nil}

	body := map[string]any{
		"email":      "user@example.com",
		"password":   "123",
		"first_name": "John",
		"last_name":  "Doe",
		"nit":        "123",
		"phone":      "123",
		"role":       "cliente",
	}
	b, _ := json.Marshal(body)

	router, rr := setupRouter(h.Register)
	req := httptest.NewRequest(http.MethodPost, "/test", bytes.NewBuffer(b))
	req.Header.Set("Content-Type", "application/json")

	router.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusBadRequest, rr.Code)
}
