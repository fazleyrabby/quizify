
var map;
var fromLatLng = null;
var toLatLng = null;
var selecting = ''; // To track whether selecting "From" or "To"
var fromMarker = null;
var toMarker = null;
var userLatLng = null; // Variable to hold user's location
var initialMarker = null; // Reference to store the initial marker
const apiKey = document.getElementById('maptilerKey').value; // Replace with your MapTiler API key

// Initialize the map
function initMap() {
    map = new maplibregl.Map({
        container: 'map', // ID of the container
        style: 'https://api.maptiler.com/maps/basic-v2/style.json?key=' + apiKey, // Map style
        center: [-74.5, 40], // Initial map center [lng, lat]
        zoom: 12 // Initial zoom level
    });

    // Add zoom and rotation controls to the map.
    map.addControl(new maplibregl.NavigationControl());

    // Get the user's current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            userLatLng = [position.coords.longitude, position.coords.latitude];

            // Center the map on the user's location
            map.setCenter(userLatLng);

            // Add a marker for the user's current location as the city
            initialMarker = new maplibregl.Marker({ color: 'red' })
                .setLngLat(userLatLng)
                .setPopup(new maplibregl.Popup().setText("City: You are here!"))
                .addTo(map);
        }, function (error) {
            alert("Unable to retrieve your location");
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }

    // Handle map clicks for setting "From" or "To" locations
    map.on('click', function (e) {
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
document.getElementById('clearFromBtn').addEventListener('click', function () {
    fromLatLng = null;
    document.getElementById('from').value = '';
    document.getElementById('from-suggestions').innerHTML = ''; // Clear suggestions

    // Remove the marker if it exists
    if (fromMarker) {
        fromMarker.remove();
        fromMarker = null;
    }
});

// Clear the "To" location
document.getElementById('clearToBtn').addEventListener('click', function () {
    toLatLng = null;
    document.getElementById('to').value = '';
    document.getElementById('to-suggestions').innerHTML = ''; // Clear suggestions

    // Remove the marker if it exists
    if (toMarker) {
        toMarker.remove();
        toMarker = null;
    }
});

// Remove the initial user marker (city)
document.getElementById('removeInitialMarkerBtn').addEventListener('click', function () {
    if (initialMarker) {
        initialMarker.remove();
        initialMarker = null;
    }
});

// Show the map when the 'From' or 'To' inputs are clicked
document.getElementById('from').addEventListener('click', function () {
    selecting = 'from';
    document.getElementById('map').style.display = 'block';
});

document.getElementById('to').addEventListener('click', function () {
    selecting = 'to';
    document.getElementById('map').style.display = 'block';
});

// Fetch suggestions from MapTiler Geocoding API
function fetchSuggestions(input, type) {
    if (!input) return;
    fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(input)}.json?key=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            const suggestionsContainer = document.getElementById(type + '-suggestions');
            suggestionsContainer.innerHTML = '';

            data.features.forEach(feature => {
                const suggestionItem = document.createElement('div');
                suggestionItem.className = 'suggestion-item';
                suggestionItem.innerText = feature.place_name;

                suggestionItem.addEventListener('click', function () {
                    // Set the value of the input field
                    document.getElementById(type).value = feature.place_name;

                    // Set the latitude and longitude
                    if (type === 'from') {
                        fromLatLng = feature.geometry.coordinates;
                        if (fromMarker) fromMarker.remove();
                        fromMarker = new maplibregl.Marker()
                            .setLngLat(fromLatLng)
                            .setPopup(new maplibregl.Popup().setText("From: Selected"))
                            .addTo(map);
                        map.setCenter(fromLatLng); // Center the map on the selected location
                    } else {
                        toLatLng = feature.geometry.coordinates;
                        if (toMarker) toMarker.remove();
                        toMarker = new maplibregl.Marker()
                            .setLngLat(toLatLng)
                            .setPopup(new maplibregl.Popup().setText("To: Selected"))
                            .addTo(map);
                        map.setCenter(toLatLng); // Center the map on the selected location
                    }

                    // Clear suggestions
                    suggestionsContainer.innerHTML = '';
                });

                suggestionsContainer.appendChild(suggestionItem);
            });
        });
}

// Add event listeners to input fields for fetching suggestions
document.getElementById('from').addEventListener('input', function () {
    fetchSuggestions(this.value, 'from');
});

document.getElementById('to').addEventListener('input', function () {
    fetchSuggestions(this.value, 'to');
});

// Submit button functionality (calculate distance or do other actions)
document.getElementById('submitBtn').addEventListener('click', function () {
    if (fromLatLng && toLatLng) {
        const distance = getDistance(fromLatLng, toLatLng);
        document.getElementById('distanceDisplay').innerText = `Distance: ${distance.toFixed(2)} km`;
    } else {
        alert('Please select both From and To locations.');
    }
});

// Calculate distance between two points
function getDistance(from, to) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (to[1] - from[1]) * (Math.PI / 180);
    const dLon = (to[0] - from[0]) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(from[1] * (Math.PI / 180)) * Math.cos(to[1] * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

// Initialize the map when the page loads
window.onload = initMap;