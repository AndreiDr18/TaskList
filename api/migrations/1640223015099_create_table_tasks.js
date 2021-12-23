module.exports = {
    "up": "INSERT INTO tasks(name, description, dueDate, status, tags) VALUES ('Walking my dog',\"My husky\'s got quite some personality\",'2022-01-05','ToDo','Home')",
    "down": "DELETE FROM tasks WHERE name = 'Walking my dog"
}