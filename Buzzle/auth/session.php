<?php
declare(strict_types=1);
header('Content-Type: application/json');

session_start();

if (!isset($_SESSION['user_id'], $_SESSION['username'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Not authenticated.',
    ]);
    exit;
}

echo json_encode([
    'success' => true,
    'username' => $_SESSION['username'],
]);

