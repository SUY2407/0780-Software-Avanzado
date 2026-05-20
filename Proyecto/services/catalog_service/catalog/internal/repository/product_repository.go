package repository

import (
	"catalog/internal/models"
	"database/sql"
	"fmt"
	"os"
	"strconv"
)

type ProductRepository struct {
	db *sql.DB
}

func NewProductRepository(db *sql.DB) *ProductRepository {
	return &ProductRepository{db}
}

// ============================
// GET ALL
// ============================
func (r *ProductRepository) GetAll() ([]models.Product, error) {
	rows, err := r.db.Query(`
        SELECT id, sku, name, description, price, stock, category, imageUrl, providerId, createdAt, updatedAt 
        FROM products`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []models.Product

	for rows.Next() {
		var p models.Product
		if err := rows.Scan(
			&p.ID, &p.SKU, &p.Name, &p.Description, &p.Price,
			&p.Stock, &p.Category, &p.ImageURL, &p.ProviderID,
			&p.CreatedAt, &p.UpdatedAt,
		); err != nil {
			return nil, err
		}
		products = append(products, p)
	}
	return products, nil
}

// ============================
// GET BY ID
// ============================
func (r *ProductRepository) GetByID(id int) (*models.Product, error) {
	var p models.Product

	err := r.db.QueryRow(`
        SELECT id, sku, name, description, price, stock, category, imageUrl, providerId, createdAt, updatedAt
        FROM products WHERE id = @p1`, id).
		Scan(
			&p.ID, &p.SKU, &p.Name, &p.Description, &p.Price,
			&p.Stock, &p.Category, &p.ImageURL, &p.ProviderID,
			&p.CreatedAt, &p.UpdatedAt,
		)

	if err != nil {
		return nil, err
	}

	return &p, nil
}

// ============================
// CREATE (con createdAt y updatedAt)
// ============================
func (r *ProductRepository) Create(p *models.Product) error {
	_, err := r.db.Exec(`
        INSERT INTO products 
		(sku, name, description, price, stock, category, imageUrl, providerId, createdAt, updatedAt)
        VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, GETDATE(), GETDATE())
    `,
		p.SKU, p.Name, p.Description, p.Price, p.Stock,
		p.Category, p.ImageURL, p.ProviderID)

	return err
}

// UPDATE (SKU NO SE ACTUALIZA)
func (r *ProductRepository) Update(id int, p *models.Product) error {
	_, err := r.db.Exec(`
        UPDATE products SET
            name = @p1,
            description = @p2,
            price = @p3,
            stock = @p4,
            category = @p5,
            imageUrl = @p6,
            providerId = @p7,
            updatedAt = GETDATE()
        WHERE id = @p8
    `,
		p.Name,
		p.Description,
		p.Price,
		p.Stock,
		p.Category,
		p.ImageURL,
		p.ProviderID,
		id,
	)

	return err
}

// ============================
// DELETE
// ============================
func (r *ProductRepository) Delete(id int) error {
	_, err := r.db.Exec(`DELETE FROM products WHERE id = @p1`, id)
	return err
}

// ============================
// EXTERNAL PROVIDER CATALOG
// (Lee GROUP_NUMBER desde .env)
// ============================
func (r *ProductRepository) GetExternalProducts() ([]models.ExternalProduct, error) {
	rows, err := r.db.Query(`
        SELECT sku, imageUrl, name, price, stock, category
        FROM products
    `)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []models.ExternalProduct

	// Leer el número de grupo desde ENV
	groupEnv := os.Getenv("GROUP_NUMBER")
	groupNum, err := strconv.Atoi(groupEnv)
	if err != nil {
		fmt.Println("Warning: GROUP_NUMBER no es válido, usando 0")
		groupNum = 0
	}

	for rows.Next() {
		var p models.ExternalProduct
		if err := rows.Scan(
			&p.SKU, &p.Image, &p.Name, &p.Price, &p.Stock, &p.Category,
		); err != nil {
			return nil, err
		}

		p.ExternalLabel = "Proveedor Externo"
		p.GroupNumber = groupNum

		products = append(products, p)
	}

	return products, nil
}
