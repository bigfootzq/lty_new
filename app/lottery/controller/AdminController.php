<?php

namespace app\lottery\controller;

use cmf\controller\AdminBaseController;
use think\Request;
use think\Db;
use app\lottery\model\AdminModel;

/**
 * Class AdminController
 * @package app\lottery\controller
 * @adminMenuRoot(
 *     'name'   =>'彩店管理',
 *     'action' =>'default',
 *     'parent' =>'',
 *     'display'=> true,
 *     'order'  => 30,
 *     'icon'   =>'th',
 *     'remark' =>'彩店管理'
 * )
 */
class AdminController extends AdminBaseController
{
	public function index(){
		
    }
	//彩果列表
	public function awardList(){
		$where   = [];
        $request = input('request.');

        $keywordComplex = [];
        if (!empty($request['keyword'])) {
            $keyword = $request['keyword'];

            $keywordComplex['issue_number']    = ['like', "%$keyword%"];
        }
        $AwardQuery = Db::name('lottery_k3_bonus_results');

        $list = $AwardQuery->whereOr($keywordComplex)->where($where)->order("create_time DESC")->paginate(10);
        // 获取分页显示
        $page = $list->render();
        $this->assign('list', $list);
        $this->assign('page', $page);
        // 渲染模板输出
        return $this->fetch();
	}
	//每日彩果列表
	public function todayAwardList(){
		$gameid = '111';
		switch($gameid){
			case '111':
				$table = 'lottery_k3_bonus_results';
				$provid = 36;
				$gamecode = 'JXKS';
				$maxqi = 84;
				$startime = '08:55:00';
				$interval_time = 596;//每期时间，暂定为596秒
				break;
		}
		$today = date("ymd");
		$qi = 0;
		$data = array();
		while ($qi < $maxqi) {
			$qi++;
			$endtime = strtotime($startime) +$qi*$interval_time = 596;
			$bonustime = $endtime + 60;
			$data['id'] = $qi-1;
			$data['qi'] = $qi;
			$data['endtime'] = date("H:i:s",$endtime); 
			$data['bonustime'] = date("H:i:s",$bonustime); 
			$data2[] = $data;
		}
		$where   = [];
        $request = input('request.');

        $keywordComplex = [];
        if (!empty($request['keyword'])) {
            $keyword = $request['keyword'];

            $keywordComplex['issue_number']    = ['like', "%$keyword%"];
        }
        $AwardQuery = Db::name('lottery_k3_bonus_results');

        // $list = $AwardQuery->whereOr($keywordComplex)->where($where)->order("create_time DESC")->paginate(10);
        // 获取分页显示
        // $page = $list->render();
		// dump($data2);
        $this->assign('list', $data2);
        // 渲染模板输出
        return $this->fetch();
	}
	
	//人工更正彩果
	public function alterAward(){
		if($this->request->isPost()){
			
			$result = $this->validate($this->request->param(), 'Admin');
			if ($result !== true) {
                    // 验证失败 输出错误信息
                    $this->error($result);
                } else {
                    $result = DB::name('lottery_k3_bonus_results')->where('id',$_POST['id'])->setField('bonus_code',$_POST['bonus_code']);
                    if ($result !== false) { 
                        $this->success("彩果变更成功！");
                    } else {
                        $this->error("彩果变更失败！");
                    }
                }
		}else{
			$id    = $this->request->param('id', 0, 'intval');
			$bouns = DB::name('lottery_k3_bonus_results')->where(["id" => $id])->find();
			$this->assign($bouns);
			// 渲染模板输出
			return $this->fetch();
		}
	}
	//投注列表
	public function orderList(){
		if($this->request->isPost()){

		}else{
			$issue_number    = $this->request->param('currentissue', 0, 'intval');
			$list = DB::name('lottery_betorder_list')->where(["currentissue" => $issue_number])->order("createtime DESC")->paginate(20);
			// 获取分页显示
			$page = $list->render();
			$this->assign('list', $list);
			$this->assign('page', $page);
			// 渲染模板输出
			return $this->fetch();
		}
		
	}
	
