CREATE DATABASE IF NOT EXISTS buzzle_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE buzzle_app;

CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, email, password_hash)
VALUES (
    'buzzle_admin',
    'admin@buzzle.test',
    -- Password: Buzzle@123
    '$2y$10$Oa3DuJ9xRcmk6VwBEm90xeJX6HAtjEu0Xcb07YabZMiqglR6Q8aY2'
) ON DUPLICATE KEY UPDATE email = VALUES(email);

CREATE TABLE IF NOT EXISTS leaderboard (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    score INT UNSIGNED NOT NULL,
    difficulty ENUM('easy', 'medium', 'hard') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO leaderboard (username, score, difficulty) VALUES
('playerOne', 1250, 'hard'),
('MathWhiz', 1120, 'hard'),
('LogicKing', 980, 'medium')
ON DUPLICATE KEY UPDATE score = VALUES(score);

CREATE TABLE IF NOT EXISTS user_stats (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    games_played INT UNSIGNED DEFAULT 0,
    puzzles_solved INT UNSIGNED DEFAULT 0,
    average_score INT UNSIGNED DEFAULT 0,
    preferred_difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'easy',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO user_stats (user_id, games_played, puzzles_solved, average_score, preferred_difficulty)
SELECT u.id, 120, 95, 850, 'hard'
FROM users u
WHERE u.username = 'buzzle_admin'
ON DUPLICATE KEY UPDATE
    games_played = VALUES(games_played),
    puzzles_solved = VALUES(puzzles_solved),
    average_score = VALUES(average_score),
    preferred_difficulty = VALUES(preferred_difficulty);

