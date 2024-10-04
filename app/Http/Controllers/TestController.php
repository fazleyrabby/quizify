<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use Illuminate\Http\Request;

class TestController extends Controller
{
    public function index()
    {
        $vehicles = Vehicle::toBase()->where('status', true)->get();
        return view('google-map', compact('vehicles'));
        // return view('mapbox', compact('vehicles'));
    }

    public function estimate(Request $request)
    {
        $estimatedCost = 0;
        $fromLatLng = json_decode($request->from_lat_lng, true);
        $toLatLng = json_decode($request->to_lat_lng, true);
        
        $distance = calculateDistance($fromLatLng, $toLatLng);
        $estimatedCost += costByDistance($distance);
        $estimatedCost = $this->calculateVehicleCost($request->all(), $estimatedCost);

        dd('Your estimated cost is: ' . $estimatedCost . " USD");
    }

    private function calculateVehicleCost($request, $estimatedCost){
        $willReturn = false;
        if(isset($request['will_return'])){
            $willReturn = true;
            $estimatedCost += $estimatedCost * 2.1;
        }

       $vehicles = Vehicle::whereIn('id', $request['vehicles'])->get();

       foreach($vehicles as $vehicle){
            if($vehicle->has_ac){
                $estimatedCost += 100 + $willReturn ? 50 : 0;
            }

            if($vehicle->has_wifi){
                $estimatedCost += 50 + $willReturn ? 25 : 0;
            }

            if($vehicle->has_luggage_capacity){
                $estimatedCost += 25 + $willReturn ? 10 : 0;
            }

            if($vehicle->has_sound_system){
                $estimatedCost += 50 + $willReturn ? 20 : 0;
            }
       }

       return $estimatedCost;
    }
    public function filterVehicles(Request $request)
    {
        // Initialize the query
        $query = Vehicle::query();
        
        if ($request->has('has_ac') && json_decode($request->has_ac)) {
            $query->where('has_ac', $request->input('has_ac'));
        }

        if ($request->has('has_wifi') && json_decode($request->has_wifi)) {
            $query->where('has_wifi', $request->input('has_wifi'));
        }

        if ($request->has('has_sound_system') && json_decode($request->has_sound_system)) {
            $query->where('has_sound_system', $request->input('has_sound_system'));
        }

        if ($request->has('has_luggage_capacity') && json_decode($request->has_luggage_capacity)) {
            $query->where('has_luggage_capacity', $request->input('has_luggage_capacity'));
        }

        if ($request->input('seats')) {
            $query->whereIn('seats', $request->input('seats'));
        }
        
        // Fetch the filtered vehicles
        $vehicles = $query->get();
        // Return the result (or pass it to a view)
        return response()->json($vehicles);
    }

    public function seed()
    {
        $possibleSeats = seats();
        $data = [];
        for ($i = 0; $i < 20; $i++) {
            $data[] = [
                'title' => fake()->words(2, true),
                'seats' => $possibleSeats[array_rand($possibleSeats)],
                'has_wifi' => rand(0, 1),
                'has_ac' => rand(0, 1),
                'has_sound_system' => rand(0, 1),
                'has_luggage_capacity' => rand(0, 1),
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        Vehicle::insert($data);
    }
}
