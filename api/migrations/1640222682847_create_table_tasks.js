module.exports = {
    "up": "INSERT INTO tasks(name, description, dueDate, status, tags) VALUES ('Gardening','The grass is all furry','2021-12-17','Done','Home Grass')",
    "down": "DELETE FROM tasks WHERE name = 'Gardening'"
}