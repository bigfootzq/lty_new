<?php
// +----------------------------------------------------------------------
// | ThinkCMF [ WE CAN DO IT MORE SIMPLE ]
// +----------------------------------------------------------------------
// | Copyright (c) 2013-2017 http://www.thinkcmf.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( http://www.apache.org/licenses/LICENSE-2.0 )
// +----------------------------------------------------------------------
// | Author: 老猫 <thinkcmf@126.com>
// +----------------------------------------------------------------------
namespace app\portal\controller;

use cmf\controller\HomeBaseController;

class IndexController extends HomeBaseController
{
    public function index()
    {
        return $this->fetch(':index');
    }
	
	public function ttt(){
		// 建立socket连接到内部推送端口
			$client = stream_socket_client('tcp://127.0.0.1:5678', $errno, $errmsg, 1);
			// 推送的数据，包含uid字段，表示是给这个uid推送
			$shopid = 2;
			$data = array('shopid'=>$shopid, 'code'=>1,'msg'=>'有新方案');
			dump($data);
			// 发送数据，注意5678端口是Text协议的端口，Text协议需要在数据末尾加上换行符
			fwrite($client, json_encode($data)."\n");
			// 读取推送结果
			echo fread($client, 8192);
	}
}
