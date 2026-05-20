package database

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/microsoft/go-mssqldb"
)

func connectTo(database string) (*sql.DB, error) {
	dsn := fmt.Sprintf(
		"server=%s,%s;user id=%s;password=%s;database=%s;encrypt=false;trustServerCertificate=true;connection timeout=30",
		os.Getenv("DB_HOST"), os.Getenv("DB_PORT"),
		os.Getenv("DB_USER"), os.Getenv("DB_PASSWORD"),
		database,
	)

	maxRetries := 30
	retryDelay := 5 * time.Second

	var db *sql.DB
	var err error

	for i := 0; i < maxRetries; i++ {
		db, err = sql.Open("sqlserver", dsn)
		if err != nil {
			log.Printf("⚠️ DB open attempt %d/%d failed (db=%s): %v", i+1, maxRetries, database, err)
			time.Sleep(retryDelay)
			continue
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		err = db.PingContext(ctx)
		cancel()
		if err != nil {
			log.Printf("⚠️ DB ping attempt %d/%d failed (db=%s): %v", i+1, maxRetries, database, err)
			db.Close()
			time.Sleep(retryDelay)
			continue
		}

		log.Printf("✅ MSSQL Connected to DB: %s", database)
		return db, nil
	}

	return nil, fmt.Errorf("could not connect to MSSQL (db=%s): %v", database, err)
}

func Connect() (*sql.DB, error) {
	// 1. conectarse a master
	masterDB, err := connectTo("master")
	if err != nil {
		return nil, err
	}
	defer masterDB.Close()

	// 2. crear DB si no existe
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "economarket"
	}
	createDB := fmt.Sprintf(`
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = '%s')
BEGIN
    CREATE DATABASE [%s];
END;
`, dbName, dbName)

	if _, err := masterDB.Exec(createDB); err != nil {
		return nil, fmt.Errorf("failed to create database %s: %v", dbName, err)
	}
	log.Printf("✅ Database '%s' ensured", dbName)

	// 3. conectarse ahora a economarket
	return connectTo(dbName)
}

func InitSchema(db *sql.DB) error {
	query := `
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND type = N'U')
BEGIN
    CREATE TABLE [dbo].[users] (
        id INT IDENTITY(1,1) PRIMARY KEY,
        email NVARCHAR(255) UNIQUE NOT NULL,
        password_hash NVARCHAR(255) NOT NULL,
        first_name NVARCHAR(100) NOT NULL,
        last_name NVARCHAR(100) NOT NULL,
        nit NVARCHAR(20) NOT NULL,
        phone NVARCHAR(20) NOT NULL,
        role NVARCHAR(50) NOT NULL CHECK (role IN ('cliente', 'proveedor', 'admin')),
        created_at DATETIME2 DEFAULT SYSDATETIME(),
        updated_at DATETIME2 DEFAULT SYSDATETIME()
    );
END;
`
	if _, err := db.Exec(query); err != nil {
		return fmt.Errorf("schema creation failed: %v", err)
	}

	log.Println("✅ Table 'users' ensured in DB:", os.Getenv("DB_NAME"))
	return nil
}
