module.exports = {
    "up": "INSERT INTO users(UUID, username, password) VALUES ('3d5ab7f3-6b89-465c-b320-c5e931857b36','Andra','8025831532796a41b33cf9c0d1e6d4054b803c6d58c043544208b2f5b276d0bce455d22fa6f0662770d848c632277d2c545aa5ec794b199eb583906657a3f910')",
    "down": "DELETE FROM users WHERE username='Andra'"
}