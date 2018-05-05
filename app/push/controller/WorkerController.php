<?php
/**
 * Created by notepad++.
 * User: bigfoot
 * Date: 2017/12/31
 * Time: 23:50
 */
namespace app\push\controller;

use think\worker\Server;
// use think\Db;
use Workerman\Worker;
use Workerman\MySQL;
// require_once VENDOR_PATH.'/workerman/workerman/mysql-master/src/Connection.php';

class WorkerController extends Server
{
    protected $socket = 'tcp://0.0.0.0:1234';
	protected $db = NULL;
	
    /**
     * 收到信息
     * @Author: 296720094@qq.com chenning
	 * @Editor: bigfootzq
     * @param $connection
     * @param $data
     */
    public function onMessage($connection, $data)
    {	
		global $db;
		$db = new \Workerman\Connection('localhost', '3306', 'root', 'kof3306', 'lty');
		// dump($db);
        // 判断当前客户端是否已经验证,既是否设置了uid
		if(!isset($connection->uid))
		{
		   // 读取上传的data，验证token
		    trace($data,'notice');
			// dump($data);
			if (isset($data) && $data){
				$res =  json_decode( $data,true);
				// dump($res);
				$token = isset($res['token'])?$res['token']:null;
			}else{
				$connection->send(json_encode(array('code'=>0,'msg'=>'data null')));
			}
			if ($token){
				$user_id = $db->single("SELECT user_id FROM `lty_user_token` WHERE token = '$token' ") || null;
			}else{
				$connection->send(json_encode(array('code'=>0,'msg'=>'token null')));
			}
			
			if (!empty($user_id) && ($user_id == (int)$res['shopid'])){
				$connection->uid = (int)$res['shopid'];
				$connection->send(json_encode(array('code'=>1,'msg'=>'Authentication ok')));
			}else{
				$connection->send(json_encode(array('code'=>0,'msg'=>'Authentication fail')));
			}

		   /* 保存uid到connection的映射，这样可以方便的通过uid查找connection，
			* 实现针对特定uid推送数据
			*/
		   $this->worker->uidConnections[$connection->uid] = $connection;
		   return;
		}
    }

    /**
     * 当连接建立时触发的回调函数
     * @Author: 296720094@qq.com chenning
     * @param $connection
     */
    public function onConnect($connection)
    {
        
    }

    /**
     * 当连接断开时触发的回调函数
     * @Author: 296720094@qq.com chenning
     * @param $connection
     */
    public function onClose($connection)
    {
        
    }

    /**
     * 当客户端的连接上发生错误时触发
     * @Author: 296720094@qq.com chenning
     * @param $connection
     * @param $code
     * @param $msg
     */
    public function onError($connection, $code, $msg)
    {
        echo "error $code $msg\n";
    }

    /**
     * 每个进程启动
     * @Author: 296720094@qq.com chenning
     * @param $worker
     */
    public function onWorkerStart($worker)
    {
		// 开启一个内部端口，方便内部系统推送数据，Text协议格式 文本+换行符
		$inner_text_worker = new Worker('Text://0.0.0.0:5678');
		$inner_text_worker->onMessage = function($connection, $buffer)
		{
			 global $worker;
			// $data数组格式，里面有shopid，表示向那个shopid的页面推送数据
			$data = json_decode($buffer, true);
			$shopid = $data['shopid'];
			$news = json_encode(array('code'=>1,'msg'=>'有新方案'));
			// 通过workerman，向uid的页面推送数据
			$ret = $this->sendMessageByUid($shopid, $news);
			// dump($ret);
			// 返回推送结果
			$connection->send($ret ? 'ok' : 'fail');
		};
		$inner_text_worker->listen();
    }
	// 向所有验证的用户推送数据
	function broadcast($message)
	{
	   global $worker;
	   foreach($this->worker->uidConnections as $connection)
	   {
			$connection->send($message);
	   }
	}

	// 针对uid推送数据
	function sendMessageByUid($uid, $message)
	{
		 global $worker;
		if(isset($this->worker->uidConnections[$uid]))
		{
			$connection = $this->worker->uidConnections[$uid];
			$connection->send($message);
			return true;
		}
		return false;
	}
}