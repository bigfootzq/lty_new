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

class AwardController extends BaseController
{
	// 自动加载验证
	public function __construct(){
			
	}
	
    /**
     * 显示资源列表
     */
    public function index(){
		$str = '{"endtime":"2018-02-03 20:00:00",
		"lotteytype":"lottery",
		"mobile":"1451",
		"schemeid":"956489875257843712",
		"shopid":"2",
		"source":"58.com",
		"tickets":"1",
		"totalamount":"2",
		"username":"邢博文"}';
		// $data = (array)json_decode($str,true);
		// dump($data);
		$data = array(
					 "endtime" => "2018-02-03 20:00:00",
					  "mobile" =>  "1451",
					  "schemeid" => 111,
					  "shopid" =>  "2",
					  "source" =>  "58.com",
					  "tickets" =>  "1",
					  "totalamount" => "2",
					  "username" =>  "邢博文",
					  "lotterytype" => "super_lottery"
					);
		for($i = 0;$i<1000;$i++){
			$data['schemeid'] = $i*100+1;
			// dump($data);
			Db::name('lottery_scheme')->insert($data);
			// echo Db::getLastSql();
		}
		
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
			// $res = json_decode( $postAward, true);//对POST信息解码
			$res = explode('#',$postAward);
			// dump($res);
		}
		//对信息进行校验
		$validate = new Validate([
            'issue_number'	=> 'require',
            'bonus_code'        => 'require',
            'provid'		=> 'require',
            'create_time'		=> 'require'
        ]);

        $validate->message([
			'lotterytype.require'	=> '缺少期号',
            'shopid.require'		=> '缺少开奖结果',
            'schemeid.require'		=> '缺少开奖省份',
            'endtime.require'		=> '缺少生成时间'
        ]);
		// $rule = [
					// ['multiples','require|number|between:1,99','缺少倍数|倍数必须是数字|倍数必须在1~99之间'],
					// ['amount','require|number|>:0','缺少单票金额|单票金额必须是数字|单票金额必须大于0'],
					// ['type','require','缺少彩票玩法'],
					// ['ticketno','require','缺少彩票序号'],
					// ['lotteryNumber','require','缺少彩票号码']
				// ];
		// $validate_sd = new Validate($rule);
		// if (!$validate->check($res)) {
            // $this->error($validate->getError());
        // }

		// $newAward['issue_number'] = $res['issue_number'];
		// $newAward['bonus_code'] = $res['bonus_code'];
		// $newAward['provid'] = $res['provid'];
		// $newAward['create_time'] = $res['create_time'];
		// $newAward['status'] = 1;
		$newAward['issue_number'] = $res[0];
		$newAward['bonus_code'] = $res[1];
		$newAward['provid'] = $res[2];
		$newAward['create_time'] = $res[3];
		$newAward['status'] = 1;
		// dump($newAward);
		$result = Db::name('lottery_k3_bonus_results')->insert($newAward);//scheme写入数据库
		if($result){
			$this->success('本次开奖结果已经上传');
		}else{
			$this->error('本次开奖结果上传失败');
		}
	}

	protected function getPeriod($gameid){
		switch($gameid){
			case '111':
				$table = 'lottery_k3_bonus_results';
				$provid = 36;
				break;
		}
		$Curqi = '180111083';
		$endtime = $this->getEndtime('JXKS',$Curqi);
		$seconds = floor((strtotime($endtime)-time()));
		// dump($endtime);
		// dump($second);
		$map['provid'] = $provid;	
		$map['issue_number'] = $Curqi -1;	
		$preIssues	=	Db::name($table)
							->where($map)
							->field('issue_number,bonus_code,bstatus')
							->find();	
		$HistoryIssues	=	Db::name($table)
							// ->where($map)
							->field('issue_number,bonus_code,bstatus')
							->limit(3,10)
							->select();

		$data['CurIssueNumber'] = array(
									"IssueStatus" 	=> 	0,
									"IssueNumber"	=>	'180111083'
									
									);
		$data['PreIssueNumber'] = array(
									"IssueStatus" 	=> 	0,
									"IssueNumber" 	=> 	$preIssues['issue_number'],
									"BonusTime" 	=> 	-297,
									"bonus_code" 	=> 	$preIssues['bonus_code'],
									"bstatus" 		=> 	$preIssues['bstatus']
									
									);
		$data['Seconds'] =  $seconds;
		$data['HistoryIssues'] = $HistoryIssues;
		$this->success("",$data);;
	
	}
	
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
		// $map['id'] = 11;
		$result	=	Db::name('lottery_betorder_list')
					// ->limit(1)
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

}
