<?php 


function seats(){
    return [25, 30, 40, 45, 60];
}


function calculateDistance($fromLatLng, $toLatLng) {
    $earthRadius = 6371; // Earth's radius in kilometers

    $lat1 = $fromLatLng[1];
    $lon1 = $fromLatLng[0];
    $lat2 = $toLatLng[1];
    $lon2 = $toLatLng[0];

    // Convert latitude and longitude from degrees to radians
    $lat1 = deg2rad($lat1);
    $lon1 = deg2rad($lon1);
    $lat2 = deg2rad($lat2);
    $lon2 = deg2rad($lon2);

    // Haversine formula
    $dLat = $lat2 - $lat1;
    $dLon = $lon2 - $lon1;
    
    $a = sin($dLat / 2) * sin($dLat / 2) +
        cos($lat1) * cos($lat2) *
        sin($dLon / 2) * sin($dLon / 2);
    $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

    $distance = $earthRadius * $c; // Distance in kilometers

    return $distance;
}

function costByDistance($distance){
    return match (true) {
        $distance >= 10 && $distance <= 40  => 100,
        $distance >= 41 && $distance <= 100 => 200,
        $distance >= 101 && $distance <= 150 => 300,
        $distance >= 151 => 500,
        default => 0, // Default case if distance is below 10 or not within a range
    };
}