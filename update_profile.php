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

// Get the input data
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['success' => false, 'message' => 'Invalid input data']);
    exit;
}

$userId = $input['userId'] ?? null;
$roleType = $input['roleType'] ?? null;

if (!$userId || !$roleType) {
    echo json_encode(['success' => false, 'message' => 'User ID and role type are required']);
    exit;
}

try {
    // Start transaction
    $pdo->beginTransaction();
    
    // Update users table
    $updateUserQuery = "UPDATE users SET full_name = ?, email = ?, phone = ?, updated_at = NOW() WHERE user_id = ?";
    $userStmt = $pdo->prepare($updateUserQuery);
    $userStmt->execute([
        $input['fullName'],
        $input['email'],
        $input['phone'],
        $userId
    ]);
    
    if ($roleType === 'worker') {
        // Check if worker profile exists
        $checkWorkerQuery = "SELECT worker_id FROM worker_profiles WHERE user_id = ?";
        $checkStmt = $pdo->prepare($checkWorkerQuery);
        $checkStmt->execute([$userId]);
        $workerExists = $checkStmt->fetch();
        
        // Handle profile picture
        $profilePicture = null;
        if (!empty($input['profilePicture'])) {
            // Save base64 image to file or store in database
            $profilePicture = $input['profilePicture']; // Store as base64 or save to file system
        }
        
        if ($workerExists) {
            // Update existing worker profile
            $updateWorkerQuery = "UPDATE worker_profiles SET 
                profile_picture = ?, 
                profession = ?, 
                experience_years = ?, 
                hourly_rate = ?, 
                bio = ?, 
                skills = ?, 
                age = ?, 
                gender = ?, 
                address = ?, 
                city = ?, 
                state = ?, 
                zip_code = ?, 
                is_complete = TRUE, 
                updated_at = NOW() 
                WHERE user_id = ?";
            
            $workerStmt = $pdo->prepare($updateWorkerQuery);
            $workerStmt->execute([
                $profilePicture,
                $input['profession'],
                $input['experienceYears'],
                $input['hourlyRate'],
                $input['bio'],
                $input['skills'],
                $input['age'],
                $input['gender'],
                $input['address'],
                $input['city'],
                $input['state'],
                $input['zipCode'],
                $userId
            ]);
        } else {
            // Insert new worker profile
            $insertWorkerQuery = "INSERT INTO worker_profiles 
                (user_id, profile_picture, profession, experience_years, hourly_rate, bio, skills, age, gender, address, city, state, zip_code, is_complete) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)";
            
            $workerStmt = $pdo->prepare($insertWorkerQuery);
            $workerStmt->execute([
                $userId,
                $profilePicture,
                $input['profession'],
                $input['experienceYears'],
                $input['hourlyRate'],
                $input['bio'],
                $input['skills'],
                $input['age'],
                $input['gender'],
                $input['address'],
                $input['city'],
                $input['state'],
                $input['zipCode']
            ]);
        }
    }
    
    // Commit transaction
    $pdo->commit();
    
    echo json_encode(['success' => true, 'message' => 'Profile updated successfully']);
    
} catch (PDOException $e) {
    $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
