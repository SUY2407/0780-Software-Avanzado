package models

import "time"

type User struct {
    ID           int       `json:"id"`
    Email        string    `json:"email"`
    PasswordHash string    `json:"-"`
    FirstName    string    `json:"first_name"`
    LastName     string    `json:"last_name"`
    NIT          string    `json:"nit"`
    Phone        string    `json:"phone"`
    Role         string    `json:"role"`
    CreatedAt    time.Time `json:"created_at"`
    UpdatedAt    time.Time `json:"updated_at"`
}

type RegisterRequest struct {
    Email     string `json:"email"`
    Password  string `json:"password"`
    FirstName string `json:"first_name"`
    LastName  string `json:"last_name"`
    NIT       string `json:"nit"`
    Phone     string `json:"phone"`
    Role      string `json:"role"`
}

type LoginRequest struct {
    Email    string `json:"email"`
    Password string `json:"password"`
}

type LoginResponse struct {
    Token string `json:"token"`
    User  User   `json:"user"`
}