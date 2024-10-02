var map;
var fromLatLng = null;
var toLatLng = null;
var selecting = ''; // To track whether selecting "From" or "To"
var fromMarker = null;
var toMarker = null;
var userLatLng = null; // Variable to hold user's location
var initialMarker = null; // Reference to store the initial marker
const apiKey = document.getElementById('mapboxKey').value; // Replace with your Mapbox API key

// Initialize the map
function initMap() {
    mapboxgl.accessToken = apiKey; // Set the Mapbox access token

    map = new mapboxgl.Map({
        container: 'map', // ID of the container
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-74.5, 40], // Initial map center [lng, lat]
        zoom: 12 // Initial zoom level
    });


    // Add zoom and rotation controls to the map.
    map.addControl(new mapboxgl.NavigationControl());

    // Get the user's current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            userLatLng = [position.coords.longitude, position.coords.latitude];

            // Center the map on the user's location
            map.setCenter(userLatLng);

            // Add a marker for the user's current location
            initialMarker = new mapboxgl.Marker({ color: 'red' })
                .setLngLat(userLatLng)
                .setPopup(new mapboxgl.Popup().setText("City: You are here!"))
                .addTo(map);
        }, function (error) {
            alert("Unable to retrieve your location");
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }

    // Handle map clicks for setting "From" or "To" locations
    map.on('click', function (e) {
        const coordinates = e.lngLat;
        if (selecting === 'from') {
            fromLatLng = Object.values(coordinates);
            
            // Fetch the location name for "From"
            fetchLocationName(coordinates).then(locationName => {
                document.getElementById('from').value = locationName;
                document.getElementById('from-lat-lng').value = JSON.stringify(fromLatLng);

                // Remove the previous "From" marker if it exists
                if (fromMarker) fromMarker.remove();

                // Add a new marker for the "From" location
                fromMarker = new mapboxgl.Marker()
                    .setLngLat(coordinates)
                    .setPopup(new mapboxgl.Popup().setText("From: Selected"))
                    .addTo(map);
                selecting = '';
                calculateDistance();
            });
        } else if (selecting === 'to') {
            toLatLng = Object.values(coordinates);
            // Fetch the location name for "To"
            fetchLocationName(coordinates).then(locationName => {
                document.getElementById('to').value = locationName;
                document.getElementById('to-lat-lng').value = JSON.stringify(toLatLng);
                // Remove the previous "To" marker if it exists
                if (toMarker) toMarker.remove();

                // Add a new marker for the "To" location
                toMarker = new mapboxgl.Marker()
                    .setLngLat(coordinates)
                    .setPopup(new mapboxgl.Popup().setText("To: Selected"))
                    .addTo(map);
                selecting = '';
                calculateDistance();
            });
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
    map.resize();
});

document.getElementById('to').addEventListener('click', function () {
    selecting = 'to';
    document.getElementById('map').style.display = 'block';
    map.resize();
});

// Fetch suggestions from Mapbox Geocoding API
function fetchSuggestions(input, type) {
    if (!input) return;
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(input)}.json?access_token=${apiKey}`)
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
                        document.getElementById('from-lat-lng').value = JSON.stringify(fromLatLng);
                        if (fromMarker) fromMarker.remove();
                        fromMarker = new mapboxgl.Marker()
                            .setLngLat(fromLatLng)
                            .setPopup(new mapboxgl.Popup().setText("From: Selected"))
                            .addTo(map);
                        map.setCenter(fromLatLng); // Center the map on the selected location
                    } else if(type === 'to') {
                        toLatLng = feature.geometry.coordinates;
                        document.getElementById('to-lat-lng').value = JSON.stringify(toLatLng);
                        if (toMarker) toMarker.remove();
                        toMarker = new mapboxgl.Marker()
                            .setLngLat(toLatLng)
                            .setPopup(new mapboxgl.Popup().setText("To: Selected"))
                            .addTo(map);
                        map.setCenter(toLatLng); // Center the map on the selected location
                    }

                    calculateDistance()

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
// document.getElementById('submitBtn').addEventListener('click', function () {
//     if (fromLatLng && toLatLng) {
//         const distance = getDistance(fromLatLng, toLatLng);
//         document.getElementById('distanceDisplay').innerText = `${distance.toFixed(2)} km`;
//     } else {
//         alert('Please select both From and To locations.');
//     }
// });

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

// Calculate distance between two points
function calculateDistance() {
    if (fromLatLng && toLatLng) {
        const distance = getDistance(fromLatLng, toLatLng);
        getRoute();
        document.getElementById('distanceDisplay').innerText = `${distance.toFixed(2)} km`;
    } else {
        document.getElementById('distanceDisplay').innerText = ''; // Clear if NaN
    }
}
// Function to fetch the location name based on coordinates
function fetchLocationName(latLng) {
    return fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${latLng.lng},${latLng.lat}.json?access_token=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            if (data.features && data.features.length > 0) {
                return data.features[0].place_name; // Return the first place name
            }
            return "Unknown Location"; // Fallback if no name is found
        });
}

// Function to draw the route on the map
function drawRoute(route) {
    if (map.getSource('route')) {
        map.getSource('route').setData({
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: route
            }
        });
    } else {
        map.addSource('route', {
            type: 'geojson',
            data: {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: route
                }
            }
        });

        map.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': '#888',
                'line-width': 8
            }
        });
    }
}

// Function to get the route from the Mapbox Directions API
function getRoute() {
    if (!fromLatLng || !toLatLng) {
        alert('Please select both From and To locations.');
        return;
    }

    const [fromLng, fromLat] = fromLatLng;
    const [toLng, toLat] = toLatLng;

    // Request to the Directions API
    fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${fromLng},${fromLat};${toLng},${toLat}?geometries=geojson&access_token=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0].geometry.coordinates; // Get the route coordinates
                drawRoute(route); // Draw the route on the map
                // calculateDistance(); // Update the distance display
            } else {
                // alert('Route not found.');
            }
        })
        .catch(error => {
            console.error('Error fetching directions:', error);
            // alert('Failed to get directions.');
        });
}
// Initialize the map when the page loads
window.onload = initMap;
