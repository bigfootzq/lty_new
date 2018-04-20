<?php

namespace app\lottery\controller;

use cmf\controller\AdminBaseController;
use think\Request;
use think\Db;

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
