<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MapLibre Example</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    {{-- <link href="https://unpkg.com/maplibre-gl@latest/dist/maplibre-gl.css" rel="stylesheet" /> --}}
    <link href="https://api.mapbox.com/mapbox-gl-js/v3.7.0/mapbox-gl.css" rel="stylesheet">

    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />

    <style>
        #map {
            height: 600px;
            width: 100%;
            display: none;
        }

        canvas.mapboxgl-canvas {
            width: 100%;
        }

        .suggestions:not(:empty) {
            border: 1px solid #ccc;
            max-height: 150px;
            overflow-y: auto;
            position: absolute;
            background: white;
            z-index: 1000;
            width: calc(100% - 10rem);
        }

        .suggestion-item {
            padding: 0.5rem;
            cursor: pointer;
        }

        .suggestion-item:hover {
            background: #f0f0f0;
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
            <form action="{{ route('estimate') }}" method="post">
            @csrf
            <input type="hidden" name="from_lat_lng" id="from-lat-lng">
            <input type="hidden" name="to_lat_lng" id="to-lat-lng">
            
            <div class="mb-3 row position-relative">
                <label for="from" class="col-sm-2 col-form-label">From</label>
                <div class="col-sm-10">
                    <input class="form-control mb-2" type="text" name="from" id="from" autocomplete="off">
                    <div id="from-suggestions" class="suggestions"></div>
                    <button id="clearFromBtn" class="btn btn-sm btn-danger">Clear</button>
                </div>
            </div>
            <div class="mb-3 row position-relative">
                <label for="to" class="col-sm-2 col-form-label">To</label>
                <div class="col-sm-10">
                    <input class="form-control mb-2" type="text" name="to" id="to" autocomplete="off">
                    <div id="to-suggestions" class="suggestions"></div>
                    <button id="clearToBtn" class="btn btn-sm btn-danger">Clear</button>
                </div>
            </div>
            <div class="mb-3 row position-relative">
                <label for="to" class="col-sm-2 col-form-label">Distance</label>
                <div class="col-sm-10">
                    <p id="distanceDisplay"></p>
                </div>
            </div>

            <div class="map-container">
                <div id="map"></div>
            </div>

            <hr>
            <div class="mb-3 row position-relative">
                

            </div>

            <div class="mb-3 row position-relative">
                <label for="seats" class="col-sm-2 form-label">Seats</label>
                <div class="col-sm-10">
                    <select class="form-control select2-default filter" name="seats[]" id="seats" multiple>
                        @foreach (seats() as $seat)
                            <option value="{{ $seat }}">{{ $seat }}</option>
                        @endforeach
                    </select>
                </div>
            </div>

            <div class="mb-3 row position-relative">
                <label for="" class="col-sm-2 form-label">Conditions</label>
                <div class="col-sm-10">
                    <div class="form-check">
                        <input class="form-check-input filter" name="has_ac" type="checkbox" value="" id="has-ac">
                        <label class="form-check-label" for="has-ac">
                          Has AC
                        </label>
                    </div>

                    <div class="form-check">
                        <input class="form-check-input filter" name="has_wifi" type="checkbox" value="" id="has-wifi">
                        <label class="form-check-label" for="has-wifi">
                          Has Wifi
                        </label>
                    </div>

                    <div class="form-check">
                        <input class="form-check-input filter" name="has_sound_system" type="checkbox" value="" id="has-sound-system">
                        <label class="form-check-label" for="has-sound-system">
                          Has Sound System
                        </label>
                    </div>

                    <div class="form-check">
                        <input class="form-check-input filter" name="has_luggage_capacity" type="checkbox" value="" id="has-luggage-capacity">
                        <label class="form-check-label" for="has-luggage-capacity">
                          Has Luggage Capacity
                        </label>
                    </div>

                    <div class="form-check">
                        <input class="form-check-input" name="will_return" type="checkbox" value="" id="will-return">
                        <label class="form-check-label" for="will-return">
                          Will Return
                        </label>
                    </div>
                </div>
            </div>

            <div class="mb-3 row position-relative">
                <label class="col-sm-2 form-label">Vehicles List</label>
                <div class="col-sm-10">
                    <select class="form-control select2-default" id="vehicles-list" name="vehicles[]" multiple>
                    </select>
                </div>
            </div>
            
           

            <button type="submit" class="btn btn-primary mb-4">Submit</button>
            <button type="button" id="removeInitialMarkerBtn" class="btn btn-secondary mb-4">Remove Current
                Location</button>

            </form>

        </main>
    </div>

    <input type="hidden" id="mapboxKey" value="{{ env('MAPBBOX_PUBLIC_TOKEN') }}">
    {{-- <script src="https://unpkg.com/maplibre-gl@latest/dist/maplibre-gl.js"></script> --}}

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js" integrity="sha512-v2CJ7UaYy4JwqLDIrZUI/4hqeoQieOmAZNXBeQyjo21dadnwR+8ZaIJVT8EE2iyI61OV8e6M8PP2/4hpQINQ/g==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
    <script src="https://api.mapbox.com/mapbox-gl-js/v3.7.0/mapbox-gl.js"></script>
    <script src="{{ asset('frontend/map.js') }}"></script>

    <script>
        $(document).ready(function() {
            $('.select2-default').select2();

            $('.filter').on('change', function(){
                let filters = {
                    has_ac: $('#has-ac').is(':checked') ? 1 : 0,
                    has_wifi: $('#has-wifi').is(':checked') ? 1 : 0,
                    has_sound_system: $('#has-sound-system').is(':checked') ? 1 : 0,
                    has_luggage_capacity: $('#has-luggage-capacity').is(':checked') ? 1 : 0,
                    seats: $('#seats').val()
                };

                // Send AJAX request to filter vehicles
                $.ajax({
                    url: "{{ route('filter') }}",  // Laravel route for filtering vehicles
                    method: 'GET',
                    data: filters,
                    success: function (response) {
                        // Clear the current vehicles list
                        $('#vehicles-list').html('');

                        // Populate the select box with filtered vehicles
                        if (response.length > 0) {
                            response.forEach(vehicle => {
                                $('#vehicles-list').append(`
                                    <option value="${vehicle.id}">
                                        ${vehicle.title} | Seat: ${vehicle.seats} | WiFi: ${vehicle.has_wifi ? 'True' : 'False'} | AC: ${vehicle.has_ac ? 'True' : 'False'} | Sound System: ${vehicle.has_sound_system ? 'True' : 'False'} | Luggage Capacity: ${vehicle.has_luggage_capacity ? 'True' : 'False'}
                                    </option>
                                `);
                            });
                        } else {
                            $('#vehicles-list').append('<option>No vehicles found matching your criteria.</option>');
                        }
                    }
                });
            })
        });

        
    </script>
</body>

</html>
