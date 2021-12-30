module.exports = {
    "up": "CREATE TABLE tasks (name VARCHAR(255) NOT NULL, description TEXT, dueDate DATE, status ENUM('ToDo','InProgress','Done','Failed'), tags VARCHAR(255))",
    "down": "DROP TABLE tasks"
}