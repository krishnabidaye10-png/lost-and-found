const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const db = require("./db");

const app = express();
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },

    filename: function (req, file, cb) {
        const uniqueName =
            Date.now() + "-" + file.originalname;

        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.get("/api/items", (req, res) => {
    const sql = "SELECT * FROM items ORDER BY created_at DESC";

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching items:", err);
            return res.status(500).json({
                message: "Failed to fetch items"
            });
        }

        res.json(results);
    });
});
// GET one item by ID
app.get("/api/items/:id", (req, res) => {

    const itemId = req.params.id;

    const sql = "SELECT * FROM items WHERE id = ?";

    db.query(sql, [itemId], (err, results) => {

        if (err) {
            console.error("Error fetching item:", err);

            return res.status(500).json({
                message: "Failed to fetch item"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        res.json(results[0]);
    });
});
app.post("/api/items", upload.single("photo"), (req, res) => {
       const {
        item_type,
        item_name,
        location,
        item_date,
        contact_name,
        contact_info
    } = req.body;

    if (
        !item_type ||
        !item_name ||
        !location ||
        !item_date ||
        !contact_name ||
        !contact_info
    ) {
        return res.status(400).json({
            message: "Please provide all required information."
        });
    }

    if (!req.file) {
        return res.status(400).json({
            message: "Please upload a photo."
        });
    }

    const photo = req.file
        ? `/uploads/${req.file.filename}`
        : "";

    const sql = `
        INSERT INTO items
        (item_type, item_name, photo, location, item_date, contact_name, contact_info)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        item_type,
        item_name,
        photo,
        location,
        item_date,
        contact_name,
        contact_info
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error adding item:", err);

            return res.status(500).json({
                message: "Failed to add item"
            });
        }

        res.status(201).json({
            message: "Item added successfully",
            itemId: result.insertId
        });
    });
});
// Update an item
app.put("/api/items/:id", (req, res) => {
    const itemId = req.params.id;

    const {
        item_name,
        location,
        item_date,
        contact_name,
        contact_info
    } = req.body;

    if (
        !item_name ||
        !location ||
        !item_date ||
        !contact_name ||
        !contact_info
    ) {
        return res.status(400).json({
            message: "Please provide all required information."
        });
    }

    const sql = `
        UPDATE items
        SET
            item_name = ?,
            location = ?,
            item_date = ?,
            contact_name = ?,
            contact_info = ?
        WHERE id = ?
    `;

    const values = [
        item_name,
        location,
        item_date,
        contact_name,
        contact_info,
        itemId
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error updating item:", err);

            return res.status(500).json({
                message: "Failed to update item"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        res.json({
            message: "Item updated successfully"
        });
    });
});
// Delete an item
app.delete("/api/items/:id", (req, res) => {
    const itemId = req.params.id;

    const sql = "DELETE FROM items WHERE id = ?";

    db.query(sql, [itemId], (err, result) => {
        if (err) {
            console.error("Error deleting item:", err);

            return res.status(500).json({
                message: "Failed to delete item"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        res.json({
            message: "Item deleted successfully"
        });
    });
});
app.put("/api/items/:id/returned", (req, res) => {

    const itemId = req.params.id;

    const sql = "UPDATE items SET status = 'returned' WHERE id = ?";

    db.query(sql, [itemId], (err, result) => {

        if (err) {
            console.error("Error marking item as returned:", err);

            return res.status(500).json({
                message: "Failed to mark item as returned"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        res.json({
            message: "Item marked as returned"
        });
    });
});
const PORT = 3000;

app.use((err, req, res, next) => {
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
            message: "Photo is too large. Please choose an image smaller than 5 MB."
        });
    }

    console.error(err);

    res.status(500).json({
        message: "Something went wrong on the server."
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});