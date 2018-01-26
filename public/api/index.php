<?php
// +----------------------------------------------------------------------
// | ThinkCMF [ WE CAN DO IT MORE SIMPLE ]
// +----------------------------------------------------------------------
// | Copyright (c) 2013-2017 http://www.thinkcmf.com All rights reserved.
// +----------------------------------------------------------------------
// | Author: Dean <zxxjjforever@163.com>
// +----------------------------------------------------------------------

// [ 应用入口文件 ]

// 调试模式开关
define("APP_DEBUG", true);

// 定义 APP 命名空间
define("APP_NAMESPACE", 'api');

// 定义CMF根目录,可更改此目录
define('CMF_ROOT', __DIR__ . '/../../');

// 定义应用目录
define('APP_PATH', CMF_ROOT . 'api/');

// 定义CMF目录
define('CMF_PATH', __DIR__ . '/../../simplewind/cmf/');

// 定义插件目录
define('PLUGINS_PATH', __DIR__ . '/../plugins/');

// 定义扩展目录
define('EXTEND_PATH', __DIR__ . '/../../simplewind/extend/');
define('VENDOR_PATH', __DIR__ . '/../../simplewind/vendor/');

// 定义应用的运行时目录
define('RUNTIME_PATH',__DIR__.'/../../data/runtime/api/');

// 加载框架基础文件
require __DIR__ . '/../../simplewind/thinkphp/base.php';

// 准许跨域请求。
header("Access-Control-Allow-Origin: * ");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header('Access-Control-Allow-Headers:*');  
/**
 * 浏览器第一次在处理复杂请求的时候会先发起OPTIONS请求。路由在处理请求的时候会导致PUT请求失败。
 * 在检测到option请求的时候就停止继续执行
 */
if($_SERVER['REQUEST_METHOD'] == 'OPTIONS'){
    exit;
}

// 执行应用
\think\App::run()->send();
