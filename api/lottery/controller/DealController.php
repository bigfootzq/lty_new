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
		// $page = $get['page'];
		// $limit_start = ($page -1)*10;
		$map['userid'] = $this ->userid;
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
		if($result){
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
		if($result){
			$this->success("ok",$result);
		}else{
            $this->error("请求失败!");
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
			$result1 = Db::name('lottery_betorder_list')->insert($data);
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
		if($result1){
			//发送投注记录
			$this->success('ok',$post);
		}else{
			$this->error('error');
		}
	}
	
	/*
	* 拆票函数，根据投注记录生产的对应提交的投注方案，存入lottery_scheme表
	*
	*/
	public function betsToScheme(){
		//读入投注记录，status:0为未提交记录
		$map['status'] = 0;
		$result	=	Db::name('lottery_betorder_list')
					->limit(100)
					->where($map)
					->select();
		// dump($result);
		foreach ($result as $key => $value){
			// userid,chaseid,totalmoney,gamecode,currentissue,issuenumber,number,multiple,isstopafterbonus,source,createtime,
			// schemeid,shopid,username,lotterytype,mobile,totalmount,tickets,source,endtime,creatime,getcounter,tstatus,status
			//根据userid获得对应的彩店shopid,用户名,手机号码
			$user['id'] = $value['userid']; 
			$userinfo  = Db::name('user')
						->field('shopid,user_login,mobile')
						->where($user)
						->find();
			$data['schemeid'] = create_out_trade_no();//生成订单号
			$data['shopid'] = $userinfo['shopid'];
			$data['username'] = $userinfo['user_login'];
			$data['mobile'] = $userinfo['mobile'];
			$data['lotterytype'] = $value['gamecode'];
			$data['totalamount'] = $value['totalmoney'];
			$data['source'] = $value['source'];
			$data['isstopafterbonus'] = $value['isstopafterbonus'];
			if ($value['chaseid'] == 0){
			 $data['ischase'] = 0;
			}else{
			$data['ischase'] = 1;//该方案是追号记录 
			}
			//根据期号和gamecode计算出截止时间
			$endtime = $this->getEndtime($value['gamecode'],$value['currentissue']);
			 $data['endtime'] = $endtime;
			 // $data[''] = $value[''];
			 //schemedetail:sid,ticketno,type,multiples,amount,append,lotteryNumber,createtime,status,
			$data['schemedetail']['sid']  = $data['schemeid'];
			$data['schemedetail']['ticketno']  = 1;
			$data['schemedetail']['type']  = 1;
			$data['schemedetail']['multiples']  = $value['multiple'];
			$data['schemedetail']['amount'] = $value['totalmoney'];
			$data['schemedetail']['append'] = 1;
			$data['schemedetail']['lotteryNumber'] = explode('#',$value['number']);
			$data['schemedetail']['ischase'] = $value['chaseid']?1:0;
			dump($data);
		}
	}
	/*
	*根据期号和gamecode计算出截止时间
	*/
	private function getEndtime($gamecode = 'JXKS',$issue){
		$year = '20'.substr($issue,0,2);
		$month= substr($issue,2,2);
		$day = substr($issue,4,2);
		$no = (int)substr($issue,6,3);
		switch($gamecode){
			case'JXKS':
				$starttime = mktime(9,5,0,$month,$day,$year);
				break;
			
		}
		// dump(date('Y-m-d H:i:s',$starttime));
		// dump($issue);
		// dump($no);
		$endtime = $starttime + $no*60*10;//每期间隔10分钟
		return date('Y-m-d H:i:s',$endtime) ;
	}
	
	/**
	 * 生成订单号
	 * 可根据自身的业务需求更改
	 */
	private function create_out_trade_no() {
		$year_code = array('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J');
		return 'CT'.$year_code[intval(date('Y')) - 2010] .strtoupper(dechex(date('m'))) .
			date('d') .substr(time(), -5) . substr(microtime(), 2, 5) . sprintf('d', rand(0, 99));
	}
	

}