	/**
	*这个函数可能是用于人工开奖的，但是我暂时想不起来了。
	*/
	public function openBonus(){
			$issue_number    = $this->request->param('issue_number', 0, 'intval');
			$where['issue_number'] = $issue_number;
			// dump($where);
			$bonus = DB::name('lottery_k3_bonus_results')->where($where)->find();//查询彩果
			// dump($bonus);
			if($bonus){
				$bonus_results = lty_openBonus($bonus);
				// dump($bonus_results);
				if($bonus_results){
					
					$admin = new AdminModel();
					$info = $admin->saveAll($bonus_results);//更新开奖结果
					if($info){
						$this->success('开奖成功');
					}else{
						$this->error('开奖失败');
					}
				}else{
						$this->error('开奖失败');
				}
			}
	}
	//店主充值
	public function shopmanRecharge(){
		
	}
	
	//彩民列表
	public function buyerList(){
		$where   = [];
        $request = input('request.');
        if (!empty($request['uid'])) {
            $where['id'] = intval($request['uid']);
        }
		$shopid = cmf_get_current_admin_id();
		$where['shopid'] = intval($shopid);
        $keywordComplex = [];
        if (!empty($request['keyword'])) {
            $keyword = $request['keyword'];

            $keywordComplex['user_login|mobile']    = ['like', "%$keyword%"];
        }
        $usersQuery = Db::name('user');

        $list = $usersQuery->whereOr($keywordComplex)->where($where)->order("create_time DESC")->paginate(10);
        // 获取分页显示
        $page = $list->render();
        $this->assign('list', $list);
        $this->assign('page', $page);
        // 渲染模板输出
        return $this->fetch();
	}
	//彩民充值
	public function buyerRecharge(){
		
		if($this->request->isPost()){
			$doid = cmf_get_current_admin_id();
			$where['id'] = $doid;
			$pass = $_POST['coin_pass'];
			$userinfo = Db::name('user')->where($where)->find();
			$result = $this->validate($this->request->param(), 'Admin');//验证代码还没写
			if ($result !== true) {
                    // 验证失败 输出错误信息
                    $this->error($result);
                } else {
						if (!cmf_compare_password($pass, $userinfo['coin_pass'])){
						$this->error('支付密码错误');
					} 
                    $result = DB::name('user')->where('id',$_POST['id'])->setInc('coin',$_POST['coin']);
                    if ($result !== false) { 
						//写入一条充值记录
						$rcdata['uid'] = $_POST['id'];
						$rcdata['sum'] = $_POST['coin'];
						$rcdata['doid'] = $doid;
						$rcdata['status'] = 2;
						DB::name('lottery_coin')->insert($rcdata);
                        $this->success("用户余额改变成功！");
                    } else {
                        $this->error("用户余额改变失败！");
                    }
                }
		}else{
			$id    = $this->request->param('id', 0, 'intval');
			$user = DB::name('user')->where(["id" => $id])->find();
			$this->assign($user);
			// 渲染模板输出
			return $this->fetch();
		}
		
	}
	//店主充值明细
	public function shopmanRechargeDetail(){
		$where   = [];
        $request = input('request.');
        if (!empty($request['uid'])) {
            $where['id'] = intval($request['uid']);
        }
		$doid = cmf_get_current_admin_id();
		$where['doid'] = intval($doid);
		$where['status'] = 3;
        $keywordComplex = [];
        if (!empty($request['keyword'])) {
            $keyword = $request['keyword'];

            $keywordComplex['user_login|mobile']    = ['like', "%$keyword%"];
        }
        $DetailQuery = Db::name('lottery_coin');

        $list = $DetailQuery->alias('a')->join('lty_user b','a.uid = b.id')->whereOr($keywordComplex)->where($where)->order("updatetime DESC")->paginate(10);
        // 获取分页显示
        $page = $list->render();
        $this->assign('list', $list);
        $this->assign('page', $page);
        // 渲染模板输出
        return $this->fetch();
	}
	//彩民充值明细
	
	public function buyerRechargeDetail(){
		$where   = [];
        $request = input('request.');
        if (!empty($request['uid'])) {
            $where['id'] = intval($request['uid']);
        }
		$doid = cmf_get_current_admin_id();
		$where['doid'] = intval($doid);
		$where['status'] = 2;
        $keywordComplex = [];
        if (!empty($request['keyword'])) {
            $keyword = $request['keyword'];

            $keywordComplex['user_login|mobile']    = ['like', "%$keyword%"];
        }
        $DetailQuery = Db::name('lottery_coin');

        $list = $DetailQuery->alias('a')->join('lty_user b','a.uid = b.id')->whereOr($keywordComplex)->where($where)->order("updatetime DESC")->paginate(10);
        // 获取分页显示
        $page = $list->render();
        $this->assign('list', $list);
        $this->assign('page', $page);
        // 渲染模板输出
        return $this->fetch();
		
	}
}
