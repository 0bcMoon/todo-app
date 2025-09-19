package main

import (
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"log"
	"net/http"
	"os"
)

var db *sqlx.DB

func ensure() {
	cookie_domain := os.Getenv("COOKIE_DOMAIN")
	if cookie_domain == "" {
		panic("COOKIE_DOMAIN not found in .env")
	}

	DATABASE_URL := os.Getenv("DATABASE_URL")
	if DATABASE_URL == "" {
		panic("DATABASE_URL not found in .env")
	}
}

func main() {

	ensure()
	var err error

	db, err = sqlx.Connect("postgres", os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()
	log.Println("Connected to the database successfully.")
	setupDB()
	r := setupRoutes()

	port := ":"
	if os.Getenv("PORT") != "" {
		port += os.Getenv("PORT")
	} else {
		port += "8080"
	}
	log.Printf("Server starting on port %s...", port)
	log.Fatal(http.ListenAndServe(port, r))
}

func applySchema() error {
	schema, err := os.ReadFile("schema.sql")
	if err != nil {
		return err
	}
	_, err = db.Exec(string(schema))
	return err
}

func setupDB() {
	log.Println("Running database migrations...")
	err := applySchema()
	if err != nil {
		log.Fatal("Failed to apply database schema:", err)
		panic(err)
	}
	log.Println("Database migrations applied successfully.")
}
