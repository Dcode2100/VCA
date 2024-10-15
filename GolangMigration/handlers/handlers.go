package handlers

import (
    "encoding/json"
    "net/http"
    "GolangMigration/models"
    "gorm.io/gorm"
)

func CreateItem(db *gorm.DB) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        var item models.Item
        json.NewDecoder(r.Body).Decode(&item)
        db.Create(&item)
        json.NewEncoder(w).Encode(item)
    }
}

// Implement ReadItem, UpdateItem, DeleteItem similarly
