<?php
declare(strict_types=1);
header('Content-Type: application/json');

session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Please log in to view your profile.',
    ]);
    exit;
}

require_once __DIR__ . '/../includes/db.php';

$userId = $_SESSION['user_id'];

$stmt = $mysqli->prepare(
    'SELECT u.username, u.email, u.profile_picture,
            COALESCE(us.preferred_difficulty, "easy") AS preferred_difficulty,
            COALESCE(us.games_played, 0) AS games_played,
            COALESCE(us.puzzles_solved, 0) AS puzzles_solved,
            COALESCE(us.average_score, 0) AS average_score
     FROM users u
     LEFT JOIN user_stats us ON us.user_id = u.id
     WHERE u.id = ?
     LIMIT 1'
);

if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to prepare profile query.',
    ]);
    exit;
}

$stmt->bind_param('i', $userId);
$stmt->execute();
$result = $stmt->get_result();
$profile = $result->fetch_assoc();
$stmt->close();

if (!$profile) {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'message' => 'User not found.',
    ]);
    exit;
}

echo json_encode([
    'success' => true,
    'profile' => [
        'username' => $profile['username'],
        'email' => $profile['email'],
        'profilePicture' => $profile['profile_picture'] ?? null,
        'difficulty' => ucfirst($profile['preferred_difficulty']),
        'gamesPlayed' => (int) $profile['games_played'],
        'puzzlesSolved' => (int) $profile['puzzles_solved'],
        'averageScore' => (int) $profile['average_score'],
    ],
]);

