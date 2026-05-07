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
    $pdo->beginTransaction();
    
    // Update job request status
    $updateRequestQuery = "UPDATE job_requests SET status = 'accepted' WHERE request_id = ? AND worker_id = ?";
    $requestStmt = $pdo->prepare($updateRequestQuery);
    $requestStmt->execute([$requestId, $workerId]);
    
    // Get job ID from request
    $getJobQuery = "SELECT job_id FROM job_requests WHERE request_id = ?";
    $jobStmt = $pdo->prepare($getJobQuery);
    $jobStmt->execute([$requestId]);
    $jobRequest = $jobStmt->fetch(PDO::FETCH_ASSOC);
    
    if ($jobRequest) {
        // Update job with worker ID and status
        $updateJobQuery = "UPDATE jobs SET worker_id = ?, status = 'accepted' WHERE job_id = ?";
        $jobUpdateStmt = $pdo->prepare($updateJobQuery);
        $jobUpdateStmt->execute([$workerId, $jobRequest['job_id']]);
    }
    
    $pdo->commit();
    
    echo json_encode(['success' => true, 'message' => 'Job request accepted successfully']);
    
} catch (PDOException $e) {
    $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
