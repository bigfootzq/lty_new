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
use api\lottery\model\BetOrderModel;


class AwardController extends BaseController
{
	// 自动加载验证
	public function __construct(){
			
	}
	
    /**
     * 显示资源列表
     */
    public function index(){
	
    }
	public function update(){
		$get = input('get.');
		// dump($get);
		$result = Db::name('lottery_app_version')->order('version_id')->find();
		// dump($result);
		if($result){
			if($result['version_name'] > $get['version']){
				$data = array(
								'md5'=>$result['md5'],
								'note'=>$result['upgrade_point'],
								'url'=>$result['url']
								);
				$this->success('版本更新',$data);
			}else{
				$this->error('无需升级');
			}
		}else{
			$this->error('无需升级');
		}
		
	}
	public function Award(Request	$request){
		switch ($request->method()){
			case 'GET': // get请求处理代码
				$game = input('get.game');
				$page = input('get.page');
				$this->getAward($game,$page);
				break;			
			case 'POST': // post请求处理代码
				// $postAward  = input('post.');
				$postAward =  file_get_contents("php://input");
				// dump($postAward);
				$this->addAward($postAward);
				break;
        }
    }
	
	public function period(Request	$request){
		switch ($request->method()){
			case 'GET': // get请求处理代码
				$gameid = input('get.gameId');
				$this->getPeriod($gameid);
				break;
        }
    }
	public function order(Request	$request){
		$post = input('post.');
		// dump($post) 
		foreach($post as $key=>$value){
			$data[strtolower($key)] = $value;
		}
		// $data['createtime'] = time();
		if ($data['isstopafterbonus'] == true){
			$data['isstopafterbonus'] = 1;
		}else{
			$data['isstopafterbonus'] = 0;
		}
		// dump($data);
		//将订单记录写入订单数据表
		$reslut = Db::name('lottery_order_list')->insert($data);
		if($reslut){
			//发送投注记录
			$this->success('ok');
		}else{
			$this->error('error');
		}
		
    }
	
	protected function getAward($game = "jxks",$page = '1'){
		switch($game){
			case 'jxks'://江西快三
				$table = 'lottery_k3_bonus_results';
				$provid = 36;
				break;
		}
		// dump($page);
		$limit_start = ($page -1)*10;
		$map['provid'] = $provid;	
		$result	=	Db::name($table)
					->where($map)
					->field('issue_number,create_time,bonus_code')
					->order('issue_number desc')
					->limit($limit_start,10)
					->select();
		if($result){
			$this->success("",$result);
		}else{
            $this->error("请求失败!");
		}
	}
	
	protected function addAward($postAward){
		if(empty($postAward)){
			$this->error('post数据为空');
		}else{
			// dump($postAward);
			$res = json_decode( $postAward, true);//对POST信息解码
			// dump($res);
		}
		//对信息进行校验
		$validate = new Validate([
            'issue_number'	=> 'require|unique:lottery_k3_bonus|length:9',
            'bonus_code'        => 'require',
            'provid'		=> 'require',
            'device_number'		=> 'require',
            'create_time'		=> 'require'
        ]);

        $validate->message([
			'issue_number.require'	=> '缺少期号',
			'issue_number.unique'	=> '本次开奖结果已经上传',
			'issue_number.length'	=> '期号长度必须为9位',
            'bonus_code.require'		=> '缺少开奖结果',
            'provid.require'		=> '缺少开奖省份',
            'device_number.require'		=> '缺少设备号码',
            'create_time.require'		=> '缺少生成时间'
        ]);

		if (!$validate->check($res)) {
            $this->error($validate->getError());
        }

		$newAward['issue_number'] = $res['issue_number'];
		$newAward['bonus_code'] = $res['bonus_code'];
		$newAward['provid'] = $res['provid'];
		$newAward['device_number'] = $res['device_number'];
		$newAward['create_time'] = $res['create_time'];
		$newAward['status'] = 1;
		$result = Db::name('lottery_k3_bonus')->insert($newAward);//scheme写入数据库
		if($result){
			$this->bstatus($newAward);
			$bonus_results = $this->openBonus($newAward);
			// dump($bonus_results);
			if($bonus_results){
				$betorder = new BetOrderModel();
				$info = $betorder->saveAll($bonus_results);
			}
			$this->success('本次开奖结果上传成功');
		}else{
			$this->error('本次开奖结果上传失败');
		}
	}

