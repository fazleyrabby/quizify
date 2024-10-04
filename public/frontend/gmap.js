var map;
var fromLatLng = null;
var toLatLng = null;
var selecting = ''; // To track whether selecting "From" or "To"
var fromMarker = null;
var toMarker = null;
var userLatLng = null; // Variable to hold user's location
var initialMarker = null; // Reference to store the initial marker
const apiKey = "AIzaSyBZufSNTXgmLBmRhCZ3gZEDBdie4pcWW_c"; // Replace with your Google Maps API key

// Initialize the map
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 40, lng: -74.5 }, // Initial map center [lat, lng]
        zoom: 12 // Initial zoom level
    });

    // Get the user's current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            userLatLng = { lat: position.coords.latitude, lng: position.coords.longitude };

            // Center the map on the user's location
            map.setCenter(userLatLng);

            // Add a marker for the user's current location
            initialMarker = new google.maps.Marker({
                position: userLatLng,
                map: map,
                title: "You are here!",
                icon: { url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' }
            });
        }, function (error) {
            alert("Unable to retrieve your location");
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }

    // Handle map clicks for setting "From" or "To" locations
    map.addListener('click', function (e) {
        const coordinates = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        if (selecting === 'from') {
            fromLatLng = coordinates;
            
            // Fetch the location name for "From"
            fetchLocationName(coordinates).then(locationName => {
                document.getElementById('from').value = locationName;
                document.getElementById('from-lat-lng').value = JSON.stringify(fromLatLng);

                // Remove the previous "From" marker if it exists
                if (fromMarker) fromMarker.setMap(null);

                // Add a new marker for the "From" location
                fromMarker = new google.maps.Marker({
                    position: coordinates,
                    map: map,
                    title: "From: Selected"
                });
                selecting = '';
                calculateDistance();
            });
        } else if (selecting === 'to') {
            toLatLng = coordinates;
            // Fetch the location name for "To"
            fetchLocationName(coordinates).then(locationName => {
                document.getElementById('to').value = locationName;
                document.getElementById('to-lat-lng').value = JSON.stringify(toLatLng);

                // Remove the previous "To" marker if it exists
                if (toMarker) toMarker.setMap(null);

                // Add a new marker for the "To" location
                toMarker = new google.maps.Marker({
                    position: coordinates,
                    map: map,
                    title: "To: Selected"
                });
                selecting = '';
                calculateDistance();
            });
        }
    });
}

// Clear the "From" location
document.getElementById('clearFromBtn').addEventListener('click', function (e) {
    e.preventDefault()
    fromLatLng = null;
    document.getElementById('from').value = '';
    document.getElementById('from-suggestions').innerHTML = ''; // Clear suggestions

    // Remove the marker if it exists
    if (fromMarker) {
        fromMarker.setMap(null);
        fromMarker = null;
    }
});

// Clear the "To" location
document.getElementById('clearToBtn').addEventListener('click', function () {
    e.preventDefault()
    toLatLng = null;
    document.getElementById('to').value = '';
    document.getElementById('to-suggestions').innerHTML = ''; // Clear suggestions

    // Remove the marker if it exists
    if (toMarker) {
        toMarker.setMap(null);
        toMarker = null;
    }
});

// Remove the initial user marker (city)
document.getElementById('removeInitialMarkerBtn').addEventListener('click', function () {
    if (initialMarker) {
        initialMarker.setMap(null);
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

// Fetch suggestions from Google Places API
function fetchSuggestions(input, type) {
    if (!input) return;
    const autocompleteService = new google.maps.places.AutocompleteService();
    
    autocompleteService.getPlacePredictions({ input: input }, function (predictions, status) {
        console.log(predictions)
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            const suggestionsContainer = document.getElementById(type + '-suggestions');
            suggestionsContainer.innerHTML = '';
            
            predictions.forEach(function (prediction) {
                const suggestionItem = document.createElement('div');
                suggestionItem.className = 'suggestion-item';
                suggestionItem.innerText = prediction.description;
                
                suggestionItem.addEventListener('click', function () {
                    document.getElementById(type).value = prediction.description;
                    const placesService = new google.maps.places.PlacesService(map);
                    placesService.getDetails({ placeId: prediction.place_id }, function (place, status) {
                        if (status === google.maps.places.PlacesServiceStatus.OK) {
                            const location = place.geometry.location;
                            if (type === 'from') {
                                fromLatLng = { lat: location.lat(), lng: location.lng() };
                                document.getElementById('from-lat-lng').value = JSON.stringify(fromLatLng);
                                if (fromMarker) fromMarker.setMap(null);
                                fromMarker = new google.maps.Marker({
                                    position: fromLatLng,
                                    map: map,
                                    title: "From: Selected"
                                });
                                map.setCenter(fromLatLng);
                            } else if (type === 'to') {
                                toLatLng = { lat: location.lat(), lng: location.lng() };
                                document.getElementById('to-lat-lng').value = JSON.stringify(toLatLng);
                                if (toMarker) toMarker.setMap(null);
                                toMarker = new google.maps.Marker({
                                    position: toLatLng,
                                    map: map,
                                    title: "To: Selected"
                                });
                                map.setCenter(toLatLng);
                            }
                            calculateDistance();
                            suggestionsContainer.innerHTML = ''; // Clear suggestions
                        }
                    });
                });

                suggestionsContainer.appendChild(suggestionItem);
            });
        }
    });
}


// Add event listeners to input fields for fetching suggestions
document.getElementById('from').addEventListener('input', function () {
    fetchSuggestions(this.value, 'from');
});

document.getElementById('to').addEventListener('input', function () {
    fetchSuggestions(this.value, 'to');
});

// Calculate distance between two points using Haversine formula
function getDistance(from, to) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (to.lat - from.lat) * (Math.PI / 180);
    const dLon = (to.lng - from.lng) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(from.lat * (Math.PI / 180)) * Math.cos(to.lat * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

// Calculate distance and route between two points
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
    const geocoder = new google.maps.Geocoder();
    return new Promise((resolve, reject) => {
        geocoder.geocode({ location: latLng }, function (results, status) {
            console.log("Geocoder Status:", status);
            if (status === 'OK' && results[0]) {
                console.log("Geocoder Results:", results);
                resolve(results[0].formatted_address);
            } else {
                console.log("Geocoding failed.");
                resolve("Unknown Location");
            }
        });
    });
}

// Function to get the route using Google Directions API
function getRoute() {
    if (!fromLatLng || !toLatLng) {
        alert('Please select both From and To locations.');
        return;
    }

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({ map: map });

    const request = {
        origin: fromLatLng,
        destination: toLatLng,
        travelMode: google.maps.TravelMode.DRIVING
    };

    directionsService.route(request, function (result, status) {
        if (status === 'OK') {
            directionsRenderer.setDirections(result);
        } else {
            alert('Could not find route between these locations.');
        }
    });
}
