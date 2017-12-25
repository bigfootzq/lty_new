<?php

use think\Route;

Route::get('scheme','lottery/Scheme/scheme');
Route::post('scheme','lottery/Scheme/scheme');
Route::patch('scheme','lottery/Scheme/scheme');


Route::post('user/logon','User/public/logon');
