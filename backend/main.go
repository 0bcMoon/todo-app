package main

import (
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"

	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3" // SQLite driver
	// "net/http"
)

var db *sqlx.DB

func ensure() {
	cookie_domain := os.Getenv("COOKIE_DOMAIN")
	if cookie_domain == "" {
		panic("COOKIE_DOMAIN not found in .env")
	}
}
func loadEnv() {

	err := godotenv.Load()
	if err != nil {
		panic("Error loading .env file")
	}
	ensure()
}

func main() {
	loadEnv();
	var err error
	db, err = sqlx.Connect("sqlite3", "./todo.db")
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()


	// Create tables
	err = createTables(db)
	if err != nil {
		log.Fatal("Failed to create tables:", err)
	}

	r := setupRoutes()

	log.Println("Server starting on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", r))
}

func createTables(db *sqlx.DB) error {

	// ADD dummy user
	users := `
	CREATE TABLE IF NOT EXISTS  users(
		id INTEGER ,
		username TEXT NOT NULL UNIQUE,
		password TEXT NOT NULL,
		created_at DATETIME NOT NULL,
		PRIMARY KEY("id" AUTOINCREMENT)
    );
	INSERT OR IGNORE INTO users (username, password, created_at) VALUES ('0bcMoon', 'password', CURRENT_TIMESTAMP);
	INSERT OR IGNORE INTO users (username, password, created_at) VALUES ('hicham', 'password', CURRENT_TIMESTAMP);
	`
	_, err := db.Exec(users)
	if err != nil {
		return err
	}

	projectSchema := `
    CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
		user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );`
	_, err = db.Exec(projectSchema)
	if err != nil {
		return err
	}

	todoSchema := `
    CREATE TABLE IF NOT EXISTS todos (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL,
        project_id TEXT NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );`
	_, err = db.Exec(todoSchema)

	return err
}