	protected function getPeriod($gameid){
		switch($gameid){
			case '111':
				$table = 'lottery_k3_bonus_results';
				$provid = 36;
				$gamecode = 'JXKS';
				$maxqi = '084';
				$startime = '08:55:00';
				$interval_time = 596;//每期时间，暂定为596秒
				break;
		}
		$today = date("ymd").'000';
		$jiange = strtotime(date("H:i:s"))-strtotime('08:55:00');
		// dump($jiange);
		$qi = ceil($jiange/$interval_time);
		// dump($qi);
		if ($qi <= $maxqi && $qi >0){
			$Curqi = $today+$qi;//当前期号=年月日+计算出来的期号,180411083
			$map['issue_number'] = $Curqi -1;
			$seconds = floor(strtotime('08:55:00')+$qi*$interval_time-time());
		}else if ($qi > $maxqi && $qi >0){//24点前
			$tomorrow = date("ymd",strtotime("+1 day"));
			$Curqi = $tomorrow.'001';//一天最多$maxqi期，超过跳到下一天第一期
			$map['issue_number'] = $today+$maxqi;
			$seconds = floor(strtotime('08:55:00')-strtotime('00:00:00')+strtotime('24:00:00')-time());
		}else{//0点
			$yesterday =  date("ymd",strtotime("-1 day"));
			$Curqi = $today+1;//一天最多$maxqi期，超过跳到下一天第一期
			$map['issue_number'] = $yesterday.$maxqi;
			$seconds = floor(strtotime('08:55:00')-time());
		}
		$map['provid'] = $provid;	
		
		// dump($map);
		$preIssues	=	Db::name($table)
							->where($map)
							->field('issue_number,bonus_code,bstatus')
							->find();
		// dump($preIssues);
		$map2['issue_number'] = ['<',$Curqi];
		$HistoryIssues	=	Db::name($table)
							->where($map2)
							->field('issue_number,bonus_code,bstatus')
							->order('issue_number desc')
							->limit(1,9)
							->select();

		$data['CurIssueNumber'] = array(
									"IssueStatus" 	=> 	0,
									"IssueNumber"	=>	(string)$Curqi
									
									);
		$bonustime = $seconds+60;//开奖时间,截止后一分钟再开奖,快三助手是45秒左右
		$data['PreIssueNumber'] = array(
									"IssueStatus" 	=> 	0,
									"IssueNumber" 	=> 	(string)$map['issue_number'],
									"BonusTime" 	=> 	$bonustime,
									"bonus_code" 	=> 	$preIssues['bonus_code'],
									"bstatus" 		=> 	$preIssues['bstatus']
									
									);
		$data['Seconds'] =  $seconds;//截止时间
		$data['HistoryIssues'] = $HistoryIssues;
		$this->success("",$data);;
	
	}
	/*
		冷热数据接口
	*/
	public function getHotData(){
		$result = Db::name('lottery_k3_bonus_results')
					->field('bonus_code')
					->limit(100)
					->order('issue_number desc')
					->select();
		// dump($result);
		$count['one'][0] = 0;
		$count['two'][0] = 0;
		$count['three'][0] = 0;
		$count['four'][0] = 0;
		$count['five'][0] = 0;
		$count['six'][0] = 0;

		foreach($result as $key => $value){
			$bonus_code = explode(',',$value['bonus_code']);
			foreach ($bonus_code as $number){
				// dump($number);
				switch($number){
					case '1':
							$count['one'][0] += 1;
							break;
					case '2':
							$count['two'][0] += 1;
							break;
					case '3':
							$count['three'][0] += 1;
							break;
					case '4':
							$count['four'][0] += 1;
							break;
					case '5':
							$count['five'][0] += 1;
							break;
					case '6':
							$count['six'][0] += 1;
							break;
				}
			}
			if ($key == 19){
				$data['20'] = $count;
				$data['20']['name'][0] = '20期';
 			}else if($key == 29){
				$data['30'] = $count;
				$data['30']['name'][0] = '30期';
			}else if ($key == 49){
				$data['50'] = $count;
				$data['50']['name'][0] = '50期';
			}
				
		}
		$data['100'] = $count;
		$data['100']['name'][0] = '100期';
		// dump($data);
		$this->success('ok',$data);
	}
	/*
	*	图表走势接口
	*/
	public function getTongjiData(){
		$maxissue = input('get.maxissue');
		$provid = input('get.provid');
		$result = Db::name('lottery_k3_bonus_results')
					->field('issue_number,bonus_code')
					->limit(500)
					->where('issue_number','>',$maxissue)
					->order('issue_number desc')
					->select();
		// dump($result);
		if(count($result) == 0){
			$this->error('没有查询到记录');
		}

		foreach($result as $key => $value){
			$bonus_code = explode(',',$value['bonus_code']);
			// dump($bonus_code);
			$hz = array_sum($bonus_code);//求出和值
			
			sort($bonus_code,1);
			$value['qihao'] = substr($value['issue_number'],6,3);
			$value['hz'] = $hz;
			$value['hzws'] = $hz%10;
			$value['jishu'] = 0;
			$value['dashu'] = 0;
			$value ['kuadu'] = $bonus_code[2]- $bonus_code[0]; //跨度
			$value['maxnumber'] = $bonus_code[2];//最大号码
			$value['minnumber'] = $bonus_code[0];//最小号码
			//计算和值形态
			if(($hz % 2) ==0){
				$value['hzxt']['jishu'] = 1;
				$value['hzxt']['oushu'] = 0;  
			}else{
				$value['hzxt']['jishu'] = 0;
				$value['hzxt']['oushu'] = 1;  
			};
			if($hz >9){
				$value['hzxt']['dashu'] = 1;
				$value['hzxt']['xiaoshu'] = 0;  
			}else{
				$value['hzxt']['dashu'] = 0;
				$value['hzxt']['xiaoshu'] = 1; 
			};
			
			$value['hzlu'] = $hz%3;//计算和值012路
			
			$count['one'] = 0;
			$count['two'] = 0;
			$count['three'] = 0;
			$count['four'] = 0;
			$count['five'] = 0;
			$count['six'] = 0;
			$count2['linlu'] = 0;
			$count2['yilu'] = 0;
			$count2['erlu'] = 0;
			foreach ($bonus_code as $number){
				// dump($number);
				 if(($number % 2) !=0){
					$value['jishu']++;//计算奇数个数
				};
				 if( $number > 3){
					$value['dashu']++;//计算大数个数
				};
				if( ($number%3) == 0){
					$count2['linlu'] += 1;
				}else if ( ($number%3) == 1){
					$count2['yilu'] += 1;
				}else if ( ($number%3) == 2){
					$count2['erlu'] += 1;
				}
				switch($number){
					case '1':
							$count['one'] += 1;
							break;
					case '2':
							$count['two'] += 1;
							break;
					case '3':
							$count['three'] += 1;
							break;
					case '4':
							$count['four'] += 1;
							break;
					case '5':
							$count['five'] += 1;
							break;
					case '6':
							$count['six'] += 1;
							break;
				}
			}
			$value['lulu'] = $count;
			$value['haomalu'] = $count2;
			$data2[] = $value;

				
		}
		// dump($data2);
		$this->success('ok',$data2);
	}
	
