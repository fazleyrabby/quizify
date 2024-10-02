<?php

use App\Http\Controllers\TestController;
use Illuminate\Support\Facades\Route;

Route::get('/', [TestController::class, 'index']);


Route::get('/test', [TestController::class , 'seed']);
Route::post('/estimate', [TestController::class , 'estimate'])->name('estimate');

Route::get('/filter-vehicles', [TestController::class, 'filterVehicles'])->name('filter');