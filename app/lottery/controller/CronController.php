<?php

namespace app\lottery\controller;

use cmf\controller\HomeBaseController;
use think\Request;
use think\Db;
use app\lottery\model\SchemeModel;

/**
 * Class CronController
 * 需要随时轮询的业务写在这里面
 * )
 */
class CronController extends HomeBaseController
{
	public function index(){
		
    }
	/*
		将超过截止时间的任务状态置为5
	*/
	public function clearExpireScheme(){
			// echo 'in';
			
			$scheme = new SchemeModel;
			$scheme->save(['tstatus' => 5],function($query){
			   // 闭包更新，所有截止时间小于当前时间的，status=5
				$map['endtime'] = ['<',date("Y-m-d H:i:s")];
			    $query->where($map)->where('tstatus', 1);
			});
	}
}
