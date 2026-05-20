package jwt

import (
	"os"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
)

// helper para setear variables de entorno de forma segura
func setEnv(t *testing.T, key, value string) {
	t.Helper()
	if err := os.Setenv(key, value); err != nil {
		t.Fatalf("no se pudo setear %s: %v", key, err)
	}
}

func TestGenerateToken_Success(t *testing.T) {
	// Arrange
	setEnv(t, "JWT_SECRET", "test-secret-key")
	setEnv(t, "JWT_EXPIRATION_HOURS", "1")

	userID := 10
	email := "test@example.com"
	role := "customer"

	// Act
	tokenString, err := GenerateToken(userID, email, role)

	// Assert
	assert.NoError(t, err)
	assert.NotEmpty(t, tokenString)

	// Validar que el token se pueda parsear y tenga los claims correctos
	claims, err := ValidateToken(tokenString)
	assert.NoError(t, err)
	assert.NotNil(t, claims)
	assert.Equal(t, userID, claims.UserID)
	assert.Equal(t, email, claims.Email)
	assert.Equal(t, role, claims.Role)
}

func TestGenerateToken_DefaultExpiration(t *testing.T) {
	// Arrange: sin JWT_EXPIRATION_HOURS => debe usar 24h por defecto
	setEnv(t, "JWT_SECRET", "test-secret-key")
	_ = os.Unsetenv("JWT_EXPIRATION_HOURS")

	// Act
	tokenString, err := GenerateToken(1, "user@example.com", "admin")

	// Assert
	assert.NoError(t, err)
	assert.NotEmpty(t, tokenString)

	claims, err := ValidateToken(tokenString)
	assert.NoError(t, err)
	assert.NotNil(t, claims)

	// Verificamos que la expiración sea mayor a ahora (aprox 24h)
	assert.True(t, claims.ExpiresAt.After(time.Now()))
}

func TestValidateToken_InvalidTokenString(t *testing.T) {
	setEnv(t, "JWT_SECRET", "test-secret-key")

	// Act
	claims, err := ValidateToken("not-a-valid-jwt")

	// Assert
	assert.Error(t, err)
	assert.Nil(t, claims)
}

func TestValidateToken_EmptyToken(t *testing.T) {
	setEnv(t, "JWT_SECRET", "test-secret-key")

	claims, err := ValidateToken("")

	assert.Error(t, err)
	assert.Nil(t, claims)
}

func TestValidateToken_WrongSecret(t *testing.T) {
	// 1) Generar token con un secret
	_ = os.Setenv("JWT_SECRET", "secret-uno")
	tokenString, err := GenerateToken(1, "test@example.com", "customer")
	assert.NoError(t, err)

	// 2) Validar token con OTRO secret
	_ = os.Setenv("JWT_SECRET", "secret-dos")

	claims, err := ValidateToken(tokenString)

	assert.Error(t, err)
	assert.Nil(t, claims)
}

func TestValidateToken_Expired(t *testing.T) {
	// Creamos un token manualmente ya expirado
	setEnv(t, "JWT_SECRET", "test-secret-key")

	expiredClaims := Claims{
		UserID: 1,
		Email:  "expired@example.com",
		Role:   "customer",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(-1 * time.Hour)), // hace 1h
			IssuedAt:  jwt.NewNumericDate(time.Now().Add(-2 * time.Hour)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, expiredClaims)
	tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	assert.NoError(t, err)

	claims, err := ValidateToken(tokenString)

	assert.Error(t, err)
	assert.Nil(t, claims)
}
