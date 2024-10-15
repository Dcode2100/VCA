package main

import (
	"GolangMigration/handlers"
	"GolangMigration/models"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func main() {
    db, err := gorm.Open(sqlite.Open("test.db"), &gorm.Config{})
    if err != nil {
        log.Fatal(err)
    }
    db.AutoMigrate(&models.Item{})

    r := mux.NewRouter()
    r.HandleFunc("/items", handlers.CreateItem(db)).Methods("POST")
    // Add routes for other CRUD operations

    log.Fatal(http.ListenAndServe(":8080", r))
}