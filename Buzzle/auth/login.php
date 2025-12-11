<?php
declare(strict_types=1);
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed.',
    ]);
    exit;
}

require_once __DIR__ . '/../includes/db.php';

$usernameOrEmail = trim($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';

if ($usernameOrEmail === '' || $password === '') {
    echo json_encode([
        'success' => false,
        'message' => 'Username/Email and password are required.',
    ]);
    exit;
}

$stmt = $mysqli->prepare(
    'SELECT id, username, email, password_hash 
     FROM users 
     WHERE username = ? OR email = ? 
     LIMIT 1'
);

if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to prepare statement.',
    ]);
    exit;
}

$stmt->bind_param('ss', $usernameOrEmail, $usernameOrEmail);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();
$stmt->close();

if (!$user || !password_verify($password, $user['password_hash'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid credentials.',
    ]);
    exit;
}

session_start();
$_SESSION['user_id'] = $user['id'];
$_SESSION['username'] = $user['username'];

echo json_encode([
    'success' => true,
    'message' => 'Login successful! Redirecting...',
]);

