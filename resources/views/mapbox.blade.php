<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MapLibre Example</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    {{-- <link href="https://unpkg.com/maplibre-gl@latest/dist/maplibre-gl.css" rel="stylesheet" /> --}}
    <link href="https://api.mapbox.com/mapbox-gl-js/v3.7.0/mapbox-gl.css" rel="stylesheet">
    <script src="https://api.mapbox.com/mapbox-gl-js/v3.7.0/mapbox-gl.js"></script>

    <style>
        
        #map {
            height: 600px;
            width: 100%;
            display: none;
        }

        canvas.mapboxgl-canvas{
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

            <button type="button" id="submitBtn" class="btn btn-primary mb-4">Submit</button>
            <button type="button" id="removeInitialMarkerBtn" class="btn btn-secondary mb-4">Remove Current Location</button>

            
            <div class="map-container">
                <div id="map"></div>
            </div>
            
        </main>
    </div>

    <input type="hidden" id="mapboxKey" value="{{ env("MAPBBOX_PUBLIC_TOKEN") }}">
    {{-- <script src="https://unpkg.com/maplibre-gl@latest/dist/maplibre-gl.js"></script> --}}
    <script src="{{ asset('frontend/map.js') }}"></script>
</body>

</html>
