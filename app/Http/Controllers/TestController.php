<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use Illuminate\Http\Request;

class TestController extends Controller
{
    public function index(){
        $vehicles = Vehicle::all();
        return view('maplibre', compact('vehicles'));
    }

    public function check(Request $request){
        dd($request->all());
    }

    public function seed(){
        $possibleSeats = [25, 30, 40, 45, 60];
        $data = [];
        for($i=0; $i < 20; $i++){
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
