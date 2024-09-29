<?php

use App\Http\Controllers\TestController;
use Illuminate\Support\Facades\Route;

Route::get('/', [TestController::class, 'index']);


Route::get('/test', [TestController::class , 'seed']);
Route::post('/check', [TestController::class , 'check'])->name('check');