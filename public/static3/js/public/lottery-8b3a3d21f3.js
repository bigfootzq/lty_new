/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	/**
	 * Created by 赵宇飞 on 2016/8/12.
	 */

	(function($){

		var sport = {//--运动类型编码与名称、计数单位的映射
				"201": ["足球", "球"],//--运动名称、让分计数单位
				"202": ["篮球", "分"],
				"203": ["排球", "局"],
				"204": ["沙滩排球", "局"],
				"205": ["冰球", "球"],
				"206": ["网球", "盘"],
				"207": ["羽毛球", "局"],
				"208": ["水球", "球"],
				"209": ["曲棍球", "球"],
				"210": ["乒乓球", "局"],
				"211": ["手球", "球"],
				"212": ["橄榄球", "分"]
			}

		var Lottery = function(){
			var self = this;

			/**
			 * 从M个不同元素中选N个元素的排列数（区分元素排列先后顺序）
			 * @param m
			 * @param n
			 * @returns 排列数
			 */
			self.A = function(m, n){
				var arr = [];
				for(var i = 0; i < n; i++){
					arr.push(m - i);
				}
				var fun = new Function("return " + arr.join("*"));
				return fun();
			};

			/**
			 * 从M个不同元素中选N个元素的组合数（不区分元素排列先后顺序）
			 * @param m
			 * @param n
			 * @returns {number} 组合数
			 */
			self.C = function(m, n){
				return self.A(m, n) / self.A(n, n);
			};

			/**
			 * 从1到m的数中随机选n个数，返回一个数组
			 * @param m
			 * @param n
			 * @returns {Array.<T>}
			 */
			self.R = function(m, n){
				var arr = [];
				for(var i = 0; i < m; i++){//--生成要选取的数组
					arr.push(i + 1);
				}
				var result = [];
				for(var i = 0; i < n; i++){
					var len = arr.length;
					var random = Math.floor(Math.random() * len);//--取随机下标
					result.push(arr[random]);
					arr.splice(random, 1);//--移除已选的元素
				}
				return result.sort();
			};

			self.select11_5 = new Select11_5(self);//--十一选五玩法对象实例化
			self.jingcai = new jingcai(self);//--竞彩玩法对象实例化函数
		};

		var Select11_5 = function(obj){//--十一选五对象构造函数
			var self = this;
			self.parent = obj;

			var def = {//--十一选五玩法默认设置
				money: 2,//--单注价格
				bonus: 540,//--单注奖金
				lotNum: 5,//--开奖号码数
				selNum: 5//--单注号码数
			};

			//--十一选五不同玩法设置信息
			var $config = {};
			self.$config = $config;
			var $maps = {};
			self.$lottery_type = null;

			/**
			 * 设置不同玩法的配置信息
			 * @param config，json对象，可以包含多种彩种、玩法信息，每种玩法的结构与def相同
			 */
			self.config = function(opts){
				var lottery_type = opts.lottery_type;
				var o = {};
				var config = opts.config;
				var $$config = {};
				for(var i in config){
					$$config[i] = $.extend({}, def, config[i]);
				}
				o.lottery_type = lottery_type;
				o.config = $$config;
				$config[lottery_type.v] = o;
				$maps[lottery_type.map] = o;
			};

			/**
			 * 获取当前页面彩种配置
			 * @url 当前页面url
			 */
			self.getConfig = function(url){//console.log(url, $maps)
				if(!!url){
					for(var i in $maps){
						if(url.has(i)){
							return $maps[i];
						}
					}
				}
				return $maps["bj11x5"];
			};

			/**
			 * 投注数量计算
			 * @param opts = {
				 *  lottery: "BJSYY",//--彩种，在config函数中注册
				 *  game: "r5",//--玩法，在config函数中注册
				 *  selectNum: 11,//--选择数量
				 *  duplex: 2//--胆拖的胆的数量
				 * }
			 */
			self.betNum = function(opts){
				var config = $config[opts.lottery].config;
				var setting = config && config[opts.game]? config[opts.game]: def;
				var m = opts.selectNum - opts.duplex;
				var n = setting.selNum - opts.duplex;
				return self.parent.C(m, n);//--求出所有组合数
			};

			/**
			 * 最大中奖数计算
			 * @param opts = {
				 *  lottery: "BJSYY",//--彩种，在config函数中注册
				 *  game: "r5",//--玩法，在config函数中注册
				 *  selectNum: 11,//--选择数量
				 *  duplex: 2//--胆拖的胆的数量
				 * }
			 */
			self.maxWinNum = function(opts){
				var config = $config[opts.lottery].config;
				var setting = config && config[opts.game]? config[opts.game]: def;
				var lotNum = setting.lotNum,//--开奖号码数
					selum = setting.selNum,//--单注号码数
					selectNum = opts.selectNum,//--选号数量
					danNum = opts.duplex;//--胆数量
				if(selum <= lotNum) {//--任5以及单注号码数比开奖号码数少的玩法
					//--获得最大中奖号码数量；这个数小于等于开奖的号码个数；当选择的号码数量大于开奖号码数量，最大中奖号码个数等于开奖号码的个数
					var baseNum = lotNum >= selectNum ? selectNum : lotNum;
					var m = baseNum - danNum;
					var n = selum - danNum;
					return self.parent.C(m, n);//--计算出所有中奖组合（胆不计在内）
				}else {//--任6、任7、任8
					var num = lotNum > danNum? lotNum: danNum;
					var m = selectNum - num;
					var n = selum - num;console.log(m,n);
					return self.parent.C(m, n);
				}
			};

			/**
			 * 最小中奖数计算
			 * @param opts = {
				 *  lottery: "BJSYY",//--彩种，在config函数中注册
				 *  game: "r5",//--玩法，在config函数中注册
				 *  selectNum: 11,//--选择数量
				 *  duplex: 2//--胆拖的胆的数量
				 * }
			 */
			self.minWinNum = function(opts){
				var config = $config[opts.lottery].config;
				var setting = config && config[opts.game]? config[opts.game]: def;
				var lotNum = setting.lotNum,//--开奖号码数
					selum = setting.selNum,//--单注号码数
					selectNum = opts.selectNum,//--选号数量
					danNum = opts.duplex;//--胆数量
				if(selum <= lotNum) {//--任5以及单注号码数比开奖号码数少的玩法
					//--获得最小中奖号码数量；这个数小于等于开奖的号码个数；当选择的号码数量大于开奖号码数量，最大中奖号码个数等于开奖号码的个数
					// if(){}
					var baseNum = lotNum - (11 - selectNum) >= selum ? lotNum - (11 - selectNum) : selum;
					var m = baseNum - danNum;
					var n = selum - danNum;
					return self.parent.C(m, n);//--计算出所有中奖组合（胆不计在内）
				}else {//--任6、任7、任8
					var num = lotNum > danNum? lotNum: danNum;
					var m = selectNum - num - danNum;
					var n = selum - num - danNum;console.log(m,n);
					if(n > 0){
						return self.parent.C(m, n);
					}else{
						return 1;
					}
				}
			};

			/**
			 * 返回包括 注数、花费、最大中奖注数、最大中奖金额
			 * @param opts = {
				 *  lottery: "BJSYY",//--彩种，在config函数中注册
				 *  game: "r5",//--玩法，在config函数中注册
				 *  selectNum: 11,//--选择数量
				 *  duplex: 2//--胆拖的胆的数量
				 * }
			 */
			self.result = function(opts){//console.log(opts);
				var config = $config[opts.lottery].config;
				var setting = config && config[opts.game]? config[opts.game]: def;
				var money = setting.money,//--单注花费金额
					bonus = setting.bonus//--单注中奖奖金
				var betNum = self.betNum(opts);
				money = money * betNum;
				var maxWinNum = self.maxWinNum(opts);
				bonus = bonus * maxWinNum;
				var minWinNum = self.minWinNum(opts);
				var minBonus = minWinNum * setting.bonus;
				return {
					betNum: betNum,//--需购买注数
					money: money,//--购买彩票话费金额
					maxWinNum: maxWinNum,//--最大中奖数
					bonus: bonus,//--最大奖金
					minWinNum: minWinNum,
					minBonus: minBonus
				};
			};

			/**
			 * 机选号码
			 * @param opts = {
				 *  lottery: "BJSYY",//--彩种，在config函数中注册
				 *  game: "r5"//--玩法，在config函数中注册
				 * }
			 * @returns {Array.<T>} 机选结果，数组
			 */
			self.random = function(opts){
				var config = $config[opts.lottery].config;
				var setting = config && config[opts.game]? config[opts.game]: def;
				// var setting = $config[opts.lottery][opts.game] || def;
				var num = setting.selNum;//--机选号码数
				return self.parent.R(11, num);//--返回机选数组
			};
		};

		var jingcai = function(lottery){//--竞彩对象实例化函数
			var self = this;
			self.parent = lottery;

			var $guoguan = {//--过关与混合过关玩法映射
				"1": {"1": [1]},
				"2": {
					"1": [2],
					"3": [1, 2]
				},
				"3": {
					"1": [3],
					"3": [2],
					"4": [2, 3],
					"6": [1, 2],
					"7": [1, 2, 3]
				},
				"4": {
					"1": [4],
					"4": [3],
					"5": [3, 4],
					"6": [2],
					"10": [1, 2],
					"11": [2, 3, 4],//--4串11混合过关，包含2串1、3串1、4串1，其他混合过关与此类似
					"14": [1, 2, 3],//--4串14混合过关，包含单关、2串1、3串1，如果不可以选择单关，则不在混合过关列表显示
					"15": [1, 2, 3, 4]
				},
				"5": {
					"1": [5],
					"5": [4],
					"6": [4, 5],
					"10": [2],
					"15": [1, 2],
					"16": [3, 4, 5],
					"20": [2, 3],
					"25": [1, 2, 3],
					"26": [2, 3, 4, 5],
					"30": [1, 2, 3, 4],
					"31": [1, 2, 3, 4, 5]
				},
				"6": {
					"1": [6],
					"6": [5],
					"7": [5, 6],
					"15": [2],
					"20": [3],
					"21": [1, 2],
					"22": [4, 5, 6],
					"35": [2, 3],
					"41": [1, 2, 3],
					"42": [3, 4, 5, 6],
					"50": [2, 3, 4],
					"56": [1, 2, 3, 4],
					"57": [2, 3, 4, 5, 6],
					"62": [1, 2, 3, 4, 5],
					"63": [1, 2, 3, 4, 5, 6]
				},
				"7": {
					"1": [7],
					"7": [6],
					"8": [6, 7],
					"21": [5],
					"35": [4],
					"120": [2, 3, 4, 5, 6, 7],
					"127": [1, 2, 3, 4, 5, 6, 7]
				},
				"8": {
					"1": [8],
					"8": [7],
					"9": [7, 8],
					"28": [6],
					"56": [5],
					"70": [4],
					"247": [2, 3, 4, 5, 6, 7, 8],
					"255": [1, 2, 3, 4, 5, 6, 7, 8]
				}
			};

			self.$guoguan = $guoguan;

			//--将赛事列表接口数据格式化成页面呈现所需的数据形式
			self.formatFromApi = function(data){
				var self = this,
					r = [];//console.log(self);
				if(!itou.outil.is(data, "Object")){//--如果返回的data类型不是object（数组也不行），则直接返回空数组
					return r;
				}
				for(var i in data){
					if(i == "token"){continue}
					var k = i.split(/-/),
						d = new Date(k[0], k[1] - 1, k[2]),
						o = {},
						n = 0,
						diff = 0,
						D = data[i];
					o.t = d.Dateformat("mm月dd日 周ww").split(" ");
					o.items = [];
					diff = (new Date()).DateDiff("h", d);//console.log(i, d, diff);
					// diff = Math.abs(diff);
					for(var m in D){
						var item = D[m];
						n += 1;
						o.items.push(self.itemFactory(item));
					}
					o.t.push("共" + n + "场比赛");
					o.isShow = (diff < 0);
					r.push(o);
				}
				return r;
			};
			//--将更多玩法接口返回的数据，处理成页面呈现所需的形式
			self.formatItemFromApi = function(item){
				return self.itemFactory(item);
			};
			//--工厂函数，返回item数据的json对象
			self.itemFactory = function(item, itemMoreFactory){
				var d = {};
				d.no = item.serial_no || ""; //--编号
				d.id = item.match_id || 0; //--唯一标识
				d.saishi = item.league_name || "";    //--所属赛事
				d.saishiColor = item.league_color && item.league_color[0]? item.league_color[0]: "#666";  //--所属赛事背景颜色
				d.fontColor = item.league_color && item.league_color[1]? item.league_color[1]: "#000";  //--所属赛事字体颜色
				d.endTime = item.bet_time;   //--投注结束时间
				d.bisaiTime = item.match_time;//--比赛时间
				d.sort = item.sort;//--排列顺序
				d.reversion = item.reversion;//--主客队名称是否逆转
				d.hostName = item.host_name_s || "";  //--主队名称
				d.hostName = (d.hostName + "").left(5);
				d.hostRank = item.rank && item.rank["1"] && item.rank["1"].rank? item.rank["1"].rank: "";  //--主队排名
				d.hostSaishi = item.rank && item.rank["1"] && item.rank["1"].rank_league? item.rank["1"].rank_league: "";  //--主队赛事
				d.guestName = item.guest_name_s || ""; //--客队名称
				d.guestName = (d.guestName + "").left(5);
				d.guestRank = item.rank && item.rank["2"] && item.rank["2"].rank? item.rank["2"].rank: ""; //--客队排名
				d.guestSaishi = item.rank && item.rank["2"] && item.rank["2"].rank_league? item.rank["2"].rank_league: ""; //--客队赛事
				return d;
			};

			/**
			 * 计算注数
			 * @param guoguan   过关类型数组，单关 = 1，2串1 = 2，3串1 = 3 …………
			 * @returns {number} 总的注数
			 * 注意：复合过关设胆，例如7场比赛5_26过关，设胆意思是7取5求组合数时，考虑胆的影响，而5取包含串法时不考虑胆的影响
			 */
			self.getZhushu = function(data){
				var guoguan = data.guoguan,
					selectNum = data.selectNum,
					dan = data.dan,//--设为胆的赛事的各自选项数
					tuo = data.tuo,//--拖的赛事的各自选项数
					Dan = data.Dan,//--设为胆的赛事的各自选项组合
					Tuo = data.Tuo,//--拖的赛事的各自选项组合
					danLen = dan.length,//--胆的数量
					num = 0;
					// console.log(guoguan, selectNum,dan, tuo, Dan, Tuo, danLen);
				var danZuhe = dan.reduce(function(y1, y2){return y1 * y2}, 1);//--胆组合数
				// console.log(danZuhe)
				// console.log(Dan, Tuo);
				for(var i = 0, len = guoguan.length; i < len; i++){
					var a = guoguan[i].split("_");
					if(a.length == 2){
						var a0 = a[0], //--关数
							a1 = a[1], //--玩法
							b = $guoguan[a0][a1],//--可选过关玩法
							c = tuo.combination(a0 - danLen),//--对应关数的组合
							cc = Tuo.combination(a0 - danLen);
							// console.log(b,c);
						if(c.length > 0){
							for(var m = 0, n = c.length; m < n; m ++){
								var cm = c[m];
								var ccm = Dan.concat(cc[m]);
								for(var x = 0, y = b.length; x < y; x ++){
									if(a1 == 1){
										var d = cm.combination(b[x] - danLen);
										num += danZuhe * d.reduce(function(X, Y){//--计算所有组合的积之和
											return X + Y.reduce(function(y1, y2){return y1 * y2}, 1);
										}, 0);
									}else{
										var zh = getZuhe(ccm);//console.log(zh);
										for(var o = 0, p = zh.length; o < p; o ++){
											var d = zh[o].combination(b[x]);//console.log(d);//--todo:继续计算
											num += d.reduce(function(X, Y){//--计算所有组合的积之和
												 return X + Y.reduce(function(y1, y2){return y1 * y2}, 1);
											}, 0);
										}
									}
								}
							}
						}else{
							if(a1 == 1){
								num += 1 * danZuhe;
							}else{
								for(var x = 0, y = b.length; x < y; x ++){
									var zh = getZuhe(Dan);//console.log(zh);
									for(var o = 0, p = zh.length; o < p; o ++){
										var d = zh[o].combination(b[x]);//console.log(d);//--todo:继续计算
										num += d.reduce(function(X, Y){//--计算所有组合的积之和
												return X + Y.reduce(function(y1, y2){return y1 * y2}, 1);
										}, 0);
									}
								}
							}
						}
					}
				}
				function getZuhe(arr){//--递归函数，计算组合过关的住数
					var r = 0,
						a = [];
					zs("", arr);
					function zs(str, arr){
						if(arr[0]){
							var item = arr[0];
							var arr1 = arr.slice(1);
							for(var i = 0, len = item.length; i < len; i++){
								var str1 = str? str + "*" + item[i]: item[i];//console.log(str1);
								zs(str1, arr1);
							}
						}else{
							a.push(str.split("*"));
						}
					}
					// console.log(r);
					return a;
				}
				return num;
			};

			self.football = new jingcaiFootball(self);//--竞彩足球对象实例化
			self.basketball = new jingcaiBasketball(self);//--竞彩篮球对象实例化
		};
		

		var jingcaiFootball = function(jingcai){//--竞彩足球对象构造函数
			var self = this;
			self.parent = jingcai;

			var $opts = {
				maxGuan: {//--最大串关数'
					SportteryNWDL: 8,//--胜平负
					SportteryWDL: 8,//--让球胜平负
					SportteryScore: 4,//--比分
					SportteryTotalGoals: 6,//--进球数
					SportteryHalfFull: 4//--半全场
				},
				maps: {//--默认映射关系
					SportteryNWDL: "shengfu",//--胜平负
					SportteryWDL: "rangqiu",//--让球胜平负
					SportteryScore: "bifen",//--比分
					SportteryTotalGoals: "jinqiu",//--进球数
					SportteryHalfFull: "banquanchang",//--半全场

					WDL: "WDL",//--让球胜平负
					Score: "Score",//--比分
					TotalGoals: "TotalGoals",//--进球数
					HalfFull: "HalfFull",//--半全场
				}
			};

			var $selected = null;
			var $config = {};
			self.$maps = $opts.maps;
			self.$guoguan = jingcai.$guoguan;
			var $guoguan = jingcai.$guoguan

			/**
			 * 竞彩足球配置
			 * @param config 类型json，包含胜平负、让球胜平负、比分、进球数、半全场等玩法 单一和混合投注对应的编号
			 * config = {
			 *      SportteryNWDL: {//--胜平负玩法对应编码
			 *          single: {"胜": "3", "平": "1", "负": "0"},//--单一投注对应编码
			 *          mixed: {"胜": "16", "平": "15", "负": "14"}//--混合投注对应编码
			 *      }
			 *      ………………………………
			 * }
			 */
			self.config = function(config){
				$config = config;
				self.$config = $config;
			};
			/**
			 * 自定义玩法映射关系
			 * @param opts 类型：json， 自定义json中选项的值
			 * opts = {
			 *      SportteryNWDL: "shengfu",//--胜平负
			 *      SportteryWDL: "rangqiu",//--让球胜平负
			 *      SportteryScore: "bifen",//--比分
			 *      SportteryTotalGoals: "jinqiu",//--进球数
			 *      SportteryHalfFull: "banquanchang",//--半全场
			 * }
			 */
			self.maps = function(opts){
				var m = mapsReversal(opts);
				if(m.length != opts.length){
					console.error("映射关系的值不可以重复");
					return;
				}
				var maps = $opts.maps,
					mc = mapsCopy(maps);
				for(var i in opts){
					if(mc[i]){
						$opts.maps[i] = opts[i];
					}
				}
				var m = mapsReversal(mc);
				if(m.length != mc.length){
					console.error("自定义映射关系的值与原映射关系的之冲突，生效后出现相同的值");
					return;
				}else{
					$opts.maps = mc;
				}
			};
			function mapsReversal(maps){//--将映射关系的键与值颠倒
				var m = {};
				for(var i in maps){
					m[maps[i]] = i;
				}
				return m;
			}
			function mapsCopy(maps){//--映射关系拷贝
				var m = {};
				for(var i in maps){
					m[i] = maps[i];
				}
				return m;
			}

			self.outil = new outil();//--竞彩足球工具对象实例化

			function outil(){//--工具对象构造函数
				var self = this;
			};
			outil.prototype.mapsReversal = mapsReversal;
			outil.prototype.mapsCopy = mapsCopy;
			/**
			编码singl类型，转为mixed类型
			参数：game，玩法；code，单一类型编码
			 */
			outil.prototype.singleToMixed = function(game, code){
				try {
					var r = null,
						g = $config[game],
						single = g.single,
						mixed = g.mixed;
					for(var i in single){
						if(single[i] == code){
							r = mixed[i];
							break;
						}
					}
					r = r || null;
					return r;
				} catch (error) {
					return null;
				}
			};
			/**
			 *将选择的选项格式化成对应的编码
			 * @param item 某赛事的选项
			 * @param item 某赛事的选项页面数据，用来提取赔率
			 * @param type  是否是混合投注
			 * @returns {*} 返回对应的编码对象
			 */
			outil.prototype.formatItem = function(item, itemOld, type){
				var self = this,
					t = {},
					v = {},
					r = {};//--返回结果
				if(!type){
					return null;
				}
				// console.log(item, itemOld, type)
				for(var i in item){
					if($config[i] && itemOld.game[$opts.maps[i]]){
						t[i] = $config[i];
						// v[i] = itemOld.game[$opts.maps[i]].peilv;
						var vi = itemOld.game[$opts.maps[i]].peilv;
						if(itou.outil.is(vi, "Array")){
							var vii = {};
							vi.forEach(function(v){
								vii = $.extend({}, vii, v);
							});
							v[i] = vii;
						}else{
							v[i] = vi;
						}
					}
				}
				// console.log(t, v, itemOld);
				for(var i in t){
					var opt = t[i][type],
						s = item[i],
						o = [];
					for(var m = 0, n = s.length; m < n; m++){//--追加编号与赔率
						// console.log(s[m],opt[s[m]]);
						if(opt[s[m]]){o.push(opt[s[m]] + ":" + v[i][s[m]].v)}
					}
					r[i] = o;
				}
				return r;
			};
			/**
			 * 投注选择项格式化方法
			 * 将页面的页面的投注选择数据，格式化成接口所需的数据形式
			 * @param selected
			 * @returns {{}}
			 */
			outil.prototype.formatSelected = function(selected, dataMaps){
				var self = this,
					r = {},//--返回结果
					s = {},//--格式化后的投注信息
					sMixed = {},//--格式化后的混合投注信息，奖金评测接口需求
					sSingle = {},//--//--格式化后的单一投注信息
					t = {},//--一些其他重要信息
					maps = $opts.maps
					m = mapsReversal(maps);//--键与值颠倒的映射关系
				t.danguan = true;//--是否可以单关
				t.num = {};//--每种玩法的总计选择数
				t.nuNum = 0;//--赛事数量
				t.allNum = 0;//--所有选择数
				t.maxNum = 0;//--单场比赛最多的选项数
				t.allType = {};//--所有已选的玩法
				t.dan = [];
				t.tuo = [];
				t.pankou = {};
				t.selectNum = [];//--每个赛事所选的选项数，用于计算所有组合
				t.selectDan = [];//--每个赛事所选的胆选项数，用于计算所有组合
				t.selectTuo = [];//--每个赛事所选的拖选项数，用于计算所有组合
				t.Dan = [];//--每个赛事所选的胆选项组合，用于计算所有组合
				t.Tuo = [];//--每个赛事所选的拖选项组合，用于计算所有组合
				for(var i in selected){
					var item = selected[i];
					var n = 0;
					var N = [];
					var si = {};
					t.tuo.push(i);
					t.pankou[i] = dataMaps[i].info.pankou;
					for(var ii in item){//console.log(item);
						var hasDan = false;
						if(ii != "dan"){
							if(!item[ii] || item[ii].length == 0){continue}
							if(t.danguan){t.danguan = !!dataMaps[i].game[ii].danguan}//console.log(dataMaps[i].game[ii],item[ii]);
							if(!t.allType[ii]){t.allType[ii] = {num: 0}}//console.log(ii,t.allType[ii]);
							if(!m[ii]){
								console.error( ii + "的映射关系不存在，请提前预设");
								break;
							}else{
								var len = item[ii].length;
								if(len > 0) {
									si[m[ii]] = item[ii];
									n += len;
									N.push(len);
									t.allType[ii].num += len;
									if (t.num[m[ii]]) {
										t.num[m[ii]] += len;
									} else {
										t.num[m[ii]] = len;
									}
								}else{
									delete item[ii];
								}
							}
						}else{
							if(item[ii]){t.dan.push(i);hasDan = true;}
						}
					}
					if(n > 0){
						s[i] = si;
						t.nuNum += 1;
						t.allNum += n;
						t.selectNum.push(n);
						if(hasDan){
							t.selectDan.push(n);
							t.Dan.push(N);
						}else{
							t.selectTuo.push(n);
							t.Tuo.push(N);
						}
						self.maxNum = self.maxNum >= n? self.maxNum: n;//--获取最大的单场比赛选项数
					}else{
						delete selected[i];//console.log(i);
					}
				}
				t.tuo = Array.minus(t.tuo, t.dan);
				var n = 0;
				for(var i in t.num){
					if(t.num[i] > 0){ n += 1;}
				}
				for(var i in t.allType){
					if(t.allType[i].num == 0){delete t.allType[i]}
				}
				t.type = n == 0? null: (n == 1? "single": "mixed");//--投注类型（单一或混合）
				for(var i in s){
					if(i != "danguan"){
						sSingle[i] = self.formatItem(s[i], dataMaps[i], "single");//--格式化成指定编号
						sMixed[i] = self.formatItem(s[i], dataMaps[i], "mixed");
					}
				}
				// console.log(t.nuNum,t.danguan)
				if(t.nuNum == 0){
					t.text = "至少选择一场比赛";
					t.enough = false;//--是否已经足够开始投注
				}else if(t.nuNum == 1 && t.danguan == false){
					t.text = "至少选择二场比赛";
					t.enough = false;
				}else{
					t.text = "";
					t.enough = true;
				}
				r.intro = t;
				r.mixed = sMixed;
				r.single = sSingle;
				r.selected = r[t.type];
				$selected = r;//console.log(r);
				return r;
			};

			/**
			 * 计算过关数量
			 * @param formatedSelect 经过formatSelected函数处理的选择项
			 * @returns {Array} 允许的过关方式
			 */
			outil.prototype.getGuoguan = function(formatedSelect){
				var self = this,
					ms = $opts.maps,
					sm = mapsReversal(ms),
					allType = formatedSelect.intro.allType,//--所有玩法
					nuNum = formatedSelect.intro.nuNum,//--赛事数量
					danguan = formatedSelect.intro.danguan,//--是否可以单关
					min = nuNum;//--过关数量
				// console.log(formatedSelect, allType, nuNum, danguan, min);
				for(var i in allType){//--获得最大过关数
					// console.log(i);
					if(!min || $opts.maxGuan[sm[i]] < min){
						min = $opts.maxGuan[sm[i]];
					}
				}
				var a = [];
				for(var i = 2; i <= min; i++){
					a.push(i);
				}
				if(danguan){//--允许单管
					a.splice(0, 0, [1]);
				}
				return a;
			};
			/**
			 * 根据过关数据，获取混合过关列表
			 * @param guoguan   过关方式数组，为getGuoguan函数的返回值
			 * @returns {Array} 混合过关方式，形式["2_3", "3_4", …………]
			 */
			outil.prototype.getGuoguanMore = function(guoguan){
				var self = this,
					danguan = false,//--是否允许单关
					r = [];//--混合过关选项结果
				if(guoguan[0] == "1"){danguan = true}
				for(var i = 0, len = guoguan.length; i < len; i++){
					if(guoguan[i] != "1"){
						var a = guoguan[i],
							opts = $guoguan[a];//console.log(a);
						for(var ii in opts){
							if(ii != "1"){
								// if(danguan || opts[ii][0] != "1"){
								if(opts[ii][0] != "1"){
									r.push(a + "_" + ii);
								}
							}
						}
					}
				}
				return r;
			};
			/**
			 * 将选择的过关方式格式化,用来获取最短的串法
			 * @param guoguan   选择地过关方式，包括混合过关，形式：["2_1", "3_4", "4_10", …………]
			 * @returns {Array} 数组，格式化后的过关串法，单关 = 1，2串1 = 2，3串1 = 3 …………
			 */
			outil.prototype.formatGuoguan = function(guoguan){
				var self = this,
					r = [];
				for(var i = 0, len = guoguan.length; i < len; i++){
					var a = guoguan[i].split("_");
					if(a.length == 2){
						r = r.concat($guoguan[a[0]][a[1]]);
					}
				}
				return r.uniquelize().sort();//--将结果唯一化
			};
			/**
			 * 计算注数
			 * @param guoguan   过关类型数组，单关 = 1，2串1 = 2，3串1 = 3 …………
			 * @returns {number} 总的注数
			 * 注意：复合过关设胆，例如7场比赛5_26过关，设胆意思是7取5求组合数时，考虑胆的影响，而5取包含串法时不考虑胆的影响
			 */
			outil.prototype.getZhushu = function(guoguan){//console.log(guoguan);
				var self = this,
					selectNum = $selected.intro.selectNum,
					dan = $selected.intro.selectDan,//--设为胆的赛事的各自选项数
					tuo = $selected.intro.selectTuo,//--拖的赛事的各自选项数
					Dan = $selected.intro.Dan,//--设为胆的赛事的各自选项组合
					Tuo = $selected.intro.Tuo;//--拖的赛事的各自选项组合
				var data = {
					guoguan: guoguan,
					selectNum: selectNum,
					dan: dan,
					tuo: tuo,
					Dan: Dan,
					Tuo: Tuo
				};
				var num = jingcai.getZhushu(data);
				return num;
			};
			/**
			 * 格式化页面选择信息，为奖金测评接口提供数据
			 * @param data
			 * @returns {{}}
			 */
			outil.prototype.formatSelectedToApi = function(data){
				var self = this,
					t = $selected.intro,
					// s = $selected.selected,
					r = {};
					// console.log(t, $selected);
				r.passTypes = data.passTypes;//--过关方式
				r.multiple = data.multiple;//--倍数
				r.minRequiredSetCount = t.dan.length || 0;//--最小胆，用于模糊定胆
				r.maxRequiredSetCount = t.dan.length || 0;//--最大胆，用于模糊定胆
				// r.lotteryNo = data.lotteryNo;//--期号
				r.requiredIndex = "";//--胆列表
				r.optionalIndex = "";//--拖列表
				var type = data.type || t.type;
				var s = $selected[type];
				if(type == "single"){
					for(var i in t.num){break;}
					var lotteryType = i;//--单一过关
				}else{
					var lotteryType = "SportterySoccerMix";//--混合过关
				}
				r.lotteryType = lotteryType;
				r.matches = [];
				var dan = [],
					tuo = [];
				for(var i in s){
					var o = {
						sn: i,//--场次
						prized: false,//--是否已开奖
						hitSet: ""//--命中选项
					};
					var spArray = [],
						rqArray = "";
					for(var ii in s[i]){
						spArray = spArray.concat(s[i][ii]);//console.debug(s[i], ii,s[i][ii]);
						if(ii == "SportteryWDL" && !rqArray){
							rqArray = "A:" + t.pankou[i];
						}
						// console.error(spArray,spArray);
					}
					o.spArray = spArray.join(";");
					o.rqArray = rqArray;
					r.matches.push(o);
					if(t.dan.contains(i)){
						dan.push(r.matches.length - 1);
					}else{
						tuo.push(r.matches.length - 1);
					}
					r.requiredIndex = dan.join(",");
					r.optionalIndex = tuo.join(",");
				}//console.log(r);
				return r;
			};

			/**
			 * 格式化页面选择信息，为方案接口提供数据
			 * @param data
			 * @returns {{}}
			 */
			outil.prototype.formatSelectedToApiFangan = function(data){
				var self = this,
					t = $selected.intro,
					s = $selected.selected,
					r = {};
				r.pass_type = data.passTypes;//--过关方式
				r.count = data.count || 1;//--总注数
				r.money = r.count * 2;//--总金额
				r.m_ext = data.m_ext || "";//--投注方式选项
				r.manner = data.manner || 0;//--投注方式
				r.bet_seq = data.bet_seq;//--bet_id序列
				if(t.type == "single"){
					for(var i in t.num){break;}
					var lotteryType = i;//--单一过关
					var wager_type = "Common";
				}else{
					var lotteryType = "SportterySoccerMix";//--混合过关
					var wager_type = "Combin";
				}
				r.lottery_type = lotteryType;
				r.wager_type = wager_type;
				r.wager_store = [];
				var o = {
					wt: r.wager_type,
					pt: r.pass_type,
					c: r.count / data.multiple,
					m: r.money / data.multiple,
					multiple: data.multiple,
					wager: [],
					abs: data.dan.join(",")
				};
				for(var i in s){
					var spArray = [i, []];
					for(var ii in s[i]){
						if(s[i][ii]){
							var a = s[i][ii];
							for(var x = 0, y = a.length; x < y; x++ ){
								a[x] = a[x].split(":")[0];
							}
							spArray[1] = spArray[1].concat(a);
						}
					}
					spArray[1] = spArray[1].join(",");
					spArray = spArray.join(":");
					o.wager.push(spArray);
				}
				o.wager = o.wager.join(";");
				r.wager_store.push(o);
				// console.log(r);
				return r;
			};

			outil.prototype.formatListToOptimize = function(list, type, wt){//--格式化优化数据，使之可以提供到做单api
				var self = this,
					maps = $opts.maps,
					maps1 = mapsReversal(maps),
					r = [],
					obj = {};
				for(var i = 0, len = list.length; i < len; i ++){
					var o = {wt: wt, c: 1},
						item = list[i];
					o.pt = item.guoguan.replace("串", "_");
					o.m = item.zhushu * 2;
					o.multiple = item.zhushu;
					o.wager = [];
					var t = item.text;
					for(var x = 0, y = t.length; x < y; x ++){
						var it = t[x],
							no = it[2],
							game = it[3],//--玩法
							opt = it[1];//--选项
						try{
							var no1 = $config[maps1[game]][type][opt];
						}catch(e){
							var no1 = "";
							console.error(e.message);
						}
						o.wager.push(no + ':' + no1);
					}
					o.wager = o.wager.join(";");
					// r.push(o);
					obj[i] = o;
				}
				// return r;
				return obj;
			};

			//--将赛事列表接口数据格式化成页面呈现所需的数据形式
			outil.prototype.formatFromApi = jingcai.formatFromApi;
			//--将更多玩法接口返回的数据，处理成页面呈现所需的形式
			outil.prototype.formatItemFromApi = function(item){
				var self = this;
				return self.itemFactory(item);
			};

			outil.prototype.itemFactory = function(item){
				var d = jingcai.itemFactory(item);//console.log(item); 
				if(itemMoreFactory){
					var it = new itemMoreFactory(item);
					d = $.extend({}, d, it);
				}
				return d;
			};
			/**
			 * 工厂函数，处理更多玩法
			 * @param isMore 布尔值。 如果为true，则返回更多玩法对象，否则返回所有玩法对象
			 */
			function itemMoreFactory(item, isMore){
				var d = {},
					maps = $opts.maps,
					more = ["SportteryScore", "SportteryTotalGoals", "SportteryHalfFull"];//--更多选项包含的玩法
				for(var i in $config){
	                try {
	                    if(isMore && !more.contains(i)){//--不属于更多的玩法则跳出本次循环
	                        continue;
	                    }
	                    var a = item.list[i],
	                        b = $config[i].single,//--编码映射关系
	                        c = mapsReversal(b),
	                        e = {};//console.log(i,item);
	                    d[maps[i] + "Danguan"] = (a? a.is_single == "1": false);
	                    d[maps[i] + "Key"] = a? a.bet_id: "";
	                    if(i == "SportteryWDL"){
	                        var pankou = a && a.boundary? (a.boundary > 0? "+" + a.boundary: a.boundary): 0;
	                        d[maps[i] + "Num"] = pankou;
	                        d.pankou = pankou;//--盘口，即让球数
	                    }
	                    var open = !!a;//--是否守住
	                    for(var ii in c){
	                        var x = a && a.odds[ii]? (a.odds[ii] * 1 || 0) : "未受注";//--取得赔率与选项的映射关系
							x = (x == 0? "未受注": x);
	                        if(isNaN(x)){open = false}
	                        e[c[ii]] = x;
	                    }
	                    d[maps[i] + "Open"] = open;//--是否守住
	                    d[maps[i]] = e;
	                }
	                catch(e){
	                    console.log('exception here...');
	                }
				}
				return d;
			}

			// outil.prototype.formateSelectedForDan = function(selected){};

			//--格式化方案详情页面返回数据
			outil.prototype.formatDetailData = function(data){
				var match_list = data.match_list,//--赛事列表
					wager = data.wagers[0].wager,//--投注列表
					abs = data.wagers[0].abs || "",//--投注列表
					type = data.type;//--single 或 mixed,单一或混合投注
				abs = abs.split(",");
				var wg = {}, r = [];
				var weekDay = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
				wager = wager.split(";");
				wager.each(function(v){
					var val = v.split(":");
					wg[val[0]] = val[1].split(",");
					return v;
				});
				for(var i in match_list){
					var item = match_list[i],
						o = {};
					o.no = i;
					o.id = item.match_id;
					o.intro = {
						id: item.match_id,
						no: weekDay[(i + "").left(1) - 1] + (i + "").right((i + "").length - 1),//--日期
						hasDan: abs.contains(i),//--是否为胆
						saishi: item.league_name,//--赛事
						time: item.match_time? (item.match_time).Dateformat("mm/dd HH:NN"): "",//--比赛时间
						hostName: item.host_name_s,//--主队名称
						guestName: item.guest_name_s,//--客队名称
						bifen: item.is_prize == "1"? item.host_goals + ':' + item.guest_goals: "VS",//--最终比分
						isKaijiang: item.is_prize == "1",//--是否开奖
						isDelay: false,//--是否延期
						sport: sport[item.sport_type] || []
					};
					if(item.sport_type && o.intro.sport[0] && data.lottery_type == "WL"){
						o.intro.no = i + "-" + o.intro.sport[0]
					}else if(item.sport_type && o.intro.sport[0]){
						o.intro.no = i;
					}
					o.list = {};
					var list = item.list;
					if(!list){
						continue;
					}
					for(var x in $config){
						if(list[x]){
							var ob = {};
							var odds = type == "single"? list[x].odds: list[x].odds_mix,
								maps = $config[x][type],
								mapsR = mapsReversal(maps);//console.log(mapsR);
							ob.hasPankou = (x == "SportteryWDL" || x == "WDL");//--是否有盘口
							ob.pankou = list[x].boundary;//--盘口
							ob.r = type == "single"? mapsR[list[x].lottery_result]: mapsR[list[x].lottery_result_mix];//--比赛结果
							// if(["WDL", "Score", "HalfFull", "TotalGoals", "WL"].indexOf(x) != -1){
								ob.rOdds = list[x].odds_result;//--单场终赔
							// }
							// console.log(type, mapsR[list[x].lottery_result], mapsR[list[x].lottery_result_mix]);
							// console.log(ob.r, mapsR, list[x].lottery_result)
							ob.opts = [];
							if(list[x].lottery_result == "Delay"){
								o.intro.bifen = "延期";
								o.intro.isDelay = true;                        
							}
							// if(x == "SportteryNWDL" || x == "SportteryWDL"){
								// console.log(maps)
								for(var y in maps){
									var obj = {};
									obj.v = y;//--选项名
									obj.p = odds[maps[y]];//--赔率
									obj.s = wg[i].contains(maps[y]);//--是否选中
									if(obj.s && ob.r && ob.r == obj.v){//--中奖
										obj.w = "win";
									}else if(obj.s && ob.r && ob.r != obj.v){//--未中奖
										obj.w = "lose";
									}else if(obj.s && !ob.r){//--选中 未开奖
										obj.w = "checked";
									}else if(!obj.s && ob.r && ob.r == obj.v){//--未选中 浆果
										obj.w = "result";
									}else{//--未选中
										obj.w = "unchecked";
									}
									if(x == "SportteryNWDL" || x == "SportteryWDL" || x == "WDL" || x == "WL" || obj.s){
										ob.opts.push(obj);
									}
								}
							// }else{
							//     for(var y in odds){
							//         var obj = {};
							//         obj.v = mapsR[y];//--选项名
							//         obj.p = odds[y];//--赔率
							//         obj.s = true;//--是否选中
							//         ob.opts.push(obj);
							//     }
							// }
							o.list[x] = ob;
						}
					}
					r.push(o);
				}
				console.log(r);
				return r;
			};

		};

		var jingcaiBasketball = function(jingcai){
	        var self = this;
	        self.parent = jingcai;
	        self.$config = null;
			self.maps = {};

	        self.config = function(config){//--页面参数加载
	            var maps = {},
					maps1 = {},
					maps2 = {//--胜分差主胜和客胜的code
						host: [],
						guest:[]
					};
				for(x in config){//--值映射颠倒
	                var game = config[x];
	                for(var y in game){
	                    var opts = game[y];
	                    for(var z in opts){
	                        opts[opts[z]] = z;
							if(y == "mixed"){
								maps[opts[z]] = x;
								maps1[opts[z]] = game.single[z];
							}
							if(z.has("*h")){
								maps2.host.push(game.mixed[z]);
							}else if(z.has("*g")){
								maps2.guest.push(game.mixed[z]);
							}
	                    }
	                }
	            }
				maps2.guest = maps2.guest.uniquelize();
				maps2.host = maps2.host.uniquelize();
				self.maps.codeToGame = maps;//--mixed编码与sgame映射关系
				self.maps.mixedToSingle = maps1;//--mixed编码与single编码映射关系
				self.maps.SportteryWS = maps2;//--SportteryWS玩法主胜和客胜的mixed编码
	            self.$config = config;
				 console.log(self.$config, self.maps);
				// console.log(JSON.stringify(self.maps));
				// console.log(JSON.stringify(self.$config)); 
	        };

	        self.gameModel = function(){//--页面赛事选项数据原型
	            function game(item){
	                var self = this;
	                self.parent = item;
					// self.jingcai = jingcai;//--竞彩实例对象
	                self.SportteryWL = null;//--竞彩篮球胜负
	                self.SportteryHWL = null;//--竞彩篮球让胜负
	                self.SportteryBS = null;//--竞彩篮球大小分
	                self.SportteryWS = null;//--竞彩篮球主胜比分
	            }
	            game.prototype.baseModel = {
	                SportteryWL: ["客胜", "主胜"],//--竞彩篮球胜负
	                SportteryHWL: ["客胜", "主胜"],//--竞彩篮球让胜负
	                SportteryBS: ["大分", "小分"],//--竞彩篮球大小分
	                SportteryWS: {//--竞彩篮球主胜比分
	                    host: ["1-5*h", "6-10*h", "11-15*h", "16-20*h", "21-25*h", "26+*h"],
	                    guest: ["1-5*g", "6-10*g", "11-15*g", "16-20*g", "21-25*g", "26+*g"]
	                }
	            };
	            game.prototype.dataModel = {//--单独玩法数据原型
	                id: null,
	                danguan: false,
	                pankou: null,
	                peilv: null
	            };
	            game.prototype.optsModel = {t: null, v: null, s: false};//--单独选项数据原型
	            game.prototype.lotteryConfig = self.$config;//--竞彩篮球配置
				game.prototype.getPeilv = function(code){//--根据选项编码获得赔率
					// console.log(jingcai);
					var maps = self.maps.codeToGame,
						g = maps[code],
						g = this[g],
						peilv = 0;
					if(g.peilv.host && g.peilv.host[code]){
						peilv = g.peilv.host[code].v;
					}else if(g.peilv.guest && g.peilv.guest[code]){
						peilv = g.peilv.guest[code].v;
					}else if(g.peilv[code]){
						peilv = g.peilv[code].v;
					}else{
						peilv = 0;
					}
					return peilv;
				};
	            /**
	             * 数据初始化
	             * @param data 为列表接口返回数据的单行数据
	             * @param selected 为该赛事已选的选项
	             */
	            game.prototype.init = function(data, selected){//console.log(data, selected);
	                data = data || this.parent.data;
					var self = this,
	                    selected = selected || [],
	                    list = data.list,
	                    config = self.lotteryConfig,
	                    model = $.extend({}, self.dataModel),
	                    opts = $.extend({}, self.optsModel),
	                    base = self.baseModel,
	                    item = self.parent;
	                var hasBetid = item && item.info && item.info.betid && itou.outil.is(item.info.betid, "Array");
	                if(hasBetid){
	                    item.info.betid = [];
	                }
	                for(var i in config){//console.log(i, config[i] && base[i]);
	                    // if(config[i] && base[i]){
	                        var m = optsModel(i);
	                        self[i] = m;
	                    // }
	                }
					function optsModel(i){
						var m = $.extend(true, {}, model),
							b = base[i],//--选项基础配置
							c = config[i].single,//--玩法配置，单一
							cm = config[i].mixed,//--玩法配置，混合
							d = list[i] || {},//--玩法数据
							o = d.odds || [],//--玩法赔率
							si = selected || [];//--当前玩法选中的选项
						m.id = d.bet_id;//--玩法标识
						if(hasBetid && m.id){
							item.info.betid.push(m.id);
						}
						m.danguan = d.is_single == "1";//--是否可单关
						m.pankou = d.boundary || 0;//--盘口
						if(i == "SportteryHWL"){
							item.info.pankou = m.pankou;
						}
						if(i == "SportteryBS"){//--大小球分界值
							item.info.fenjie = m.pankou;
						}
						if(itou.outil.is(b, "Array")){
							var len = b.length;
							m.peilv = {};
							for(var x = 0; x < len; x++){
								var opt = $.extend(true, {}, opts),
									t = b[x] || "未受注",//--选项名称
									code = c[t],//--选项编号，单一
									mCode = cm[t],//--选项编号，混合
									v = o[code] || "未受注",//--选项赔率
									s = si.contains(mCode);//--是否已选中
								opt.t = t;
								v = v == "0"? "未受注": v;
								opt.v = v;
								opt.s = !isNaN(v)? s: false;
								opt.cs = code;//--单一模式编码
								opt.cm = mCode;//--混合模式编码
								m.peilv[mCode] = opt;
							}
						}else{
							m.peilv = {};
							for(var y in b){
								m.peilv[y] = {};
								for(var x = 0, len = b[y].length; x < len; x++){
									var opt = $.extend(true, {}, opts),
										t = b[y][x] || "未受注",//--选项名称
										code = c[t],//--选项编号，单一
										mCode = cm[t],//--选项编号，混合
										v = o[code] || "未受注",//--选项赔率
										s = si.contains(mCode);//--是否已选中
									opt.t = t;
									v = v == "0"? "未受注": v;
									opt.v = v;
									opt.s = !isNaN(v)? s: false;
									opt.cs = code;//--单一模式编码
									opt.cm = mCode;//--混合模式编码
									m.peilv[y][mCode] = opt;
								}
							}
						}
						return m;
					}
	            };
	            return game;
	        };

			//--将赛事列表接口数据格式化成页面呈现所需的数据形式
			self.formatFromApi = jingcai.formatFromApi;
			//--将更多玩法接口返回的数据，处理成页面呈现所需的形式
			self.formatItemFromApi = jingcai.formatItemFromApi;
			self.itemFactory = function(item){
				var d = jingcai.itemFactory(item);
				d.list = item.list;
				// if(itemMoreFactory){
				// 	var it = new itemMoreFactory(item);
				// 	d = $.extend({}, d, it);
				// }
				return d;
			};

			self.jiangjin = new jiangjin(self);

			function jiangjin(basketball){
				var self = this;
				self.parent = basketball;//--竞彩篮球实例对象
				// self.maps = basketball.maps.codeToGame;//--竞彩篮球编码与玩法映射关系
				// self.$config = basketball.$config;//--竞彩篮球设置信息
				self.currMaps = null;//--当前的兼中信息
				// console.log(self);
			};
			jiangjin.prototype.compute = function(selected){//--计算最大奖金
				var self = this,
					maps = self.parent.maps.codeToGame,
					model = selected.parent,
					page = model.page,
					list = selected.list,
					odds = {},//--赔率对象
					maxPeilv = {};//--最大的赔率组合
					console.log(page,list);
				for(var i in list){
					var it = list[i],
						item = page.maps[i],
						r = self.jianzhong(it, item.info.pankou),
						m = {},//--玩法数据对象，子对象用于指向mArr的子数组
						mArr = [];//--各玩法组合
					self.currMaps = r;
					it.each(function(val){
						var g = maps[val],//--玩法名称
							game = item.game[g];//--玩法对象
						if(!m[g]){
							m[g] = [];
							mArr.push(m[g]);
						}
						// if(g == "SportteryWS"){//--胜比分玩法
						// 	odds[val] = game.peilv.host[val].v || game.peilv.guest[val].v;//--获取赔率
						// }else{
						// 	odds[val] = game.peilv[val].v;//--获取赔率
						// }
						odds[val] = item.game.getPeilv(val);
						m[g].push(val);
					});
					// console.log(JSON.stringify(r));
					console.log(JSON.stringify(mArr));
					var zh = self.getZuhes([], mArr);
					console.log(zh, odds);
					var max = 0;
					var oddsZh = zh.each(function(val){//--求出最大的兼中赔率组合
						var sum = 0;
						val.each(function(v){
							sum += odds[v] * 1;
						});
						if(sum > max){
							max = sum;
						}
					});
					maxPeilv[i] = max;
				}
				// console.log(maxPeilv);
				var saishiZuhe = self.getSaishiZuhe(selected);
				var money = 0;
				saishiZuhe.each(function(val){//--最大奖金计算
					var p = 1;
					val.each(function(v){
						p *= maxPeilv[v];
					});
					money += p * 1;
				});
				money *= 2;
				selected.result.jiangjin = money * selected.beishu;
			};
			jiangjin.prototype.jianzhong = function(arr, pankou){//--计算得出各个选项的兼中选项
				console.log('arr:',arr);
				console.log('pankou',pankou);
				var r = {};
				var self = this,
					maps = self.parent.maps.codeToGame,
					$config = self.parent.$config;
				console.log(maps, $config);
				arr.each(function(val, index){
					if(!r[val]){
						r[val] = [];
					}
					arr.each(function(v, i){
						if(i != index){
							//console.log(val, v);
							var game = maps[val],
								g = maps[v];
							switch(true){
								case (game == "SportteryBS")://--大小分,可以和任何玩法兼中
									r[val].push(v);
									break;
								case (val == "23")://--胜负,主胜
									if(g == "SportteryBS"){//--大小分
										r[val].push(v);
									}else if(g == "SportteryHWL" && ((v == "30" && pankou < 0)) || v == "33"){//--让胜负
										r[val].push(v);
									}else if(g == "SportteryWS" && v * 1 < 10){//--胜分差,所有主胜选项
										r[val].push(v);
									}
									break;
								case (val == "20")://--胜负,客胜
									if(g == "SportteryBS"){//--大小分
										r[val].push(v);
									}else if(g == "SportteryHWL" && ((v == "33" && pankou > 0)) || v == "30"){//--让胜负
										r[val].push(v);
									}else if(g == "SportteryWS" && v * 1 < 20 && v * 1 > 10){//--胜分差,所有客胜选项
										r[val].push(v);
									}
									break;
								case (val == "33")://--让胜负,主胜
									if(g == "SportteryBS"){//--大小分
										r[val].push(v);
									}else if(g == "SportteryWL" && ((v == "20" && pankou > 0)) || v == "23"){//--胜负
										r[val].push(v);
									}else if(g == "SportteryWS"){//--胜分差
										var c = $config[g].mixed[v];
										c = c.replace(/[*g|*h|\+]/g,"");
										c = c.split("-");
										var min = c[0];
										var max = c[1] || 99999999;
										if(pankou > 0 && (v.left(1) == "0" || (v.left(1) == "1" && min < Math.abs(pankou)))){
											r[val].push(v);
										}
										if (pankou < 0 && v.left(1) == "0" && max > Math.abs(pankou)){
											r[val].push(v);
										}
									}
									break;
								case (val == "30")://--让胜负,客胜
									if(g == "SportteryBS"){//--大小分
										r[val].push(v);
									}else if(g == "SportteryWL" && ((v == "23" && pankou < 0)) || v == "20"){//--胜负
										r[val].push(v);
									}else if(g == "SportteryWS"){//--胜分差
										var c = $config[g].mixed[v];
										c = c.replace(/[*g|*h|\+]/g,"");
										c = c.split("-");
										var min = c[0];
										var max = c[1] || 99999999;
										if(pankou < 0 && (v.left(1) == "1" || (v.left(1) == "0" && min < Math.abs(pankou)))){
											r[val].push(v);
										}
										if (pankou > 0 && v.left(1) == "1" && max > Math.abs(pankou)){
											r[val].push(v);
										}
									}
									break;
								case (game == "SportteryWS")://--胜分差
									var c = $config[game].mixed[val];
									c = c.replace(/[*g|*h|\+]/g,"");
									c = c.split("-");
									var min = c[0];
									var max = c[1] || 99999999;
									if(g == "SportteryBS"){//--大小分
										r[val].push(v);
									}else if(v == "23" && val.left(1) == "0"){
										r[val].push(v);
									}else if(v == "20" && val.left(1) == "1"){
										r[val].push(v);
									}else if(v == "33"){
										if(pankou > 0 && (val.left(1) == "0" || (val.left(1) == "1" && min < Math.abs(pankou)))){
											r[val].push(v);
										}
										if(pankou < 0 && val.left(1) == "0" && max > Math.abs(pankou)){
											r[val].push(v);
										}
									}else if(v == "30"){
										if(pankou < 0 && (val.left(1) == "1" || (val.left(1) == "0" && min < Math.abs(pankou)))){
											r[val].push(v);
										}
										if(pankou > 0 && val.left(0) == "0" && max > Math.abs(pankou)){
											r[val].push(v);
										}
									}
									break;
							}
						}
					});
				});
				 console.log(r);
				return r;
			};

			/**
			 * 递归函数，用来获取所有组合
			 */
			jiangjin.prototype.getZuhes = function(r, arr){
				var self = this,
					a = arr[0],
					c = a.slice(0);//console.log(r,b, opts);
				var e = [];
				if(r.length == 0){
					r = c;
					for(var i = 0, len = r.length; i < len; i++){
						// r[i] = [r[i]];
						if(self.checkJianZhong([r[i]])){
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
							if(self.checkJianZhong(f)){
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
					return self.getZuhes(r, arr);
				}
			};
			jiangjin.prototype.checkJianZhong = function(arr){//--判断组合是否可以建忠
				var self = this,
					maps = self.currMaps,
					_arr = null,
					max = 0,
					r = true;
				for(var i = 0, len = arr.length; i < len; i++){
					var ms = maps[arr[i]];
					// console.log(arr, arr[i], ms, maps);
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
				return r;
			};
			jiangjin.prototype.getSaishiZuhe = function(selected){//--获取所有赛事组合
				var self = this,
					list = selected.list,
					guoguan = selected.guoguan,
					dan = selected.dan,
					data = selected.data;
				var basketball = self.parent,
					jingcai = basketball.parent,
					lottery = jingcai.parent,
					$guoguan = jingcai.$guoguan;
				// console.log(list, guoguan, dan, data);
				// console.log(lottery);
				var danLen = data.dan.length;
				var r = [];
				guoguan.each(function(val){//--得出赛事组合
					var arr = val.split("_");
					if(arr[0] - danLen == 0){//--获取赛事分组
						var zh = [data.dan];
					}else{
						var zh = data.tuo.combination(arr[0] - danLen).each(function(v){
							return data.dan.concat(v);
						})
					}
					if(arr[1] == "1"){
						r = r.concat(zh); 
					}else{
						var gguan = $guoguan[arr[0]][arr[1]];
						zh.each(function(zhVal){
							gguan.each(function(gVal){
								var z = zhVal.combination(gVal);
								r = r.concat(z); 
							});
						});
					}
				});
				console.log(list);
				return r;
			};

			/**
			 * 格式化页面选择信息，为方案接口提供数据
			 * @param data
			 * @returns {{}}
			 */
			self.formatSelectedToApiFangan = function(selected){
				var maps = self.maps.codeToGame,
					maps1 = self.maps.mixedToSingle,
					model = selected.parent,
					page = model.page,
					r = {};
				// console.log(maps1);
				r.pass_type = selected.guoguan.join(",");//--过关方式
				r.count = selected.result.money/2 * selected.beishu || 1;//--总注数
				r.money = selected.result.money * selected.beishu;//--总金额
				r.m_ext = "";//--投注方式选项
				r.manner = selected.data.dan.length > 0? 1: 0;//--投注方式
				r.bet_seq = [];//--bet_id序列
				var games = [],//--所有玩法
					wager_single = [],
					wager_mixed = [],
					obj = {
						id: {},
						game: {}
					};
				for(var i in selected.list){//--获取bet_id序列，获取所有玩法
					var s = selected.list[i],
						item = page.maps[i];
					var srlt = s.each(function(val){
						var g = maps[val],
							id = item.game[g].id;
						if(!obj.game[g]){
							obj.game[g] = true;
							games.push(g);
						}
						if(!obj.id[id]){
							obj.id[id] = true;
							r.bet_seq.push(id);
						}
						return maps1[val];
					});
					wager_mixed.push(i + ":" + s.join(","));
					wager_single.push(i + ":" + srlt.join(","));
				}
				if(games.length == 1){
					var lotteryType = games[0];//--单一过关
					var wager_type = "Common";
					var wager = wager_single;
				}else{
					var lotteryType = "SportteryBasketMix";//--混合过关
					var wager_type = "Combin";
					var wager = wager_mixed;
				}
				r.lottery_type = lotteryType;
				r.wager_type = wager_type;
				r.wager_store = [];
				var o = {
					wt: r.wager_type,
					pt: r.pass_type,
					c: r.count / selected.beishu,
					m: r.money / selected.beishu,
					multiple: selected.beishu,
					wager: [],
					abs: selected.data.dan.join(",")
				};
				o.wager = wager.join(";");
				r.wager_store.push(o);
				console.log(r);
				return r;
			};

			/**
			 * 格式化页面选择信息，为奖金测评接口提供数据
			 * @param data
			 * @returns {{}}
			 */
			self.formatSelectedToApi = function(selected){
				var t = selected,
					model = t.parent,
					page = model.page,
					maps = self.maps.codeToGame,
					// s = $selected.selected,
					r = {};
				r.passTypes = t.guoguan.join(",");//--过关方式
				r.multiple = t.beishu;//--倍数
				r.minRequiredSetCount = t.dan.length || 0;//--最小胆，用于模糊定胆
				r.maxRequiredSetCount = t.dan.length || 0;//--最大胆，用于模糊定胆
				// r.lotteryNo = data.lotteryNo;//--期号
				r.requiredIndex = "";//--胆列表
				r.optionalIndex = "";//--拖列表
				var type = "mixed";
				// var s = $selected[type];
				// if(type == "single"){
				// 	for(var i in t.num){break;}
				// 	var lotteryType = i;//--单一过关
				// }else{
					var lotteryType = "SportteryBasketMix";//--混合过关
				// }
				r.lotteryType = lotteryType;
				r.matches = [];
				var dan = [],
					tuo = [];
				for(var i in t.list){
					var o = {
						sn: i,//--场次
						prized: false,//--是否已开奖
						hitSet: ""//--命中选项
					};
					var spArray = [],
						rqArray = "",
						item = page.maps[i];
					t.list[i].each(function(v){
						// spArray = spArray.concat(s[i][ii]);//console.debug(s[i], ii,s[i][ii]);
						var g = maps[v];
						// if(g == "SportteryWS"){
						// 	var p = item.game[g].peilv.host[v].v || item.game[g].peilv.guest[v].v;
						// }else{
						// 	var p = item.game[g].peilv[v].v;
						// }
						var p = item.game.getPeilv(v);
						spArray.push(v + ":" + p);
						if(g == "SportteryHWL" && !rqArray){
							rqArray = "Y:" + (item.info.pankou > 0? "+" + item.info.pankou * 1: item.info.pankou);
						}
						// console.error(spArray,spArray);
					});
					o.spArray = spArray.join(";");
					o.rqArray = rqArray;
					r.matches.push(o);
					if(t.dan.contains(i)){
						dan.push(r.matches.length - 1);
					}else{
						tuo.push(r.matches.length - 1);
					}
					r.requiredIndex = dan.join(",");
					r.optionalIndex = tuo.join(",");
				}//console.log(r);
				return r;
			};
			self.formatListToOptimize = function(list, type, wt){//--格式化优化数据，使之可以提供到做单api
				var r = [],
					obj = {},
					$config = self.$config;console.log("type = ", type);
				for(var i = 0, len = list.length; i < len; i ++){
					var o = {wt: wt, c: 1},
						item = list[i];
					o.pt = item.guoguan.replace("串", "_");
					o.m = item.zhushu * 2;
					o.multiple = item.zhushu;
					o.wager = [];
					var t = item.text;
					for(var x = 0, y = t.length; x < y; x ++){
						var it = t[x],
							no = it[2],
							game = it[3],//--玩法
							opt = it[1];//--选项
						try{
							var no1 = $config[game][type][opt];
						}catch(e){
							var no1 = "";
							console.error(e.message);
						}
						o.wager.push(no + ':' + no1);
					}
					o.wager = o.wager.join(";");
					// r.push(o);
					obj[i] = o;
				}
				// return r;
				return obj;
			};

			self.formatDetailData = function(data){
				var match_list = data.match_list,//--赛事列表
					wager = data.wagers[0].wager,//--投注列表
					abs = data.wagers[0].abs || "",//--投注列表
					type = data.type;//--single 或 mixed,单一或混合投注
				abs = abs.split(",");
				// console.log("formatDetailData", "type=", type);
				var wg = {}, r = [];
				var weekDay = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
				var games = ["SportteryHWL", "SportteryBS", "SportteryWL", "SportteryWS"];
				wager = wager.split(";");
				wager.each(function(v){
					var val = v.split(":");
					wg[val[0]] = val[1].split(",");
					return v;
				});
				for(var i in match_list){
					var item = match_list[i],
						o = {};
					o.no = i;
					o.id = item.match_id;
					o.intro = {
						id: item.match_id,
						no: weekDay[(i + "").left(1) - 1] + (i + "").right((i + "").length - 1),//--日期
						hasDan: abs.contains(i),//--是否为胆
						saishi: item.league_name,//--赛事
						time: item.match_time? (item.match_time).Dateformat("mm/dd HH:NN"): "",//--比赛时间
						hostName: item.host_name_s,//--主队名称
						guestName: item.guest_name_s,//--客队名称
						bifen: item.is_prize == "1"? item.guest_goals + ':' + item.host_goals: "VS",//--最终比分
						isKaijiang: item.is_prize == "1",//--是否开奖
						sort: item.sort? item.sort * 1: 1,
						isDelay: false//--是否延期
					};
					o.list = {};
					var list = item.list;
					if(!list){
						continue;
					}
					var $config = self.$config;
					games.each(function(x){
						// console.log(x, list, list[x]);
						if(list[x]){
							var ob = {};
							var odds = type == "single"? list[x].odds: list[x].odds_mix;
							ob.hasPankou = (x == "SportteryHWL" || x == "SportteryBS");//--是否有盘口
							ob.pankou = list[x].boundary;//--盘口
							ob.pankou = ob.pankou > 0? '+' + ob.pankou: ob.pankou
							if(x == "SportteryHWL"){
								ob.pankou = "主 " + ob.pankou;
							}
							ob.r = type == "single"? $config[x][type][list[x].lottery_result]: $config[x][type][list[x].lottery_result_mix];//--比赛结果
							if(ob.r){
								if(ob.r.has("*h")){
									ob.r = "主胜 " + ob.r.replace("*h", "");
								}else if(ob.r.has("*g")){
									ob.r = "客胜 " + ob.r.replace("*g", "");
								}
							}
							// console.log(type, mapsR[list[x].lottery_result], mapsR[list[x].lottery_result_mix]);
							// console.log(ob.r, mapsR, list[x].lottery_result)
							ob.opts = [];
							if(list[x].lottery_result == "Delay"){
								o.intro.bifen = "延期";
								o.intro.isDelay = true;                        
							}
							var maps = $config[x][type];
							for(var y in maps){
								if(isNaN(y)){
									var obj = {};
									obj.v = y;//--选项名
									if(obj.v.has("*h")){
										obj.v = "主胜 " + obj.v.replace("*h", "");
									}else if(obj.v.has("*g")){
										obj.v = "客胜 " + obj.v.replace("*g", "");
									}
									obj.p = odds[maps[y]];//--赔率
									obj.s = wg[i].contains(maps[y]);//--是否选中
									if(obj.s && ob.r && ob.r == obj.v){//--中奖
										obj.w = "win";
									}else if(obj.s && ob.r && ob.r != obj.v){//--未中奖
										obj.w = "lose";
									}else if(obj.s && !ob.r){//--选中 未开奖
										obj.w = "checked";
									}else if(!obj.s && ob.r && ob.r == obj.v){//--未选中 浆果
										obj.w = "result";
									}else{//--未选中
										obj.w = "unchecked";
									}
									if(x == "SportteryHWL" || x == "SportteryBS" ||  x == "SportteryWL" || obj.s){
										ob.opts.push(obj);
									}
								}
							}
							o.list[x] = ob;
						}
					});
					r.push(o);
				}
				console.log(r);
				return r;
			};
			/**
			编码singl类型，转为mixed类型
			参数：game，玩法；code，单一类型编码
			 */
			self.singleToMixed = function(game, code){
				try {
					var r = null,
						g = self.$config[game],
						single = g.single,
						mixed = g.mixed;
					for(var i in single){
						if(single[i] == code){
							r = mixed[i];
							break;
						}
					}
					r = r || null;
					return r;
				} catch (error) {
					return null;
				}
			};
	    };

		$.lottery = new Lottery();
	})(Zepto);


/***/ }
/******/ ]);