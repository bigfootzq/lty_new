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
		echo 'test';
    }
	
	public function Award(Request	$request){
		switch ($request->method()){
			case 'GET': // get请求处理代码
				$game = input('get.game');
				$page = input('get.page');
				$this->getAward($game,$page);
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
	
	protected function getPeriod($gameid){
		switch($gameid){
			case '111':
				$table = 'lottery_k3_bonus_results';
				$provid = 36;
				break;
		}
		$Curqi = '180111083';
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
		$data['Seconds'] =  173;
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
		$result = Db::name('lottery_k3_bonus_results')
					->field('issue_number,bonus_code')
					->limit(120)
					->order('issue_number desc')
					->select();
		// dump($result);
		

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

}
