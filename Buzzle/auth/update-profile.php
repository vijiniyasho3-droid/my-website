<?php
declare(strict_types=1);
header('Content-Type: application/json');

session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Please log in to update your profile.',
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed.',
    ]);
    exit;
}

require_once __DIR__ . '/../includes/db.php';

$userId = $_SESSION['user_id'];
$username = trim($_POST['username'] ?? '');

// Validate username
if (empty($username) || strlen($username) < 3 || strlen($username) > 50) {
    echo json_encode([
        'success' => false,
        'message' => 'Username must be between 3 and 50 characters.',
    ]);
    exit;
}

// Validate username format (alphanumeric, underscore, hyphen)
if (!preg_match('/^[a-zA-Z0-9_-]+$/', $username)) {
    echo json_encode([
        'success' => false,
        'message' => 'Username can only contain letters, numbers, underscores, and hyphens.',
    ]);
    exit;
}

// Check if username is already taken by another user
$checkStmt = $mysqli->prepare('SELECT id FROM users WHERE username = ? AND id != ? LIMIT 1');
if (!$checkStmt) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to check username availability.',
    ]);
    exit;
}

$checkStmt->bind_param('si', $username, $userId);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();

if ($checkResult->num_rows > 0) {
    $checkStmt->close();
    echo json_encode([
        'success' => false,
        'message' => 'Username already taken.',
    ]);
    exit;
}
$checkStmt->close();

// Handle profile picture upload
$profilePicturePath = null;
$profilePictureDir = __DIR__ . '/../public/assets/img/profiles/';

// Create profiles directory if it doesn't exist
if (!is_dir($profilePictureDir)) {
    if (!mkdir($profilePictureDir, 0755, true)) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to create upload directory.',
        ]);
        exit;
    }
}

if (isset($_FILES['profilePicture']) && $_FILES['profilePicture']['error'] === UPLOAD_ERR_OK) {
    $file = $_FILES['profilePicture'];
    
    // Validate file type
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mimeType, $allowedTypes)) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid image format. Please upload a JPEG, PNG, GIF, or WebP image.',
        ]);
        exit;
    }

    // Validate file size (5MB limit)
    if ($file['size'] > 5 * 1024 * 1024) {
        echo json_encode([
            'success' => false,
            'message' => 'Image size must be less than 5MB.',
        ]);
        exit;
    }

    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'profile_' . $userId . '_' . time() . '.' . $extension;
    $filepath = $profilePictureDir . $filename;

    // Get old profile picture to delete later
    $oldStmt = $mysqli->prepare('SELECT profile_picture FROM users WHERE id = ? LIMIT 1');
    if ($oldStmt) {
        $oldStmt->bind_param('i', $userId);
        $oldStmt->execute();
        $oldResult = $oldStmt->get_result();
        $oldUser = $oldResult->fetch_assoc();
        $oldStmt->close();

        // Delete old profile picture if exists
        if (!empty($oldUser['profile_picture'])) {
            $oldFilePath = $profilePictureDir . basename($oldUser['profile_picture']);
            if (file_exists($oldFilePath) && is_file($oldFilePath)) {
                unlink($oldFilePath);
            }
        }
    }

    // Move uploaded file
    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        $profilePicturePath = 'public/assets/img/profiles/' . $filename;
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to upload image.',
        ]);
        exit;
    }
}

// Update database
$updateFields = ['username = ?'];
$params = [$username];
$paramTypes = 's';

if ($profilePicturePath !== null) {
    $updateFields[] = 'profile_picture = ?';
    $params[] = $profilePicturePath;
    $paramTypes .= 's';
}

// Add userId for WHERE clause
$params[] = $userId;
$paramTypes .= 'i';

$sql = 'UPDATE users SET ' . implode(', ', $updateFields) . ' WHERE id = ?';
$updateStmt = $mysqli->prepare($sql);

if (!$updateStmt) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to prepare update statement.',
    ]);
    exit;
}

$updateStmt->bind_param($paramTypes, ...$params);

if (!$updateStmt->execute()) {
    $updateStmt->close();
    // Delete uploaded file if database update failed
    if ($profilePicturePath !== null) {
        $filepath = $profilePictureDir . basename($profilePicturePath);
        if (file_exists($filepath)) {
            unlink($filepath);
        }
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to update profile.',
    ]);
    exit;
}

$updateStmt->close();

// Update session username if it was changed
if (isset($_SESSION['username'])) {
    $_SESSION['username'] = $username;
}

// Return success response
$response = [
    'success' => true,
    'message' => 'Profile updated successfully.',
];

if ($profilePicturePath !== null) {
    $response['profilePicture'] = $profilePicturePath;
}

echo json_encode($response);