	/*
	* 拆票函数，根据投注记录生产的对应提交的投注方案，存入lottery_scheme表
	*
	*/
	public function betsToScheme(){
		//读入投注记录，status:0为未提交记录
		$map['status'] = 0;	
		$map['chaseid'] = 0;//因为目前只提交非追号方案，chaseid=0代表非追号方案
		$result	=	Db::name('lottery_betorder_list')
					->where($map)
					->select();
		// dump($result);
		$result1 = 0;
		$result2 = 0;
		foreach ($result as $key => $value){
			// userid,chaseid,totalmoney,gamecode,currentissue,issuenumber,number,multiple,isstopafterbonus,source,createtime,
			// schemeid,shopid,username,lotterytype,mobile,totalmount,tickets,source,endtime,creatime,getcounter,tstatus,status
			//根据userid获得对应的彩店shopid,用户名,手机号码
			$user['id'] = $value['userid']; 
			$userinfo  = Db::name('user')
						->field('shopid,user_login,mobile')
						->where($user)
						->find();
			$data['schemeid'] = $this->create_out_trade_no();//生成订单号
			$data['shopid'] = $userinfo['shopid'];
			$data['username'] = $userinfo['user_login'];
			$data['mobile'] = $userinfo['mobile'];
			$data['lotterytype'] = $value['gamecode'];
			$data['totalamount'] = $value['totalmoney'];
			$data['source'] = $value['source'];
			// $data['isstopafterbonus'] = $value['isstopafterbonus'];
			if ($value['chaseid'] == 0){
			 $data['ischase'] = 0;
			}else{
			$data['ischase'] = 1;//该方案是追号记录 
			}
			//根据期号和gamecode计算出截止时间
			$endtime = $this->getEndtime($value['gamecode'],$value['currentissue']);
			 $data['endtime'] = $endtime;
			$lotterynumber = explode('#',$value['number']);
			$data['tickets'] = count($lotterynumber);
			$data['tstatus'] = 1;
			$data['status'] = 1;
			
			// dump($data);
			foreach($lotterynumber as $index =>$value2){
				$num = explode('.',$value2);
				switch($num[0]){
						case "HZ":
								$data2['type'] = "和值";
								$data2['lotteryNumber'] = $num[1];
								$data2['amount'] = 2;
								// array_push($data2['lotteryNumber'],$num[1]);
							break;
						case "KD":
								$data2['type'] = "跨度";
								$data2['lotteryNumber'] = $num[1];
								$data2['amount'] = 2;
								// array_push($data2['lotteryNumber'],$num[1]);
							break;
						case "3THTX":
								$data2['type'] = "三同号通选";
								$data2['lotteryNumber'] = json_encode($num[1]);
								$data2['amount'] = 2;
							break;
						case "3THDX":
								$data2['type'] = "三同号单选";
								$data2['lotteryNumber'] = $num[1];
								$data2['amount'] = 2;
							break;
						case "3LHTX":
								$data2['type'] = "三连号通选";
								$data2['lotteryNumber'] = json_encode($num[1]);
								$data2['amount'] = 2;
							break;
						case "3BTH":
								$data2['type'] = "三不同号标准";
								$number1 = explode(',',$num[1]);
								$data2['lotteryNumber'] = json_encode($number1);
								switch(count($number1) ){
									case "3":
										$data2['amount'] = 2;
										break;
									case "4":
										$data2['amount'] = 8;
										break;
									case "5":
										$data2['amount'] = 20;
										break;
									case "6":
										$data2['amount'] = 40;
										break;
								}
							break;
						case "3BTHDT":
								$data2['type'] = "三不同号胆拖";
								$data2['lotteryNumber'] = $num[1];
								$data2['amount'] = 2;
							break;
						case "2THFX":
								$data2['type'] = "二同号复选";
								$number2 = explode(',',$num[1]);
								$data2['lotteryNumber'] = json_encode($number2);
								$data2['amount'] = 2*count($number2);
							break;
						case "2THDX":
								$data2['type'] = "二同号单选";
								$number2 = explode('|',$num[1]);
								$tonghao = explode(',',$number2[0]);
								$butonghao = explode(',',$number2[1]);
								
								$data2['lotteryNumber'] = json_encode(array(
																'tonghao'=>$tonghao,
																'butonghao'=>$butonghao));
								$data2['amount'] = 2*count($tonghao)*count($butonghao);

							break;
						case "2BTH":
								$data2['type'] = "二不同号标准";
								$data2['lotteryNumber'] = $num[1];
								$number2 = explode(',',$num[1]);
								$data2['lotteryNumber'] = json_encode($number2);
								switch(count($number2) ){
									case "2":
										$data2['amount'] = 2;
										break;
									case "3":
										$data2['amount'] = 6;
										break;
									case "4":
										$data2['amount'] = 12;
										break;
									case "5":
										$data2['amount'] = 20;
										break;
									case "6":
										$data2['amount'] = 30;
										break;
								}

							break;
						case "2BTHDT":
								$data2['type'] = "二不同号胆拖";
								$data2['lotteryNumber'] = $num[1];
								$data2['amount'] = 2;
							break;
				}
				$schemedetail[$index]['ticketno']  = $index +1;//票序号
				$schemedetail[$index]['multiples']  = $value['multiple'];
				$schemedetail[$index]['amount'] = $data2['amount'];
				$schemedetail[$index]['append'] = 1;
				$schemedetail[$index]['status'] = 1;
				$schemedetail[$index]['sid']= $data['schemeid'];
				// $schemedetail[$index]['ischase'] = $value['chaseid']?1:0;
				$schemedetail[$index]['type'] = $data2['type'];
				$schemedetail[$index]['lotteryNumber'] = $data2['lotteryNumber'];
			}
			// 启动事务
			Db::startTrans();
			try{
				Db::name('lottery_scheme')->insert($data);
				
				$result1 = Db::name('lottery_scheme_detail')->insertAll($schemedetail);
				$schok = array('id'=>$value['id'],
								'status'=>1,
								'schid' =>$data['schemeid']
								);
				$result2 = Db::name('lottery_betorder_list')->update($schok);

				// 提交事务
				Db::commit();    
			} catch (\Exception $e) {
				// 回滚事务
				Db::rollback();
			}
			if ($result1 && $result2){
				$this->pushSchemeNum($data['shopid']);
				$this->success('ok',$key);
			
			}else{
				$this->error('no');
			}
		}
		
		
	}
	/*
	*根据期号和gamecode计算出截止时间
	*/
	private function getEndtime($gamecode = 'JXKS',$issue){
		$year = '20'.substr($issue,0,2);
		$month= substr($issue,2,2);
		$day = substr($issue,4,2);
		$no = (int)substr($issue,6,3)-1;
		switch($gamecode){
			case'JXKS':
				$starttime = mktime(9,5,0,$month,$day,$year);
				$fix = 3; //每期截止提前3秒，80期约提前4分钟
				break;
			
		}
		// dump(date('Y-m-d H:i:s',$starttime));
		// dump($issue);
		// dump($no);
		// $endtime = $starttime + $no*(60*10-$fix);//每期间隔10分钟
		$endtime = $starttime + $no*(60*10);//每期间隔10分钟
		return date('Y-m-d H:i:s',$endtime) ;
	}
	
