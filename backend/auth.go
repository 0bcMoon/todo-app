package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
)
type UserLogin struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func validateToken(_ string) (*User, error) {
	// Dummy validation for example purposes
	return &User{
		ID:       1,
		Username: "0bcMoon",
		Password: "thisisahashpassword",
	}, nil
}
var Session map[string]User

type contextKey string

const UserContextKey contextKey = "user"

func AuthMiddleware() func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Extract token from Authorization header
			session_cookies, err := r.Cookie("session_token")
			if err != nil {
				http.Error(w, err.Error(), http.StatusUnauthorized)
				return
			}
			session_token := session_cookies.String()
			if session_token == "" {
				http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
				return
			}
			user, err := validateToken(session_token)
			if err != nil {
				http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
				return
			}
			ctx := context.WithValue(r.Context(), UserContextKey, user)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func getUserFromContext(ctx context.Context) (*User, bool) {
	user, ok := ctx.Value(UserContextKey).(*User)
	return user, ok
}
func Login(w http.ResponseWriter, r *http.Request) {

	var req UserLogin
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	user, err := GetUserByUsername(req.Username)
	// TODO: Hash password and compare with stored hash
	if (err != nil || user.Password != req.Password) {
		http.Error(w, "Invalid username or password", http.StatusUnauthorized)
		return
	}
	// Create a session token (in a real app, use a secure random token)
	sessionToken := "dummy-session-token"
	Session[sessionToken] = *user
	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    sessionToken,
		HttpOnly: true,
		Domain: "localhost",
	})
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Login successful"))
}

func GetUser(w http.ResponseWriter, r *http.Request) {
	user, ok := getUserFromContext(r.Context())

	if !ok {
		http.Error(w, "Could not get User from Context", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}
