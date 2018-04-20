<?php
// +----------------------------------------------------------------------
// | 
// +----------------------------------------------------------------------
// | Copyright (c) 2017 bigfoot All rights reserved.
// +----------------------------------------------------------------------
// | Author: bigfoot
// +----------------------------------------------------------------------
// 
namespace api\lottery\controller;

use api\lottery\controller\BaseController;
use think\Request;
use think\Response;
use think\Db;
use think\Validate;

class DealController extends BaseController
{
	private $userid;
	// 自动加载验证
	public function __construct(){
		parent::__construct();

			// 验证 客户端 token
			// $apptoken = I('post.apptoken');
			// parent::checkAppToken($apptoken);
			
			$this->userid = parent::getUserId();
			if (!$this->userid){
				
				$this -> error('token校验失败,请重新登录');
			}
	}
	
    /**
     * 显示资源列表
     */
    public function index(){
		echo 'test';
    }
	
	public function order(Request	$request){
		switch ($request->method()){
			case 'GET': // get请求处理代码
				$get = input('get.');
				$this->getOrderData($get);
				break;
			case 'POST': // POST请求处理代码
				$post = input('post.');
				$this->addOrderData($post);
				break;
        }
		
		
    }	
	public function betorder(Request	$request){
		switch ($request->method()){
			case 'GET': // get请求处理代码
				$get = input('get.');
				$this->getbetOrderData($get);
				break;
			case 'POST': // POST请求处理代码
				$post = input('post.');
				$this->addOrderData($post);
				break;
        }
		
		
    }
	
	public function chaseorder(Request	$request){
		switch ($request->method()){
			case 'GET': // get请求处理代码
				$get = input('get.');
				$this->getchaseOrderData($get);
				break;
			case 'POST': // POST请求处理代码
				$post = input('post.');
				$this->addchaseOrderData($post);
				break;
        }
		
		
    }
	/*
		消费记录
	*/
	public function coinrecord(Request	$request){
		switch ($request->method()){
			case 'GET': // get请求处理代码
				$get = input('get.');
				$this->getCoinRecord($get);
				break;
			case 'POST': // POST请求处理代码
				$post = input('post.');
				$this->addCoinRecord($post);
				break;
        }
		
		
    }
	/*
	*请求订单记录
	*    orderstatus 
        "-1": "已撤销",
        "0": "等待中",
        "1": "进行中",
        "2": "执行失败",
        "3": "已完成",
        "4": "自动停止"
		lotterystatus
		"0" 未开奖 
		"1" 已中奖
		"2" 未中奖

	*/
	private function getOrderData($get){
		$ischase = $get['ischase'];
		$orderstatus = $get['orderStatus'];
		$lotterystatus = $get['lotteryStatus'];
		// $page = $get['page'];
		// $limit_start = ($page -1)*10;
		$map['userid'] = $this ->userid;
		$map['ischase'] = $ischase;
		if ($orderstatus >0)
		$map['orderstatus'] = $orderstatus;	
		if ($lotterystatus >0)
		$map['lotterystatus'] = $lotterystatus;	
		$result	=	Db::name('lottery_order_list')
					->where($map)
					// ->field('issuenumber,createtime,')
					// ->limit($limit_start,10)
					->select();
		// echo Db::getLastSql();
		// dump($result);
		if($result){
			$this->success("ok",$result);
		}else{
            $this->error("请求失败!");
		}
	}

	private function getbetOrderData($get){
		$orderstatus = $get['orderStatus'];
		$lotterystatus = $get['lotteryStatus'];
		// $id = $get['id'];
		// $page = $get['page'];
		// $limit_start = ($page -1)*10;
		$map['userid'] = $this ->userid;
		// $map['id']  = ['>',$id];
		if ($orderstatus >0)
		$map['orderstatus'] = $orderstatus;	
		if ($lotterystatus >0)
		$map['lotterystatus'] = $lotterystatus;	
		$result	=	Db::name('lottery_betorder_list')
					->where($map)
					// ->field('issuenumber,createtime,')
					// ->limit($limit_start,10)
					->order('createtime desc')
					->select();
		// echo Db::getLastSql();			
		if( $result && (count($result) != 0)){
			$this->success("ok",$result);
		}else{
            $this->error("请求失败!");
		}
	}

