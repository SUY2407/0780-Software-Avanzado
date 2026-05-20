package main

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

func main() {
	// ⭐ FIX #1: gin.New() → NO trailing slash redirect automático
	r := gin.New()
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	// ⭐ FIX #2: CORS GLOBAL + OPTIONS 204 LOCAL
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// URLs de servicios
	authServiceURL := getEnv("USERSSERVICEURL", "http://users-auth-service:80")
	ordersServiceURL := getEnv("ORDERSSERVICEURL", "http://orders-service:8084")
	catalogServiceURL := getEnv("CATALOGSERVICEURL", "http://catalog-service:8081")
	fxServiceURL := getEnv("FXSERVICEURL", "http://fx-service:8083")
	integrationsServiceURL := getEnv("INTEGRATIONSSERVICEURL", "http://catalog-integrations:8091")
	cartCheckoutServiceURL := getEnv("CARTCHECKOUTSERVICEURL", "http://cart-checkout-service:8086")
	paymentServiceURL := getEnv("PAYMENTSERVICEURL", "http://payment-service:8000")

	log.Printf("🔌 Gateway → Auth: %s", authServiceURL)
	log.Printf("🔌 Gateway → Orders: %s ⭐ PUERTO 8084 **FIX NO REDIRECT**", ordersServiceURL)
	log.Printf("🔌 Gateway → Catalog: %s", catalogServiceURL)
	log.Printf("🔌 Gateway → FX: %s ⭐ V22 NO STRIP", fxServiceURL)
	log.Printf("🔌 Gateway → Integrations: %s ⭐ STRIP", integrationsServiceURL)
	log.Printf("🔌 Gateway → Cart: %s", cartCheckoutServiceURL)
	log.Printf("🔌 Gateway → Payment: %s", paymentServiceURL)

	// API Routes V22 - TODAS con CORS + NO REDIRECT
	api := r.Group("/api/v1")

	api.Any("/auth/*path", proxyTo(authServiceURL))
	api.Any("/orders/*path", proxyTo(ordersServiceURL)) // ⭐ FIX: No strip, orders ya tiene /api/v1/orders
	api.Any("/catalog/*path", proxyToWithStrip(catalogServiceURL, "/api/v1/catalog"))
	api.Any("/fx/*path", proxyToWithStrip(fxServiceURL, "/api/v1"))
	api.Any("/integrations/*path", proxyToWithStrip(integrationsServiceURL, "/api/v1/integrations"))
	api.Any("/cart/*path", proxyToWithStrip(cartCheckoutServiceURL, "/api/v1/cart"))
	api.Any("/payment/*path", proxyToWithStrip(paymentServiceURL, "/api/v1/payment"))

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "gateway-v22-no-redirect-cors-fix-running",
			"services": map[string]string{
				"auth":          authServiceURL,
				"orders":        ordersServiceURL,
				"catalog":       catalogServiceURL,
				"fx":            fxServiceURL,
				"integrations":  integrationsServiceURL,
				"cart-checkout": cartCheckoutServiceURL,
				"payment":       paymentServiceURL,
			},
		})
	})

	port := getEnv("PORT", "3000")
	log.Printf("🚀 Gateway V22 **NO REDIRECT + CORS FIX** corriendo en :%s", port)
	r.Run(":" + port)
}

// ⭐ proxyTo: SIN strip prefix (auth, orders directo)
func proxyTo(targetHost string) gin.HandlerFunc {
	target, err := url.Parse(targetHost)
	if err != nil {
		log.Fatalf("❌ Error parseando %s: %v", targetHost, err)
	}
	proxy := httputil.NewSingleHostReverseProxy(target)

	return func(c *gin.Context) {
		// ⭐ OPTIONS ya manejado en middleware global

		// Configurar director
		originalDirector := proxy.Director
		proxy.Director = func(req *http.Request) {
			originalDirector(req)
			req.URL.Scheme = target.Scheme
			req.URL.Host = target.Host
			req.Host = target.Host

			// ⭐ Preservar headers críticos
			if token := req.Header.Get("Authorization"); token != "" {
				log.Printf("🔐 JWT → %s", target.Host)
			}
		}

		log.Printf("📤 %s %s → %s", c.Request.Method, c.Request.URL.Path, target.Host)
		proxy.ServeHTTP(c.Writer, c.Request)
	}
}

// ⭐ proxyToWithStrip: CON strip prefix (catalog, cart, etc)
func proxyToWithStrip(targetHost, stripPrefix string) gin.HandlerFunc {
	target, err := url.Parse(targetHost)
	if err != nil {
		log.Fatalf("❌ Error parseando %s: %v", targetHost, err)
	}
	proxy := httputil.NewSingleHostReverseProxy(target)

	return func(c *gin.Context) {
		// ⭐ OPTIONS ya manejado en middleware global

		// Strip prefix logic
		originalPath := c.Request.URL.Path
		cleanPath := strings.TrimPrefix(originalPath, stripPrefix)
		if cleanPath == originalPath {
			cleanPath = "/"
		}
		c.Request.URL.Path = cleanPath

		// Configurar director
		originalDirector := proxy.Director
		proxy.Director = func(req *http.Request) {
			originalDirector(req)
			req.URL.Path = cleanPath
			req.URL.Scheme = target.Scheme
			req.URL.Host = target.Host
			req.Host = target.Host

			// ⭐ Preservar headers críticos
			if token := req.Header.Get("Authorization"); token != "" {
				log.Printf("🔐 JWT → %s", target.Host)
			}
		}

		log.Printf("✂️ %s → %s → %s", originalPath, cleanPath, target.Host)
		proxy.ServeHTTP(c.Writer, c.Request)
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
