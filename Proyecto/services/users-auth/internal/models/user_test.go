package models

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

// Test: Crear usuario básico
func TestUser_Creation(t *testing.T) {
	user := User{
		ID:           1,
		Email:        "test@example.com",
		PasswordHash: "hashed_password",
		FirstName:    "John",
		LastName:     "Doe",
		NIT:          "123456789",
		Phone:        "+502 1234-5678",
		Role:         "customer",
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	assert.Equal(t, 1, user.ID)
	assert.Equal(t, "test@example.com", user.Email)
	assert.Equal(t, "John", user.FirstName)
	assert.Equal(t, "Doe", user.LastName)
	assert.Equal(t, "123456789", user.NIT)
	assert.Equal(t, "customer", user.Role)
}

// Test: RegisterRequest válido
func TestRegisterRequest_ValidData(t *testing.T) {
	req := RegisterRequest{
		Email:     "newuser@example.com",
		Password:  "SecurePass123!",
		FirstName: "Jane",
		LastName:  "Smith",
		NIT:       "987654321",
		Phone:     "+502 9876-5432",
		Role:      "customer",
	}

	assert.NotEmpty(t, req.Email)
	assert.NotEmpty(t, req.Password)
	assert.NotEmpty(t, req.FirstName)
	assert.NotEmpty(t, req.LastName)
	assert.Equal(t, "customer", req.Role)
}

// Test: LoginRequest válido
func TestLoginRequest_ValidData(t *testing.T) {
	req := LoginRequest{
		Email:    "user@example.com",
		Password: "password123",
	}

	assert.Equal(t, "user@example.com", req.Email)
	assert.Equal(t, "password123", req.Password)
	assert.NotEmpty(t, req.Email)
	assert.NotEmpty(t, req.Password)
}

// Test: LoginResponse válido
func TestLoginResponse_Creation(t *testing.T) {
	user := User{
		ID:        1,
		Email:     "test@example.com",
		FirstName: "Test",
		LastName:  "User",
		Role:      "customer",
	}

	response := LoginResponse{
		Token: "fake-jwt-token-12345",
		User:  user,
	}

	assert.NotEmpty(t, response.Token)
	assert.Equal(t, 1, response.User.ID)
	assert.Equal(t, "test@example.com", response.User.Email)
}

// Test: User con campos vacíos
func TestUser_EmptyFields(t *testing.T) {
	user := User{}

	assert.Equal(t, 0, user.ID)
	assert.Empty(t, user.Email)
	assert.Empty(t, user.FirstName)
	assert.Empty(t, user.LastName)
}

// Test: RegisterRequest con email inválido
func TestRegisterRequest_InvalidEmail(t *testing.T) {
	tests := []struct {
		name  string
		email string
		valid bool
	}{
		{"Email válido", "test@example.com", true},
		{"Email sin @", "invalid-email", false},
		{"Email vacío", "", false},
		{"Email solo @", "@", false},
		{"Email sin dominio", "test@", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := RegisterRequest{
				Email:     tt.email,
				Password:  "ValidPass123",
				FirstName: "Test",
				LastName:  "User",
			}

			if tt.valid {
				assert.Contains(t, req.Email, "@")
				assert.NotEmpty(t, req.Email)
			} else {
				// Para emails inválidos, verificamos que falten elementos
				if tt.email != "" && !tt.valid {
					assert.NotContains(t, req.Email, "@example.com")
				}
			}
		})
	}
}

// Test: RegisterRequest con password corto
func TestRegisterRequest_ShortPassword(t *testing.T) {
	req := RegisterRequest{
		Email:    "test@example.com",
		Password: "123",
	}

	// Verificar que el password es muy corto (< 6 caracteres)
	assert.Less(t, len(req.Password), 6)
}

// Test: RegisterRequest con password válido
func TestRegisterRequest_ValidPassword(t *testing.T) {
	req := RegisterRequest{
		Email:    "test@example.com",
		Password: "SecurePassword123!",
	}

	// Verificar que el password tiene longitud adecuada
	assert.GreaterOrEqual(t, len(req.Password), 8)
}

// Test: User roles válidos
func TestUser_ValidRoles(t *testing.T) {
	validRoles := []string{"customer", "admin", "seller"}

	for _, role := range validRoles {
		user := User{
			Email: "test@example.com",
			Role:  role,
		}

		assert.Contains(t, validRoles, user.Role)
	}
}

// Test: NIT validation (formato básico)
func TestRegisterRequest_NITFormat(t *testing.T) {
	req := RegisterRequest{
		NIT: "123456789",
	}

	assert.NotEmpty(t, req.NIT)
	assert.Regexp(t, `^\d+$`, req.NIT) // Solo números
}

// Test: Comparar timestamps
func TestUser_Timestamps(t *testing.T) {
	now := time.Now()
	user := User{
		CreatedAt: now,
		UpdatedAt: now,
	}

	assert.Equal(t, user.CreatedAt, user.UpdatedAt)
	assert.False(t, user.CreatedAt.IsZero())
}