	/*
	*请求订单记录
	*    orderstatus 
        "-1": "已撤销",
        "0": "等待中",
        "1": "进行中",
        "2": "执行失败",
        "3": "已完成",
        "4": "自动停止"
		lotterystatus
		"0" 未开奖 
		"1" 已中奖
		"2" 未中奖

	*/
	private function getchaseOrderData($get){
		$orderstatus = $get['orderStatus'];
		$lotterystatus = $get['lotteryStatus'];
		// $page = $get['page'];
		// $limit_start = ($page -1)*10;
		$map['userid'] = $this ->userid;
		if ($orderstatus >0)
		$map['orderstatus'] = $orderstatus;	
		if ($lotterystatus >0)
		$map['lotterystatus'] = $lotterystatus;	
		$result	=	Db::name('lottery_chaseorder_list')
					->where($map)
					// ->field('issuenumber,createtime,')
					// ->limit($limit_start,10)
					->order('createtime desc')
					->select();
					
		if( $result && (count($result) != 0)){
			$this->success("ok",$result);
			
		}else{
            $this->error("暂时没有您的投注记录!");
		}
	}
	
	/*
	*
	*  新增订单记录
	原始记录存一份
	追号追号记录存一份
	投注记录存一份
	*/
	private function addOrderData($post){
		$data = array();
		$data2 = array();
		if(empty($post)){
			$this->error('post null');
		}
		// dump($post);
		foreach($post as $key=>$value){
				$data[strtolower($key)] = $value;
			}
		$issuenumber  = explode('#',$post['IssueNumber']);
		// dump($issuenumber);
		if ($data['isstopafterbonus'] == true){
			$data['isstopafterbonus'] = 1;
		}else{
			$data['isstopafterbonus'] = 0;
		}
		$data['orderstatus'] = 0;
		$data['lotterystatus'] = 0;
		// $data['createtime'] = time();
		if (count($issuenumber) == 1){//如果issuenumber里面只有一组值，是直接投注，如果有多组值，是追加投注。
			// $ischase = 0;
			// $data['ischase'] = $ischase;
			//将投注记录写入投注数据表
			$result = Db::name('lottery_betorder_list')->insertGetId($data);
		} else{
			// $ischase = 1;
			// $data['ischase'] = $ischase;
			// 启动事务
			Db::startTrans();
			try{
				//将追号记录写入追号数据表
				$data['userid'] = $this->userid;
				$result = Db::name('lottery_chaseorder_list')->insertGetId($data);
				foreach($issuenumber as $key => $value){
					$data2[$key] = $data;
					$arr = explode ('|',$value);
					$data2[$key]['currentissue'] = $arr[0];
					$data2[$key]['multiple'] = $arr[1];
					$data2[$key]['totalmoney'] = $arr[2];
					$data2[$key]['userid'] = $this->userid;
					$data2[$key]['chaseid'] = $result;//追号方案编号
				}
				//将按期数拆分的追号记录写入投注记录数据表
				$result1 = Db::name('lottery_betorder_list')->insertAll($data2);
			    // 提交事务
			    Db::commit();    
			} catch (\Exception $e) {
			    // 回滚事务
			    Db::rollback();
			}

		}

		//将订单记录写入订单数据表
		// $result = Db::name('lottery_order_list')->insert($data);
		// dump($result);
		if($result){
			//发送投注记录
			$this->success('ok',$result);
		}else{
			$this->error('error');
		}
	}
	
	private function getCoinRecord($get){
		$map['uid'] = $this ->userid;
		$result	=	Db::name('lottery_coin')
					->where($map)
					->order('updatetime desc')
					->select();
					
		if( $result && (count($result) != 0)){
			$this->success("ok",$result);
			
		}else{
            $this->error("暂时没有您的消费记录!");
		}
	}
	

}
