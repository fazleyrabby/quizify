<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MapLibre Example</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href='https://unpkg.com/maplibre-gl/dist/maplibre-gl.css' rel='stylesheet' />
    
    <style>
        #map {
            height: 600px;
            width: 100%;
        }
    </style>
</head>

<body>
    <div class="col-lg-8 mx-auto p-4 py-md-5">
        <header class="d-flex align-items-center pb-3 mb-5 border-bottom">
            <a href="/" class="d-flex align-items-center text-body-emphasis text-decoration-none">
                <span class="fs-4">Tourify</span>
            </a>
        </header>

        <main>
            <div class="mb-3 row">
                <label for="from" class="col-sm-2 col-form-label">From</label>
                <div class="col-sm-10">
                    <input class="form-control mb-2" type="text" name="from" id="from">
                    <button id="clearFromBtn" class="btn btn-sm btn-danger">Clear</button>
                </div>
            </div>
            <div class="mb-3 row">
                <label for="to" class="col-sm-2 col-form-label">To</label>
                <div class="col-sm-10">
                    <input class="form-control mb-2" type="text" name="to" id="to">
                    <button id="clearToBtn" class="btn btn-sm btn-danger">Clear</button>
                </div>
            </div>

            <button type="button" id="submitBtn" class="btn btn-primary">Submit</button>

            <div id="map"></div>
            <p id="distanceDisplay"></p>
        </main>
    </div>

    <script src='https://unpkg.com/maplibre-gl/dist/maplibre-gl.js'></script>
    <script>
        var map;
        var fromLatLng = null;
        var toLatLng = null;
        var selecting = ''; // To track whether selecting "From" or "To"
        var fromMarker = null;
        var toMarker = null;

        // Initialize the map
        function initMap() {
            map = new maplibregl.Map({
                container: 'map', // ID of the container
                style: 'https://demotiles.maplibre.org/style.json', // Map style
                center: [-74.5, 40], // Initial map center [lng, lat]
                zoom: 9 // Initial zoom level
            });

            // Add zoom and rotation controls to the map.
            map.addControl(new maplibregl.NavigationControl());

            // Get the user's current location
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    userLatLng = [position.coords.longitude, position.coords.latitude];

                    // Center the map on the user's location
                    map.setCenter(userLatLng);

                    // Add a marker for the user's current location
                    new maplibregl.Marker()
                        .setLngLat(userLatLng)
                        .setPopup(new maplibregl.Popup().setText("You are here"))
                        .addTo(map);
                }, function(error) {
                    alert("Unable to retrieve your location");
                });
            } else {
                alert("Geolocation is not supported by this browser.");
            }

            // Handle map clicks for setting "From" or "To" locations
            map.on('click', function(e) {
                if (selecting === 'from') {
                    fromLatLng = e.lngLat;
                    document.getElementById('from').value = `Lat: ${fromLatLng.lat}, Lng: ${fromLatLng.lng}`;

                    // Remove the previous "From" marker if it exists
                    if (fromMarker) fromMarker.remove();

                    // Add a new marker for the "From" location
                    fromMarker = new maplibregl.Marker()
                        .setLngLat(fromLatLng)
                        .setPopup(new maplibregl.Popup().setText("From: Selected"))
                        .addTo(map);
                    selecting = '';
                } else if (selecting === 'to') {
                    toLatLng = e.lngLat;
                    document.getElementById('to').value = `Lat: ${toLatLng.lat}, Lng: ${toLatLng.lng}`;

                    // Remove the previous "To" marker if it exists
                    if (toMarker) toMarker.remove();

                    // Add a new marker for the "To" location
                    toMarker = new maplibregl.Marker()
                        .setLngLat(toLatLng)
                        .setPopup(new maplibregl.Popup().setText("To: Selected"))
                        .addTo(map);
                    selecting = '';
                }
            });
        }

        // Clear the "From" location
        document.getElementById('clearFromBtn').addEventListener('click', function() {
            fromLatLng = null;
            document.getElementById('from').value = '';

            // Remove the marker if it exists
            if (fromMarker) {
                fromMarker.remove();
                fromMarker = null;
            }
        });

        // Clear the "To" location
        document.getElementById('clearToBtn').addEventListener('click', function() {
            toLatLng = null;
            document.getElementById('to').value = '';

            // Remove the marker if it exists
            if (toMarker) {
                toMarker.remove();
                toMarker = null;
            }
        });

        // Show the map when the 'From' or 'To' inputs are clicked
        document.getElementById('from').addEventListener('click', function() {
            selecting = 'from';
        });

        document.getElementById('to').addEventListener('click', function() {
            selecting = 'to';
        });

        // Calculate and display the distance when the button is clicked
        document.getElementById('submitBtn').addEventListener('click', function() {
            if (fromLatLng && toLatLng) {
                var distanceInMeters = fromLatLng.distanceTo(toLatLng);
                var distanceInKm = distanceInMeters / 1000;
                document.getElementById('distanceDisplay').innerText =
                    `Distance: ${distanceInKm.toFixed(2)} km / ${(distanceInKm * 0.621371).toFixed(2)} miles`;
            } else {
                alert('Please select both "From" and "To" locations!');
            }
        });

        window.onload = initMap;
    </script>
</body>

</html>
