package main

import (
	"fmt"
	"time"

	"github.com/google/uuid"
)

// Users represents a user in our database
type User struct {
	ID         int        `json:"id"         db:"id"`
	Username   string     `json:"username"   db:"username"`
	Password   string     `json:"password"   db:"password"`
	CreatedAt  time.Time  `json:"createdAt"  db:"created_at"`
}

// Project represents a project in our database
type Project struct {
	ID          string    `json:"id"           db:"id"`
	Name        string    `json:"name"         db:"name"`
	Description string    `json:"description"  db:"description"`
	CreatedAt   time.Time `json:"createdAt"    db:"created_at"`
	UpdatedAt   time.Time `json:"updatedAt"    db:"updated_at"`
}

// Todo represents a todo item in our database
type Todo struct {
	ID          string    `json:"id"           db:"id"`
	Title       string    `json:"title"        db:"title"`
	Description string    `json:"description"  db:"description"`
	Status      string    `json:"status"       db:"status"`
	ProjectID   string    `json:"projectId"    db:"project_id"`
	CreatedAt   time.Time `json:"createdAt"    db:"created_at"`
	UpdatedAt   time.Time `json:"updatedAt"    db:"updated_at"`
}

func GetUserByUsername(username string) (*User, error) {
	var user User

	fmt.Println("Fetching user by username:", username) // Debugging line
	err := db.Select(&user, "SELECT * FROM users WHERE username=?", username)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func GetCurrentUser(id int) (*User, error) {
	var user User
	err := db.Select(&user, "SELECT * FROM users WHERE id=?", id)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func GetProjectsDB() ([]Project, error) {
	var projects []Project
	err := db.Select(&projects, "SELECT * FROM projects ORDER BY created_at DESC")
	if err != nil {
		return nil, err
	}
	if projects == nil {
		projects = []Project{}
	}
	return projects, nil
}

func CreateProjectDB(p Project) (*Project, error) {
	p.ID = uuid.New().String()
	p.CreatedAt = time.Now()
	p.UpdatedAt = time.Now()

	_, err := db.NamedExec(`INSERT INTO projects (id, name, description, created_at, updated_at)
		VALUES (:id, :name, :description, :created_at, :updated_at)`, p)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func DeleteProjectDB(projectID string) error {
	_, err := db.Exec("DELETE FROM projects WHERE id = ?", projectID)
	return err
}

func GetTodosByProjectDB(projectID string) ([]Todo, error) {
	var todos []Todo
	err := db.Select(&todos, "SELECT * FROM todos WHERE project_id = ? ORDER BY created_at DESC", projectID)
	if err != nil {
		return nil, err
	}
	if todos == nil {
		todos = []Todo{}
	}
	return todos, nil
}

func CreateTodoDB(t Todo) (*Todo, error) {
	t.ID = uuid.New().String()
	t.Status = "todo"
	t.CreatedAt = time.Now()
	t.UpdatedAt = time.Now()

	_, err := db.NamedExec(`INSERT INTO todos (id, title, description, status, project_id, created_at, updated_at)
        VALUES (:id, :title, :description, :status, :project_id, :created_at, :updated_at)`, t)
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func UpdateTodoDB(todoID string, t Todo) (*Todo, error) {
	t.ID = todoID
	t.UpdatedAt = time.Now()

	_, err := db.NamedExec(`UPDATE todos SET title = :title, description = :description, status = :status, updated_at = :updated_at
        WHERE id = :id`, t)
	if err != nil {
		return nil, err
	}

	// Fetch the updated todo to return it
	var updatedTodo Todo
	err = db.Get(&updatedTodo, "SELECT * FROM todos WHERE id = ?", todoID)
	if err != nil {
		return nil, err
	}
	return &updatedTodo, nil
}

func DeleteTodoDB(todoID string) error {
	_, err := db.Exec("DELETE FROM todos WHERE id = ?", todoID)
	return err
}
