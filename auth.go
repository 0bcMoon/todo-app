package main

import (
	"context"
	"crypto/rand"
	"golang.org/x/crypto/bcrypt"
	"encoding/hex"
	"encoding/json"
	"log"
	"net/http"
	"time"
)

type UserLogin struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func getUserInfo(session_key string) (*User, error) {
	user, err := GetUserFromSession(session_key)
	if err != nil {
		return nil, err
	}
	return user, nil
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
	if !VerifyPassword(req.Password, user.Password) {
		http.Error(w, "Invalid username or password", http.StatusUnauthorized)
		return
	}

	session_key, err := getRandomKey(24)
	if err != nil {
		http.Error(w, "Invalid username or password", http.StatusUnauthorized)
		return
	}
	err = CreateSession(session_key, user.ID)
	if err != nil {
		http.Error(w, "Could not create session", http.StatusInternalServerError)
		return
	}

	session_cookies := &http.Cookie{
		Name:     "session_token",
		Value:    session_key,
		HttpOnly: true,
		Path:     "/",
		SameSite: http.SameSiteDefaultMode,
		Expires:  time.Now().Add(24 * time.Hour),
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
		Path:     "/",
		SameSite: http.SameSiteDefaultMode,
		Expires:  time.Unix(0, 0), // Expire the cookie immediately
	}

	http.SetCookie(w, session_cookies)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "logout successful"})

	
}
// HashPassword generates a bcrypt hash for the given password.
func HashPassword(password string) (string, error) {
    bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
    return string(bytes), err
}

// VerifyPassword verifies if the given password matches the stored hash.
func VerifyPassword(password, hash string) bool {
    err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
    return err == nil
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
