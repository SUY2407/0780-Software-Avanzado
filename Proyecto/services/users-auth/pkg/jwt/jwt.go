package jwt

import (
    "errors"
    "os"
    "strconv"
    "time"
    "github.com/golang-jwt/jwt/v5"
)

type Claims struct {
    UserID int    `json:"user_id"`
    Email  string `json:"email"`
    Role   string `json:"role"`
    jwt.RegisteredClaims
}

func GenerateToken(userID int, email, role string) (string, error) {
    secret := []byte(os.Getenv("JWT_SECRET"))
    expirationHours, _ := strconv.Atoi(os.Getenv("JWT_EXPIRATION_HOURS"))
    if expirationHours == 0 {
        expirationHours = 24
    }

    claims := Claims{
        UserID: userID,
        Email:  email,
        Role:   role,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(expirationHours) * time.Hour)),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
        },
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(secret)
}

func ValidateToken(tokenString string) (*Claims, error) {
    secret := []byte(os.Getenv("JWT_SECRET"))
    
    token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
        return secret, nil
    })
    
    if err != nil {
        return nil, err
    }
    
    if claims, ok := token.Claims.(*Claims); ok && token.Valid {
        return claims, nil
    }
    
    return nil, errors.New("invalid token")
}