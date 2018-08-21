<?php
// +----------------------------------------------------------------------
// | 文件说明：路由
// +----------------------------------------------------------------------
// | Copyright (c) 2017 http://www.wuwuseo.com All rights reserved.
// +----------------------------------------------------------------------
// | Author: thinkcmf
// +----------------------------------------------------------------------
// | Licensed ( http://www.apache.org/licenses/LICENSE-2.0 )
// +----------------------------------------------------------------------
// | Date: 2017-8-11
// +----------------------------------------------------------------------
use think\Route;

Route::get([
    'user/favorites/my' => 'user/favorites/getFavorites', //获取收藏列表
    'user/comments/my'  => 'user/comments/getUserComments', //获取我的评论列表
    'user/comments'     => 'user/comments/getComments', //获评论列表
]);

Route::post([
    'user/articles/deletes' => 'user/Articles/deletes',
    'user/favorites'        => 'user/favorites/setFavorites', //添加收藏
    'user/comments'         => 'user/comments/setComments', //添加评论
	'user/reg'				=> 'user/public/register',//注册
	'user/sms'				=> 'user/public/smsSend',//注册验证码发送
	'user/login'			=> 'user/public/login',//登录
	'user/changePassword'	=> 'user/profile/changePassword',//修改密码
]);

Route::delete([
    'user/favorites/:id' => 'user/favorites/unsetFavorites', //删除收藏
    'user/comments/:id'  => 'user/comments/delComments', //删除评论
]);
