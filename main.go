package main

import (
	"flag"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3" // SQLite driver
)

var db *sqlx.DB

func ensure() {
	cookie_domain := os.Getenv("COOKIE_DOMAIN")
	if cookie_domain == "" {
		panic("COOKIE_DOMAIN not found in .env")
	}
}

func loadEnv() {

	// err := godotenv.Load()
	// if err != nil {
	// 	panic("Error loading .env file")
	// }
	ensure()
}


func main() {

	var err error
	db, err = sqlx.Connect("sqlite3", "./todo.db")
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	setupDB();

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
	schema, err := ioutil.ReadFile("schema.sql")
	if err != nil {
		return err
	}
	_, err = db.Exec(string(schema))
	return err
}

func setupDB() {

	migrate := flag.Bool("migrate", false, "Run database migrations and exit")
	flag.Parse()

	if *migrate {
		log.Println("Running database migrations...")
		err := applySchema()
		if err != nil {
			log.Fatal("Failed to apply database schema:", err)
		}
		log.Println("Database migrations applied successfully.")

		_, err = CreateUser("hicham", "password"); // this is very secure hhh
		if err != nil {
			log.Println("User creation skipped:", err)
		}
	}
}
