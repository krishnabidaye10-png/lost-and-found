
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");

const app = express();
app.use(express.static(path.join(__dirname, "../frontend")));

// ===============================
// UPLOAD FOLDER
// ===============================

const uploadDir = path.join(__dirname, "uploads");

// Create uploads folder if it doesn't exist
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}


// ===============================
// MULTER STORAGE
// ===============================

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },

    filename: function (req, file, cb) {

        const uniqueName =
            Date.now() + "-" + file.originalname;

        cb(null, uniqueName);
    }

});


// ===============================
// MULTER UPLOAD SETTINGS
// ===============================

const upload = multer({

    storage: storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    }

});


// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());

app.use(express.json());


// Serve frontend files
app.use(
    express.static(
        path.join(__dirname, "../frontend")
    )
);


// Serve uploaded images
app.use(
    "/uploads",
    express.static(uploadDir)
);


// ===============================
// REGISTER
// ===============================

app.post("/api/auth/register", async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            confirmPassword
        } = req.body;


        // Check required fields

        if (
            !name ||
            !email ||
            !password ||
            !confirmPassword
        ) {

            return res.status(400).json({

                message:
                    "Please fill in all fields."

            });

        }


        // Check password confirmation

        if (password !== confirmPassword) {

            return res.status(400).json({

                message:
                    "Passwords do not match."

            });

        }


        // Password length

        if (password.length < 6) {

            return res.status(400).json({

                message:
                    "Password must be at least 6 characters."

            });

        }


        // Normalize email

        const normalizedEmail =
            email.trim().toLowerCase();


        // Check if email already exists

        const checkSql =
            "SELECT id FROM users WHERE email = ?";


        db.query(
            checkSql,
            [normalizedEmail],
            async (err, results) => {

                if (err) {

                    console.error(
                        "Error checking email:",
                        err
                    );

                    return res.status(500).json({

                        message:
                            "Registration failed."

                    });

                }


                // Duplicate email

                if (results.length > 0) {

                    return res.status(409).json({

                        message:
                            "An account with this email already exists."

                    });

                }


                // Hash password

                const hashedPassword =
                    await bcrypt.hash(
                        password,
                        12
                    );


                // Insert user

                const insertSql = `

                    INSERT INTO users
                    (
                        name,
                        email,
                        password
                    )

                    VALUES (?, ?, ?)

                `;


                db.query(
                    insertSql,
                    [
                        name.trim(),
                        normalizedEmail,
                        hashedPassword
                    ],
                    (err, result) => {

                        if (err) {

                            console.error(
                                "Error creating user:",
                                err
                            );

                            return res.status(500).json({

                                message:
                                    "Registration failed."

                            });

                        }


                        res.status(201).json({

                            message:
                                "Registration successful.",

                            userId:
                                result.insertId

                        });

                    }
                );

            }
        );

    } catch (error) {

        console.error(
            "Registration error:",
            error
        );

        res.status(500).json({

            message:
                "Something went wrong during registration."

        });

    }

});


// ===============================
// LOGIN
// ===============================

app.post("/api/auth/login", (req, res) => {

    const {
        email,
        password
    } = req.body;


    // Check required fields

    if (!email || !password) {

        return res.status(400).json({

            message:
                "Please enter your email and password."

        });

    }


    // Normalize email

    const normalizedEmail =
        email.trim().toLowerCase();


    // Find user

    const sql = `

        SELECT
            id,
            name,
            email,
            password

        FROM users

        WHERE email = ?

    `;


    db.query(
        sql,
        [normalizedEmail],
        async (err, results) => {

            if (err) {

                console.error(
                    "Error finding user:",
                    err
                );

                return res.status(500).json({

                    message:
                        "Login failed."

                });

            }


            // User doesn't exist

            if (results.length === 0) {

                return res.status(401).json({

                    message:
                        "Invalid email or password."

                });

            }


            const user =
                results[0];


            // Compare password

            const passwordMatches =
                await bcrypt.compare(
                    password,
                    user.password
                );


            if (!passwordMatches) {

                return res.status(401).json({

                    message:
                        "Invalid email or password."

                });

            }


            // Check JWT secret

            if (!process.env.JWT_SECRET) {

                console.error(
                    "JWT_SECRET is not configured."
                );

                return res.status(500).json({

                    message:
                        "Server authentication is not configured."

                });

            }


            // Create JWT

            const token =
                jwt.sign(

                    {
                        id: user.id,
                        email: user.email
                    },

                    process.env.JWT_SECRET,

                    {
                        expiresIn: "7d"
                    }

                );


            // Send response

            res.json({

                message:
                    "Login successful.",

                token: token,

                user: {

                    id: user.id,

                    name: user.name,

                    email: user.email

                }

            });

        }
    );

});


// ===============================
// HOME PAGE
// ===============================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "../frontend/index.html"
        )
    );

});


// ===============================
// GET ALL ITEMS
// ===============================

