/**
 * 微信C端     竞彩投注页
 * Created by 赵宇飞 on 2016/9/13.
 */
$(function(){
	itou.localJson.setJson("__confirm_prev_page", {key: "/jingcai/"});

	var itemSelected = function(){
		var self = this;
		self.shengfu = [];//--胜平负选中项
		self.rangqiu = [];//--让球胜平负选中项
		self.bifen = [];//--比分选中项
		self.jinqiu = [];//--进球数选中项
		self.banquanchang = [];//--半全场选中项
	};
	
	var itemInfo = function(obj){//--投注行基础信息
		var self = this,
			data = obj.data;
		self.parent = obj;
		self.no = data.no || ""; //--编号
		self.id = data.id || 0;//--唯一标识
		self.saishi = data.saishi || "";    //--所属赛事
		self.saishiColor = data.saishiColor || "#666";  //--所属赛事背景颜色
		self.fontColor = data.fontColor || "#000";  //--所属赛事字体颜色
		self.endTime = data.endTime;   //--投注结束时间
		try {
			self.bisaiTime = data.bisaiTime.toDate();//--比赛时间
		} catch (error) {
			self.bisaiTime = data.bisaiTime;//--比赛时间
		}
		self.sort = data.sort;//--排列顺序
		self.pankou = data.pankou || 0;//--盘口，即让球数
		self.isShow = false;//--是否展开更多选项
		self.selectMore = false;//--是否选择了更多玩法
		self.selectNum = null;//--选择了几种玩法
		var d = self.endTime.split(/-| |:/);
		var D = new Date(d[0], d[1] - 1, d[2], d[3], d[4], d[5]);
		if(!!D.Dateformat){
			self.endTime = D.Dateformat("HH:NN");
		}
		self.selectMore = obj.parent.hasMoreGame(data.no);
		//self.hasDanguan = data.hasDanguan || false; //--是否可以单关
		// console.log(self);
	};

	var itemTeam = function(obj){//--投注行队伍信息
		var self = this,
			data = obj.data;
		self.parent = obj;
		self.host = {
			name: data.hostName || "",  //--主队名称
			rank: data.hostRank && data.hostRank != "0"? data.hostRank: "-",  //--主队排名
			saishi: data.hostSaishi//--所属赛事
		};
		self.guest = {
			name: data.guestName || "", //--客队名称
			rank: data.guestRank && data.guestRank != "0"? data.guestRank: "-",  //--客队排名
			saishi: data.guestSaishi//--所属赛事
		};
		self.reversion = data.reversion == "1";//--主客场是否逆转
	};

	var gameShengfuFactory = function(){//--胜平负玩法赔率
		var self = this,
			obj = self.parent,
			data = obj.data,
			no = data.no;
		var selected = self.parent.parent.selected || {};//--缓存的选择数据
		var shengfu = selected && selected.list && selected.list[no] && selected.list[no].shengfu? selected.list[no].shengfu: [];//--缓存的胜平负数据
		self.title = "胜平负";//--玩法名称
		self.rangNum = 0;//--玩法让球数
		// console.log(data.no);
		if(!self.peilv){
			self.peilv = {};//--玩法赔率
			if(data.shengfu){
				self.peilv["胜"] = {v: data.shengfu["胜"] || 0, s: shengfu.contains("胜")};//--主队胜赔率
				self.peilv["平"] = {v: data.shengfu["平"] || 0, s: shengfu.contains("平")};//--平局赔率
				self.peilv["负"] = {v: data.shengfu["负"] || 0, s: shengfu.contains("负")};//--客队胜赔率
			}
		}else{//--选中状态重载
			self.peilv["胜"].s = shengfu.contains("胜");
			self.peilv["平"].s = shengfu.contains("平");
			self.peilv["负"].s = shengfu.contains("负");
			self.peilv["胜"].v = data.shengfu["胜"];
			self.peilv["平"].v = data.shengfu["平"];
			self.peilv["负"].v = data.shengfu["负"];
		}
		self.danguan = data.shengfuDanguan || false;//--是否可以单关
		self.key = data.shengfuKey;
		self.open = data.shengfuOpen;
	};
	var gameShengfu = function(obj){//--胜平负玩法及赔率,对象初始化
		var self = this;
		self.parent = obj;
		gameShengfuFactory.call(self);
	};
	gameShengfu.prototype.loadMore = function(){//--胜平负玩法及赔率，数据重新载入
		var self = this;
		gameShengfuFactory.call(self);
	};

	var gameRangqiuFactory = function(){//--让球胜平负玩法赔率
		var self = this,
			obj = self.parent,
			data = obj.data,
			no = data.no;
		var selected = self.parent.parent.selected || {};//--缓存的选择数据
		var rangqiu = selected && selected.list && selected.list[no] && selected.list[no].rangqiu? selected.list[no].rangqiu: [];//--缓存的让球胜平负数据
		self.title = "让球胜平负";//--玩法名称
		self.rangqiuNum = data.rangqiuNum || 0;//--玩法让球数
		if(!self.peilv){
			self.peilv = {};//--玩法赔率
			if(data.rangqiu){
				self.peilv["胜"] = {v: data.rangqiu["胜"] || 0, s: rangqiu.contains("胜")};//--主队胜赔率
				self.peilv["平"] = {v: data.rangqiu["平"] || 0, s: rangqiu.contains("平")};//--平局赔率
				self.peilv["负"] = {v: data.rangqiu["负"] || 0, s: rangqiu.contains("负")};//--客队胜赔率
			}
		}else{//--选中状态重载
			self.peilv["胜"].s = rangqiu.contains("胜");
			self.peilv["平"].s = rangqiu.contains("平");
			self.peilv["负"].s = rangqiu.contains("负");
			self.peilv["胜"].v = data.rangqiu["胜"];
			self.peilv["平"].v = data.rangqiu["平"];
			self.peilv["负"].v = data.rangqiu["负"];
		}
		self.danguan = data.rangqiuDanguan || false;//--是否可以单关
		self.key = data.rangqiuKey;
		self.open = data.rangqiuOpen;
	};
	var gameRangqiu = function(obj){//--让球胜平负玩法及赔率,对象初始化
		var self = this;
		self.parent = obj;
		gameRangqiuFactory.call(self);
	};
	gameRangqiu.prototype.loadMore = function(){//--让球胜平负玩法及赔率，数据重新载入
		var self = this;
		gameRangqiuFactory.call(self);
	};

	var gameBifenFactory = function(){//--比分玩法挤赔率数据载入
		var self = this,
			obj = self.parent,
			data = obj.data,
			no = data.no;
		var model = self.parent.parent;
		var selected = model.selected || {};//--缓存的选择数据
		var bifen = selected && selected.list && selected.list[no] && selected.list[no].bifen? selected.list[no].bifen: [];//--缓存的比分数据
		var win = model.opts.bifen.win.slice(0),//--胜比分选项
			dogfall = model.opts.bifen.dogfall.slice(0),//--平比分选项
			lose = model.opts.bifen.lose.slice(0);//--负比分选项
		self.title = "比分";//--玩法名称
		if(!self.peilv){
			var peilv = [win, dogfall, lose];//--玩法赔率
			for(var m = 0, len = peilv.length; m < len; m ++){
				var arr = peilv[m];
				peilv[m] = {};
				for(var n = 0, l = arr.length; n < l; n ++){
					var t = arr[n];//--玩法比分
					var o = {
						v: data.bifen && data.bifen[t]? data.bifen[t]: 1,//--赔率
						s: bifen.contains(t)
					};
					peilv[m][t] = o;
				}
			}
			self.peilv = peilv;
		}else{//--选择项选中状态重载
			var peilv = self.peilv;
			for(var m = 0, len = peilv.length; m < len; m ++){
				var arr = peilv[m];
				for(var n in arr){
					var t = arr[n];//--玩法比分
					t.s = bifen.contains(n);
					t.v = data.bifen && data.bifen[n]? data.bifen[n]: 1;
				}
			}
		}
		self.danguan = data.bifenDanguan || false;//--是否可以单关
		self.key = data.bifenKey;
		self.open = data.bifenOpen;
	};
	var gameBifen = function(obj){//--比分玩法及赔率,对象初始化
		var self = this;
		self.parent = obj;
		gameBifenFactory.call(self);
	};
	gameBifen.prototype.loadMore = function(){//--比分玩法及赔率，数据重新载入
		var self = this;
		gameBifenFactory.call(self);
	};

	var gameJinqiuFactory = function(){//--总进球玩法及赔率
		var self = this,
			obj = self.parent,
			data = obj.data,
			no = data.no;
		var model = self.parent.parent;
		var selected = model.selected || {};//--缓存的选择数据
		var jinqiu = selected && selected.list && selected.list[no] && selected.list[no].jinqiu? selected.list[no].jinqiu: [];//--缓存的总进球数据
		var balls = model.opts.balls.slice(0);//--总进球选项
		self.title = "总进球";//--玩法名称
		if(!self.peilv){
			self.peilv = {};//--玩法赔率
			var arr = balls;
			for(var n = 0, l = arr.length; n < l; n ++) {
				var t = arr[n];//--玩法标题
				var o = {
					v: data.jinqiu && data.jinqiu[t] ? data.jinqiu[t] : 1,//--赔率
					s: jinqiu.contains(t)
				};
				self.peilv[t] = o;
			}
		}else{//--选中状态重载
			var arr = balls;
			for(var n = 0, l = arr.length; n < l; n ++) {
				var t = arr[n];//--玩法标题
				self.peilv[t].s = jinqiu.contains(t);
				self.peilv[t].v =  data.jinqiu && data.jinqiu[t] ? data.jinqiu[t] : 1;
			}
		}
		self.danguan = data.jinqiuDanguan || false;//--是否可以单关
		self.key = data.jinqiuKey;
		self.open = data.jinqiuOpen;
	};
	var gameJinqiu = function(obj){//--总进球玩法及赔率,对象初始化
		var self = this;
		self.parent = obj;
		gameJinqiuFactory.call(self);
	};
	gameJinqiu.prototype.loadMore = function(){//--总进球玩法及赔率，数据重新载入
		var self = this;
		gameJinqiuFactory.call(self);
	};

	var gameBanquanchangFactory = function(){//--半全场玩法及赔率
		var self = this,
			obj = self.parent,
			data = obj.data,
			no = data.no;
		var model = self.parent.parent;
		var selected = model.selected || {};//--缓存的选择数据
		var banquanchang = selected && selected.list && selected.list[no] && selected.list[no].banquanchang? selected.list[no].banquanchang: [];//--缓存的总进球数据
		var shengfu = model.opts.shengfu.slice(0);//--半全场选项
		self.title = "半全场";//--玩法名称
		if(!self.peilv){
			self.peilv = {};//--玩法赔率
			var arr = shengfu;
			for(var n = 0, l = arr.length; n < l; n ++) {
				var t = arr[n];//--玩法标题
				var o = {
					v: data.banquanchang && data.banquanchang[t] ? data.banquanchang[t] : 1,//--赔率
					s: banquanchang.contains(t)
				};
				self.peilv[t] = o;
			}
		}else{
			var arr = shengfu;
			for(var n = 0, l = arr.length; n < l; n ++) {
				var t = arr[n];//--玩法标题
				self.peilv[t].s = banquanchang.contains(t);
				self.peilv[t].v = data.banquanchang && data.banquanchang[t] ? data.banquanchang[t] : 1;
			}
		}
		self.danguan = data.banquanchangDanguan || false;//--是否可以单关
		self.key = data.banquanchangKey;
		self.open = data.banquanchangOpen;
	};
	var gameBanquanchang = function(obj){//--半全场玩法及赔率,对象初始化
		var self = this;
		self.parent = obj;
		gameBanquanchangFactory.call(self);
	};
	gameBanquanchang.prototype.loadMore = function(){//--半全场玩法及赔率，数据重新载入
		var self = this;
		gameBanquanchangFactory.call(self);
	};

	var itemGame = function(obj){//--投注行玩法及赔率
		var self = this;
		self.shengfu = new gameShengfu(obj);//--胜平负玩法
		self.rangqiu = new gameRangqiu(obj);//--让球玩法
		self.bifen = new gameBifen(obj);//--比分玩法
		self.jinqiu = new gameJinqiu(obj);//--总进球玩法
		self.banquanchang = new gameBanquanchang(obj);//--半全场玩法
	};
	itemGame.prototype.loadMore = function(){//--投注行玩法及赔率重新加载更多信息
		var self = this;
		self.shengfu.loadMore();
		self.rangqiu.loadMore();
		self.bifen.loadMore();
		self.jinqiu.loadMore();
		self.banquanchang.loadMore();
	};

	var item = function(data, model){//--竞彩投注行数据原型
		var self = this;
		self.data = data;
		self.parent = model;
		self.info = new itemInfo(self);//--行基础信息
		self.team = new itemTeam(self);//--行队伍信息
		self.game = new itemGame(self);//--行玩法及赔率
		var no = data.no;//--赛事编号
		var selected = self.parent.selected || {};//--缓存的选择数据
		var i = selected.list && selected.list[no]? selected.list[no]: {};//--赛事选择数据
		var dan = i && i.dan? i.dan: false;//--缓存的选胆数据
		if(!i){
			self.selected = 0;//--0 = 未选中，1 = 选中，-1 = 设胆
		}else{
			self.selected = dan? -1: 1;
		}
		self.parent.maps[no] = self;//--设置映射关系
		self.parent.hasMoreGame(no);
	};
	item.prototype.loadMore = function(){//--点击获取比分、总进球、半全场的赔率
		var self = this;
		self.game.loadMore();
	};

	var timmer = function(obj){//--计时器管理对象
		var self = this;
		self.parent = obj;
		var timmerMap = {};//--计时器映射

		self.newTimmer = function(opts){//--创建新的计时器
			var key = opts.key,
				fun = opts.fun,
				timeout = opts.timeout;
			self.clearTimmer(key);
			timmerMap[key] = window.setInterval(function() {
				fun();
			}, timeout);
			console.log(timmerMap);//console.log(obj);
		};
		self.clearTimmer = function(key){//--清除指定的计时器
			window.clearInterval(timmerMap[key]);
			delete timmerMap[key];
		};
		self.getTimmers = function(key){
			// console.log(timmerMap);
			var arr = [];
			for(var i in timmerMap){
				if(i.has(key)){
					arr.push(i);
				}
			}
			return arr;
		};
	};

	var apis = function(obj){//--API调用实例化函数，用于调用所有api
		var self = this;
		self.parent = obj;

		self.getAdvLive = function(){
			return itou.get({
				url:"adv/getnotice",
				data: {
				},
				formatResult:false
			});
		};
		self.getAdertisingStatus = function(){
			return itou.get({
				url:"adv/adinfo",
				data: {
					aid: 1,
					pid: 2,
					station_id: self.parent.station_id,
				},
				formatResult:false
			});
		};
		self.getAdvNum = function(){
			return itou.get({
				url:"adv/clickstat",
				data: {
					aid: 1,
					pid: 2,
					station_id: self.parent.station_id,
				},
				formatResult:false
			});
		};
		self.getList = function(){//--获取赛事列表
			var model = self.parent;
			// if(model.cacheList){
			// 	var cacheList = model.cacheList,
			// 		defer = $.Deferred();
			// 		defer.resolve(cacheList);
			// 		return defer.promise();
			// }else{
				var s = self.parent.selected.search || {},
					min_odds = "",//--最小赔率
					max_odds = "",//--最大赔率
					odds_list = [],//--赔率范围数组,
					peilv = s.peilv,
					league_name = s.saishi || "";//--所属赛事，数组
				//console.log(s);
				for(var i = 0, len = peilv.length; i < len; i ++){
					switch (peilv[i]) {
						case "0"://--1.5以下
							min_odds = "0";
							max_odds = "1.5";
							break;
						case "1"://--1.5-2.0
							min_odds = "1.5";
							max_odds = "2";
							break;
						case "2"://--2.0以上
							min_odds = "2";
							max_odds = "0";
							break;
					}
					odds_list.push([min_odds, max_odds]);
				}
				// console.log(odds_list);
				return itou.get({
					url: "match/selectlist",
					data: {
						hide_more: 1,
						odds_list: odds_list,
						league_name: league_name
					},
					showErr: true//--接口超时是否跳转错误页面
				});
			// }
		};
		self.loadMore = function(data){//--赛事加载更多选项，获取比分、总进球、半全场赔率
			return itou.get({
				url: "match/selectmore",
				data: data
			});
		};
		self.getSearchSaishi = function(){//--获取检索项中的赛事
			return itou.get({
				url: "match/leaguequerylist",
				data: {}
			});
		};
		self.getJiangjin = function(data){//--获取奖金，这个异步加载要在点击选择赛事后，延时调用
			var token = itou.getToken(),
				t = Math.floor(Math.random() * 1000);
			return itou.get({
				// url: "evaluate/?token=" + token + "&t=" + t,
				url: "evaluate/?token=" + token,
				data: JSON.stringify(data),
				type: "POST",
				processData: false,
				formatResult: false,
				autocache: true
			});
		};
		self.saveFangan = function(data, act){//--保存方案
			return itou.outil.saveProject(data, act);
		};

		self.getDefaultStation = function(data){//--获取默认店铺
			return itou.get({
				url: "shop/getMyRecommStation",
				data: {
					lottery_type: data.lottery_type,
					money: data.money
				}
			});
		};

		self.getResult = function(){//--获取最近7天比赛结果数量
			return itou.get({
				url: "match/finishcount",
				data: {},
				rnd: false,
				notoken: true
			});
		};
	};

	var money = function(data){//--奖金信息，通过接口返回
		var self = this;
		self.huafei = data.huafei || 0;//--总投注金额
		self.jiangjin = data.jiangjin || 0;//--最大奖金金额
		self.list = data.list || [];//--奖金状态列表
	};

	var searchOpts = function(obj){//--检索项数据
		var self = this;
		self.parent = obj;
		var selected = self.parent.selected,
			search = selected.search || {},
			peilv = search.peilv || [],//--缓存数据
			saishi = search.saishi || [];
		self.isShow = false;
		self.temp = {//--临时数据，执行检索后，需要同步到缓存数据中，取消检索需要充值
			peilv: peilv.slice(0),
			saishi: saishi.slice(0)
		};
		self.peilv = {//--胜平负低赔率区间检索项，单选
			title: "胜平负低赔率区间",
			opts: []
		};
		self.saishi = {//--赛事检索项，数据格式{t: "英超", v: "yingchao", s: false}，复选；来源：接口返回
			title: "赛事",
			opts: []
		};

		self.tempReset = function(){
			var selected = self.parent.selected,
				search = selected.search || {},
				peilv = search.peilv || [],//--缓存数据
				saishi = search.saishi || [];
			self.temp = {//--临时数据，执行检索后，需要同步到缓存数据中，取消检索需要充值
				peilv: peilv.slice(0),//--复制原检索项选中数组
				saishi: saishi.slice(0)
			};//console.log(selected);
		};
		// self.tempReset();console.log(self.temp);
		self.formatOpts();
	};

	searchOpts.prototype.formatOpts = function(){//--根据缓存，格式化检索项选中状态;需要在接口完成后执行
		var self = this;
		var temp = self.temp,
			peilv = temp.peilv || [],
			saishi = temp.saishi || [],//--缓存数据
			opts = self.saishi.opts;//console.log(temp.peilv,temp.saishi);
		self.peilv.opts = [
			{t: "1.50以下", v: "0", s: peilv.contains('0')},//--通过缓存数据判断选中状态
			{t: "1.50-2.00", v: "1", s: peilv.contains('1')},
			{t: "2.00以上", v: "2", s: peilv.contains('2')}
		];
		for(var i in opts){
			opts[i].s = saishi.contains(opts[i].t);
		}
		//self.tempReset();
	};
	searchOpts.prototype.doSelectSearch = function(type, index){//--选择检索项
		var self = this;
		if(self[type] && self[type].opts && self[type].opts[index] && self[type].opts[index].t){
			//console.log(self.temp,self);
			if(self[type].opts[index].s){//--取消选中状态
				self.temp[type] = Array.minus(self.temp[type], [self[type].opts[index].v]);//--取差集
			}else{//--设置选中状态
				self.temp[type].push(self[type].opts[index].v);
			}
			self[type].opts[index].s = !self[type].opts[index].s;
		}
	};
	searchOpts.prototype.selectAll = function(){//--选中全部赛事
		var self = this,
			opts = self.saishi.opts;
		for(var i = 0, len = opts.length; i < len; i++){
			if(!opts[i].s){
				self.doSelectSearch('saishi', i);
			}
		}
	};
	searchOpts.prototype.unselectAll = function(){//--反选全部赛事
		var self = this,
			opts = self.saishi.opts;
		for(var i = 0, len = opts.length; i < len; i++){
			// if(!opts[i].s){
				self.doSelectSearch('saishi', i);
			// }
		}
	};
	searchOpts.prototype.getSelectedFromTemp = function(){//--将选中项从临时数据中取出
		var self = this;
		var selected = self.parent.selected,
			search = selected.search || {};
		search.peilv = self.temp.peilv.slice(0);
		search.saishi = self.temp.saishi.slice(0);console.log(selected);
		itou.localJson.setJson("__Jingcai_Selected", {data: selected});//--保存缓存数据
	};

	var helper = function(model){//--帮助信息对象实例化函数
		var self = this;
		self.parent = model;
		self.showTop = false;//--是否显示页面右上角帮助弹窗
		self.rangqiu = {//--让球帮助信息
			isShow: false,//--是否显示
			info: {
				host: "",//--主队名
				guest: "",//--客队名
				num: ""//--让球数
			}
		};
		self.resultList = [];//--最近3天比赛结果
	};

	var result = function(model){//--选择场次之后的计算结果
		var self = this;
		self.parent = model;
		self.formated = null;
		self.guoguan = [];//--过关方式
		self.guoguanMore = [];//--混合过关方式
		self.formatedGuoguan = [];//--处理之后的过关方式
		self.zhushu = null;
		self.guoguanHtml = null;
		self.guoguanDef = null;
		self.minDan = 0;
	};
	result.prototype.compute = function(){//--处理选中数据，进行计算
		var self = this,
			model = self.parent,
			selected = model.selected.list,
			maps = model.maps;
		// console.log(self);
		//console.log(selected);
		
		self.guoguanCompute();//--过关计算，得出最短过关串
		self.getMinDan();
		var min = self.minDan;//console.log(model.getDanNum(),min);
		if(model.getDanNum() > min){
			model.clearDan();//--清除胆
			model.getDanList();
		}
		var r = $.lottery.jingcai.football.outil.formatSelected(selected, maps);//--格式化选择数据，用于后续计算
		self.formated = r;
		console.log(JSON.stringify(selected, null, 4), r);
		var guoguan = self.getGuoguan(r);//console.log(guoguan);
		self.clearGuoguan();//--清理不合适的过关选项
		if(guoguan.length > 0 && self.guoguanDef){//--获取默认过关方式
			// console.log(guoguan, Math.max.apply(null, guoguan));
			model.selected.guoguan.splice(0);
			model.selected.guoguan.push(Math.max.apply(null, guoguan) + "_1");
		}else if(guoguan.length == 0){
			model.selected.guoguan.splice(0);
		}
		var guoguanMore = self.getGuoguanMore(guoguan);
		// console.log(guoguan, guoguanMore);
		self.getZhushu();//--注数计算
		self.getGuoguanHtml();//--获取过关按钮显示信息
		var r1 = $.lottery.jingcai.football.outil.formatSelectedToApi({//--格式化选中数据，使之可以被评测接口使用
			passTypes: model.selected.guoguan.join(","),//--过关方式
			multiple: model.selected.beishu,//--倍数
			type: "mixed"//--单关或者是混关
		});
		self.getMinDan();
		// console.log(r);
		// console.log(r1);//alert(JSON.stringify(r1));
		// console.log(r1.passTypes, !r1.passTypes)
		if(!r1.passTypes || r1.matches.length == 0){
			model.evaluate.max = 0;
		}else{
			var timeout = 0;
			if(self.zhushu > 10000){
				timeout = 350;
			}
			model.timmer.newTimmer({//--调用接口获取奖金评测
				key: "__sys_jingcai_football_evaluate",
				fun:function(){
					model.timmer.clearTimmer("__sys_jingcai_football_evaluate");
					// model.apis.getJiangjin(r1)
					// 	.then(function(r){
					// 		self.formatEvaluateFromApi(r);
					// 	});
					model.evaluate.max = model.getMaxMoney();;
				},
				timeout: timeout 
			});
		}
		self.guoguanCompute();//--过关计算，得出最短过关串
		itou.localJson.setJson("__Jingcai_Selected", {data: model.selected});//--保存缓存数据
	};
	result.prototype.getMinDan = function(){//--获得最短的胆数量
		var self = this,
			guoguan = self.parent.selected.guoguan;
		for(var i = 0, len = guoguan.length; i < len; i ++){
			var gg = guoguan[i].split("_");
			if(i == 0){
				self.minDan = gg[0];
			}else{
				self.minDan = self.minDan < gg[0]? self.minDan: gg[0];
			}
		}
	};
	result.prototype.getGuoguan = function(r){//--获得过关方式
		var self = this;
		self.guoguan = $.lottery.jingcai.football.outil.getGuoguan(r);
		return self.guoguan;
	};
	result.prototype.getGuoguanMore = function(guoguan){//--获得混合过关方式
		var self = this;
		self.guoguanMore = $.lottery.jingcai.football.outil.getGuoguanMore(guoguan);
		return self.guoguanMore;
	};
	result.prototype.guoguanCompute = function(){//--处理选择的过关方式，得出最短串法
		var self = this,
			guoguan = self.parent.selected.guoguan;
		self.formatedGuoguan = $.lottery.jingcai.football.outil.formatGuoguan(guoguan);
		// console.log(guoguan, self.formatedGuoguan, self.parent.selected);
		return self.formatedGuoguan;
	};
	result.prototype.getZhushu = function(){//--获取注数
		var self = this,
			guoguan = self.parent.selected.guoguan;
		self.zhushu = $.lottery.jingcai.football.outil.getZhushu(guoguan);
		return self.zhushu;
	};
	result.prototype.clearGuoguan = function(){//---清理不合适的过关选项
		var self = this,
			num = self.formated.intro.nuNum,
			sNum = self.formated.intro.num, 
			danguan = self.formated.intro.danguan,
			guoguan = self.guoguan,
			l = guoguan.length,
			max = guoguan[l - 1],
			s = self.parent.selected.guoguan;//console.log(self.formated.intro);
		var hasMore = sNum.SportteryScore || sNum.SportteryHalfFull;
		var hasTotalGoals = sNum.SportteryTotalGoals;
		if(hasMore){
			var m = 4;
		}else if(hasTotalGoals){
			var m = 6;
		}else{
			var m = 8;
		}
		num = num < m? num: m;
		for(var len = s.length, i = len -1; i >= 0; i --){
			var x = s[i].split("_")[0];
			if(x > num || (x == 1 && !danguan)){
				s.splice(i, 1);
			}
		}
		if(s.length == 0 && self.parent.isDoselect == true){
			s.push(max + "_1");
			self.guoguanDef = true;
		}
		self.parent.isDoselect = false;
		// console.log(self.parent.selected.guoguan,self,self.guoguan);
	};
	result.prototype.formatEvaluateFromApi = function(data){//--处理奖金测评数据
		if(data.code != "200"){
			return;
		}
		var self = this,
			hrm = data.data.hrm,
			o = self.parent.evaluate;
		o.max = 0;
		o.min = 0;
		o.hasDan = true;
		o.list = [];
		for(var i in hrm){
			o.hasDan = !(i == "0");//--是否是胆拖投注
			var a = hrm[i];
			for(var ii in a){
				var b = a[ii],
					obj = {};
				o.max = o.max > b.max? o.max: b.max;//--获取最大奖金
				o.min = o.min == 0? b.min: (o.min < b.min? o.min: b.min);//--获取最小金额
				obj.dan = i;
				obj.tuo = ii;
				obj.max = b.max;
				obj.min = b.min;
				o.list.push(obj);
			}
		}
		//console.log(o);
	};
	result.prototype.getGuoguanHtml = function(){//--获取过关呈现字符
		var self = this,
			$data = self.parent,
			guoguan = $data.selected.guoguan,
			dan = self.formated.intro.dan.length,
			str = "";
		// console.log(guoguan);
		if(guoguan.length == 0){
			str = "选择过关";
		}else{
			str = guoguan[0] == "1_1"? "单关": guoguan[0].replace("_", "串");
			if(!!dan){
				str = str + "(<span class='fontred font12'>胆</span>)"
			}
			if(guoguan.length > 1){
				str = str + "..";
			}
		}
		self.guoguanHtml = str;
	};

	var act = function(model){
		var self = this;
		self.parent = model;
		self.currAction = "";//--当前弹窗动作
		self.submitAction = "";//--当前提交动作
	};
	act.prototype.show = function(key){//--显示指定弹窗
		var self = this,
			model = self.parent;
		if(key == "evaluate" && self.currAction != "evaluate"){
			var r1 = $.lottery.jingcai.football.outil.formatSelectedToApi({//--格式化选中数据，使之可以被评测接口使用
				passTypes: model.selected.guoguan.join(","),//--过关方式
				multiple: model.selected.beishu,//--倍数
				type: "mixed"//--单关或者是混关
			});console.log(r1, JSON.stringify(r1));
			model.apis.getJiangjin(r1)
				.then(function(r){
					model.result.formatEvaluateFromApi(r);
				});
		}
		if(key == "evaluate" && self.parent.evaluate.max == "0"){//--最大奖金为0时，不显示奖金评测窗口
			self.currAction = "";
			return;
		}else if(key == "jianpan"){
			self.parent.jianpan.firstKeyDown = false;
		}
		self.currAction = self.currAction == key? "": key;
	};
	act.prototype.hide = function(){//--隐藏指定弹窗
		var self = this;
		self.currAction = "";
	};
	act.prototype.selectGuoguan = function(key){//--选择/取消过关方式
		var self = this,
			model = self.parent;
			guoguan = model.selected.guoguan;//console.log(guoguan.contains(key));
		if(guoguan.length >= 5 && !guoguan.contains(key)){
			model.vm.showToast('过关方式不能超过5个');
			return;
		}
		if(guoguan.contains(key)){
			self.parent.selected.guoguan = Array.minus(guoguan, [key]);
		}else{
			guoguan.push(key);
		}
		self.parent.result.guoguanDef = false;
		self.parent.result.compute();
		self.parent.result.guoguanCompute();
		self.parent.result.getZhushu();
		itou.localJson.setJson("__Jingcai_Selected", {data: self.selected});//--保存缓存数据
	};
	act.prototype.doSaveFangan = function(){//--保存方案
		var self = this,
			model = self.parent,
			result = model.result,
			selected = model.selected,
			submitAction = self.submitAction,
			s = model.result.guoguanHtml;
		if(s == "选择过关"){
			model.vm.showToast('请选择过关方式');
			return;
		}
		if(result.zhushu * 2 > 100000){
			model.vm.showToast('单倍方案金额不能超过10万元');
			return;
		}
		if(result.zhushu * selected.beishu * 2 > 2000000){
			model.vm.showToast('方案金额不能超过200万');
			return;
		}
		var r = self.getFanganData();
		// console.log(r);
		model.apis.saveFangan(r, submitAction);
	};
	act.prototype.getFanganData = function(){//--获取方案所需数据
		var self = this,
			model = self.parent,
			f = model.result.formated,
			dan = f.intro.dan,
			betIds = model.getBetIds(),
			o = {};
		o.passTypes = model.selected.guoguan.join(",");//--过关方式
		o.count = model.result.zhushu * model.selected.beishu;//--总注数
		o.multiple = model.selected.beishu;//--倍数
		o.m_ext = "";//--投注方式选项
		o.manner = model.result.formated.intro.dan.length > 0? 1: 0;//--投注方式
		o.bet_seq = betIds;//--bet_id序列
		o.dan = dan;
		var r = $.lottery.jingcai.football.outil.formatSelectedToApiFangan(o);
		return r;
	};
	act.prototype.doSubmit = function(){//--提交店铺
		var self = this;
		self.submitAction = "submit";
		self.doSaveFangan();
	};
	act.prototype.doSave = function(){//--保存方案并执行跳转
		var self = this;
		self.submitAction = "save";
		self.doSaveFangan();
	};

	var jianpan = function(model){
		var self = this;
		self.parent = model;
		self.firstKeyDown = false;
		var selected = self.parent.selected,
			beishu = selected.beishu || 1;
		self.canReplace = (beishu == 1);//--是否可以替换掉原数字'
	};
	jianpan.prototype.keyNum = function(code){//--点击数字按键
		var self = this,
			result = self.parent.result,
			selected = self.parent.selected,
			beishu = selected.beishu || 1,
			canReplace = self.canReplace;//console.log(self.firstKeyDown,canReplace);
		if(!self.firstKeyDown){
			beishu = code;
		}else{
			beishu = canReplace? code * 1: (beishu + "" + code) * 1;
		}
		self.canReplace = false;
		if(beishu > 50000){
			beishu = 50000;
		}else if(beishu < 1){
			beishu = 1;
		}
		if(beishu != selected.beishu){
			self.parent.selected.beishu = beishu;
			result.compute();
		}
		self.firstKeyDown = true;
	};
	jianpan.prototype.keydel = function(){//--点击删除按键
		var self = this,
			result = self.parent.result,
			selected = self.parent.selected,
			beishu = selected.beishu || 1,
			len = (beishu + "").length;
		if(!self.firstKeyDown){
			beishu = 1;
		}else{
			beishu = (beishu + "").left(len - 1) || 1;
		}
		beishu = beishu * 1;
		if(beishu > 50000){
			beishu = 50000;
		}else if(beishu < 1){
			beishu = 1;
		}
		self.canReplace = (beishu == 1);
		if(beishu != selected.beishu){
			self.parent.selected.beishu = beishu;
			result.compute();
		}
		self.firstKeyDown = true;
	};
	jianpan.prototype.keyTop = function(code){//--点击倍数按键
		var self = this,
			result = self.parent.result,
			act = self.parent.act;
		self.parent.selected.beishu = code;
		result.compute();
		act.hide()
	};

	var currItem = function(model){//--显示更多玩法的控制对象
		var self = this;
		self.parent = model;
		self.show = false;//--是否显示界面
		self.item = null;//--当前显示的数据
		self.no = null;
		self.selected = null;
	};
	currItem.prototype.showMore = function(no){
		var self = this,
			model = self.parent,
			pSelected = model.selected.list,
			maps = model.maps;
		self.no = no;
		self.item = maps[no];
		var selected = pSelected[no] || {};
		self.selected = {};
		for(var i in selected){
			if(itou.outil.is(selected[i], "Array")){
				self.selected[i] = selected[i].slice(0);
			}
		}
		var game = self.item.game;
		if(game.bifen.open || game.jinqiu.open || game.banquanchang.open){
			self.show = true;
		}else{
			var betid = game.shengfu.key || game.rangqiu.key;
			model.apis.loadMore({
					serial_no: no,
					bet_id: betid
				})
				.then(function(data){//--格式化数据并重载更多玩法
					var y = 0;
					for(var x in data){
						if(x != "token"){
							y = x;
							break;
						}
					}
					var r = $.lottery.jingcai.football.outil.formatItemFromApi(data[y]);
					// r.no = y;
					// console.log(r);
					// console.log(it.data);
					self.item.data = r;
					self.item.loadMore();
					self.show = true;
				});
		}
		// console.log(self.item);
		// console.log(self.selected);
	};
	currItem.prototype.submit = function(){//--确认
		var self = this,
			model = self.parent,
			pSelected = model.selected.list;
		self.show = false;
		model.isDoselect = true;
		model.selected.list[self.no] = self.selected;
		itou.localJson.setJson("__Jingcai_Selected", {data: model.selected});//--保存缓存数据
		model.clearSelected();
		self.item.loadMore();
		model.hasMoreGame(self.no);
		model.result.compute();
		model.getDanList();
		if(window.myDrapload){
			window.myDrapload.unlock();
		}
	}
	currItem.prototype.cancel = function(){//--取消
		var self = this;
		self.show = false;
		self.item.loadMore();
		if(window.myDrapload){
			window.myDrapload.unlock();
		}
	}
	currItem.prototype.doSelectSaishi = function(game, key, index){//--在弹窗选择赛事
		var self = this,
			result = self.parent.result.formated.intro || {},
			nuNum = result.nuNum || 0,
			no = self.no,
			selected = self.parent.selected.list;
		// console.log(self.item);
		if(self.item.game && self.item.game[game] && self.item.game[game].peilv){
			if(self.item.game[game].peilv[key] && self.item.game[game].peilv[key].v == "未受注"){
				return;
			}
			if(self.item.game[game].peilv[index] && self.item.game[game].peilv[index][key] &&self.item.game[game].peilv[index][key].v == "未受注"){
				return;
			}
			if(nuNum >= 11 && !selected[no]){
				vm.showToast("最多选择11场比赛。");
				return;
			}
			if(!index && index != 0){
				self.item.game[game].peilv[key].s = !self.item.game[game].peilv[key].s;//--是否选中样式切换
			}else{
				self.item.game[game].peilv[index][key].s = !self.item.game[game].peilv[index][key].s;//--是否选中样式切换
			}
			if(!self.selected[game]){self.selected[game] = []}
			if(self.selected[game].contains(key)){//--是否选中数据处理
				self.selected[game] = Array.minus(self.selected[game], [key]);//--取差集
			}else{
				self.selected[game].push(key);//--追加
			}
		}
		// console.log(self.parent.selected.list[self.no][game]);
		// console.log(self.selected[game]);
	};
	currItem.prototype.selectAll = function(game, index){//--点击标题全选、全取消, @param game(String) = 玩法, @param index(Int) = 下标
		if(game != "bifen"){
			return;
		}
		var self = this,
			result = self.parent.result.formated.intro || {},
			nuNum = result.nuNum || 0,
			no = self.no,
			selected = self.parent.selected.list;
		if(nuNum >= 11 && !selected[no]){
			vm.showToast("最多选择11场比赛。");
			return;
		}
		self.selected[game] = self.selected[game] || [];
		var peilv = self.item.game[game].peilv[index],
			selected = self.selected[game] || [],
			selectedAll = true;//--是否已经全部选中
		for(var i in peilv){
			var o = peilv[i];
			if(selectedAll && !o.s){
				selectedAll = false;
			}
		}
		// console.log(peilv, self.selected[game], selectedAll);
		for(var i in peilv){
			var o = peilv[i];
			o.s = !selectedAll;
			if(selectedAll){
				self.selected[game] = Array.minus(self.selected[game], [i]);//--取差集
			}else{
				if(!self.selected[game].contains(i)){
					self.selected[game].push(i);//--追加
				}
			}
		}
		// console.log(peilv, self.selected[game], selectedAll);
	};

	var model = function(){
		var self = this;
		self.showBody = false;
		self.drapload = null;
		self.showOpenMsg = false;//--是否显示页面第一次打开时的提示信息
		self.isDoselect = false;
		self.vm = null;
		self.localData = {t: "竞彩足球", v: "", service: "", num: 0, map: "jingcai"};
		itou.localData.setData("__sys_lottery_type", {key: self.localData});
		self.result = new result(self);
		self.helper = new helper(self);//--帮助信息对象实例化
		self.timmer = new timmer(self);//--计时器对象实例化
		self.apis = new apis(self);
		self.act = new act(self);
		self.opts = {//--玩法选项
			bifen: {//--比分选项
				win: ["1:0", "2:0", "2:1", "3:0", "3:1", "3:2", "4:0", "4:1", "4:2", "5:0", "5:1", "5:2", "胜其他"],//::胜比分选项
				dogfall: ["0:0", "1:1", "2:2", "3:3", "平其他"],//::平比分选项
				lose: ["0:1", "0:2", "1:2", "0:3", "1:3", "2:3", "0:4", "1:4", "2:4", "0:5", "1:5", "2:5", "负其他"]//::负比分选项
			},
			balls: ["0球", "1球", "2球", "3球", "4球", "5球", "6球", "7+"],//--总进球选项
			shengfu: ["胜/胜", "胜/平", "胜/负", "平/胜", "平/平", "平/负", "负/胜", "负/平", "负/负"]//--半全场选项
		};
		//self.itemModel = new item({});
		/**
		 *在生成赛事列表的同时，要生成编号与列表数据的映射关系；
		 * 并且要根据缓存的投注数据，重新设置列表数据的投注状态
		 */
		self.list = [];//--赛事列表列表信息//--元素形式：{t: "8月10日  周四 共4场比赛", items: [item1, item2, item3 …………]}
		self.maps = {};//--赛事编号与列表数据映射关系，数据形式self.maps[saishi_no] = item;
		self.danList = [];//--设单列表数据
		self.betIds = [];//--被选中的玩法标志
		self.currItem = new currItem(self);//--显示更多玩法的控制对象
		self.evaluate = {//--奖金评测对象
			max: 0,//--最大奖金值
			min: 0,//--最小奖金值
			hasDan: true,//--是否是胆拖投注
			list: []//--评测数据列表
		};
		//--缓存的投注数据
		//--数据形式：
		/*
		 self.selected = {
			search: {
				peilv: [0, 1, 2],
				saishi: ['yijia', 'yingchao', 'xijia' …………]
			},
			list: {
				saishi_no: {
					shengfu: ["负"],
					rangqiu: ["胜"],
					bifen: ["1-0"],
					jinqiu: [],
					banquanchang: [],
					dan: false
				}
			},
			guoguan:[],//--用户选择的过关串
			beishu: 1
		 };
		*/
		var prev = window.prevPage;
		if(!prev || prev.has("/project/detail/") || prev.has("/user/shop/details/") || prev == window.config.base_url){//--清空缓存数据
			itou.localJson.setJson("__Jingcai_Selected", {data: {}});
			itou.sessionData.delData("__Jingcai_SaishiList");
		}
		var localSelected = itou.localJson.getJson("__Jingcai_Selected").data;//--竞彩投注页缓存的投注数据，包含选号数据和筛选条件
		// console.log("localSelected = ", JSON.stringify(localSelected));
		self.selected = localSelected || {};//--这个数据需要随时更新并存入缓存，存入之前需要剔除多余的数据
		self.selected.search = self.selected.search || {peilv: [], saishi: []};
		self.selected.list = self.selected.list || {};
		self.selected.guoguan = self.selected.guoguan || [];
		self.selected.beishu = self.selected.beishu || 1;

		/**
		 * 列表缓存数据，在
		 */
		var cacheList = itou.sessionData.getData("__Jingcai_SaishiList").data;
		if(cacheList && !(!prev || prev.has("/project/detail/") || prev == window.config.base_url)){//--列表缓存数据存，在需要重新调用接口的位置，需要将self.cacheList设置为null
			self.cacheList = cacheList;
		}else{
			self.cacheList = null;
		}
		// console.log(self.cacheList);

		self.searchOpts = new searchOpts(self);//---检索项初始化

		self.result.guoguanDef = self.selected.guoguan.length == 0;
		self.result.getMinDan();//--获得最小可设胆数
		self.jianpan = new jianpan(self);//--小键盘梳理对象
		self.advertising_data = {
			dest_url:'',
			show: false,
		}
		self.station_id = itou.localJson.getJson('__entry_info').station_id;
	};
	model.prototype.getAdvertising = function(){
		var self = this;
		self.apis.getAdertisingStatus()
				.then(function(result){
					var defer = $.Deferred();
					if(result.data.toString()){
						self.advertising_data.dest_url = result.data.dest_url;
						var time = localStorage.getItem("advertising_time")//itou.localJson.getJson('advertising_time');
						var d = new Date();
						var now_time = d.getTime();
						if(!time){
							self.advertising_data.show = true;
							//itou.localJson.setJson('advertising_time', now_time);
						}
						else if((now_time-time) > 86400000){
							self.advertising_data.show = true;
						}
						defer.resolve();
					}
					return defer.promise();
				})
	};
	model.prototype.deleteSelected = function(){
		var self = this,
			selected = self.selected;;
		selected.search.peilv = [];
		selected.search.saishi = [];
		selected.list = {};
		selected.guoguan = [];
		selected.beishu = 1;
	};

	model.prototype.formatData = function(item){//--格式化接口返回的列表数据，返回结果可作为item()函数的参数
		var self = this,
			d = {};
		d.no = item.no || ""; //--编号
		d.id = item.id || 0; //--唯一标识
		d.saishi = item.saishi || "";    //--所属赛事
		d.saishiColor = item.saishiColor || "#666";  //--所属赛事颜色
		d.endTIme = item.endTime;   //--投注结束时间
		d.hasDanguan = item.hasDanguan || false; //--是否可以单关
		d.hostName = item.hostName || "";  //--主队名称
		d.hostRank = item.hostRank || "";  //--主队排名
		d.guestName = item.guestName || ""; //--客队名称
		d.guestRank = item.guestRank || ""; //--客队排名
		d.shengfu = item.shengfu || [];//--胜平负赔率
		d.shengfuDanguan = item.shengfuDanguan || false;//--胜平负单关
		d.rangNum = item.rangNum || 0;//--让球胜平负让球数
		d.rangqiu = item.rangqiu || [];//--让球胜平负赔率
		d.rangqiuDanguan = item.rangqiuDanguan || false;//--让球胜平负单关
		d.bifen = item.bifen || {};//--比分玩法赔率
		d.bifenDanguan = item.bifenDanguan || false;//--让球胜平负单关
		d.jinqiu = item.jinqiu || {};//--进球数玩法赔率
		d.jinqiuDanguan = item.jinqiuDanguan || false;//--进球数单关
		d.banquanchang = item.banquanchang || {};//--半全场玩法赔率
		d.banquanchangDanguan = item.banquanchangDanguan || false;//--半全场单关
		return d;
	};

	model.prototype.clearSelected = function(){//--清除已不存在的赛事的投注缓存
		var self = this,
			maps = self.maps,
			selected = self.selected.list;
		for(var i in selected){
			if(!maps[i]){
				delete selected[i];//--移除已经不存在的赛事的投注状态
			}else{//--移除空选择项
				var num = 0;
				for(var x in selected[i]){
					var g = selected[i][x];
					num += g.length;
				}
				if(num == 0){
					delete selected[i];
				}
			}
		}
		// for(var i in maps){//--追加新增赛事的选择项
		//     if(!selected[i]){
		//         selected[i] = new itemSelected();
		//     }
		// }
	};

	model.prototype.setDan = function(no){//--设胆
		var self = this,
			maps = self.maps,
			selected = self.selected.list;
		if(selected[no]){
			selected[no].dan = !selected[no].dan;
		}
	};

	model.prototype.clearDan = function(){//--清空胆
		var self = this,
			maps = self.maps,
			selected = self.selected.list;
		for(var i in selected){
			selected[i].dan = false;
		}
	};

	/**
	 * 选择投注项
	 * @param no    赛事编号
	 * @param game  玩法，例如 "shengfu"
	 * @param key   键值
	 */
	model.prototype.doSelect = function(no, game, key, vm, i){
		var self = this,
			result = self.result.formated.intro || {},
			maxNum = result.maxNum || 0,
			nuNum = result.nuNum || 0,
			selected = self.selected.list,
			maps = self.maps;
		self.isDoselect = true;
		self.clearSelected();
		if(maxNum >= 50 && (!selected[no] || !selected[no][game] || !selected[no][game].contains(key))){
			// vm.showToast("单场比赛最多选择50个投注项。");
			// return;
		}else if(nuNum >= 11 && !selected[no]){
			vm.showToast("最多选择11场比赛。");
			return;
		}
		if(!selected[no]){
			selected[no] = {};
		}
		if(!selected[no][game]){
			selected[no][game] = [];
		}
		i = i || 0;
		if(maps && maps[no] && maps[no].game[game] && maps[no].game[game].peilv && (maps[no].game[game].peilv[key] || maps[no].game[game].peilv[i][key])){
			var peilv = maps[no].game[game].peilv[i]? maps[no].game[game].peilv[i][key]: maps[no].game[game].peilv[key];
			var s = peilv.s;
			var t = key;
			peilv.s = !s;
			selected[no][game].danguan = maps[no].game[game].danguan;//--是否可以单关
			if(!s){
				if(t){
					selected[no][game].push(t)
				}
			}else{
				if(t){
					selected[no][game] = Array.minus(selected[no][game], [t]);//--求二者差集
				}
			}
		}
		// console.log(self.selected);
		self.clearSelected();
		itou.localJson.setJson("__Jingcai_Selected", {data: self.selected});//--保存缓存数据
		self.result.compute();//--计算
		self.getDanList();
		self.hasMoreGame(no);
	};
	model.prototype.getDanList = function(){//--获取设胆列表信息
		var self = this,
			selected = self.selected.list,
			maps = self.maps,
			r = [];
		for(var i in selected){
			var s = selected[i],
				o = {},
				item = maps[i];
			o.no = i;
			o.pankou = item.info.pankou;
			o.hostname = item.team.host.name;
			o.guestname = item.team.guest.name;
			o.list = [];
			for(var m in s){
				if(m != "dan"){
					if(m == "rangqiu"){
						s[m].pankou = item.info.pankou;
					}
					o.list.push(s[m]);
				}
			}
			o.dan = !!s["dan"];
			r.push(o);
		}
		self.danList = r;//console.log(r);
	};
	model.prototype.getDanNum = function(){//--获取胆的数量
		var self = this,
			s = self.selected.list,
			num = 0;
		for(var i in s){
			if(s[i].dan){
				num += 1;
			}
		}
		return num;
	};
	//--是否选择了更多玩法
	model.prototype.hasMoreGame = function(no){
		var self = this,
			s = self.selected.list,
			r = false,
			num = 0,
			maps = ["bifen", "jinqiu", "banquanchang"];
		if(!s[no]){
			r = false;
			num = 0;
		}else{
			var ss = s[no];
			for(var i = 0, len = maps.length; i < len; i++){
				var key = maps[i]
				if(ss[key] && ss[key].length > 0){
					r = true;
					num += 1;
				}
			}
		}
		if(self.maps[no]){
			self.maps[no].info.selectMore = r;
			self.maps[no].info.selectNum = num? "+" + num: null;
		}else{
			return r;
		}
	};
	model.prototype.getBetIds = function(){//--获取选定玩法标识
		var self = this,
			s = self.selected.list,
			maps = self.maps,
			a = [];
		for(var i in s){
			for(var ii in s[i]){
				if(ii != "dan" && maps[i].game[ii].key && s[i][ii].length > 0){
					a.push(maps[i].game[ii].key);
				}
			}
		}
		self.betIds = a;
		return a;
	};
	model.prototype.formatSelectedForOptimize = function(){//--将选中的数据，格式化成奖金优化所需形式
		var self = this,
			selected = self.selected,
			list = selected.list,//--选中列表
			guoguan = selected.guoguan,//--过关方式
			zhushu = self.result.zhushu,//--注数
			changshu = 0,//--場數
			maps = self.maps,
			r = [];
		for(var i in list){//--格式化选中数据，获取主队名称、各选定项赔率、以及让球数
			var o = {},
				item = maps[i],
				a = list[i];
			o.hostname = item.team.host.name;//--主队名
			o.pankou = item.info.pankou;//--让球数
			o.opts = [];//--所有选项
			o.peifulv = {};//--赔付率
			for(var m in a){
				if(m != "dan"){
					var pflv = 0;//--临时数据，用于计算赔付率
					var b = a[m],
						g = item.game[m],
						bei = 1;//--乘数，默认1，让球胜平负时为 -1
					if(m == "rangqiu"){bei = -1}
					for(var x = 0, y = b.length; x < y; x ++){
						var t = b[x];
						var peilv = g.peilv;
						if(m == "bifen"){
							peilv = $.extend({}, peilv[0],  peilv[1],  peilv[2]);
						}
						var peilv = peilv[t].v * bei;//--获取赔率
						o.opts.push([t, peilv, m, i]);//--选项（胜、平、负等）、对应赔率，玩法，对应no
						pflv += 1 / Math.abs(peilv);
					}
					if(pflv > 0){
						o.peifulv[m] = 1 / pflv;//--赔付率
					}
				}
			}
			if(o.opts.length > 0){
				r.push(o);
			}
		}
		changshu = r.length;
		// console.log(r);
		var zuhe = [];
		for(var i = 0, len = guoguan.length; i < len; i ++){//--获得场次组合
			var a = guoguan[i].split("_"),
				l = a[0],
				z = r.combination(l);
			zuhe = zuhe.concat(z);
		}
		console.log(zuhe);

		// var allZuhe = getZuhes([], zuhe[9].slice(0));
		// console.log(allZuhe);
		var allZuhe = [];
		for(var i = 0, len = zuhe.length; i < len; i++){
			allZuhe = allZuhe.concat(getZuhes([], zuhe[i].slice(0)));
		}
		console.log(allZuhe);//document.write(JSON.stringify(allZuhe));

		var data = {
			changshu: changshu,//--场数
			money: self.result.zhushu * selected.beishu * 2,//--总金额
			guoguan: guoguan,//--过关
			type: self.result.formated.intro.type,//--投注方式：混合或单一
			zuhe: allZuhe,//--所有组合
			canHot: guoguan.length == 1 && guoguan[0] == changshu + "_1"//--是否可以博冷博热
		};
		// console.log(guoguan.length == 1, guoguan[0] == changshu + "_1", self.evaluate.min >= self.result.zhushu * 2);

		var r = self.act.getFanganData();
		// console.log(JSON.stringify({data: data, api: r}));return;
		itou.localJson.setJson("__Jingcai_Optimize", {data: data, api: r});//--保存缓存数据
		Gray.$page.loadPage("/jingcai/prizereview/?back=" + window.backurl);

		/**
		 * 递归函数，用来获取所有组合
		 */
		function getZuhes(r, arr){
			var a = arr[0],
				name = a.hostname,
				pankou = a.pankou,
				peifulv = a.peifulv,
				opts = a.opts,
				b = [name, pankou],//--队名、盘口
				c = [];console.log(r,b, opts);
			for(var i = 0, len = opts.length; i < len; i++){
				var d = b.slice(0);
				d[2] = peifulv[opts[i][2]];//--获得赔付率
				d = d.concat(opts[i]);//console.log(d);
				c.push(d);
			}
			var e = [];
			if(r.length == 0){
				r = c;
				for(var i = 0, len = r.length; i < len; i++){
					r[i] = [r[i]];
				}
			}else{
				// console.log(r, c);
				for(var i = 0, len = r.length; i < len; i++){
					for(var ii = 0, l = c.length; ii < l; ii++){//console.log(r[i])
						var f = r[i].slice(0);
						f.push(c[ii].slice(0));
						e.push(f);
					}
				}
				r = e;
			}
			arr.splice(0, 1);
			if(arr.length == 0){
				return r;
			}else{
				return getZuhes(r, arr);
			}
		}
	};

	//--缓存中被选中的更多玩法选项初始化
	model.prototype.initMore = function(){
		var self = this,
			selected = self.selected,
			list = selected.list,
			maps = self.maps,
			deferred = [];
		for(var i in list){
			var item = list[i],
				bifen = item.bifen,//--比分选项
				jinqiu = item.jinqiu,//--总进球选项
				banquanchang = item.banquanchang,//--半全场选项
				it = maps[i],
				betid = it.game.shengfu.key || it.game.rangqiu.key;
			// console.log(i);
			if((bifen && bifen.length > 0) || (jinqiu && jinqiu.length > 0) || (banquanchang && banquanchang.length > 0)){
				var d = self.apis.loadMore({//--获取更多玩法数据
						serial_no: i,
						bet_id: betid
					})
					.then(function(data){//--格式化数据并重载更多玩法
						var y = 0;
						for(var x in data){
							if(x != "token"){
								y = x;
								break;
							}
						}
						var r = $.lottery.jingcai.football.outil.formatItemFromApi(data[y]),
							it = maps[y];
						// r.no = y;
						// console.log(r);
						// console.log(it.data);
						it.data = r;
						it.loadMore();
					});
				deferred.push(d);//--promise对象存入数组
			}
		}
		if(deferred == 0){//--如果缓存中没有赛事选择了更多玩法
			var defer = $.Deferred();
			defer.resolve();
			return defer.promise();
		}else{
			return $.when.apply(null, deferred);//--执行$.when，当所有更多玩法的异步加载完成后，执行后续计算操作
		}
	};

	model.prototype.getMaxMoney = function(){//--获取理论最大奖金
		var self = this,
			result = self.result,
			formated = result.formated,
			selected = self.selected,
			maps = self.maps,
			maxArr = [],
			maxObj = {},
			optArr = [],
			optObj = {};
		if(formated.intro.enough && selected.guoguan.length > 0){//--场数足够并且选择了过关方式
			var list = selected.list;//--赛事选择列表
			//console.log(list);
			//console.log(maps);
			for(var i in list){
				var si = list[i],//--单个赛事的选择项，包括是否为胆
					item = maps[i],//--赛事数据映射
					arr = [],
					odds = {},
					max = 0;//console.log(item);
				if(!item){
					continue;
				}
				var pankou = item.info.pankou;//--盘口
				for(var ii in si){//--循环处理选择项
					var opts = si[ii];//console.log(opts);
					if(itou.outil.is(opts, "Array") && opts.length > 0){
						if(ii == "rangqiu"){//--让球胜平负特殊处理
							arr.push(opts.each(function(v){
								odds[v + "*" + pankou] = item.game[ii].peilv[v].v;//--获取赔率
								return v + "*" + pankou//--拼接数组
							}));
						}else{
							arr.push(opts);//--拼接数组
							if(ii == "bifen"){
								var peilv = item.game[ii].peilv;
								peilv = $.extend({}, peilv[0], peilv[1], peilv[2]);
							}else{
								var peilv = item.game[ii].peilv;
							}
							opts.each(function(v){
								odds[v] = peilv[v].v;//--获取赔率
							});
						}
					}
				}
				//console.log(arr, odds);
				var zh = [];
				for(var m = 1, n = arr.length; m <= n; m ++){
					var _arr = arr.combination(m);
					_arr.each(function(v){
						var __arr = getZuhes([], v.slice(0));
						//console.log(v);
						zh = zh.concat(__arr);
					});
				}
				var _zh = null;
				zh.each(function(v){
					var _odds = getOdds(v);
					if(max < _odds){
						_zh = v;
					}
					max = max > _odds? max: _odds;//console.log(max, _odds, v);
				});
				maxArr.push(max);
				maxObj[i] = max;
				// console.log(_zh);
				var __zh = _zh.each(function(v){
					return v + "$|$" + i;
				});
				optArr.push(__zh);
				optObj[i] = __zh;
			}
			// console.log(maxArr);
			// console.log(optArr);

			var dan = self.result.formated.intro.dan,
				tuo = self.result.formated.intro.tuo,
				allS = dan.concat(tuo);
			if(tuo.length == 0){
				tuo = dan.splice(0);
			}
			var	tLen = tuo.length,
				dLen = dan.length,
				allZH = [],
				allZH1 = [];
			var guoguan = self.selected.guoguan;
			var $guoguan = $.lottery.jingcai.football.$guoguan;
			guoguan.each(function(val){
				var arr = val.split("_"),
					a = arr[0],
					b = arr[1];
				var tZH = tuo.combination(a - dLen);//console.log(tZH);
				var __allZH = [[dan], tZH].getZuhes();
				if(b == 1){
					__allZH.each(function(val){
						allZH.push(val[0].concat(val[1]));
					});
				}else{
					var d_t_Arr = [];
					__allZH.each(function(val){
						var _optArr = val[0].concat(val[1]);
						_optArr = _optArr.each(function(_val){
							return optObj[_val];
						});//console.log(optObj, _optArr);
						var zh = _optArr.getZuhes();
						//console.log(zh);
						zh.each(function(val){
							var _dan = [],
								_tuo = [];
							val.each(function(_val){
								var _arr = _val.split("$|$");
								if(dan.contains(_arr[1])){
									_dan.push(_val);
								}else{
									_tuo.push(_val);
								}
							});
							d_t_Arr.push([_dan, _tuo]);
						});
					});

					// var zh = optArr.getZuhes();
					// console.log(zh);
					var __zh = [];
					d_t_Arr.each(function(val){
						var _dan = val[0],
							_tuo = val[1];
						var _zh = _tuo.combination(a - _dan.length);
						var _zh = [[_dan], _zh].getZuhes();
						_zh = _zh.each(function(_val){
							return _val[0].concat(_val[1]);
						});
						// console.log(_zh);
						__zh = __zh.concat(_zh);
					});
					// console.log(__zh);
					var _mps = $guoguan[a][b];
					// var __allZH = [];
					__zh.each(function(val){
						_mps.each(function(_val){
							if(_val != 1){
								var ___zh = val.combination(_val);
								allZH1 = allZH1.concat(___zh);
							}
						});
					});
				}
			});
			// console.log(allZH);
			var allMoney = 0;
			allZH.each(function(v){
				var m = 1;
				v.each(function(val){
					m *= maxObj[val];//console.log(maxObj[val], val, m);
				});
				allMoney += m * 1;
			});
			// console.log(allZH1);
			allZH1.each(function(v){
				var m = 1;
				v.each(function(val){
					var _arr = val.split("$|$");
					var item = self.maps[_arr[1]];
					if(item){
						var game = item.game;
						switch (true) {
							case _arr[0].has("*")://--让球胜平负
								var opt = _arr[0].split("*");
								var odds = game.rangqiu.peilv[opt[0]].v;
								break;
							case (_arr[0].has(":") || _arr[0].has("其他"))://--比分
								// var odds = game.bifen.peilv[_arr[0]].v;
								if(game.bifen.peilv[0][_arr[0]]){
									var odds = game.bifen.peilv[0][_arr[0]].v;
								}
								if(game.bifen.peilv[1][_arr[0]]){
									var odds = game.bifen.peilv[1][_arr[0]].v;
								}
								if(game.bifen.peilv[2][_arr[0]]){
									var odds = game.bifen.peilv[2][_arr[0]].v;
								}
								break;
							case _arr[0].has("/")://--半全场
								var odds = game.banquanchang.peilv[_arr[0]].v;
								break;
							case (_arr[0].has("球") || _arr[0] == "7+")://--总进球
								var odds = game.jinqiu.peilv[_arr[0]].v;
								break;
							default:
								var odds = game.shengfu.peilv[_arr[0]].v;
								break;
						}
						// console.log(odds, _arr[0]);
						m *= odds;
					}
				});
				allMoney += m * 1;
			});
			// console.log(allMoney * 2);
			return allMoney * 2 * self.selected.beishu;
		}

		/**
		 * 递归函数，用来获取所有组合
		 */
		function getZuhes(r, arr){
			//console.log(arr);
			var a = arr[0],
				c = a.slice(0);//console.log(r,b, opts);
			var e = [];
			if(r.length == 0){
				r = c;
				for(var i = 0, len = r.length; i < len; i++){
					// r[i] = [r[i]];
					if(checnJianZhong([r[i]])){
						e.push([r[i]]);
					}
				}
				r = e;
			}else{
				// console.log(r, c);
				for(var i = 0, len = r.length; i < len; i++){
					for(var ii = 0, l = c.length; ii < l; ii++){//console.log(r[i])
						var f = r[i].slice(0);
						f.push(c[ii]);
						if(checnJianZhong(f)){
							e.push(f);
						}
					}
				}
				r = e;
			}
			arr.splice(0, 1);
			if(arr.length == 0){
				return r;
			}else{
				return getZuhes(r, arr);
			}
		}

		function checnJianZhong(arr){//--判断组合是否可以建忠
			var maps = window.jianzhong.maps,
				_arr = null,
				max = 0,
				r = true;
			for(var i = 0, len = arr.length; i < len; i++){
				var ms = maps[arr[i]];//console.log(arr, arr[i], ms);
				for(var ii = 0; ii < len; ii++){
					if(i != ii){
						var v = arr[ii];
						if(!ms.contains(v)){
							r = false;
							break;
						}
					}
				}
			}
			// console.log(arr,r);
			return r;
		}

		function getOdds(arr){//--获取赔率总和
			var max = 0;
			arr.each(function(v){
				max += odds[v];
			});
			return max;
		}
		
	};

	window.pageLoad = function(){
		var vm = new Vue({
			el: "body",
			data: new model(),
			ready: function(){
				console.debug("jingcai:Vue ready");
				var self = this,
					$data = self.$data;
				var hasOpened = itou.sessionData.getData("__jingcai_hasOpened");
				if(!hasOpened.key){
					$data.showOpenMsg = true;//--显示页面第一次打开时的提示信息，3秒后隐藏
					window.setTimeout(function() {
						$data.showOpenMsg = false;
					}, 3000);
					itou.sessionData.setData("__jingcai_hasOpened", {key: true});
				}
			},
			created: function(){
				var self = this,
					$data = self.$data;
				$data.vm = self;
				//$data.getAdvertising();
				$data.apis.getSearchSaishi()//--获取检索项赛事列表
					.then(function(data){
						if(data.league_list){
							data.league_list.each(function(v){
								$data.searchOpts.saishi.opts.push({t: v, v: v, s: false});
							});
						}
					});
				$data.apis.getResult()//--获取最近几天比赛结果
					.then(function(data){
						var date = new Date();
						for(var i = 0; i < 3; i++){//--计算最近3天，得到第一个有结果的天数
							var d = date.DateAdd("d", i * -1),
								f = d.Dateformat("yyyy-MM-DD"),
								v = data[f];
							var o = {};
								o.v = v;
								o.i = i;
							switch(i){
								case 0:
									o.t = "今日";
									break;
								case 1:
									o.t = "昨日";
									break;
								default:
									o.t = d.Dateformat("mm月dd日");
							}
							if(v > 0){
								$data.helper.resultList.push(o);
							}
						}
					});
				self.doRefresh()//--获取页面列表数据
					.then(function(){
						// itou.timeLine.stamp("Vue-created-doRefresh-ok", "页面数据读取完毕");
					});
			},
			computed: {
				hasSearchOpts: function(){//--计算：是否已经有选中的选择项
					var self = this,
						$data = self.$data,
						search = $data.selected.search;
						// console.log("$data.selected = ", $data.selected);
						// console.log("search = ", search);
					return (search.peilv.length > 0 || search.saishi.length > 0);
				},
				guoguanHtml: function(){
					var self = this,
						$data = self.$data,
						guoguan = $data.selected.guoguan,
						dan = $data.result.formated.intro.dan.length,
						str = "";
					// console.log(guoguan);
					if(guoguan.length == 0){
						str = "选择过关";
					}else{
						str = guohuan[0].replace("_", "串");
						if(!!dan){
							str = str + "(<span class='fontred font12'>胆</span>)"
						}
					}
					return str;
				},
				canOptimize: function(){//--是否支持奖金优化
					var self = this,
						$data = self.$data,
						selected = $data.selected,
						result = $data.result,
						guoguan = selected.guoguan,
						money = result.zhushu * selected.beishu * 2;
					if(!result.formated.intro.Dan.length && guoguan.length > 0 && result.zhushu <= 500 && money <= 100000){
						var r = true;
						for(var i = 0, len = guoguan.length; i < len; i++){
							var a = guoguan[i].split("_");
							if(a[1] != "1"){
								r = false;
								break;
							}
						}
						return r;
					}else{
						return false;
					}
				}
			},
			methods: {
				// back: function(){
				// 	Gray.$page.loadPage("/");
				// },
				close_adv:function(){
					var self = this;
					self.advertising_data.show = false;
					var d = new Date();
					var now_time = d.getTime();
					localStorage.setItem('advertising_time', now_time)
					//itou.localJson.setJson('advertising_time', now_time);
				},
				look_adv_details:function(){
					var self = this,
						$data = self.$data;
					$data.apis.getAdvNum()
						.then(function(result){
							Gray.$page.loadPage(self.advertising_data.dest_url);
						})
				},
				showDays: function(index){//--显示或隐藏某一天的赛事列表
					var self = this,
						$data = self.$data,
						list = $data.list;
					if(list[index]){
						list[index].isShow = !list[index].isShow;
					}
				},
				showSaishiMore: function(key){//--显示或隐藏赛事的更多投注项列表
					var self = this,
						$data = self.$data,
						maps = $data.maps;//console.log(maps[key], maps[key].info);
					if(maps[key] && maps[key].info){
						// maps[key].info.isShow = !maps[key].info.isShow;
						if(window.myDrapload){
							window.myDrapload.isLockUp = true;
							// console.log(window.myDrapload);
						}
						$data.currItem.showMore(key);
					}
				},
				showTopHelp: function(){//--显示右上角帮助信息
					var self = this,
						$data = self.$data,
						helper = $data.helper;
					helper.showTop = !helper.showTop;
				},
				closeTopHelp: function(){//--显示右上角帮助信息
					var self = this,
						$data = self.$data,
						helper = $data.helper;
					helper.showTop = false;
				},
				showRangqiuHelp: function(key){//--显示让球帮助信息
					var self = this,
						$data = self.$data,
						maps = $data.maps,
						helper = $data.helper;
					if(helper.rangqiu.isShow){//--当提示信息显示时，关闭提示信息
						helper.rangqiu.isShow = false;
						return;
					}
					if(!maps[key]){return}
					if(!maps[key].game.rangqiu){return}
					if(!maps[key].game.rangqiu.open){return}//--未受注时不显示提示信息
					if(maps[key] && maps[key].info && maps[key].team){
						var info = maps[key].info,
							team = maps[key].team
							host = team.host.name,
							guest = team.guest.name,
							num = info.pankou;
						helper.rangqiu.info = {
							host: host,
							guest: guest,
							num: num
						};
						helper.rangqiu.isShow = true;
					}
				},
				doSelectSaishi: function(no, game, key, i){//--选择赛事
					var self = this,
						$data = self.$data,
						maps = $data.maps;
					if(maps && maps[no] && maps[no].game && maps[no].game[game] && maps[no].game[game].peilv){
						var peilv = !isFinite(i)? maps[no].game[game].peilv: maps[no].game[game].peilv[i];//console.log(peilv[key]);
						if(isNaN(peilv[key].v)){
							return;
						}
						$data.doSelect(no, game, key, vm, i);
					}
				},
				showSearch: function(){//--显示或隐藏筛选项
					var self = this,
						$data = self.$data,
						searchOpts = $data.searchOpts;
					searchOpts.tempReset();
					searchOpts.formatOpts();
					searchOpts.isShow = !searchOpts.isShow;
				},
				selectSearch: function(type, index){//--选中筛选项
					var self = this,
						$data = self.$data,
						searchOpts = $data.searchOpts;
					searchOpts.doSelectSearch(type, index);
				},
				doSelectAll: function(){//--选中所有赛事筛选项
					var self = this,
						$data = self.$data,
						searchOpts = $data.searchOpts;
					searchOpts.selectAll();
				},
				doUnSelectAll: function(){//--取消选中所有赛事选项
					var self = this,
						$data = self.$data,
						searchOpts = $data.searchOpts;
					searchOpts.unselectAll();
				},
				doRefresh: function(){//--刷新页面，加载数据
					var self = this,
						$data = self.$data;
					$data.list = [];
					$data.maps = {};
					return $data.apis.getList()
						.then(function(data){
							// console.log(data);
							itou.sessionData.setData("__Jingcai_SaishiList", {data: data});
							$data.showBody = true;
							var r = $.lottery.jingcai.football.outil.formatFromApi(data);
							// console.log(r);
							var x = 0;
							for(var i = 0, l = r.length; i < l; i++){
								var d = r[i],
									o = {
										intro: d.t,//--时间、场次等信息
										isShow: d.isShow//--是否展开当天赛事
									},
									items = d.items,
									rs = [];//console.log(o);
								o.items = [];
								$data.list.push(o);
								for(var ii = 0, len = items.length; ii < len; ii++){
									x += 1;
									var it = new item(items[ii], $data);//--赛事实例化
									rs.push(it);//console.log(ii, it);
									if(x % 5 == 0 || ii == len - 1){
										itou.outil.doSetTimeout(o.items, rs, x * 5);
										rs = [];
									}
								}
							}
							
							$data.clearSelected();//---移除已不存在的选择项
						})
						.then(function(){
							return $data.initMore();//--初始化缓存中选中的更多玩法
						})
						.then(function(){
							$data.result.compute();
							$data.getDanList();
						});
				},
				doSearch: function(){//--执行检索
					var self = this,
						$data = self.$data;
					$data.searchOpts.getSelectedFromTemp();//--选择项数据更新
					self.doRefresh();//--执行数据检索
					self.showSearch();
				},
				doSetDan: function(no){//--设胆
					var self = this,
						$data = self.$data,
						s = $data.selected.list,
						f = $data.result.formated,
						danLen = f.intro.dan.length,
						guoguan = $data.result.formatedGuoguan,
						min = $data.result.minDan || 0;//console.log(min);
					if(!s[no].dan && danLen + 1 > min){
						self.showToast("设胆个数不能超过最小过关场数");
						return;
					}
					$data.setDan(no);
					$data.result.compute();
					$data.getDanList();
					itou.localJson.setJson("__Jingcai_Selected", {data: self.selected});//--保存缓存数据
				},
				doOptimize: function(){//--奖金优化
					var self = this,
						$data = self.$data;
					$data.formatSelectedForOptimize();
				},
				gotoMatch: function(item){//--查看战绩分析
					var matchid = item.info.id;
					if(item.team.reversion){
						var msg = "<span class='fontred'>您将要打开的数据页面中，主客场位置与当前投注页相反，</span>投注时请确认主客队位置，一旦提交，我们将按照您的所选选项执行。<br />";
						vm.showMsgBox(msg, "重要提醒", "beforeGotoMatch_close", "确定");
						vm.$on('msgbox_close', function(msg){
							if(msg == "beforeGotoMatch_close"){
								Gray.$page.loadPage("/match/history/?doreset=1&matchid=" + matchid + "&back=" + this.backurl);
							}
						});
					}else{
						Gray.$page.loadPage("/match/history/?doreset=1&matchid=" + matchid + "&back=" + this.backurl);
					}
				},
				doDeleteSelected: function(){
					var self = this,
						$data = self.$data;
					$data.deleteSelected();
				}
			}
		});
		window.myDrapload = $('#dropload-body').dropload({
            scrollArea : window,
            autoLoad: false,
            domUp : {                                                          // 下方DOM
                domClass   : 'dropload-down',
                domLoad    : '<div class="dropload-load"><div><span class="loading"></span>加载中...</div></div>',
				domUpdate  : '<div class="dropload-update">↑松开刷新</div>',
                domNoData  : '<div class="dropload-noData"><div>没有更多数据了</div></div>'
            },
            distance:100,
            loadUpFn: function(me){
                me.lock();
				vm.cacheList = null;
				vm.doDeleteSelected();
                vm.doRefresh()
					.then(function(){
						me.unlock();
					});
                me.resetload();
            }
        });
	};

});
