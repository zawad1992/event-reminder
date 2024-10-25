<?php

/**
 * Laravel - Root Directory Index
 * Securely redirect all requests to the public directory
 */

// Define the path to the public directory
define('PUBLIC_PATH', __DIR__ . '/public');

// Validate that public/index.php exists
if (!file_exists(PUBLIC_PATH . '/index.php')) {
    die('Laravel public/index.php not found. Please check your installation.');
}

// Store the requested URI
$uri = urldecode(
    parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? ''
);

// Security check: Prevent directory traversal
if ($uri !== '/' && file_exists(PUBLIC_PATH . $uri)) {
    // Check if the file is actually in the public directory (prevent directory traversal)
    $realUri = realpath(PUBLIC_PATH . $uri);
    $realPublic = realpath(PUBLIC_PATH);
    
    if ($realUri === false || strpos($realUri, $realPublic) !== 0) {
        http_response_code(403);
        die('Forbidden');
    }
}

// Set working directory to public
chdir(PUBLIC_PATH);

// Include the public/index.php file
require_once PUBLIC_PATH . '/index.php';