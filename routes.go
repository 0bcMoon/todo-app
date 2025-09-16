package main

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func setupRoutes() http.Handler {
	r := chi.NewRouter()

	// Middlewares
	r.Use(middleware.Logger)

	r.Route("/projects", func(r chi.Router) {
		r.Use(AuthMiddleware())
		r.Get("/", getProjects)
		r.Post("/", createProject)
		r.Route("/{projectID}", func(r chi.Router) {
			r.Delete("/", deleteProject)
			r.Get("/todos", getTodosByProject)
		})
	})

	r.Route("/todos", func(r chi.Router) {
		r.Use(AuthMiddleware())
		r.Use(AuthMiddleware())
		r.Post("/", createTodo)
		r.Route("/{todoID}", func(r chi.Router) {
			r.Put("/", updateTodo)
			r.Delete("/", deleteTodo)
		})
	})

	r.Route("/user", func(r chi.Router) {
		r.Use(AuthMiddleware())
		r.Get("/", GetUser)
	})

	r.Route("/auth", func(r chi.Router) {
		r.Post("/login", Login)
		r.Delete("/logout", Logout)

	})

	// Serve frontend
	workDir, _ := os.Getwd()
	filesDir := http.Dir(filepath.Join(workDir, "frontend", "dist"))
	staticFileServer(r, "/", filesDir)

	return r
}

func staticFileServer(r chi.Router, path string, root http.FileSystem) {
	if strings.ContainsAny(path, "{}*") {
		panic("FileServer does not permit URL parameters.")
	}

	fs := http.StripPrefix(path, http.FileServer(root))

	if path != "/" && path[len(path)-1] != '/' {
		r.Get(path, http.RedirectHandler(path+"/", 301).ServeHTTP)
		path += "/"
	}
	path += "*"

	r.Get(path, func(w http.ResponseWriter, r *http.Request) {
		// Check if the file exists
		_, err := root.Open(r.URL.Path)
		if os.IsNotExist(err) {
			// File does not exist, serve index.html
			http.ServeFile(w, r, "frontend/dist/index.html")
			return
		}
		fs.ServeHTTP(w, r)
	})
}
