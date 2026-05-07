<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Database configuration
$host = 'localhost';
$dbname = 'worksure_db';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['success' => false, 'message' => 'Invalid input data']);
    exit;
}

$requestId = $input['requestId'] ?? null;
$workerId = $input['workerId'] ?? null;

if (!$requestId || !$workerId) {
    echo json_encode(['success' => false, 'message' => 'Request ID and Worker ID are required']);
    exit;
}

try {
    // Update job request status to rejected
    $updateQuery = "UPDATE job_requests SET status = 'rejected' WHERE request_id = ? AND worker_id = ?";
    $stmt = $pdo->prepare($updateQuery);
    $stmt->execute([$requestId, $workerId]);
    
    echo json_encode(['success' => true, 'message' => 'Job request declined successfully']);
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
