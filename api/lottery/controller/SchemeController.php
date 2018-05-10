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

use cmf\controller\RestBaseController;
use think\Request;
use think\Response;
use think\Db;
use think\Validate;

class SchemeController extends BaseController
{
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
	
	public function scheme(Request	$request){
		switch ($request->method()){
			case 'GET': // get请求处理代码
				$get = input('get.');
				 
				$this->getScheme($get);
				break;
				
			case 'POST': // post请求处理代码
				$post_scheme = input('post.');
				// dump($post_scheme);
				$this->addScheme($post_scheme);
				break;
				
			case 'PATCH': // patch请求处理代码
				$patch_scheme = input('patch.');
				$this->updateScheme($patch_scheme);
				break;
        }
    }
	
	protected function getScheme($get){
		// dump($get);
		
		if(!empty($get['page'])){
			$page = $get['page'];
			$limit_start = ($page -1)*15;	
		}else{
			$limit_start = 1;
		}
		if (!empty($get['scheme_id'])){
						$map['schemeid'] = $get['scheme_id'];
					}
		//根据彩店ID查询所有对应的status=1的方案
		$map['shopid'] = $this->userid;
		$map['status'] = 1;	
		$map['endtime'] = ['>=',date("Y-m-d H:i:s")];
		$result	=	Db::name('lottery_scheme')
					->where($map)
					->order('id desc')
					->limit($limit_start,15)
					->select();
		$count = Db::name('lottery_scheme')
					->where($map)
					->count();
		// dump($count);
		// dump($result);
		$totalpages = ceil($count/15);
		// dump($totalpage);
		if($result){
			//每下发一次，计数器+1
			Db::name('lottery_scheme')
					->where($map)
					->setInc('getcounter');
			$this->success('方案下发',$result);
		}else{
            $this->error("请求失败!");
		}
	}
	
