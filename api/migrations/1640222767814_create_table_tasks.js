module.exports = {
    "up": "INSERT INTO tasks(name, description, dueDate, status, tags) VALUES ('Workout','Push Day','2022-06-08','Failed','Bodybuilding')",
    "down": "DELETE FROM tasks WHERE name = 'Workout'"
}