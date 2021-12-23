module.exports = {
    "up": "INSERT INTO users(UUID, username, password) VALUES ('bd22d4a0-234c-492d-9d30-99413480f4a','Eu','c6001d5b2ac3df314204a8f9d7a00e1503c9aba0fd4538645de4bf4cc7e2555cfe9ff9d0236bf327ed3e907849a98df4d330c4bea551017d465b4c1d9b80bcb0')",
    "down": "DELETE FROM users WHERE username='Eu'"
}