module.exports = {
    "up": "INSERT INTO tasks(name, description, dueDate, status, tags) VALUES ('Workshop','Tuesday Usual','2024-08-01','ToDo','Exciting')",
    "down": "DELETE FROM tasks WHERE name = 'Workshop'"
}