	protected function addScheme($post_scheme){
		// $res = json_decode ( $post_scheme, true);//对POST信息解码
		$res = $post_scheme;
		trace($post_scheme,'notice');
		//对信息进行校验
		$validate = new Validate([
            'lotterytype'	=> 'require',
            'shopid'        => 'require',
            'schemeid'		=> 'require|unique:lottery_scheme',
            'endtime'		=> 'require',
            'tickets'		=> 'require',
            'totalamount'	=> 'require'
        ]);

        $validate->message([
			'schemeid.unique'		=> '此方案已经上传',
			'lotterytype.require'	=> '缺少彩票类型',
            'shopid.require'		=> '缺少彩店ID',
            'schemeid.require'		=> '缺少方案编号',
            'endtime.require'		=> '缺少方案截止时间',
            'tickets.require'		=> '缺少总票数',
            'totalamount.require'	=> '缺少总金额'
        ]);
		$rule = [
					['multiples','require|number|between:1,99','缺少倍数|倍数必须是数字|倍数必须在1~99之间'],
					['amount','require|number|>:0','缺少单票金额|单票金额必须是数字|单票金额必须大于0'],
					['type','require','缺少彩票玩法'],
					['ticketno','require','缺少彩票序号'],
					['lotteryNumber','require','缺少彩票号码']
				];
		$validate_sd = new Validate($rule);
		if (!$validate->check($res)) {
            $this->error($validate->getError());
        }

		$new_scheme['lotterytype'] = $res['lotterytype'];
		$new_scheme['shopid'] = (int)$res['shopid'];
		$new_scheme['mobile'] = isset($res['mobile'])?$res['mobile']:' ';
		$new_scheme['username'] = isset($res['username'])?$res['username']:' ';
		$new_scheme['schemeid'] = $res['schemeid'];
		$new_scheme['endtime'] = $res['endtime'];
		$new_scheme['tickets'] = $res['tickets'];
		$new_scheme['source'] = isset($res['source'])?$res['source']:' ';
		$new_scheme['totalamount'] = $res['totalamount'];
		$new_scheme['tstatus'] = 1;
		$new_scheme['status'] = 1;
		// dump($new_scheme);
		
		$scheme_detail = array();
		foreach($res['schemedetail'] as $key=>$value){ 
			if (!$validate_sd->check($value)){
				$this->error($validate_sd->getError());
			}
			// $value["lotteryNumber"]= addslashes(json_encode($value["lotteryNumber"]));
			$value["lotteryNumber"]= json_encode($value["lotteryNumber"]);
			$value["sid"] = $res['schemeid'];
			$value["status"] = 1;
			// dump($value);
			$scheme_detail[$key] = $value;
			// array_push($scheme_detail, $value);
		} 
		
		// dump($scheme_detail);
		//信息入库,启动事务
		Db::startTrans();
		try{
			$result1 = Db::name('lottery_scheme')->insert($new_scheme);//scheme写入数据库
			$result2 = Db::name('lottery_scheme_detail')->insertAll($scheme_detail);//detail写入数据库
		    // 提交事务
		    Db::commit();    
		} catch (\Exception $e) {
		    // 回滚事务
		    Db::rollback();
		}
		
		if ($result1 && $result2){
			// $this->pushSchemeNum($new_scheme['shopid']);
			$this->success('方案上传成功');
		}else{
			$this->error('方案上传失败');
		}
	}
	protected function updateScheme($patch_scheme){
		$res = $patch_scheme;
		// dump($res);
		//对信息进行校验
		$rule = [
					['shopid','require|number|>:0','缺少店铺id|店铺id必须是数字|店铺id必须大于0'],
					['schemeid','require','缺少方案编号'],
					['tstatus','require|number|in:2,3,4,6','缺少方案状态|方案状态必须是数字|提交的方案状态只能是2,3,4,6']
				];
		$validate = new Validate($rule);
		if ( !$validate->check($res) ){
			$this->error($validate->getError());
		}
		$map['schemeid'] = $res['schemeid'];
		if ($res['tstatus'] == 6){
			$de = array();
			$map2['sid'] = $res['schemeid'];
			$detail = Db::name('lottery_scheme_detail')->where($map2)->select();
			foreach ($detail as $k2 =>$v2){
					$de[$k2 ]['multiples'] = $v2['multiples'];
					$de[$k2 ]['amount'] = $v2['amount'];
					$de[$k2 ]['append'] = $v2['append'];
					$de[$k2 ]['type'] = $v2['type'];
					$de[$k2 ]['ticketno'] = $v2['ticketno'];
					$de[$k2 ]['lotteryNumber'] = (array)json_decode($v2['lotteryNumber']);
					
				}
			$this->success('请求成功',['schemedetail'=>$de]);
		}
		$scheme = Db::name('lottery_scheme')->where($map)->find();
		$tstatus = $scheme['tstatus'];
		$id = $scheme['id'];
		// dump($tstatus);								
		if($tstatus == 1){
			
			if ($res['tstatus'] == 2){
				Db::startTrans();
				try{
					Db::name('lottery_scheme')->lock(true)->where('id',$id)->find();
					$list = Db::name('lottery_scheme')->where('id', $scheme["id"])->setField('tstatus',$res['tstatus']);
					// 提交事务
					Db::commit();    
				} catch (\Exception $e) {
					// 回滚事务
					Db::rollback();
				}
				$msg = '状态变更为出票中';
			}else{
				$this->error('该方案未出票不能直接结账');
			}
						// dump($list);
			if ($list != 0){
				$de = array();
				$map2['sid'] = $res['schemeid'];
				$detail = Db::name('lottery_scheme_detail')->where($map2)->select();
				foreach ($detail as $k2 =>$v2){
						$de[$k2 ]['multiples'] = $v2['multiples'];
						$de[$k2 ]['amount'] = $v2['amount'];
						$de[$k2 ]['append'] = $v2['append'];
						$de[$k2 ]['type'] = $v2['type'];
						$de[$k2 ]['ticketno'] = $v2['ticketno'];
						$de[$k2 ]['lotteryNumber'] = (array)json_decode($v2['lotteryNumber']);
					}
				//返回成功报文
				$this->success($msg,['schemedetail'=>$de]);
			}
		}else if($tstatus == 2){
			if($res['tstatus'] == 3 || $res['tstatus'] == 4){
				Db::startTrans();
				try{
					Db::name('lottery_scheme')->lock(true)->where('id',$id)->find();
					$list = Db::name('lottery_scheme')->where('id',$id)->setField('tstatus',$res['tstatus']);
					// 提交事务
					Db::commit();    
				} catch (\Exception $e) {
					// 回滚事务
					Db::rollback();
				}
				if (isset($list)&&$list != 0){
					$this->success('结账成功,请刷新！');	
				}else{
					$this->error('结账失败');
				}
			}
			if($res['tstatus'] == 2){
				
				$this->success('方案正在出票中');
			}
		}else if($tstatus == 3 ){
			$this->success('方案已经出票成功');
		}else if($tstatus == 4 ){
			$this->success('方案已经出票失败');
		}else if($tstatus == 5){
			if($res['tstatus'] == 3 || $res['tstatus'] == 4){
				Db::startTrans();
				try{
					Db::name('lottery_scheme')->lock(true)->where('id',$id)->find(1);
					$list = Db::name('lottery_scheme')->where('id',$id)->setField('tstatus',$res['tstatus']);
					// 提交事务
					Db::commit();    
				} catch (\Exception $e) {
					// 回滚事务
					Db::rollback();
				}
				if (isset($list)&&$list != 0){
					$this->success('结账成功,请刷新！');	
				}else{
					$this->error('结账失败');
				}
			}else{
				$this->error('方案已经过期');
			}
		}
	
	}
	
	protected function pushSchemeNum($shopid){
		
		// dump($shopid);
		$map['shopid'] = $shopid;
		$map['getcounter'] = 0;
		$result = Db::name('lottery_scheme')->where($map)->find();
		// dump($result);
		if ($result){
			// 建立socket连接到内部推送端口
			$client = stream_socket_client('tcp://127.0.0.1:5678', $errno, $errmsg, 1);
			// 推送的数据，包含uid字段，表示是给这个uid推送
			$data = array('shopid'=>$shopid, 'code'=>2,'msg'=>'有新方案');
			// dump($data);
			// 发送数据，注意5678端口是Text协议的端口，Text协议需要在数据末尾加上换行符
			fwrite($client, json_encode($data)."\n");
			// 读取推送结果
			// echo fread($client, 8192);
		}
		
		
	}
	
	
	 

}
