const mysql = require("mysql2");
const path = require("path");
const fs = require("fs");

require("dotenv").config({
    path: path.join(__dirname, ".env")
});

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,

    ssl: {
        ca:
            process.env.DB_SSL_CA ||
            fs.readFileSync(
                path.join(__dirname, "ca.pem")
            )
    },

    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
});

// Test the pool connection
db.getConnection((err, connection) => {

    if (err) {

        console.error(
            "MySQL connection failed:",
            err
        );

        return;
    }

    console.log(
        "Connected to MySQL database!"
    );

    connection.release();
});

module.exports = db;