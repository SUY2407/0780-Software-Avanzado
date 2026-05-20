package http

import (
	"net/http"
	"strings"

	"users-auth-service/internal/models"
	"users-auth-service/internal/service"
	"users-auth-service/pkg/jwt"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	service *service.AuthService
}

func NewAuthHandler(s *service.AuthService) *AuthHandler {
	return &AuthHandler{service: s}
}

// Register registra un nuevo usuario en el sistema
// @Summary      Registrar Usuario
// @Description  Crea una cuenta nueva (cliente, proveedor o admin)
// @Tags         Auth
// @Accept       json
// @Produce      json
// @Param        request body models.RegisterRequest true "Datos de Registro"
// @Success      201  {object}  models.User
// @Failure      400  {object}  map[string]string "Error de validación"
// @Failure      409  {object}  map[string]string "Conflicto (Email ya existe)"
// @Router       /auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validación manual
	if req.Email == "" || !isValidEmail(req.Email) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email"})
		return
	}
	if req.Password == "" || len(req.Password) < 6 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password must be at least 6 characters"})
		return
	}
	if req.FirstName == "" || req.LastName == "" || req.NIT == "" || req.Phone == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "All fields are required"})
		return
	}
	if req.Role != "cliente" && req.Role != "proveedor" && req.Role != "admin" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Role must be cliente, proveedor or admin"})
		return
	}

	user, err := h.service.Register(req)
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"user": user})
}

// Login inicia sesión y devuelve un JWT
// @Summary      Iniciar Sesión
// @Description  Autentica credenciales y retorna un token JWT
// @Tags         Auth
// @Accept       json
// @Produce      json
// @Param        request body models.LoginRequest true "Credenciales"
// @Success      200  {object}  models.LoginResponse
// @Failure      400  {object}  map[string]string "Datos inválidos"
// @Failure      401  {object}  map[string]string "Credenciales incorrectas"
// @Router       /auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, err := h.service.Login(req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}

// Me obtiene la información del usuario actual
// @Summary      Obtener perfil actual
// @Description  Devuelve los datos del usuario autenticado basado en el token JWT
// @Tags         Auth
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  models.User
// @Failure      401  {object}  map[string]string "No autorizado"
// @Failure      404  {object}  map[string]string "Usuario no encontrado"
// @Router       /auth/me [get]
func (h *AuthHandler) Me(c *gin.Context) {
	claims, exists := c.Get("claims")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userClaims := claims.(*jwt.Claims)
	user, err := h.service.GetUserByID(userClaims.UserID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// AuthMiddleware valida el token JWT en la cabecera
func (h *AuthHandler) AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := h.service.ValidateToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		c.Set("claims", claims)
		c.Next()
	}
}

func isValidEmail(email string) bool {
	// Email simple validation
	return len(email) > 3 && strings.Contains(email, "@") && strings.Contains(email, ".")
}
