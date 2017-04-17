<?php

function success() {
    http_response_code(200);
}

function failure() {
    http_response_code(500);
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $to = 'gavin.nelson1@googlemail.com';
    $message = filter_var($_POST['message'], FILTER_SANITIZE_STRING);
    $subject = 'actualbird.com message';
    $headers = 'From: actualbird.com';
    if ($message != '' && mail($to, $subject, $message, $headers)) {
        success();
    } else {
        failure();
    }
} else {
    failure();
}

?>
