<?php

use think\Db;
	//开奖函数
	//2BTH.1,2,3,4,5,6#2THDX.11,22,33|4,5,6#2THFX.11X,22X,33X,44X,55X,66X#3LHTX.XYZ#3BTH.1,2,3,4,5,6#3THDX.111#3THTX.XXX#HZ.4
	function lty_openBonus($newAward){
		
		$map['status'] = 1;
		// $map['chaseid'] = 0;//目前只开非追号订单
		$map['currentissue'] = $newAward['issue_number'];
		//查询彩果
		$bonus_info = Db::name('lottery_k3_bonus_results')->where('issue_number',$newAward['issue_number'])->find();
		$res = analyzeBonusCode($bonus_info['bonus_code']);
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
	

   /*
   * 	彩果解析函数
   */
   function analyzeBonusCode($bonus_code){
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