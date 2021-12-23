module.exports = {
    "up": "INSERT INTO tasks(name, description, dueDate, status, tags) VALUES (\"Mina\'s birthday\",\"Can\'t wait to have a beer\",'2022-07-24','inProgress','Personal')",
    "down": "DELETE FROM tasks WHERE name = \"Mina\'s birthday\""
}