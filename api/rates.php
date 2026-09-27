<?php
declare(strict_types=1);

const LIVE_RATES_URL = 'https://rates.clearviewsys.com/alsharhan/uploads/ho/rateswithcss.xml';

header('Content-Type: application/xml; charset=iso-8859-1');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

$url = LIVE_RATES_URL . '?t=' . time();
$xml = false;

if (function_exists('curl_init')) {
    $curl = curl_init($url);
    curl_setopt_array($curl, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 4,
        CURLOPT_TIMEOUT => 7,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTPHEADER => ['Accept: application/xml,text/xml;q=0.9,*/*;q=0.8'],
    ]);
    $result = curl_exec($curl);
    $status = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
    curl_close($curl);
    if (is_string($result) && $status >= 200 && $status < 300) {
        $xml = $result;
    }
}

if ($xml === false) {
    $context = stream_context_create([
        'http' => [
            'timeout' => 7,
            'header' => "Accept: application/xml,text/xml;q=0.9,*/*;q=0.8\r\n",
        ],
    ]);
    $result = @file_get_contents($url, false, $context);
    if (is_string($result)) {
        $xml = $result;
    }
}

if ($xml !== false) {
    header('X-Rates-Source: live');
    echo $xml;
    exit;
}

$fallback = dirname(__DIR__) . '/rateswithcss.xml';
if (is_file($fallback)) {
    header('X-Rates-Source: local');
    readfile($fallback);
    exit;
}

http_response_code(503);
echo 'Rates are temporarily unavailable';
