#!/usr/bin/env php
<?php
// define('APP_PATH', __DIR__ . '/app/');


// 调试模式开关
define("APP_DEBUG", true);

// 定义CMF根目录,可更改此目录
define('CMF_ROOT', __DIR__ . '/');

// 定义应用目录
define('APP_PATH', CMF_ROOT . 'app/');
define('BIND_MODULE','push/Worker');
// 定义CMF核心包目录
define('CMF_PATH', CMF_ROOT . 'simplewind/cmf/');

// 定义插件目录
define('PLUGINS_PATH', __DIR__ . '/plugins/');

// 定义扩展目录
define('EXTEND_PATH', CMF_ROOT . 'simplewind/extend/');
define('VENDOR_PATH', CMF_ROOT . 'simplewind/vendor/');

// 定义应用的运行时目录
define('RUNTIME_PATH', CMF_ROOT . 'data/runtime/');

// 定义CMF 版本号
define('THINKCMF_VERSION', '5.0.170927');


// 加载框架引导文件
require __DIR__ . '/simplewind/thinkphp/start.php';