module.exports = {
    "up": "INSERT INTO tasks(name, description, dueDate, status, tags) VALUES ('Lunch Break',\"A man\'s gotta eat!\",'2022-06-18','ToDo','refreshing')",
    "down": "DELETE FROM tasks WHERE name = 'Lunch Break'"
}