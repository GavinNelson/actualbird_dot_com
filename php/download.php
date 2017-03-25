<?php
$format = $_GET['format'];
$title = $_GET['title'];
$path = "downloads/".$title."/".$format.".zip";
header("Location: http://actualbird.com/".$path);
die();
?>