<?php
// +----------------------------------------------------------------------
// | ThinkCMF [ WE CAN DO IT MORE SIMPLE ]
// +----------------------------------------------------------------------
// | Copyright (c) 2013-2017 http://www.thinkcmf.com All rights reserved.
// +----------------------------------------------------------------------
// | Author: Dean <zxxjjforever@163.com>
// +----------------------------------------------------------------------
namespace api\user\controller;

use think\Db;
use think\Validate;
use cmf\controller\RestBaseController;

class PublicController extends RestBaseController
{
    // 用户注册
    public function register()
    {
        $validate = new Validate([
            'username'          => 'require',
            'shopcode'          => 'require',
            'password'          => 'require',
            'vcode' 			=> 'require'
        ]);

        $validate->message([
            'shopcode.require'          => '请输入彩店代码',
            'username.require'          => '请输入手机号',
            'password.require'          => '请输入您的密码!',
            'vcode.require' 			=> '请输入数字验证码!'
        ]);

        $data = $this->request->param();
        if (!$validate->check($data)) {
            $this->error($validate->getError());
        }

        $user = [];

        $userQuery = Db::name("user");

        if (Validate::is($data['username'], 'email')) {
            $user['user_email'] = $data['username'];
            $userQuery          = $userQuery->where('user_email', $data['username']);
        } else if (preg_match('/(^(13\d|15[^4\D]|17[013678]|18\d)\d{8})$/', $data['username'])) {
            $user['mobile'] = $data['username'];
            $userQuery      = $userQuery->where('mobile', $data['username']);
        } else {
            $this->error("请输入正确的手机或者邮箱格式!");
        }

        $errMsg = cmf_check_verification_code($data['username'], $data['vcode']);
        if (!empty($errMsg)) {
            $this->error($errMsg);
        }

        $findUserCount = $userQuery->count();

        if ($findUserCount > 0) {
            $this->error("此账号已存在!");
        }
		$user['shopid']     = $data['shopcode'];
        $user['create_time'] = time();
        $user['user_status'] = 1;
        $user['user_type']   = 2;
        $user['user_pass']   = cmf_password($data['password']);

        $result = $userQuery->insert($user);


        if (empty($result)) {
            $this->error("注册失败,请重试!");
        }

        $this->success("注册并激活成功,请登录!");

    }

    // 用户登录 TODO 增加最后登录信息记录,如 ip
    public function login()
    {
        $validate = new Validate([
            'username' => 'require',
            'password' => 'require'
        ]);
        $validate->message([
            'username.require' => '请输入手机号,邮箱或用户名!',
            'password.require' => '请输入您的密码!'
        ]);

        $data = $this->request->param();
        if (!$validate->check($data)) {
            $this->error($validate->getError());
        }

        $userQuery = Db::name("user");
        if (Validate::is($data['username'], 'email')) {
            $userQuery = $userQuery->where('user_email', $data['username']);
        } else if (preg_match('/(^(13\d|15[^4\D]|17[013678]|18\d)\d{8})$/', $data['username'])) {
            $userQuery = $userQuery->where('mobile', $data['username']);
        } else {
            $userQuery = $userQuery->where('user_login', $data['username']);
        }

        $findUser = $userQuery->find();

        if (empty($findUser)) {
            $this->error("用户不存在!");
        } else {

            switch ($findUser['user_status']) {
                case 0:
                    $this->error('您已被拉黑!');
                case 2:
                    $this->error('账户还没有验证成功!');
            }

            if (!cmf_compare_password($data['password'], $findUser['user_pass'])) {
                $this->error("密码不正确!");
            }
        }

        // $allowedDeviceTypes = ['mobile', 'android', 'iphone', 'ipad', 'web', 'pc', 'mac'];

        // if (empty($data['device_type']) || !in_array($data['device_type'], $allowedDeviceTypes)) {
            // $this->error("请求错误,未知设备!");
        // }

        $userTokenQuery = Db::name("user_token")
            ->where('user_id', $findUser['id'])
            ->where('device_type', $data['device_type']);
        $findUserToken  = $userTokenQuery->find();
        $currentTime    = time();
        $expireTime     = $currentTime + 24 * 3600 * 180;
        $token          = md5(uniqid()) . md5(uniqid());
        if (empty($findUserToken)) {
            $result = $userTokenQuery->insert([
                'token'       => $token,
                'user_id'     => $findUser['id'],
                'expire_time' => $expireTime,
                'create_time' => $currentTime,
                'device_type' => $data['device_type']
            ]);
        } else {
            $result = $userTokenQuery
                ->where('user_id', $findUser['id'])
                ->where('device_type', $data['device_type'])
                ->update([
                    'token'       => $token,
                    'expire_time' => $expireTime,
                    'create_time' => $currentTime
                ]);
        }


        if (empty($result)) {
            $this->error("登录失败!");
        }

        $this->success("登录成功!", ['token' => $token, 'user' => $findUser]);
    }
	
