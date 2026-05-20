package database

import (
	"database/sql"
	"fmt"
	"os"

	_ "github.com/microsoft/go-mssqldb"
)

func Connect() (*sql.DB, error) {
	host := os.Getenv("DB_HOST")
	user := os.Getenv("DB_USER")
	pass := os.Getenv("DB_PASSWORD")
	name := os.Getenv("DB_NAME")
	port := os.Getenv("DB_PORT")

	connString := fmt.Sprintf(
		"server=%s;user id=%s;password=%s;port=%s;database=%s;encrypt=disable",
		host, user, pass, port, name,
	)

	db, err := sql.Open("sqlserver", connString)
	if err != nil {
		return nil, err
	}

	return db, db.Ping()
}
