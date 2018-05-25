<?php

namespace app\lottery\controller;

use cmf\controller\AdminBaseController;
use think\Request;
use think\Db;
use app\lottery\model\StatisticsModel;

/**
 * Class AdminController
 * @package app\lottery\controller
 * @adminMenuRoot(
 *     'name'   =>'彩店统计',
 *     'action' =>'default',
 *     'parent' =>'',
 *     'display'=> true,
 *     'order'  => 30,
 *     'icon'   =>'th',
 *     'remark' =>'彩店统计'
 * )
 */
class StatisticsController extends AdminBaseController
{
	public function index(){
		
    }
	//方案统计列表
	public function schemeStatistics(){
		$where   = [];
        $request = input('request.');
        $keywordComplex = [];
        if (!empty($request['keyword'])) {
            $keyword = $request['keyword'];

            $keywordComplex['issue_number']    = ['like', "%$keyword%"];
        }
        $SchemeQuery = Db::name('lottery_scheme');
		// $where['createtime'] = null;
		$post = input('post.');
		$selectTime = isset($post["selectTime"])?$post["selectTime"]:'today';
		
		// dump($selectTime);
        // $list = $SchemeQuery->whereTime('create_time', $selectTime)->whereOr($keywordComplex)->where($where)->order("create_time DESC")->paginate(10);
        $allCount = $SchemeQuery->whereTime('createtime', $selectTime)->where('tstatus != 1')->count('tstatus');
        $saleCount = $SchemeQuery->whereTime('createtime', $selectTime)->where('tstatus = 2')->count('tstatus');
        $successCount = $SchemeQuery->whereTime('createtime', $selectTime)->where('tstatus = 3')->count('tstatus');
        $failCount = $SchemeQuery->whereTime('createtime', $selectTime)->where('tstatus = 4')->count('tstatus');
        $expireCount = $SchemeQuery->whereTime('createtime', $selectTime)->where('tstatus = 5')->count('tstatus');
        // 获取分页显示
        // $page = $list->render();
        $this->assign('allCount', $allCount);
        $this->assign('saleCount', $saleCount);
        $this->assign('successCount', $successCount);
        $this->assign('failCount', $failCount);
        $this->assign('expireCount', $expireCount);
        // $this->assign('list', $list);
        // $this->assign('page', $page);
        // 渲染模板输出
        return $this->fetch();
	}

}
