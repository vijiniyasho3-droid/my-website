<?php
declare(strict_types=1);
header('Content-Type: application/json');

require_once __DIR__ . '/../includes/db.php';

$limit = 10;

$query = $mysqli->prepare(
    'SELECT username, score, difficulty 
     FROM leaderboard 
     ORDER BY score DESC, created_at ASC 
     LIMIT ?'
);

if (!$query) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Unable to prepare leaderboard query.',
    ]);
    exit;
}

$query->bind_param('i', $limit);
$query->execute();
$result = $query->get_result();

$entries = [];

while ($row = $result->fetch_assoc()) {
    $entries[] = [
        'username' => $row['username'],
        'score' => (int) $row['score'],
        'difficulty' => ucfirst($row['difficulty']),
    ];
}

$query->close();

echo json_encode([
    'success' => true,
    'entries' => $entries,
]);