app.get("/api/items", (req, res) => {

    const sql =
        "SELECT * FROM items ORDER BY created_at DESC";

    db.query(sql, (err, results) => {

        if (err) {

            console.error(
                "Error fetching items:",
                err
            );

            return res.status(500).json({

                message:
                    "Failed to fetch items"

            });

        }

        res.json(results);

    });

});


// ===============================
// GET ONE ITEM BY ID
// ===============================

app.get("/api/items/:id", (req, res) => {

    const itemId =
        req.params.id;

    const sql =
        "SELECT * FROM items WHERE id = ?";

    db.query(
        sql,
        [itemId],
        (err, results) => {

            if (err) {

                console.error(
                    "Error fetching item:",
                    err
                );

                return res.status(500).json({

                    message:
                        "Failed to fetch item"

                });

            }


            if (results.length === 0) {

                return res.status(404).json({

                    message:
                        "Item not found"

                });

            }


            res.json(
                results[0]
            );

        }
    );

});


// ===============================
// ADD NEW ITEM
// ===============================

app.post(
    "/api/items",
    upload.single("photo"),
    (req, res) => {

        const {
            item_type,
            item_name,
            location,
            item_date,
            contact_name,
            contact_info
        } = req.body;


        // Check required information

        if (
            !item_type ||
            !item_name ||
            !location ||
            !item_date ||
            !contact_name ||
            !contact_info
        ) {

            return res.status(400).json({

                message:
                    "Please provide all required information."

            });

        }


        // Check photo

        if (!req.file) {

            return res.status(400).json({

                message:
                    "Please upload a photo."

            });

        }


        // Photo path

        const photo =
            `/uploads/${req.file.filename}`;


        // SQL query

        const sql = `

            INSERT INTO items

            (
                item_type,
                item_name,
                photo,
                location,
                item_date,
                contact_name,
                contact_info
            )

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


        db.query(
            sql,
            values,
            (err, result) => {

                if (err) {

                    console.error(
                        "Error adding item:",
                        err
                    );

                    return res.status(500).json({

                        message:
                            "Failed to add item"

                    });

                }


                res.status(201).json({

                    message:
                        "Item added successfully",

                    itemId:
                        result.insertId

                });

            }
        );

    }
);


// ===============================
// UPDATE ITEM
// ===============================

app.put(
    "/api/items/:id",
    (req, res) => {

        const itemId =
            req.params.id;


        const {
            item_name,
            location,
            item_date,
            contact_name,
            contact_info
        } = req.body;


        // Check required information

        if (
            !item_name ||
            !location ||
            !item_date ||
            !contact_name ||
            !contact_info
        ) {

            return res.status(400).json({

                message:
                    "Please provide all required information."

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


        db.query(
            sql,
            values,
            (err, result) => {

                if (err) {

                    console.error(
                        "Error updating item:",
                        err
                    );

                    return res.status(500).json({

                        message:
                            "Failed to update item"

                    });

                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({

                        message:
                            "Item not found"

                    });

                }


                res.json({

                    message:
                        "Item updated successfully"

                });

            }
        );

    }
);


// ===============================
// DELETE ITEM
// ===============================

app.delete(
    "/api/items/:id",
    (req, res) => {

        const itemId =
            req.params.id;


        const sql =
            "DELETE FROM items WHERE id = ?";


        db.query(
            sql,
            [itemId],
            (err, result) => {

                if (err) {

                    console.error(
                        "Error deleting item:",
                        err
                    );

                    return res.status(500).json({

                        message:
                            "Failed to delete item"

                    });

                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({

                        message:
                            "Item not found"

                    });

                }


                res.json({

                    message:
                        "Item deleted successfully"

                });

            }
        );

    }
);


// ===============================
// MARK ITEM AS RETURNED
// ===============================

app.put(
    "/api/items/:id/returned",
    (req, res) => {

        const itemId =
            req.params.id;


        const sql =
            "UPDATE items SET status = 'returned' WHERE id = ?";


        db.query(
            sql,
            [itemId],
            (err, result) => {

                if (err) {

                    console.error(
                        "Error marking item as returned:",
                        err
                    );

                    return res.status(500).json({

                        message:
                            "Failed to mark item as returned"

                    });

                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({

                        message:
                            "Item not found"

                    });

                }


                res.json({

                    message:
                        "Item marked as returned"

                });

            }
        );

    }
);


// ===============================
// ERROR HANDLER
// ===============================

app.use(
    (err, req, res, next) => {

        // File too large

        if (
            err.code ===
            "LIMIT_FILE_SIZE"
        ) {

            return res.status(400).json({

                message:
                    "Photo is too large. Please choose an image smaller than 5 MB."

            });

        }


        console.error(err);


        res.status(500).json({

            message:
                "Something went wrong on the server."

        });

    }
);


// ===============================
// START SERVER
// ===============================

// Railway/Render provides PORT automatically

const PORT =
    process.env.PORT || 3000;

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Server running on port ${PORT}`
        );

    }
);
