package repository

import (
	"database/sql"
	"errors"

	"users-auth-service/internal/models"
	"golang.org/x/crypto/bcrypt"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(user *models.User, password string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// Sintaxis correcta para MSSQL: @p1, @p2...
	query := `
		INSERT INTO users (email, password_hash, first_name, last_name, nit, phone, role)
		OUTPUT INSERTED.id, INSERTED.email, INSERTED.password_hash, INSERTED.first_name,
		       INSERTED.last_name, INSERTED.nit, INSERTED.phone, INSERTED.role,
		       INSERTED.created_at, INSERTED.updated_at
		VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7)
	`

	row := r.db.QueryRow(
		query,
		user.Email,
		string(hashedPassword),
		user.FirstName,
		user.LastName,
		user.NIT,
		user.Phone,
		user.Role,
	)

	return row.Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&user.FirstName,
		&user.LastName,
		&user.NIT,
		&user.Phone,
		&user.Role,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
}

func (r *UserRepository) FindByEmail(email string) (*models.User, error) {
	user := &models.User{}

	query := `
		SELECT id, email, password_hash, first_name, last_name, nit, phone, role, created_at, updated_at
		FROM users
		WHERE email = @p1
	`

	err := r.db.QueryRow(query, email).Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&user.FirstName,
		&user.LastName,
		&user.NIT,
		&user.Phone,
		&user.Role,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, errors.New("user not found")
	}
	return user, err
}

func (r *UserRepository) FindByID(id int) (*models.User, error) {
	user := &models.User{}

	query := `
		SELECT id, email, password_hash, first_name, last_name, nit, phone, role, created_at, updated_at
		FROM users
		WHERE id = @p1
	`

	err := r.db.QueryRow(query, id).Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&user.FirstName,
		&user.LastName,
		&user.NIT,
		&user.Phone,
		&user.Role,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, errors.New("user not found")
	}
	return user, err
}

func (r *UserRepository) VerifyPassword(hashedPassword, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}
