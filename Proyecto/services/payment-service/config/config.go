package config

import (
	"fmt"
	"os"
)

type Config struct {
	DBServer   string
	DBName     string
	DBUser     string
	DBPassword string
	GRPCPort   string
	RESTPort   string
	Secret     string
}

func LoadConfig() *Config {

	return &Config{
		DBServer:   getEnvOrDefault("DB_SERVER", "mssql,1433"),
		DBName:     getEnvOrDefault("DB_NAME", "paymentsDB"),
		DBUser:     getEnvOrDefault("DB_USER", "sa"),
		DBPassword: getEnvOrDefault("DB_PASSWORD", "YourStrong@Passw0rd123!"),
		GRPCPort:   getEnvOrDefault("GRPC_PORT", "8082"),
		RESTPort:   getEnvOrDefault("REST_PORT", "8000"),
		Secret:     getEnvOrDefault("JWT_SECRET", "super-secret-jwt-key"),
	}
}

func (c *Config) GetDBConnectionString() string {
	return fmt.Sprintf(
		"server=%s;user id=%s;password=%s;database=%s;encrypt=disable",
		c.DBServer, c.DBUser, c.DBPassword, c.DBName,
	)
}

func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
