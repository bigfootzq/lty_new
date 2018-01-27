<?php

use think\Route;

Route::get('scheme','lottery/Scheme/scheme');
Route::get('award','lottery/Award/Award');
Route::get('period','lottery/Award/period');
Route::get('getHotData','lottery/Award/getHotData');
Route::get('getTongjiData','lottery/Award/getTongjiData');
Route::get('profile/orderdata','lottery/Deal/order');
Route::get('profile/chaseorderdata','lottery/Deal/chaseorder');
Route::get('profile/betorderdata','lottery/Deal/betorder');
Route::get('user/logout','user/public/logout');
Route::get('user/userinfo','user/public/userinfo');

Route::post('scheme','lottery/SchemeTemp/scheme');
Route::post('scheme2','lottery/Scheme/scheme');
Route::patch('scheme','lottery/Scheme/scheme');


Route::post('user/logon','User/public/logon');
Route::post('order','lottery/Deal/order');
