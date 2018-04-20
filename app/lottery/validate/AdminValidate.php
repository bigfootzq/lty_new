<?php
// +----------------------------------------------------------------------
// | ThinkCMF [ WE CAN DO IT MORE SIMPLE ]
// +----------------------------------------------------------------------
// | Copyright (c) 2013-2017 http://www.thinkcmf.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( http://www.apache.org/licenses/LICENSE-2.0 )
// +----------------------------------------------------------------------
// | Author: 小夏 < 449134904@qq.com>
// +----------------------------------------------------------------------
namespace app\lottery\validate;

use think\Validate;

class AdminValidate extends Validate
{
	protected $rule = [
        'id' => 'require',
        'coin'  => 'require',
        'coin_pass'  => 'require',
    ];
    protected $message = [
        'id.require' => '用户id不能为空',
        'coin.require'  => '金额不能为空',
        'coin_pass.require'  => '支付密码不能为空',
    ];
}