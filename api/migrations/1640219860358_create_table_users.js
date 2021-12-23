module.exports = {
    "up": "CREATE TABLE users2 (UUID TEXT, username VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL)",
    "down": "DROP TABLE users2"
}