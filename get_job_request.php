<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
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

$workerId = $_GET['workerId'] ?? null;

if (!$workerId) {
    echo json_encode(['success' => false, 'message' => 'Worker ID is required']);
    exit;
}

try {
    $query = "SELECT jr.request_id, jr.created_at, j.title, j.description, j.location, j.hourly_rate, 
                     u.full_name as userName
              FROM job_requests jr
              JOIN jobs j ON jr.job_id = j.job_id
              JOIN users u ON jr.user_id = u.user_id
              WHERE jr.worker_id = ? AND jr.status = 'pending'
              ORDER BY jr.created_at DESC
              LIMIT 10";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([$workerId]);
    $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'requests' => $requests
    ]);
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
