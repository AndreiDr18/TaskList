module.exports = {
    "up": "INSERT INTO tasks(name, description, dueDate, status, tags) VALUES ('A new bench','The garden is quite empty','2022-06-14','ToDo','Home')",
    "down": "DELETE FROM tasks WHERE name = 'A new bench'"
}