	/**
	 * 生成订单号
	 * 可根据自身的业务需求更改
	 */
	private function create_out_trade_no() {
		// $year_code = array('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J');
		return intval(date('Y')).strtoupper(dechex(date('m'))) .
			date('d') .substr(time(), -5) . substr(microtime(), 2, 5) . sprintf('d', rand(0, 999));
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
			$data = array('shopid'=>$shopid, 'code'=>1,'msg'=>'有新方案');
			// dump($data);
			// 发送数据，注意5678端口是Text协议的端口，Text协议需要在数据末尾加上换行符
			fwrite($client, json_encode($data)."\n");
			// 读取推送结果
			// echo fread($client, 8192);
		}
		
		
	}
	
	//开奖函数
	//2BTH.1,2,3,4,5,6#2THDX.11,22,33|4,5,6#2THFX.11X,22X,33X,44X,55X,66X#3LHTX.XYZ#3BTH.1,2,3,4,5,6#3THDX.111#3THTX.XXX#HZ.4
	function openBonus($newAward){
		
		$map['status'] = 1;
		// $map['chaseid'] = 0;//目前只开非追号订单
		$map['currentissue'] = $newAward['issue_number'];
		//查询彩果
		$bonus_info = Db::name('lottery_k3_bonus_results')->where('issue_number',$newAward['issue_number'])->find();
		$res = $this->analyzeBonusCode($bonus_info['bonus_code']);
		$barr = explode(',',$bonus_info['bonus_code']);
		//查出当前期号的订单，status=1 为已经提交
		$all_result	=	Db::name('lottery_betorder_list')
					->where($map)
					->select();
		// echo Db::getLastSql();			
		// dump($all_result);
		$brs = array();
		$bonus_results = array();
		if(count($all_result) !=0){
			foreach ($all_result as $result){
			// dump($result);
			$brs['bonus'] = 0;
			$result_arr = explode('#',$result['number']);
				foreach($result_arr as $value){
					// dump($value);
					$num = explode('.',$value);
						switch($num[0]){
							case "HZ":
								if ($num[1] == $res['hz']){
									$brs['lotterystatus'] = 1;
									$brs['bonus'] += 9;//和值9元
								}else{
									$brs['lotterystatus'] = 2;//1为已中奖，2为未中奖
								}
								break;
							case "3THTX":
								if ($res['bstatus'] === '三同号'){
									$brs['lotterystatus'] = 1;
									$brs['bonus'] += 40;//三同号通选40
								}else{
									$brs['lotterystatus'] = 2;//1为已中奖，2为未中奖
								}
								break;
							case "3THDX":
								if ($res['bstatus'] === '三同号'){
									if(substr( $num[1], 0, 1 ) == substr( $bonus_info['bonus_code'], 0, 1 )){
										$brs['lotterystatus'] = 1;
										$brs['bonus'] += 240;//三同号单选240
									}else{
										$brs['lotterystatus'] = 2;//1为已中奖，2为未中奖
									}
								}else{
									$brs['lotterystatus'] = 2;//1为已中奖，2为未中奖
								}
								break;
							case "3LHTX":
								if ($res['bstatus'] === '三连号'){
									$brs['lotterystatus'] = 1;
									$brs['bonus'] += 10;//三连号通选10
								}else{
									$brs['lotterystatus'] = 2;//1为已中奖，2为未中奖
								}
								break;
							case "3BTH":
								if ($res['bstatus'] === '三不同号'){
									$brs['lotterystatus'] = 1;
									$brs['bonus'] += 40;//三不同号通选40
								}else{
									$brs['lotterystatus'] = 2;//1为已中奖，2为未中奖
								}
								break;
							case "3BTHDT":
								//三不同号胆拖，备用
								break;
							case "2THFX":
								//2THFX.11X,22X,33X,44X,55X,66X
								$tfarr = explode(',',$num[1]);
								if ($res['bstatus'] === '二同号'){
									if ($barr[0] == $barr[1]){
										$bcode = $barr[0];
									}else{
										$bcode = $barr[1];
									}
									foreach($tfarr as $th){
										if(substr( $th, 0, 1 ) == $bcode){//只要有一个中了就行
											$brs['lotterystatus'] = 1;
											$brs['bonus'] += 15;//二同号复选15
										}else{
											$brs['lotterystatus'] = 2;
										}
									}
								}else{
									$brs['lotterystatus'] = 2;
								}
								break;
							case "2THDX":
								//2THDX.11,22,33|4,5,6
								$tdarr = explode('|',$num[1]);
								$tarr = explode(',',$tdarr[0]);//同号
								$narr = explode(',',$tdarr[1]);//不同号
								if ($res['bstatus'] === '二同号'){
									if ($barr[0] == $barr[1]){
										$tcode = $barr[0];
										$ncode = $barr[2];
									}else{
										$tcode = $barr[1];
										$ncode = $barr[0];
									}
									foreach($tarr as $th){
										if(substr( $th, 0, 1 ) == $tcode){//首先同号中
											foreach($narr as $nh){
												if ($nh == $ncode){//然后不同号也中，才算中奖
													$brs['lotterystatus'] = 1;
													$brs['bonus'] += 80;//二同号单选80
												}else{
													$brs['lotterystatus'] = 2;
												}
											}
										}else{
											$brs['lotterystatus'] = 2;
										}
									}
								}else{
									$brs['lotterystatus'] = 2;
								}
								break;
							case "2BTH":
								//2BTH.1,2,3,4,5,6
								$btharr = explode(',',$num[1]);
								if($res['bstatus'] == '三同号'){
									$brs['lotterystatus'] = 2;//如果彩果是三同号肯定不中
								}else{
									$zcount = 0;
									foreach($btharr as $bth){
										if (strpos($bonus_info['bonus_code'],$bth) !== false){
											$zcount++;
										}
									}
									if ($zcount == 2){//只要买的号码在彩果中出现两次即中奖
										$brs['lotterystatus'] = 1;
										$brs['bonus'] += 8;//二不同号中两个号8元
									}else if($zcount == 3){
										$brs['lotterystatus'] = 1;
										$brs['bonus'] += 3*8;//二不同号中三个号3*8元
									}else{
										$brs['lotterystatus'] = 2;
									}
								}
								
								break;
							case "KD":
								//跨度投注,0:12,1:20,2:24,3:24,4:20,5:12
								sort($barr);//对彩果排序
								if ($num[1] == (int)($barr[2]-$barr[0])){
									switch($num[1]){
										case 0:
											$brs['bonus'] += 12;
											break;
										case 1:
											$brs['bonus'] += 20;
											break;
										case 2:
											$brs['bonus'] += 24;
											break;
										case 3:
											$brs['bonus'] += 24;
											break;
										case 4:
											$brs['bonus'] += 20;
											break;
										case 5:
											$brs['bonus'] += 12;
											break;
									}
									$brs['lotterystatus'] = 1;
								}else{
										$brs['lotterystatus'] = 2;
								}
								break;
							case "2BTHDT":
								//二不同号胆拖，备用
								break;
						}
					
				}
				$brs['id'] = $result['id'];
				$brs['bonus']>0?($brs['lotterystatus']=1):($brs['lotterystatus']=2);
				$brs['bonus'] = $brs['bonus']*$result['multiple'];//最后乘一下投注倍数
				
				// dump($brs);
				$bonus_results[] = $brs;
			}
			// dump($bonus_results);
			if($bonus_results){
				return($bonus_results);
			}else{
				return false;
			}
		}else{
			return false;
		}
		
	}
	
	private function bstatus($postAward){
		
		$table = 'lottery_k3_bonus_results';
		$res = $this->analyzeBonusCode($postAward['bonus_code']);
		$value['bstatus']  = $res['bstatus'];
		$value['bonus_code'] = $postAward['bonus_code'];
		$value['create_time'] = $postAward['create_time'];
		$value['issue_number'] = $postAward['issue_number'];
		$value['provid'] = $postAward['provid'];
 		Db::name($table)->insert($value);
   }
   /*
   * 	彩果解析函数
   */
   private function analyzeBonusCode($bonus_code){
		$barr = explode(',',$bonus_code);
		// dump($barr);
		$value['hz'] = $barr[0] +$barr[1] +$barr[2];
		if (($barr[0] ==$barr[1]) &&($barr[0]==$barr[2])){
			$value['bstatus'] = "三同号";
		}else if (($barr[0] !=$barr[1]) &&($barr[0]!=$barr[2]) &&($barr[1]!=$barr[2])){
			$value['bstatus'] = "三不同号";
			sort($barr);
			if( ( $barr[0]+1 == $barr[1]) && ($barr[1]+1 == $barr[2])){
				$value['bstatus'] = "三连号";
			}
		}else if(($barr[0] ==$barr[1]) ||($barr[0]==$barr[2]) ||($barr[1] == $barr[2])){
			$value['bstatus'] = "二同号";
		}
		return $value;
   }

}