	//彩票店主登录
	public function logon(){
		$validate = new Validate([
            'username' => 'require',
            'password' => 'require'
        ]);
        $validate->message([
            'username.require' => '请您的用户名!',
            'password.require' => '请输入您的密码!'
        ]);

        $data = $this->request->param();
        if (!$validate->check($data)) {
            $this->error($validate->getError());
        }

        $userQuery = Db::name("user");
        if (Validate::is($data['username'], 'email')) {
            $userQuery = $userQuery->where('user_email', $data['username']);
        } else if (preg_match('/(^(13\d|15[^4\D]|17[013678]|18\d)\d{8})$/', $data['username'])) {
            $userQuery = $userQuery->where('mobile', $data['username']);
        } else {
            $userQuery = $userQuery->where('user_login', $data['username']);
        }

        $findUser = $userQuery->find();

        if (empty($findUser)) {
            $this->error("用户不存在!");
        } else {

            switch ($findUser['user_status']) {
                case 0:
                    $this->error('您的账户已经被禁用!');
                case 2:
                    $this->error('账户还没有验证成功!');
            }

            if (!cmf_compare_password($data['password'], $findUser['user_pass'])) {
                $this->error("密码不正确!");
            }
        }
		
		$userTokenQuery = Db::name("user_token")
            ->where('user_id', $findUser['id']);
            // ->where('device_type', $data['device_type']);
        $findUserToken  = $userTokenQuery->find();
        $currentTime    = time();
        $expireTime     = $currentTime + 24 * 3600 * 180;
		$key = "lottery";
		$payload = array(
						"iss" => "Server", 
						'uid' => $findUser['id'],
						);
		
		$token = \jwt\JWT::encode($payload, $key);
        // $token          = md5(uniqid()) . md5(uniqid());
        if (empty($findUserToken)) {
            $result = $userTokenQuery->insert([
                'token'       => $token,
                'user_id'     => $findUser['id'],
                'expire_time' => $expireTime,
                'create_time' => $currentTime
                // 'device_type' => $data['device_type']
            ]);
        } else {
            $result = $userTokenQuery
                ->where('user_id', $findUser['id'])
                // ->where('device_type', $data['device_type'])
                ->update([
                    'token'       => $token,
                    'expire_time' => $expireTime,
                    'create_time' => $currentTime
                ]);
        }


        if (empty($result)) {
            $this->error("登录失败!");
        }else{
			session_start();
			session('ADMIN_ID', $findUser['id']);
			session('name',$data['username'] );
			$sessionId= session_id();  //这里增加了几句用于显式传递sessionId
			$this->success("登录成功!", ['token' => $token, 'shopid' => $findUser['id'],'sid'=>$sessionId]);
		}
		
        
	}
    // 用户退出
    public function logout()
    {
        $userId = $this->getUserId();
        Db::name('user_token')->where([
            'token'       => $this->token,
            'user_id'     => $userId,
            'device_type' => $this->deviceType
        ])->update(['token' => '']);

        $this->success("退出成功!");
    }
    // 获取用户信息
    public function userinfo()
    {
        $userId = $this->getUserId();
        $userinfo = Db::name('user')->where([
						'id'     => $userId
					])->find();

        if($userinfo){
			$this->success('查询用户信息成功',$userinfo);
		}else{
			$this->error('查询用户信息失败');
		}
    }

    // 用户密码重置
    public function passwordReset()
    {
        $validate = new Validate([
            'username'          => 'require',
            'password'          => 'require',
            'verification_code' => 'require'
        ]);

        $validate->message([
            'username.require'          => '请输入手机号,邮箱!',
            'password.require'          => '请输入您的密码!',
            'verification_code.require' => '请输入数字验证码!'
        ]);

        $data = $this->request->param();
        if (!$validate->check($data)) {
            $this->error($validate->getError());
        }

        $userWhere = [];
        if (Validate::is($data['username'], 'email')) {
            $userWhere['user_email'] = $data['username'];
        } else if (preg_match('/(^(13\d|15[^4\D]|17[013678]|18\d)\d{8})$/', $data['username'])) {
            $userWhere['mobile'] = $data['username'];
        } else {
            $this->error("请输入正确的手机或者邮箱格式!");
        }

        $errMsg = cmf_check_verification_code($data['username'], $data['verification_code']);
        if (!empty($errMsg)) {
            $this->error($errMsg);
        }

        $userPass = cmf_password($data['password']);
        Db::name("user")->where($userWhere)->update(['user_pass' => $userPass]);

        $this->success("密码重置成功,请使用新密码登录!");

    }
	
	public function smsSend()
    {
        if(request()->isPost()){
            $mobile =  input('post.mobile');//input助手函数	获取输入数据 支持默认值和过滤
            $code = cmf_get_verification_code($mobile,6);  
			// dump($code);
            $result = sendMsg($mobile, $code); 
			// dump($result);
            //$result['Code'] = 'OK';  
            if ($result['Code'] == 'OK') {  
                //存到数据库中  
				cmf_verification_code_log($mobile,$code,3600);
                $this->success('ok',  $mobile);  
            }  

        }
    }

}
