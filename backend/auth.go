package main

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"
)

type UserLogin struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func getUserInfo(_ string) (*User, error) {
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
			session_token := session_cookies.Value

			if  session_token == "" {
				http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
				return
			}
			user, err := getUserInfo(session_token)
			if err != nil {
				http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
				return
			}
			fmt.Println("Authenticated user:", user.Username)
			ctx := context.WithValue(r.Context(), UserContextKey, user)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func getUserFromContext(ctx context.Context) *User {
	user, _ := ctx.Value(UserContextKey).(*User)
	return user
}

func Login(w http.ResponseWriter, r *http.Request) {

	var req UserLogin
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	user, err := GetUserByUsername(req.Username)
	if err != nil {
		http.Error(w, "Invalid username or password", http.StatusUnauthorized)
		return
	}
	// TODO: Hash password and compare with stored hash
	if user.Password != req.Password {
		http.Error(w, "Invalid username or password", http.StatusUnauthorized)
		return
	}

	session_key, err := getRandomKey(24)
	if err != nil {
		http.Error(w, "Invalid username or password", http.StatusUnauthorized)
		return
	}
	session_cookies := &http.Cookie{
		Name:     "session_token",
		Value:    session_key,
		HttpOnly: true,
		Domain:   os.Getenv("COOKIE_DOMAIN"),
		Path:     "/",
		SameSite: http.SameSiteDefaultMode,
	}
	http.SetCookie(w, session_cookies)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Login successful"})
}

func Logout(w http.ResponseWriter, r *http.Request) {
	// Invalidate the session token (implementation depends on how sessions are managed)
	session_cookies := &http.Cookie{
		Name:     "session_token",
		Value:    "",
		HttpOnly: true,
		Domain:   os.Getenv("COOKIE_DOMAIN"),
		Path:     "/",
		SameSite: http.SameSiteDefaultMode,
		Expires:  time.Unix(0, 0), // Expire the cookie immediately
	}
	http.SetCookie(w, session_cookies)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "logout successful"})

	
}

func getRandomKey(size int) (string, error) {

	randomBytes := make([]byte, size)
	_, err := rand.Read(randomBytes)
	if err != nil {
		log.Fatal("Error generating random bytes:", err)
		return "", nil
	}
	// Print as hex string (optional, for demonstration)
	return hex.EncodeToString(randomBytes), nil
}

func GetUser(w http.ResponseWriter, r *http.Request) {

	user := getUserFromContext(r.Context())
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}
