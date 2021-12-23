module.exports = {
    "up": "INSERT INTO tasks(name, description, dueDate, status, tags) VALUES ('Project Planning','Plan a project','2022-08-01','InProgress','Work')",
    "down": "DELETE FROM tasks WHERE name = 'Project Planning'"
}