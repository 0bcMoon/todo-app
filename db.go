package main

import (
	"database/sql"
	"fmt"
	"log"
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
	UserID      int       `json:"userId"       db:"user_id"`
	Name        string    `json:"name"         db:"name"`
	Description string    `json:"description"  db:"description"`
	CreatedAt   time.Time `json:"createdAt"    db:"created_at"`
}

// Todo represents a todo item in our database
type Todo struct {
	ID          string    `json:"id"           db:"id"`
	Title       string    `json:"title"        db:"title"`
	Description string    `json:"description"  db:"description"`
	Status      string    `json:"status"       db:"status"`
	ProjectID   string    `json:"projectId"    db:"project_id"`
	CreatedAt   time.Time `json:"createdAt"    db:"created_at"`
}

func CreateSession(session_key string, userID int) (error) {
	// Store the session in the database with an expiration time
	_, err := db.Exec("INSERT INTO session (session_key, user_id) VALUES ($1, $2)", session_key, userID)
	if err != nil {
		log.Println("Error creating session:", err)
		return  err
	}
	return nil
}

func CreateUser(username, password string) (*User, error) {
	passwordHash, err := HashPassword(password)
	if err != nil {
		return nil, err
	}
	user := User{
		Username:  username,
		Password:  passwordHash,
	}
	_, err = db.NamedExec("INSERT INTO users (username, password) VALUES (:username, :password)", &user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func GetUserFromSession(session_key string) (*User, error) {
	user := User{}
	query := `SELECT
					u.id,
					u.username,
					u.password,
					u.created_at
				FROM users u
				JOIN session s ON u.id = s.user_id
				WHERE s.session_key = $1`

	err := db.Get(&user, query, session_key)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("invalid or expired session token")
		}
		return nil, err
	}
	// Update the session expiration
	_, err = db.Exec("UPDATE session SET expires_at = CURRENT_TIMESTAMP + INTERVAL '2 hours' WHERE session_key = $1", session_key)
	if err != nil {
		log.Println("Error updating session expiration:", err)
	}

	return &user, nil
}

func GetUserByUsername(username string) (*User, error) {

	user := User{}

	err := db.Get(&user, `SELECT * FROM users WHERE username=$1`, username)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("no user found with username: %s", username)
	}
	if err != nil {
		return nil, fmt.Errorf("failed to fetch user: %w", err)
	}
	return &user, nil
}

func GetCurrentUser(id int) (*User, error) {
	var user User
	err := db.Get(&user, "SELECT * FROM users WHERE id=$1", id)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func GetProjectsDB(id int) ([]Project, error) {
	var projects []Project
	err := db.Select(&projects, "SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC", id)
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

	_, err := db.NamedExec(`INSERT INTO projects (id, user_id, name, description, created_at)
		VALUES (:id, :user_id, :name, :description, :created_at)`, p)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func DeleteProjectDB(projectID string, id int) error {
	result, err := db.Exec("DELETE FROM projects WHERE id = $1 AND user_id = $2", projectID, id)
	if err != nil {
		return err
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return fmt.Errorf("project not found or you don't have access")
	}
	return nil
}

func GetTodosByProjectDB(projectID string, userID int) ([]Todo, error) {
	// check if project belongs to user
	var project Project
	err := db.Get(&project, "SELECT id FROM projects WHERE id = $1 AND user_id = $2", projectID, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("project not found or you don't have access")
		}
		return nil, err
	}
	var todos []Todo
	err = db.Select(&todos, "SELECT * FROM todos WHERE project_id = $1 ORDER BY created_at DESC", projectID)
	if err != nil {
		return nil, err
	}
	if todos == nil {
		todos = []Todo{}
	}
	return todos, nil
}

func CreateTodoDB(t Todo, userID int) (*Todo, error) {
	// check if project belongs to user
	var project Project
	err := db.Get(&project, "SELECT id FROM projects WHERE id = $1 AND user_id = $2", t.ProjectID, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("project not found or you don't have access")
		}
		return nil, err
	}
	t.ID = uuid.New().String()
	t.Status = "todo"
	t.CreatedAt = time.Now()

	_, err = db.NamedExec(`INSERT INTO todos (id, title, description, status, project_id, created_at)
        VALUES (:id, :title, :description, :status, :project_id, :created_at)`, t)
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func UpdateTodoDB(todoID string, userID int, t Todo) (*Todo, error) {
	// check if todo belongs to user
	var tid string
	err := db.Get(&tid, "SELECT t.id FROM todos t JOIN projects p ON t.project_id = p.id WHERE t.id = $1 AND p.user_id = $2", todoID, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("todo not found or you don't have access")
		}
		return nil, err
	}

	t.ID = todoID

	_, err = db.NamedExec(`UPDATE todos SET title = :title, description = :description, status = :status WHERE id = :id`, t)
	if err != nil {
		return nil, err
	}

	// Fetch the updated todo to return it
	var updatedTodo Todo
	err = db.Get(&updatedTodo, "SELECT * FROM todos WHERE id = $1", todoID)
	if err != nil {
		return nil, err
	}
	return &updatedTodo, nil
}

func DeleteTodoDB(todoID string, userID int) error {
	res, err := db.Exec(`
        DELETE FROM todos
        WHERE id = $1 AND project_id IN (
            SELECT id FROM projects WHERE user_id = $2
        )
    `, todoID, userID)

	if err != nil {
		return err
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("todo not found or you don't have access")
	}

	return nil
}
