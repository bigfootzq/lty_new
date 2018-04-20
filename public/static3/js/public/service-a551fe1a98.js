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
	 * 微信C端公共对象
	 * by zhaoyf 2016-08-03
	 */

	(function(window, $){

		var preset = {//--预设开发和线上环境变量
			product: {//--线上产品环境变量
				appid:{
					wx: 'wx1c76bcbd8f60cbe3',//--微信公众号appid
					ali: '2017072607907717'//--支付宝生活号appid
				},
				base_url:'//koudai.itou.com/',
				secret:'',
				api_url:'//apic.itou.com/api/',
				img_url:'//www.itou.com/'
			},
			development: {//--开发环境变量
				appid:{
					wx: 'wx1c76bcbd8f60cbe3',//--微信公众号appid
					ali: '2017072607907717'//--支付宝生活号appid
				},
				base_url:'//koudai.itou.com/',
				secret:'',
				// api_url:"//act.apic.itou.com/api/",
				// api_url:'//apicwww1.dev.itou.com/api/',
				api_url:'//apic.dev.itou.com/api/',
				// api_url:'//apic.itou.com/api/',
				// img_url:'//koudaiimg.itou.com/',
				img_url:'//www.itou.com/'
			}
		};

		var config= !window.environment? preset[window.environment]: preset['product'];
		
		if(window.environment == 'development'){
			// config.base_url = "//" + window.location.host + "/";
			config.base_url = "//192.168.33.10/api/";
		}

		config.platform = "wx";//--当前运行平台(wx：web端；android：安卓APP；ios：苹果App)
		
		config.version = "20180101000000";
		window.config = config;

		config.strategy = {//--全局策略
			saveProjectWithNologin: false//--是否开放匿名提交方案
		};
		//--广告入口域名
		config.advHost = ["koudai-lrts.itou.com"];

		/**
		 * 说明： 
		 * config.platform 会影响接口参数，因而，微信、支付宝和手机网页通用‘wx’；但是app模式，ios和android平台各自拥有不同的值。
		 * config.browser 会影响插件调用，因而 微信、支付宝各自不同；ios和android的插件是经过cordova封装的，因而公用值‘app’
		 */
		var UA = navigator.userAgent + "";
		if(config.platform == "wx"){
			// console.log(UA);
			// alert(UA);
			switch (true) {
				case UA.has("MicroMessenger"):
					config.browser = "wx";//--微信公众号
					break;
				// case UA.has("QQ/"):
				// 	config.browser = "qq";//--qq公众号
				// 	break;
				case UA.has("AlipayClient"):
					config.browser = "ali";//--支付宝生活号
					break;
				default:
					config.browser = "mobile";//--h5web端
					config.platform = config.browser;
					break;
			}
		}else{
			//--自动判断当前设备平台
			if (/(iPhone|iPad|iPod|iOS)/i.test(UA)) {
				config.platform = "ios";
				config.browser = "ios";
			} else if (/(Android)/i.test(UA)) {
				config.platform = "android";
				config.browser = "android";
			} else {
				config.platform = "app";
				config.browser = "app";
			};
		}
		// console.log(config.browser);
		config.isAPP = config.browser == "android" || config.browser == "ios"  || config.browser == "app";
		if(!config.isAPP && config.advHost.indexOf(window.location.hostname) >= 0){
			//--特殊的广告入口域名，特殊处理
			config.browser = "mobile";
			config.platform = config.browser;
		}
		//--gray框架初始化，微信平台
		Gray.make(config.browser);
		Gray.cache.cacheable = true;//--允许页面级缓存并开启自动缓存

		var ITOU = function(){
			var self = this;
			self.exp = new Exp();//--正则表达式
			self.msg = new Message(self);//--页面提示信息 实例对象
			self.outil = new outil(self);//--工具箱，提供一些常用方法
			self.localJson = new localJson(self);//--本地存储json，非永久，超3天自动清除
			self.localData = new localData(self);//--本地存储数据，永久，不会自动清除
			self.sessionData = new sessionData(self);//--本地存储数据，页面关闭自动清除
			self.timeLine = new TimeLine(self);//--时间线对象，用来进行性能分析
			self.setting = new Setting(self);//--基础配置对象，用来设置基本的配置信息
			self.history = new History(self);//--历史记录对象
			self.page = new Page(self);//--页面跳转对象
			self.dataModel = new DataModel(self);//--接口数据原型创建对象
			self.cookie = new Cookie(self);//--JS的cookie操作
			self.apiTimeout = new ApiTimeout(self);//--接口超时错误页面

			self.extend = {};//--扩展用对象

			self.proto = {};//--扩展属性

			var protocol = window.location.protocol;//--协议
			if(protocol == "http:"){
				self.proto.protocol = "http:";//--设置默认协议
				self.proto.protocol_ws = "ws:";//--推送设置默认协议
			}else{
				self.proto.protocol = "https:";//--设置默认协议
				self.proto.protocol_ws = "wss:";//--推送设置默认协议
			}
			config.base_url = self.proto.protocol + config.base_url;
			config.api_url = self.proto.protocol + config.api_url;
			config.img_url = self.proto.protocol + config.img_url;
			
			try {
				var debug = Gray.$page.getUrlParam("debug");
				if(!debug && window.environment != 'development'){
					// window.console = {};
					window.console.log = function(){};
					window.console.debug = function(){};
					window.console.error = function(){};
					window.console.info = function(){};
					window.console.warn = function(){};
				}
			} catch (error) {
				
			}

			var loader = new Loader();
			try{//--监听loader属性设置，来开启或关闭页面加载提示
				Object.defineProperty(self, 'loader', {
					set: function(val){
						if(val == "on"){
							loader.setOpen();
						}else if(val == "off"){
							loader.setClose();
						}
					}
				})
			}catch(e){
				console.log(e);
			}

			//--异步加载默认参数
			var defParams = {
				// headers: {
				// 	token: null
				// },
				dataType: "json",
				data: {
					platform: "koudai_" + config.browser,
					_prt: self.proto.protocol.replace(":", ""),
					ver: config.version//--内部版本号
					// token: null
				},
				// xhrFields: {
				// 	withCredentials: true
				// },
				notoken: false,//--不带token，走get模式
				formatResult: true,//--是否对接口结果进行预处理，如果code != 0， 弹窗提示，默认true
				autocache: false,//--是否将数据缓存到本页面——页面级缓存
				sessionCache: false,//--是否将数据缓存到本页面——session级缓存:true(只读缓存不写缓存), false（及不读也不写）, reload（重新加载并且写缓存）
				fullUrl: false,//--是否是完整的接口url，默认为否，需要连接api服务器域名
				noToast: false,//--是否展示toast弹窗
				showErr: false,//--超时后是否跳转到超时页面
				rnd: true//--是否追加随机数
			};

			if(!config.isAPP && config.advHost.indexOf(window.location.hostname) >= 0){
				//--特殊的广告入口域名，提交参数特殊处理
				defParams.data.platform = "koudai_adv";
			}

			//--获取token的值
			self.getToken = function(){//console.log('getToken', localStorage.getItem("token"));
				// return 'itouapi_f3cb23f95572b37250bce5547e5fbf5e6c105a60';
				return  localStorage.getItem("token2");
			}

			//--设置token
			self.setToken = function(token){//console.log('setToken');
				localStorage.setItem("token2", token);
			};

			self.random = function(len){//--生成指定长度随机字符串，范围[1-9a-Z]
				var str = Math.random().toString(36).substr(2);
				if(str.length >= len) {
					return str.substr(0, len);
				}
				str += self.random(len - str.length);
				return str;
			};

			//--记录返回的url
			self.saveReturnUrl = function(url){
				if(!url){
					if(config.platform == "wx"){
						url = window.location.href;
					}else{
						url = Gray.$page.href || window.location.href;
					}
				}
				if(!url.has("/user/login/")){
					self.localData.setData("__sys_window_return_url", {
						url: url,
						date: new Date()
					});
				}
			};

			//--读取返回url
			self.getReturnUrl = function(){
				var returnUrl = itou.localData.getData("__sys_window_return_url");
				return returnUrl || null;
			};

			/**
			 * 预处理接口参数
			 * @params 接口请求的参数
			 */
			self.formatParams = function(params){
				var debug = window.environment == "development",
					token = self.getToken() || "";//--获取token
				// defParams.headers.token = self.getToken() || null;//--获取token
				// self.cookie.set({name: "token", value: token, domain: "itou.com"});
				if(debug){
					// defParams.data.token = token;
				}
				params = $.extend(true, {}, defParams, params);//--参数合并
				if(params.rnd){
					params.data.t = Math.floor(Math.random() * 1000000);//--页面传递的随机数
					params.cache = false;//禁用缓存
					params.ifModified = true;//禁用缓存
				}
				if(!params.fullUrl){
					params.url = config.api_url + params.url;//alert("window.environment=" + window.environment + ";config.api_url=" + config.api_url);
				}
				return params;
			};

			self.formatWithToken = function(params){//--格式化参数，拼接到url，增加token
				var debug = window.environment == "development",
					token = self.getToken() || "";//--获取token
				// defParams.headers.token = self.getToken() || null;//--获取token
				// self.cookie.set({name: "token", value: token, domain: "itou.com"});
				if(debug){
					// defParams.data.token = token;
				}
				// if(!params.notoken && (params.type + "").toUpperCase() != "POST"){//--带token时，强制设为POST
				// 	params.type = "POST";
				// }
				params = $.extend(true, {}, defParams, params);//--参数合并
				if(params.rnd){
					params.data.t = Math.floor(Math.random() * 1000000);//--页面传递的随机数
					params.cache = false;//禁用缓存
					params.ifModified = true;//禁用缓存
				}
				if(!params.fullUrl){
					params.url = config.api_url + params.url;//alert("window.environment=" + window.environment + ";config.api_url=" + config.api_url);
				}
				var querystring = [];
				if(params.type == "POST" || !params.notoken){
					var data = (params.type == "POST"? defParams.data: params.data);
					querystring = $.param(data);
					for(var i in data){//--通用参数拼接地址栏参数
						delete params.data[i];
					}
					if(querystring.length > 0){
						params.url += (params.url.has("?")? "&": "?") + querystring;
					}
					params.type = "POST";
				}
				if(!params.notoken){
					var token = localStorage.getItem("__itou_random_token");
					if(!token){
						token = self.random(48);
						localStorage.setItem("__itou_random_token", token);
					}
					params.data.token = token;
				}
				return params;
			};

			/**
			 * 异步调用接口
			 * @params 异步请求参数，包含接口url，接口数据等
			 */
			self.get = function(params){//--注意Params 和 params 是两个变量
				var key = JSON.stringify(params);//alert(params.url)
				if(self.outil.hex_sha1){
					key = self.outil.hex_sha1(key);//--键值加密，用来缩短键值长度
				}
				if(!!params.sessionCache){
					self.outil.autocache.setKey(params.url, key);
				}
				var url = Gray.$page.href || (config.isAPP? "/": window.location.href),
					queryNotoken = self.outil.getUrlParam(url, "notoken"),
					Params;
				if(!!queryNotoken){
					Params = self.formatParams(params);//console.log(Params);
				}else{
					Params = self.formatWithToken(params);//console.log(Params);
				}
				var sessionData = self.sessionData.getData("__apis_sessionData")[key];
				// console.log(params, !!Gray.cache.autocache, !!params.autocache, key, Gray.$cache);
				if(!!Gray.cache.autocache && !!params.autocache && !!Gray.$cache[key]){
					//--如果页面允许自动缓存，并且接口参数要求自动缓存，并且该接口缓存数据存在的时候，读取页面缓存
					var result = Gray.$cache[key];
					return formatResult(Params, result);//--返回缓存结果
				}else if(params.sessionCache == true && sessionData){
					var result = sessionData;//console.error(sessionData)
					return formatResult(Params, result);//--返回缓存结果
				}else{
					if(self.apiTimeout.showErr && Params.showErr){
						console.log(key, Params.url, Gray.$page.href);
						self.apiTimeout.startApi(key);
					}
					return $.ajax(Params)
						.then(function(result){
							if(self.apiTimeout.showErr && Params.showErr){
								self.apiTimeout.endApi(key);
							}
							result = result || {};
							result.data = result.data || result.info;
							if(result.data && result.data.token){//--如果接口返回token，则保存token值
								self.setToken(result.data.token);
							}
							if(!!Gray.cache.autocache && !!params.autocache && !!result){
								//--如果页面允许自动缓存，并且接口参数要求自动缓存, 记录缓存数据
								Gray.$cache[key] = result;
							}
							if(!!params.sessionCache && result.errcode === 0){
								var obj = {};
								obj[key] = result;
								self.sessionData.setData("__apis_sessionData", obj);
							}
							return formatResult(Params, result);//--返回异步加载结果
						});
				}
			};

			self.gotoLogin = function(){
				self.saveReturnUrl();
				if(config.platform == "wx"){
					self.auth.getCode("snsapi_userinfo");
				}else{
					Gray.$page.loadPage("/user/login/");
				}
			};

			//--处理返回结构，返回promise对象
			function formatResult(Params, result){
				var defer = $.Deferred();
				if(!Params.formatResult){//--如果不需要预处理，则直接返回结果
					defer.resolve(result);
				}else{
					if(result === null || typeof result == 'undefined'){//--接口不正常
						if(!Params.noToast){
							self.msg.toast = '网络错误，请重试';
						}
						defer.reject();
					}
					if(result.errcode === 0){//--接口正常
						defer.resolve(result.data);
					}else if(result.errcode == -1001){
						self.gotoLogin();
					}else if(result.errcode == -4){
						var returnUrl = self.localData.getData("__sys_window_return_url");
						if(returnUrl){
							var date = new Date(returnUrl.date);
							var diff = Math.abs((new Date()).DateDiff("s",date));
							if(diff >= 300){
								Gray.$page.loadPage("/");
							}else if(returnUrl.url.replace(config.base_url, "") == "user/setting/"){
								Gray.$page.loadPage("/");
							}else{
								itou.localData.setData("__sys_window_return_url",{});
								Gray.$page.loadPage(returnUrl.url);
							}
						}else{
							Gray.$page.loadPage("/");
						}
					}else if(result.errcode != -2){//--接口返回错误信息,-2是/api/user/Wxauth/接口返回的错误信息
						if(!Params.noToast){
							self.msg.toast = result.msg;
						}
						defer.reject(result);
					}
				}
				return defer.promise();
			};

			/**
			 * 批量获取接口数据
			 * @arr params的数组
			 * params.formatResult 会被忽略，按照fals处理，无论接口是否返回错误信息，返回结果都会存入数组
			 * 返回结果的顺序与请求参数顺序一致
			 * 暂时不支持页面缓存
			 */
			self.getApis = function(arr){
				var results = [];
				var chains = null;
				for(var i = 0, len = arr.length; i < len; i++){//--拼接任务链
					var params = self.formatParams(arr[i]);//--预处理请求数据
					chains = chains? $.ajax(params): chains.then(function(result){
						if(result.data && result.data.token){//--如果接口返回token，则保存token值
							self.setToken(result.data.token);
						}
						results.push(result);//--结果存入数组
						return $.ajax(params);//--进行下一步请求
					});
				}
				return !chains? null: chains.then(function(result){
					if(result.data && result.data.token){//--如果接口返回token，则保存token值
						self.setToken(result.data.token);
					}
					results.push(result);
					return results;
				});
			};

			self.auth = new auth(self);//--微信端认证验证对象，仅微信端生效
			//self.auth.getCode("snsapi_userinfo");

		}; 


		/**
		 * 页面提示信息
		 * 包含toast、alert、confirm等方法
		 * 作为ITOU的子对象实例化
		 */
		var Message = function(itou){
			var self = this;
			self.parent = itou;//--关联itou实例对象

			var toast = new Toast(self);

			try{//页面弹层提示，在toast属性设置时，触发toast.show事件；
				//--如果值为文本，则直接显示信息，如果值为对象，则在结束时出发回调
				//--参数形式：string 或者 {text:"", callback: function(){}}
				Object.defineProperty(self, "toast", {
					set: function(val){
						if((typeof val).toLowerCase() == "string"){
							toast.show(val);
						}else if(val && (typeof val).toLowerCase() == "object"){
							toast.show(val.text, val.callback);
						}
					}
				});
			}catch(e){
				console.log(e.message);
			}

		};
		/**
		 * 页面弹层提示，3秒后消失
		 */
		var Toast = function(msg){
			var self = this;
			//--弹层元素
			//var html = "<div style='corlor:white;left:0px;position:absolute;top:10px;width:100%;line-height:30px;background-color:blue;display:none;text-align:center;z-index:9999'></div>";
			var html = "<div class='formerror'></div>";
			var $el = null;

			self.create = function(){//--创建弹层对象
				if(!$el){
					$el = $(html);
				}
				return $el.appendTo("body");//--单页模式页面切换会将元素清除，因而需要重新插入BODY
			};
			//--显示弹层对象并在消失后调用回掉函数
			self.show = function(err, callback){
				$el = self.create();
				$el.text(err).show();
				window.setTimeout(function() {
					$el.hide();
					if((typeof callback).toLowerCase() == "function"){
						callback();
					}
				}, 3000);
			};
		};

		//--todo: 编写对应Confirm 和 Alert 弹窗

		/**
		 * 正则表达式
		 */
		var Exp = function(){
			var self = this;
			self.userName = /^[\u4e00-\u9fa5\d\w]{6,20}$/;//--用户名：6-20个汉字字母或数字
			self.mobile = /^1[\d]{10}$/;//--手机
			self.userPass = /^[\d\w]{6,16}$/; //--密码：6-16位，数字或字母
			self.checkcode = /^\d{6}$/;	//--验证码：6位数字
			self.shopName = /^[\u4e00-\u9fa5\w\d]{1,8}$/;	//--店铺名称
			self.nickName = /^[\u4e00-\u9fa5\w\d]{6,16}$/;	//--昵称
			self.shopUrl = /^[\d\w]{5,}$/;	//--店铺网址：5位以上数字或字母
			self.qq = /^[1-9][0-9]{4,}$/;//--qq验证
			self.email = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;//--电子邮箱

			/**
			 * 通用验证，验证值是否符合正则表达式
			 * @val 需要验证的值
			 * @exp 验证的正则表达式
			 * 注意：val 为 “” 或 0 或 false 或 null 或 undefined 时，将直接返回false；
			 */
			self.testVal = function(val, exp){
				if(!val){
					return false;
				}
				if(exp.test(val)){
					return true;
				}else{
					return false
				}
			};
			/**
			 * 验证手机号是否正确
			 * @mobile 被验证的手机号
			 */
			self.testMobile = function(mobile){
				return self.testVal(mobile, self.mobile);
			};
			/**
			 * 验证密码格式是否正确
			 * @userPass 被验证的登陆密码
			 */
			self.testPass = function(pass){
				return self.testVal(pass, self.userPass);
			};
			/**
			 * 验证用户名格式是否正确
			 * @userName 被验证的登陆用户名
			 */
			self.testUserName = function(userName){
				return self.testVal(userName, self.userName);
			};
			/**
			 * 验证qq格式是否正确
			 * @qq 被验证的qq
			 */
			self.testQQ = function(qq){
				return self.testVal(qq, self.qq);
			};
			/**
			 * 验证支付宝格式是否正确
			 * @alipay 被验证的支付宝
			 */
			self.testAlipay = function(alipay){
				return (self.testVal(alipay, self.qq) || self.testVal(alipay, self.email));
			};
		};

		/**
		 * 异步请求,超过700毫秒时，出现加载弹窗
		 */
		var Loader = function(){
			var self = this;
			var myTimmer = null;

			//--监听ajax事件
			function ajaxBeforeSend(){//--监听ajaxBeforeSend事件
				if(myTimmer){
					window.clearTimeout(myTimmer);
				}
				myTimmer = window.setTimeout(function(){
					$('#loaderbox').show();
				}, 700);
			}
			function ajaxComplete(){//--监听ajaxComplete事件
				if(myTimmer){
					window.clearTimeout(myTimmer);
				}
				$('#loaderbox').hide();
			}
			function ajaxError(){//--监听ajaxError事件
				if(myTimmer){
						window.clearTimeout(myTimmer);
					}
					$('#loaderbox').hide();
			}

			//--开启加载提示
			self.setOpen = function(){
				$(document).on('ajaxBeforeSend', ajaxBeforeSend);
				$(document).on('ajaxComplete', ajaxComplete);
				$(document).on('ajaxError', ajaxError);
			};
			//--关闭加载提示
			self.setClose = function(){
				$(document).off('ajaxBeforeSend', ajaxBeforeSend);
				$(document).off('ajaxComplete', ajaxComplete);
				$(document).off('ajaxError', ajaxError);
			};
			
		};

		/**
		 * 工具构造对象
		 * 负责一些通用的公共方法
		 */
		var outil = function(obj){
			var self = this;
			self.parent = obj;

			/**
			 * 隐藏手机号码的中间四位
			 * @mobile 待处理的手机号
			 */
			self.hideMobile = function(mobile){//--隐藏中间4位号码
				var exp1 = /^\d{7}/,
					exp2 = /^\d{3}/;
				if(!!mobile && mobile.length >= 7){
					var m1 = mobile.match(exp1)[0],
						m2 = mobile.match(exp2)[0];
					mobile = mobile.replace(m1, m2 + "****");
				}
				return mobile;
			};

			/**
			 * 格式化时间
			 * @date 要格式化的时间
			 * @formatModel 要格式化的样式
			 */
			self.formatDate = function(date, formatModel){
				try {
					date = date.split(/[- :]/);
					var d = new Date(date[0], date[1] - 1, date[2], date[3], date[4], date[5]);
				} catch (error) {
					console.log("outil-err-formatDate:", error.message);
				}
				if(!d){
					return date;
				}else{
					var yyyy = d.getFullYear(),
						mm = d.getMonth() + 1,
						dd = d.getDate(),
						hh = d.getHours(),
						nn = d.getMinutes(),
						ss = d.getSeconds(),
						YY = ("" + yyyy).right(2),
						MM = ("00" + mm).right(2),
						DD = ("00" + dd).right(2),
						HH = ("00" + hh).right(2),
						NN = ("00" + nn).right(2),
						SS = ("00" + ss).right(2);
					return formatModel
							.replace(/yyyy/g, yyyy)
							.replace(/mm/g, mm)
							.replace(/dd/g, dd)
							.replace(/hh/g, hh)
							.replace(/nn/g, nn)
							.replace(/ss/g, ss)
							.replace(/YY/g, YY)
							.replace(/MM/g, MM)
							.replace(/DD/g, DD)
							.replace(/HH/g, HH)
							.replace(/NN/g, NN)
							.replace(/SS/g, SS);
				}
			};

			/**
			 * 计算两个坐标之间的距离
			 */
			self.getFlatternDistance = function(lat1,lng1,lat2,lng2){
				function getRad(d){
					return d*Math.PI/180.0;
				};
				var EARTH_RADIUS = 6378137.0;
				var f = getRad((lat1*1 + lat2*1)/2);
				var g = getRad((lat1 - lat2)/2);
				var l = getRad((lng1 - lng2)/2);c
				
				var sg = Math.sin(g);
				var sl = Math.sin(l);
				var sf = Math.sin(f);
				
				var s,c,w,r,d,h1,h2;
				var a = EARTH_RADIUS;
				var fl = 1/298.257;
				
				sg = sg*sg;
				sl = sl*sl;
				sf = sf*sf;
				
				s = sg*(1-sl) + (1-sf)*sl;
				c = (1-sg)*(1-sl) + sf*sl;
				
				w = Math.atan(Math.sqrt(s/c));
				r = Math.sqrt(s*c)/w;
				d = 2*w*a;
				h1 = (3*r -1)/2/c;
				h2 = (3*r +1)/2/s;
				
				return d*(1 + fl*(h1*sf*(1-sg) - h2*(1-sf)*sg));
			};

			/**
			 * 根据评分获得评价文本
			 */
			self.pingjia = function(f){
				var p = "";
				switch(true){
					case f >= 4.5: p = "超好"; break;
					case (f >= 4 && f < 4.5): p = "很好"; break;
					case (f >= 3.5 && f < 4): p = "不错"; break;
					case (f >= 3 && f < 3.5): p = "一般"; break;
					case (f >= 2 && f < 3): p = "不好"; break;
					case f < 2: p = "很差"; break;
				}
				return p;
			};

			/**
			 * 判断某个对象是否是某个类型
			 * 返回：bool值 true 或 false
			 * 实例：alert(is([], "Array"));
			 */
			self.is = function (obj, type) { 
				return (type === "Null" && obj === null) || 
				(type === "Undefined" && obj === void 0 ) || 
				(type === "Number" && isFinite(obj)) || 
				Object.prototype.toString.call(obj).slice(8,-1) === type; 
			};
			/**
			 * 是否是特殊的分享页面
			 */
			self.isSharePage = function () { 
				var url = window.location.href;
				return url.has("/project/detail/") || url.has("/user/shop/details/") || url.has('/activity/givebouns/') || url.has('/activity/first/') || url.has('/activity/arena/') || url.has('activity/receivebonus') || url.has('/activity/arenarankdata/') || url.has('/activity/myarenarank/') || url.has('/activity/giveredbag/') || url.has("/activity/getbouns/") || url.has("/precommend/share/") || url.has("/precommend/confirmshare/") || url.has("/project/gendan/") || url.has("/precommend/detail/") || url.has("/precommend/?");
			};
			/**
			 * 将时间(或时间文本)转换成短格式：今天 18:00、明天 17:00、 3-11 16:00 这三种形式
			 * 返回：短时间格式
			 * 实例：alert(toShortDate("2019-05-07 17:35:27"));
			 */
			self.toShortDate = function (date) {
				if(date.toDate){
					date = date.toDate();
				}
				try {
					var diff = new Date().Dateformat("yyyy-MM-DD 00:00:00").toDate().DateDiff("s", date),
						seconds = 3600 * 24;
					if(diff > 0 && diff < seconds){
						var r = date.Dateformat("今日 hh:NN");
					}else if(diff >= seconds && diff < seconds * 2){
						var r = date.Dateformat("明日 hh:NN");
					}else{
						var r = date.Dateformat("mm-dd hh:NN");
					}
				} catch (error) {
					console.error(error.message);
					var r = date.Dateformat("mm-dd hh:NN");
				}
				return r;
			};
			/**
			 * 判断某个对象是否是空
			 * 返回：bool值 true 或 false
			 * 实例：isNull(0) --> false;
			 */
			self.isNull = function (arg1)
			{
				return !arg1 && arg1 !== 0 && typeof arg1 !== "boolean"? true: false;
			};

			var timmer = function(obj){
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
					if(key){
						window.clearInterval(timmerMap[key]);
						delete timmerMap[key];
					}else{
						for(var key in timmerMap){
							window.clearInterval(timmerMap[key]);
							delete timmerMap[key];
						}
					}
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

			self.timmer = new timmer(self);//--计时器管理对象

			/**
			 * 做单通用方法，在生成订单前询问是否登录
			 * 参数：data，做单需求的数据，即做单接口data元素的数据;
			 * 		act:动作,save = 保存方案 || submit = 提交彩电
			 * 		nologin: 布尔值，是否允许匿名提交，如果为true，则不进行登陆提示；优先级低于场景，非扫码场景下失效
			 * 注意：在data 或者 act 为null的时候，会自动获取上次执行时缓存的数据，也就是说允许使用：saveProject(null, null, true)的方式再次提交
			 */
			self.saveProject = function(data, act, nologin){
				if(!act){//--提交动作默认获取上一次的动作
					act = itou.sessionData.getData("__saveProject_act").act || "save";
				} else {
					itou.sessionData.setData("__saveProject_act", {act: act});
				}
				data = data || itou.sessionData.getData("__saveProject_data").data;
				if(!data){
					Gray.$page.loadPage("/");
					return;
				}
				return itou.get({
						url: "user/isLogin",
						data: {}
					})
					.then(function(result){
						var defer = $.Deferred(),
							entry_info = itou.localJson.getJson("__entry_info") || {},
							scene = entry_info.scene;
						if(scene != "scan" && !result.is_login){//--非扫码场景禁止匿名提交
							defer.reject();
							// Gray.$page.loadPage("/user/login/?back=" + window.backurl);
							itou.auth.getCode("snsapi_userinfo", "/user/login/?back=" + window.backurl);
						} else if (act == "save" && !result.is_login) {//--未登录禁止匿名保存
							defer.reject();
							// Gray.$page.loadPage("/user/login/?back=" + window.backurl);
							itou.auth.getCode("snsapi_userinfo", "/user/login/?back=" + window.backurl);
						} else {
							if(config.strategy.saveProjectWithNologin){//--策略允许匿名提交
								if(nologin){//--允许匿名提交
									defer.resolve();
								} else {
									if(result.is_login) {//--是否等陆
										defer.resolve();
									} else {//--未登录需确认是否匿名提交
										defer.reject();
										itou.sessionData.setData("__saveProject_data", {data: data});
										Gray.$page.loadPage("/confirm/noaccount/?back=" + window.backurl);
									}
								}
							}else{//--策略禁止匿名提交
								if(result.is_login) {//--是否等陆
									defer.resolve();
								} else {//--未登录需确认是否匿名提交
									defer.reject();
									// Gray.$page.loadPage("/user/login/?back=" + window.backurl);
									itou.auth.getCode("snsapi_userinfo", "/user/login/?back=" + window.backurl);
								}
							}
						}
						return defer.promise();
					})
					.then(function(){//--做单
						return itou.get({
								url: "make/index",
								data: data,
								type: "POST"
							});
					})
					.then(function(result){//--根据动作进行跳转
						var defer = $.Deferred();
						if(act == "submit"){//--提交店铺
							defer.reject();
							var localData = itou.localData.getData("__sys_lottery_type").key;
							localData.v = data.lottery_type;
							itou.localData.setData("__sys_lottery_type", {key: localData});
							itou.localJson.setJson("/project/detail/", {id: result.project_id});
							var backurl = window.backurl || "";
							if(backurl.has(encodeURIComponent("/confirm/noaccount/")) || backurl.has("/confirm/noaccount/")){
								backurl = encodeURIComponent(window.backpaths[0]) || backurl;
							}
							if(nologin){//--允许匿名提交，需要先进行微信授权
								itou.auth.getCode("snsapi_userinfo", "/confirm/?back=" + backurl + "&nologin=true");
							}else{
								Gray.$page.loadPage("/confirm/?back=" + backurl);
							}
						}else if(act == "save"){//--保存方案
							defer.reject();
							itou.localJson.setJson("/project/detail/", {id: result.project_id});
							var backurl = window.backurl || "";
							if(backurl.has(encodeURIComponent("/confirm/basket/")) || backurl.has("/confirm/basket/")){
								backurl = encodeURIComponent(window.backpaths[0]) || backurl;
							}
							if(nologin){//--允许匿名提交，需要先进行微信授权
								itou.auth.getCode("snsapi_userinfo", "/project/detail/?back=" + backurl + "&nologin=true");
							}else{
								Gray.$page.loadPage("/project/detail/?back=" + backurl);
							}
						}
						return defer.promise();
					});
			};

			self.getUrlParam = function(url ,key) {
				var reg = new RegExp("(^|&|\\?)" + key + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
				var r = url.match(reg);  //匹配目标参数
				if (r != null) return r[2]; return null; //返回参数值
			};

			self.getBackUrl = function(){
				var url = Gray.$page.href || (config.isAPP? "/": window.location.href),
					reg = /^(http:\/\/|https:\/\/|file:\/\/\/)[^\/]+\//,
					num = 0,
					r = {
						paths: [],
						backurl: null
					};
				url = url.replace(reg, "/").replace(/\/\//g, "/");
				//--鉴于code 或 auth_code 使用一次后会失效，因而在back中移除code等地址栏参数
				var code = self.getUrlParam(url, "code");
				url = url.replace("code=" + code, "1=1");
				var auth_code = self.getUrlParam(url, "auth_code");
				url = url.replace("auth_code=" + auth_code, "1=1");
				url = url.replace(/\&1=1/g, "");
				//--end
				function getBcak(url){
					var back = self.getUrlParam(url, "back");
					if(back){
						num += 1;
						back = decodeURIComponent(back);
						r.paths.push(back);
						return getBcak(back);
					}else{
						return url;
					}
				};
				var back = getBcak(url);
				if(num <= 8){
					r.backurl = encodeURIComponent(url);
				}else{
					r.backurl = encodeURIComponent(back);
				}
				console.debug(r);
				return r;
			};

			self.moneyFormat = function(num, fixedNum){//--金额格式化，自动处理成亿、万等单位
				fixedNum = fixedNum || 1;
				try {
					var num1 = Math.pow(10,8),
						num2 = Math.pow(10,4);
					if(num  / num1 > 1){
						num = (num / num1).toFixed(fixedNum) + "亿";
					}else if(num  / num2 > 1){
						num = (num / num2).toFixed(fixedNum) + "万";
					}else{
						num = (num * 1).toFixed(fixedNum) + "元";
					}
				} catch (error) {
					var num = (0).toFixed(fixedNum) + "元";
				}
				return num;
			};

			self.gotoTaps = function(url){//--同级标签页来回切换，不会影默认响返回功能
				var backurl = window.backpaths[0] || "/";
				backurl = encodeURIComponent(backurl);
				switch(true){
					case (url.has("?")):
						Gray.$page.loadPage(url + "&back=" + backurl);
						break;
					default:
						Gray.$page.loadPage(url + "?back=" + backurl);
				}
			};
			self.gotoDetail = function(lottery_type, id){//--跳转到简化的方案详情页
				var jingcai = [
						'SportteryWDL', 
						'SportteryNWDL', 
						'SportteryScore', 
						'SportteryTotalGoals', 
						'SportteryHalfFull', 
						'SportterySoccerMix'
					],
					danchang = [
						'WL',
						'WDL', 
						'Score', 
						'TotalGoals', 
						'HalfFull'
					],
					jingcailanqiu = [//--竞彩篮球类型
						"SportteryWL",//--胜负
						"SportteryHWL",//--让胜负
						"SportteryBS",//--大小分
						"SportteryWS",//--胜分差
						"SportteryBasketMix"//--竞彩篮球混合过关
					],
					zucai = ["ToTo", "NineToTo"],
					backurl = window.backurl,
					url;
				if(jingcai.contains(lottery_type) || danchang.contains(lottery_type)){
					url = "/confirm/project/jingcai/";
				}else if(jingcailanqiu.contains(lottery_type)){
					url = "/confirm/project/jingcailanqiu/";
				}else if(zucai.contains(lottery_type)){
					url = "/confirm/project/zucai/";
				}else if(lottery_type == "SSQ" || lottery_type == "SuperLotto"){
					url = "/confirm/project/number/";
				}else if(lottery_type == "P3" || lottery_type == "3D" || lottery_type == "P5" || lottery_type == "P7"){
					url = "/confirm/project/p33d/";
				}else{
					url = "/confirm/project/fast/";
				}
				url += "?back=" + backurl;
				if(id){
					url += "&id=" + id;
				}
				Gray.$page.loadPage(url);
			};

			self.autocache = {};
			self.autocache.setKey = function(api, key){//--记录自动缓存的接口的键值
				var obj = {};
				obj[api] = key;
				itou.sessionData.setData("__itou_outil_autocache.key", obj);
			};
			self.autocache.getKey = function(api){
				return itou.sessionData.getData("__itou_outil_autocache.key")[api];
			};

			/**
			 * 循环内演示执行函数。放入循环体内，可延时将arr1的内容存入arr内
			 * @param {Array} arr 目标数组，延时执行被插入的数组
			 * @param {Array} arr1 数据数组，延时执行要插入的数据
			 * @param {Number} n 延时时间，单位毫秒
			 */
			self.doSetTimeout = function(arr, arr1, n){
				setTimeout(function(){
					// console.log(arr, arr1, n);
					arr.push.apply(arr, arr1);
				}, n);
			}

			/**
			 * 展示“正在加载loading”层。
			 * @param {Number} len 展示时间，数字，单位S，可以是小数；
			 * @备注：只会同时存在一个层，如果连续多次调用，会以最后一次调用开始计时；
			 * @强行中止方式：调用 itou.outil.showLoading(0);可直接终止loading层展示
			 */
			self.showLoading = function(len){
				var el = $('#loaderbox__sys_itou_outil_showLoading'),
					key = "__sys_itou_outil_showLoading";
				itou.outil.timmer.clearTimmer(key);
				if(el.length == 0){
					el = $('#loaderbox').clone();
					el.attr("id", "loaderbox__sys_itou_outil_showLoading");
					el.appendTo("body");
				}
				el.show();
				itou.outil.timmer.newTimmer({
					key: key,
					timeout: len * 1000,
					fun: function(){
						el.hide();
						itou.outil.timmer.clearTimmer(key);
					}
				});
			};
		};

		//--微信认证构对象造函数
		var auth = function(obj){
			var self = this,
				regetNum = 0;
			self.parent = obj;
			self.code = Gray.$page.getUrlParam("code") || Gray.$page.getUrlParam("auth_code");//alert(self.code);
			//--当实例初始化时，判断当前帐户的认证和绑定状态
			self.checkWxauth = function(isToBindShop){
				var nologin = Gray.$page.getUrlParam("nologin") || null;
				var defer = $.Deferred();
				window.codePromise = defer.promise();
				if(!!self.code){
					self.parent.get({
						url: "user/auth",
						data: {
							code: self.code
						},
						formatResult: false
					})
					.then(function(result){
						console.info(JSON.stringify(result, null, 4))
						// confirm(JSON.stringify(result));
						regetNum += 1;
						if(result.errcode == -2){
							if(regetNum > 5){//--重复次数过多
								return;
							};
							// itou.gotoLogin();//--重新获取Code
							var url = Gray.$page.href || window.location.href;
							//领红包页跳转处理
							// if(url.has("/receivebonus")){
							// 	return;
							// }
							//领红包页处理完成
							var code = itou.outil.getUrlParam(url, "code");
							url = url.replace("code=" + code, "1=1");
							var auth_code = itou.outil.getUrlParam(url, "auth_code");
							url = url.replace("auth_code=" + auth_code, "1=1");
							url = url.replace(/\&1=1/g, "");
							self.getCode("snsapi_userinfo", url);//--重新获取Code
							return;
						}
						regetNum = 0;
						var data = result.data;
						console.log(data);
						self.parent.localJson.setJson("itou_is_subscribe", {key: data.is_subscribe, islogin: data.is_bind, timestamp: new Date().Dateformat("yyyy-MM-DD HH:NN:SS")});
						window.setTimeout(function() {
							defer.resolve();
						}, 500);

						var url = Gray.$page.href || window.location.href;
						if(!data.is_bind && nologin){
							//--不要求登陆的情况
						} else if(!data.is_bind && url.has("/user/login/")){
							//--就在登陆页面不需要跳转
						} else if(!data.is_bind){
							vm.logined = false;
						}else if(data.is_bind){
							if(url.has("/user/shop/details/")){
								return;
							}
							var back = Gray.$page.getUrlParam("back");
							if(back){
								itou.page.back();
								return;
							}
							var returnUrl = itou.localData.getData("__sys_window_return_url");
							returnUrl = returnUrl.url;
							var r = returnUrl || localStorage.getItem("returnUrl");
							if(!!r && !r.has("/user/login/")){
								Gray.$page.loadPage(r);
							}else{
								Gray.$page.loadPage("/");
							}
						}
					});
				}
			};

			/**
			 * 获取code
			 * @scope 	应用授权作用域，此时固定为：snsapi_userinfo
			 * 單頁面模式，直接進入指定的返回頁面
			 */
			self.getCode = function(scope, returnUrl){
				if(config.platform == "wx"){
					self.returnurl = Gray.page.href || window.location.href;
					localStorage.setItem("returnUrl", self.returnurl);
					// alert(returnUrl + "\n\r" + config.base_url)
					if(returnUrl){
						returnUrl = returnUrl.has(config.base_url)? returnUrl: config.base_url + returnUrl;
						var redirect_uri = encodeURIComponent(returnUrl);
					}else{
						try {
							// var redirect_uri = window.backpaths[0]? encodeURIComponent(window.backpaths[0]): window.backurl;
							var redirect_uri = window.backurl || encodeURIComponent("/");
							if(redirect_uri.has("code") || redirect_uri.has("auth_code")){
								redirect_uri = encodeURIComponent(window.backpaths[0]);
							}
							// redirect_uri = encodeURIComponent(config.base_url) + redirect_uri;
							redirect_uri = encodeURIComponent(config.base_url + "/user/login/?back=" + redirect_uri);
						} catch (error) {
							var redirect_uri = encodeURIComponent(config.base_url + "/user/login/");
						}
					}
					// var url = config.base_url;
					// if(!self.returnurl.toLowerCase().has("/user/login/")){
					// 	url += "/user/login/";
					// }
					// alert(redirect_uri)
					var url;
					if(config.browser == "wx"){
						var url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' +
							config.appid["wx"] + '&redirect_uri=' + redirect_uri +
							'&response_type=code' + '&scope=' + scope + '#wechat_redirect';
					}else if(config.browser == "ali"){
						var url = 'https://openauth.alipay.com/oauth2/publicAppAuthorize.htm?app_id=' +
							config.appid["ali"] + '&redirect_uri=' + redirect_uri +
							'&scope=auth_user';
					}
					// alert(url);
					window.location.href = url;
				}else{
					if(returnUrl){
						
						var href = Gray.$page.href || window.location.href;
						if(href == returnUrl) return;
						else var redirect_uri = returnUrl;
					}else{
						try {
							var redirect_uri = window.backpaths[0] || window.backurl;
							// redirect_uri = encodeURIComponent(config.base_url) + redirect_uri;
							redirect_uri = "/user/login/?back=" + encodeURIComponent(redirect_uri);
						} catch (error) {
							var redirect_uri = "/user/login/";
						}
					}
					Gray.$page.loadPage(redirect_uri);
				}
			};
			// self.getCode("snsapi_userinfo");
		};

		/**
		 * 本地存储JSON数据
		 * 数据存储在itou_localJson的key中
		 * 超过3天的数据会自动清除
		 */
		var localJson = function(obj){
			var self = this;
			self.parent = obj;
			var str = itou = localStorage.getItem("itou_localJson");
			var Json = str? strToJson(str): {};

			function strToJson(str){ 
				var json = (new Function("return " + str))(); 
				return json; 
			} 

			for(var i in Json){//--清除超过缓存时间的数据
				var lastTime = Json[i].lastTime || (3 * 24 * 3600);
				if(lastTime != -1){
					try{
						var timestamp  = new Date(Json[i].timestamp);
					}catch(e){
						delete Json[i];
						return;
					}
					var diff = timestamp.DateDiff("s", new Date());
					if(diff > lastTime){
						delete Json[i];
					}
				}
			}

			//--将json存入localStorage
			self.setJson = function(key, json, lastTime){//--lastTime:缓存时间，单位秒
				//--lastTime == -1，则为永久保存不清除
				lastTime = lastTime || (3 * 24 * 3600);
				if(Json[key]){
					json = $.extend({}, Json[key].json, json);
				}
				Json[key] = {
					'timestamp': new Date(),//--时间戳
					'lastTime': lastTime,//--缓存时间
					'json': json
				};
				localStorage.setItem("itou_localJson", JSON.stringify(Json));
			};
			//--从localStorage中读取json
			self.getJson = function(key){
				return Json[key]? Json[key].json || {}: {};
			};

			self.delJson = function(key, key1){
				if(key && key1){
					if(Json[key]){
						delete Json[key].json[key1];
					}
				}else if(key){
					delete Json[key];
				}
				//console.log(Json);
				localStorage.setItem("itou_localJson", JSON.stringify(Json));
			};

			self.clear = function(){//--清除所有存储数据
				localStorage.setItem("itou_localJson", "{}");
			};
		};

		/**
		 * 本地存储JSON数据
		 * 数据存储在itou_localData的key中
		 * 数据不会自动清除
		 */
		var localData = function(obj){
			var self = this;
			self.parent = obj;
			var str = itou = localStorage.getItem("itou_localData");
			var Json = str? strToJson(str): {};

			function strToJson(str){ 
				var json = (new Function("return " + str))(); 
				return json; 
			} 

			//--将json存入localStorage
			self.setData = function(key, json){
				if(Json[key]){
					json = $.extend({}, Json[key].json, json);
				}
				Json[key] = {
					'json': json
				};
				localStorage.setItem("itou_localData", JSON.stringify(Json));
			};
			//--从localStorage中读取json
			self.getData = function(key){
				return Json[key]? Json[key].json || {}: {};
			};

			self.delData = function(key, key1){
				if(key && key1){
					if(Json[key]){
						delete Json[key].json[key1];
					}
				}else if(key){
					delete Json[key];
				}
				console.log(Json);
				localStorage.setItem("itou_localData", JSON.stringify(Json));
			};

			self.clear = function(){//--清除所有存储数据
				localStorage.setItem("itou_localData", "{}");
			};
		};

		/**
		 * 本地存储JSON数据
		 * 数据存储在itou_sessionData的key中
		 * 数据不会自动清除
		 */
		var sessionData = function(obj){
			var self = this;
			self.parent = obj;
			var str = itou = sessionStorage.getItem("itou_sessionData");
			var Json = str? strToJson(str): {};

			function strToJson(str){ 
				var json = (new Function("return " + str))(); 
				return json; 
			} 

			//--将json存入sessionStorage
			self.setData = function(key, json, lastTime){
				var rnd = Math.random() * 100;
				if(rnd > 33){
					for(var i in Json){//--清除超过30分的数据
						try{
							var timestamp  = new Date(Json[i].timestamp);
						}catch(e){
							delete Json[i];
							return;
						}
						var lTime = Json[i].lastTime || 30;
						var diff = timestamp.DateDiff("n", new Date());
						if(diff > lTime){
							delete Json[i];
						}
					}
				}
				if(Json[key]){
					json = $.extend({}, Json[key].json, json);
				}
				Json[key] = {
					'timestamp': new Date(),//--时间戳
					'lastTime': lastTime || 30, //--有效期， 单位：分钟
					'json': json
				};
				sessionStorage.setItem("itou_sessionData", JSON.stringify(Json));
			};
			//--从sessionStorage中读取json
			self.getData = function(key){
				return Json[key]? Json[key].json || {}: {};
			};

			self.delData = function(key, key1){
				if(key && key1){
					if(Json[key]){
						delete Json[key].json[key1];
					}
				}else if(key){
					delete Json[key];
				}
				console.log(Json);
				sessionStorage.setItem("itou_sessionData", JSON.stringify(Json));
			};

			self.clear = function(){//--清除所有存储数据
				sessionStorage.setItem("itou_sessionData", "{}");
			};
		};

		/**
		 * 系统固定设置信息
		 * 用于设置一些固定的配置信息，例如省份等
		 */
		var Setting = function(obj){
			var self = this;
			self.parent = obj;
			obj.$setting = {};

			self.setData = function(key, val){
				obj.$setting[key] = val;console.log(obj.$setting)
			};

			self.getData = function(key){
				return obj.$setting[key] || null;
			};

			self.delData = function(){
				delete obj.$setting[key];
			};
		};

		var TimeLine = function(obj){//--时间线对象，用于进行性能分析
			var self = this;
			self.parent = obj;

			self.config = {//--基础设置
				autoAnalyze: true,//--是否自动分析
				timeout: 5000,//--自动分析延时时间，autoAnalyze == true时生效
				timeMin: 3000,//--自动分析延时时间最小值
				timeMax: 30000,//--自动分析延时时间最大值
				debug: true//--是否在标记函数触发时展示标记信息
			};

			try{//--监听auto属性设置，来开启或关闭时间线自动分析
				Object.defineProperty(self, 'auto', {
					set: function(val){
						if(val == "on"){
							self.config.autoAnalyze = true;
						}else if(val == "off"){
							self.config.autoAnalyze = false;
						}
					}
				})
			}catch(e){
				console.error(e);
			}

			try{//--监听timeout属性设置，来设置时间线自动分析延时,单位：毫秒
				Object.defineProperty(self, 'timeout', {
					set: function(val){
						if(!val || isNaN(val)){//--非数字直接返回
							return;
						}else if(val > self.config.timeMax){//--超过最大延时
							self.config.timeout = self.config.timeMax;
						}else if(val < self.config.timeMin){//--低于最小延时
							self.config.timeout = self.config.timeMin;
						}else{
							self.config.timeout = val;
						}
					}
				})
			}catch(e){
				console.error(e);
			}

			try{//--监听debug属性设置，来开启或关闭时间线标记展示
				Object.defineProperty(self, 'debug', {
					set: function(val){
						if(val == "on"){
							self.config.debug = true;
						}else if(val == "off"){
							self.config.debug = false;
						}
					}
				})
			}catch(e){
				console.error(e);
			}

			var marks = {},//---标记数据对象，数据形式{"1": {key: {msg: "msg", time: "time"}}}
				keys = [],//--标记键值数组，用于记录顺序,数据形式：[[key1, key2, key3], [key1, key2, key3]]
				error = [],//--错误信息，一般用于记录标记key重复信息，数据结构：[{cutOff: 1, key: key}]
				result = {},//--时间间隔计算对象，数据结构：{55: [{cutOff: 3, prev: {key: key, msg: msg, time: time}, curr: {key: key, msg: msg, time: time}}]}
				timeInterval = [],//--时间间隔数组，用于计算间隔最大值和最小值
				timmer = null;
			
			self.cutOff = function(){//--时间线分割
				keys.push([]);
				var len = keys.length,
					debug = self.config.debug;
				marks[len] = {};
				if(debug){
					console.debug("timeLine", "**********************时间线分割**********************");
				}
				return self;
			};

			self.stamp = function(key, msg){//--时间线标记函数
				if(keys.length == 0){//--初始数据处理
					keys.push([]);
					var len = keys.length;
					marks[len] = {};
				}
				var auto = self.config.autoAnalyze,
					timeout = debug = self.config.timeout,
					debug = self.config.debug,
					len = keys.length,
					ks = keys[len - 1],
					mrks = marks[len];
				if(!mrks[key]){//--添加标记
					mrks[key] = {
						msg: msg,
						time: new Date()
					};
					ks.push(key);
					if(debug){
						console.debug("timeLine", "——添加标记", "key = ", key, "msg = ", msg);
					}
				}else{//-错误信息记录
					error.push({"cutOff": len, "key": key});
					console.error("timeLine", "——添加标记", "标记" + key + "已存在，本次标记无效");
				}
				if(auto){//--自动执行数据分析
					if(!!timmer){//--清除计时器
						window.clearTimeout(timmer);
					}
					timmer = window.setTimeout(function() {//--重新开始计时分析
						self.analyze();
					}, timeout);
				}
			};

			self.analyze = function(){//--开始时间线分析
				var errLen = error.length;
				if(errLen){//--抛出错误信息
					console.error("timeLine", "——分析:", "标记存在重复，无法分析");
					for(var i = 0; i < len; i ++){
						console.error("timeLine", "——标记重复:", "分割数：", error[i].cutOff, "键值：", error[i].key);
					}
					return;
				}
				var len = keys.length;
				for(var i = 0; i < len; i++){//--循环输出分析数据
					var prev = null,
						curr = null,
						cutOff = i + 1,
						ks = keys[i],
						klen = ks.length,
						mrks = marks[cutOff];
					for(var ii = 0; ii < klen; ii ++){
						var key = ks[ii],//--当前键值
							mark = mrks[key];//--当前标记信息
						curr = {//--当前标记
							key: key,
							msg: mark.msg,
							time: mark.time
						};
						console.log("timeLine", "——标记信息：", "分割数：", cutOff, "key：", key, "msg：", mark.msg, "time：", mark.time);
						if(!prev){
							console.log("开始标记，无上一时间标记");
						}else{
							var diff = curr.time - prev.time;
							timeInterval.push(diff);
							if(!result[diff]){
								result[diff] = [];
							}
							result[diff].push({cutOff: cutOff, prev: prev, curr: curr});
							console.log("执行时间：", diff);
						}
						prev = {//--当前标记
							key: key,
							msg: mark.msg,
							time: mark.time
						};
					}
				}
				var max = Math.max.apply(null, timeInterval),
					min = Math.min.apply(null, timeInterval),
					maxMsg = result[max],
					minMsg = result[min];
				console.log("最大运行时间：", max);
				console.log(maxMsg);
				console.log("最小运行时间：", min);
				console.log(minMsg);
				console.log("marks = ", marks);
				console.log("keys = ", keys);
				console.log("error = ", error);
				console.log("result = ", result);
				console.log("timeInterval = ", timeInterval);
			};

			self.end = function(){//--忽视延时，直接输出分析数据，并清空数据信息
				var auto = self.config.autoAnalyze,
					timeout = debug = self.config.timeout,
					debug = self.config.debug;
				if(!!timmer){//--清除计时器
					window.clearTimeout(timmer);
					timmer = null;
				}
				self.analyze()//--进行数据分析
				//--清空数据
				marks = {};
				keys = [];
				error = [];
				result = {};
				timeInterval = [];
				timmer = null;
			};
		};

		var History = function(itou){
			var self = this;
			self.parent = itou;

			self.add = function(openPage){
				var history = itou.sessionData.getData("__sys_history") || {},
					paths = history.paths || [],
					url = Gray.$page.href || window.location.href;
				history.paths = history.paths || paths;
				if(openPage || !paths[0]){
					var p = [];
					p.splice(0, 0, url);
					paths.splice(0, 0, p);
				}else{
					if(url != paths[0][0]){
						paths[0].splice(0, 0, url);
					}
				}
				itou.sessionData.setData("__sys_history", history, 60 * 24);
			};

			self.back = function(){
				var history = itou.sessionData.getData("__sys_history") || {},
					paths = history.paths || [];
				history.paths = history.paths || paths;
				try {
					var r = paths[0][0];
					paths[0].splice(0, 1);
				} catch (error) {
					var r = "/";
				}
				itou.sessionData.setData("__sys_history", history, 60 * 24);
				return r;
			};

			self.close = function(){
				var history = itou.sessionData.getData("__sys_history") || {},
					paths = history.paths || [];
				history.paths = history.paths || paths;
				try {
					var r = paths[1][0];
					paths.splice(0, 1);
				} catch (error) {
					var r = "/";
				}
				itou.sessionData.setData("__sys_history", history, 60 * 24);
				return r;
			};
		};

		var Page = function(itou){
			var self = this;
			self.parent = itou;

			self.loadPage = function(url, openPage){
				itou.history.add(openPage);
				Gray.$page.loadPage(url, openPage);
			};

			self.back = function(params){
				// var url = Gray.$page.getUrlParam("back") || itou.history.back();
				// url = url? url: window.prevPage;
				// alert(url);
				params = params || {};
				var def = {
						step: 1//--返回步数
					},
					url = Gray.$page.getUrlParam("back") || itou.history.back();
				url = url? url: window.prevPage;
				params = $.extend({}, def, params);
				url = url || "/";
				var step = params.step;
				for(var i = 2; i <= step; i++){
					url = itou.outil.getUrlParam(url, "back");
					url? url = decodeURIComponent(url): url = "/";
				}
				Gray.$page.loadPage(url);
			};

			self.close = function(){
				var url = itou.history.close();
				url = url? unescape(url): "/";
				Gray.$page.loadPage(url);
			};
		};

		var Cookie = function(itou){
			var self = this;
			self.parent = itou;
			self.set = function(params){
				var str = [];
				str.push(params.name + "=" + params.value);
				params.expires? str.push("expires=" + params.expires): "";
				// params.path? str.push("path=" + params.path): "";
				str.push("path=/");
				params.domain? str.push("domain=" + params.domain): "";
				params.secure? str.push("secure=" + params.secure): "";
				document.cookie = str.join(";");
			};
			self.get = function(name){
				var strCookie = document.cookie,
					arrCookie = strCookie.split("; "),
					len = arrCookie.length;
				for(var i = 0; i < len; i++){
					var arr = arrCookie[i].split("=");
					if(arr[0] == name){return arr[1];}
				}
				return "";
			};
			self.del = function(name){
				self.set({
					name: name,
					value: "",
					expires: -1
				});
			};
		};

		var DataModel = function(itou){
			var self = this;
			self.parent = itou;
			self.debug = window.environment == "development";
			
			var $default = {
				// item: {//--每行赛事信息的数据对应关系； t: 选项说明; k: 选项在接口数据中的键值; d: 选项默认值
				// 	no: {t: "编号", k: "serial_no", d: ""},
				// 	saishi: {t: "赛事", k: "league_name", d: ""}
				// }
			};

			/**
			 * 使用方式：
			 * 注意：选项数据格式 = {t: "描述信息", k: "键值", d: "默认值"}
			 * 关于默认值：	可以是object对象，但实例化后，所有实例化对象共享
			 * 				可以是function，,会被立即执行
			 * itou.dataModel.config({
				key: "toto_Item",
				opts: {
					no: {t: "编号", k: "serial_no", d: ""},
					saishi: {t: "赛事", k: "league_name", d: ""},
					bgcolor: {t: "赛事背景色", k: "league_color[0]", d: ""},
					fontcolor: {t: "赛事字体颜色", k: "league_color[1]", d: "#000"},
					date: {t: "比赛时间", k: "match_time", d: ""},
					id: {t: "标识", k: "match_id", d: ""},
					hostName: {t: "主队名称", k: "host_name_s", d: ""},
					guestName: {t: "客队名称", k: "guest_name_s", d: ""},
					peilv3: {t: "胜赔率", k: "odds[3]", d: "0"},
					peilv1: {t: "平赔率", k: "odds[1]", d: "0"},
					peilv0: {t: "负赔率", k: "odds[0]", d: "0"},
					selected: {t: "选中项", k: "", d: []},
					dan: {t: "胆", k: "", d: false}
				}
			});
			 */
			self.config = function(params){//--处理默认设定
				var key = params.key,
					opts = params.opts;
				$default[key] = $.extend({}, $default[key], opts);
			};

			self.dataFactory = new function(){//--数据信息创建工厂
				var _self = this;
				_self.create = function(key){//--创建并返回行数据原型
					var arr = [];//--接口数据信息映射处理
					if(!$default[key]){
						if(self.debug) {
							console.debug("不存在类型为" + key + "的接口对应关系");
						}
						return new function(){};
					}
					arr.push("var debug = " + self.debug + ";");
					arr.push("var _default = $default['" + key + "'];");
					for(var i in $default[key]){
						arr.push("try{");
						if($default[key][i].k){//--当设置中存在键值时，获取键值代表数据
							arr.push("var val = apiData." + $default[key][i].k + ";");
							arr.push("switch (typeof val) {");
							arr.push("case 'undefined': throw ''; break;");//--当值不存在时，进入获取默认值流程
							arr.push("case 'function': _self." + i + " = val(apiData, _self); break;");//--当值的类型为function，立即执行获取返回值
							arr.push("default: _self." + i + " = val; break;");//--默认获得当前值
							arr.push("}");
						}else{//--当设置中不存在键值时，抛出，进入获取默认值过程
							arr.push("throw ''");
						}
						arr.push("}catch(error){");
							arr.push("try{");//--尝试获取默认值
							arr.push("var val = _default['" + i + "'].d;");
							arr.push("switch (typeof val) {");
							arr.push("case 'undefined': _self." + i + " = null; break;");
							arr.push("case 'function': _self." + i + " = val(apiData, _self); break;");
							arr.push("default: _self." + i + " = val; break;");
							arr.push("}");
							arr.push("}catch(error){");
							arr.push(" _self." + i + " = null;");
							arr.push("if(debug && error.message){");
							arr.push("console.error(error.message)");
							arr.push("}");
							arr.push("}");
						arr.push("if(debug && error.message){");
						arr.push("console.error(error.message)");
						arr.push("}");
						arr.push("}");
					}
					var __Data = function(apiData){//--数据原型
						var _self = this;
						var opts = new Function("_self", "apiData", "$default", arr.join("\n"));
						apiData = apiData || {};
						opts(_self, apiData, $default);
					};
					__Data.prototype.reload = function(apiData){//--重新加载数据
						var _self = this;
						var opts = new Function("_self", "apiData", "$default", arr.join("\n"));
						apiData = apiData || {};
						opts(_self, apiData, $default);
						return _self;
					};
					__Data.prototype.getJson = function(){//--返回纯JSON数据
						var _self = this,
							r = {};
						for(var i in _self){
							if(typeof _self[i] != "function"){
								r[i] = _self[i];
							}
						}
						return r;
					};
					return __Data;
				};
			};
		};

		var ApiTimeout = function(itou){//--接口超时处理
			var self = this;
			self.seconds = 15;//--超时时间
			self.showErr = true;//--是否展示错误页面
			self.errUrl = "/errors/";//--错误页面Url地址
			self.showLoading = false;//--是否展示正在加载的图标
			var sLgKey = "";//--showLoading计时器key

			var maps = {};//--接口开始数据映射

			self.startApi = function(key){//--接口调用开始，参数为接口唯一标识
				self.endApi();
				if((Gray.$page.href + "").has(self.errUrl)){//--网络错误展示页面不执行接口计时
					return;
				}
				console.debug("apiTimeout.startApi", new Date().getTime());
				if(!self.showLoading){
					window.clearTimeout(sLgKey);
					self.showLoading = true;
					sLgKey = setTimeout(function(){
						if(self.showLoading){
							///todo:展示加载中的图标
						}
					}, 700);
				}
				maps[key] = {};
				maps[key].timeoutKey = setTimeout(function(){
					self.timeoutErr();//--15秒后展示超时错误页面
				}, self.seconds * 1000);
			};
			self.endApi = function(key){//--接口调用结束，参数为接口唯一标识
				if(maps[key] && maps[key].timeoutKey){
					window.clearTimeout(maps[key].timeoutKey);
					delete maps[key];
					console.debug("apiTimeout.endApi", new Date().getTime());
					if(JSON.stringify(maps) == "{}"){
						window.clearTimeout(sLgKey);
						self.showLoading = false;
						///todo:隐藏加载中的图标
					}
				}
			};
			self.timeoutErr = function(){//--超时错误处理，转到超时错误展示页面
				for(var i in maps){
					window.clearTimeout(maps[i].timeoutKey);
				}
				Gray.$page.loadPage(self.errUrl + "?back=" + window.backurl);
			};
		}

		window.itou = new ITOU();

		itou.loader = "on";//--开启页面加载提示

		var gray_loadPage = Gray.$page.loadPage;
		Gray.$page.loadPage = function(url, openPage){
			// console.log("Gray.loadPage");
			if(window.vueObj && itou.outil.is(window.vueObj, "Array")){//--销毁原Vue对象
				var len = window.vueObj.length;
				for(var i = len - 1; i >= 0; i --){
					var vm = window.vueObj[i];
					if(vm.destroy){
						vm.destroy();
					}
					window.vueObj[i] = null;
					window.vueObj.splice(i, 1);
				}
				// console.log(window.vueObj);
			}
			gray_loadPage(url, openPage);
			if(config.browser == "android" || config.browser == "ios"  || config.browser == "app"){
				Gray.$entrust["page-load-prev-page"]();
				// Gray.$entrust["single-link-click"]();
			}
		};

		Gray.entrust.define("page-load-prev-page", function(){
			var prev = itou.sessionData.getData("__sys_window_prev_page").key || "";//--获取上一页的名称
			if(!$.isArray(prev)){
				prev = [prev];
			}
			var url = Gray.$page.href || window.location.href;//console.log(url, prev);
			if(url == prev[0]){
				window.prevPage = prev[1] || "";
				window.prevs = prev || [];
				window.isReload = true;
			}else{
				window.isReload = false;
				window.prevPage = prev[0] || "";
				window.prevs = prev || [];
				prev.splice(0, 0, url);
			}
			if(prev.length > 50){prev.length = 50;}
			itou.sessionData.setData("__sys_window_prev_page", {key: prev});
		});

		Gray.entrust.define("page-load-auth-check", function(){
			var prev = window.prevs,
				isToBindShop = false;
			for(var i = 0, len = prev.length; i < len; i++){
				if(!prev[i].has("/user/login/")){
					isToBindShop = prev[i].has("/user/shop/details/") || prev[i].has("/user/shop/bind_succ/");
					break;
				}
			}
			window.isToBindShop = isToBindShop;
			var url = Gray.$page.href || window.location.href;
			if(!url.has("/pay/scan/")){//--扫码入口页例外，其他页进行授权判断
				itou.auth.checkWxauth(isToBindShop);
			}
		});

		/**
		 * 页面加载场景检测，用于支持自动绑定店铺和匿名提交
		 * 场景：扫码 = scan，分享 = share， 店铺采种 = station_lottery， 公众号 = wx
		 */
		Gray.entrust.define("page-load-scene-check", function(){//--页面加载场景检测
			var scene = Gray.$page.getUrlParam("scene"),//--入口场景
				station_id = Gray.$page.getUrlParam("station_id"),//--店铺id
				share_id = Gray.$page.getUrlParam("share_id");//--分享人ID
			if(!scene){
				return;
			}else if(scene == "wx"){
				itou.localJson.delJson("__entry_info");//--删除场景缓存
			}else{
				var entry_info = itou.localJson.getJson("__entry_info") || {},
					stationID = entry_info.station_id;
				if(!station_id){
					return;
				}
				/**
				 * 2017-11-23 10:16:18
				 * 注释部分代码，取消场景优先级，所有场景和店铺ID统一都会被新的覆盖
				 */
				// if(station_id == stationID){//--当分享店铺相同时
				// 	if(entry_info.scene != "scan"){//--扫码场景拥有最高优先级，不被其他场景覆盖
				// 		entry_info.scene = scene;
				// 	}
				// }else{//--分享店铺不同时，覆盖所有信息
					entry_info.scene = scene;
					entry_info.station_id = station_id;
				// }
				entry_info.share_id = share_id;
				itou.localJson.setJson("__entry_info", entry_info, -1);
			}
		});

		/**
		 * 微信对象全局初始化和微信分享设置
		 */
		Gray.entrust.define("page-load-wx-init", function(){
			var url = window.location.href;
			if(itou.outil.isSharePage()){
				return;
			}
			var result = null;
			var getInfo = function(){
				return itou.get({//--获取分享人信息和绑定店铺信息
						url: "user/GetDefaultStation",
						data: {},
						formatResult: false,
						autocache: true,
						sessionCache: true
					})
					.then(function(rlt){
						result = rlt;
					});
			};
			Gray.plugin.require("init.js");
			Gray.$plugin["init.js"]()
				.then(function(){
					// console.debug(result);
					// try {//--分享人处理
					// 	var data = result.data,
					// 		station_id = data.list[0],
					// 		share_id = data.user_id;
					// } catch (error) {
					// 	var station_id = null,
					// 		share_id = null;
					// }
					var entry_info = itou.localJson.getJson("__entry_info") || {},
						station_id = entry_info.station_id,
						share_id = null;
					var self = {},
						href = window.location.href;
					if(href.has("scene=")){//--连接中是否存在场景参数
						href = href.replace(/scene=[\d_]+/g, "scene=share");
					}else{
						href += (href.has("?")? "&": "?") + "scene=share";
					}
					if(!!station_id){
						href = href + (href.has("?")? "&": "?") + "station_id=" + station_id;
					}
					if(!!share_id){
						href = href + (href.has("?")? "&": "?") + "share_id=" + share_id;
					}
					self.data = {};
					self.data.shareMess = {
						title: "口袋彩店",
						imgUrl: "//koudai.itou.com/static/images/koudailogo-b324c8e7cd.png",
						desc: "打开微信就能用，身边的彩店随时随地为您服务。",
						link: href
					};
					self.wx = wx;
					return self;
				})
				.then(function(self){
					// console.debug(self);
					Gray.plugin.define("self", [], function(){return self});
					// console.debug(itou.setting.getData("__onMenuShareAppMessage"), itou.setting.getData("__onmenusharetimeline"));
					var href = window.location.href;
					if(!href.has("/user/shop/details") && !href.has("/project/details")){//--防止共共分享覆盖私有分享
						// function wx_share_build(){
						// 	Gray.plugin.require("onmenushareappmessage.js");//--微信分享给好友
						// 	Gray.$plugin["onmenushareappmessage.js"]();
						// 	Gray.plugin.require("onmenusharetimeline.js");//--微信分享给好友
						// 	Gray.$plugin["onmenusharetimeline.js"]();
						// }
						// document.addEventListener('WeixinJSBridgeReady', wx_share_build, false);
					// 	function check_weixin(wx_share_callback){
					// 		if(typeof WeixinJSBridge == 'undefined' || (typeof WeixinJSBridge.invoke == 'undefined')){
					// 			window.setTimeout(check_weixin(wx_share_callback), 200);
					// 		}
					// 		else{
					// 			wx_share_callback();
					// 		}
					// 	}
						
					// 	check_weixin(wx_share_build);
						Gray.plugin.require("onmenushareappmessage.js");//--微信分享给好友
						Gray.$plugin["onmenushareappmessage.js"]();
						Gray.plugin.require("onmenusharetimeline.js");//--微信分享给好友
						Gray.$plugin["onmenusharetimeline.js"]();
					}
				});
			// Gray.$plugin["init.js"]()//--微信授权
			// 	.then(function(){
			// 		return itou.get({//--获取分享人信息和绑定店铺信息
			// 			url: "user/GetDefaultStation",
			// 			data: {},
			// 			formatResult: false,
			// 			autocache: true
			// 		});
			// 	})	
		});
		/**
		 * 全局APP插件初始化和分享功能设置
		 */
		Gray.entrust.define("page-load-app-init", function(){
			console.log("当前操作：", "page-load-app-init");
			Gray.plugin.require("init.js");
			Gray.plugin.require("exitapp.js");
			Gray.plugin.require("backbutton.js");
			// Gray.plugin.require("checknetwork.js");
			Gray.plugin.require("startprogress.js");
			Gray.plugin.require("endprogress.js");
			Gray.plugin.require("getdevicetoken.js");
			Gray.$plugin["init.js"]()
				.then(function(){
					try {
						Gray.$plugin["backbutton.js"]();
						// Gray.$plugin["checknetwork.js"]();
						// Gray.$plugin["startprogress.js"]();
					} catch (error) {
						console.error(error.message, error);
					}
				});
			$(function(e){
				console.log("当前状态：", "页面加载完成。");
				try {
					itou.setting.setData("__app_document_ready", {status: "ready"});
					// Gray.$plugin["endprogress.js"]();
				} catch (error) {
					console.error(error.message, error);
				}
			});
			itou.page.__back = itou.page.back;
			var backbtnNum = 0,//--短时间内主页返回按钮点击次数
				key = "__index_backbtn_dbClick"
			itou.page.back = function(params){//--封装APP独有逻辑
				var url = Gray.$page.getUrlParam("back") || itou.history.back();
					url = url? url: window.prevPage;
				url = url || "/";
				var $href = Gray.$page.href;
				if((!$href || $href == "/") && url == "/"){
					backbtnNum += 1;
					if(backbtnNum < 2){
						vm.showToast("再次点击关闭应用");
						itou.outil.timmer.clearTimmer(key);//--清除计时器
						// itou.outil.timmer.newTimmer({
						// 	key: key,
						// 	timeout: 1000,
						// 	fun: function(){
						// 		backbtnNum = 0;
						// 		itou.outil.timmer.clearTimmer(key);//--清除计时器
						// 	}
						// });
					}else{
						Gray.$plugin["init.js"]()
							.then(function(){//--关闭APP
								try {
									Gray.$plugin["exitapp.js"]();
								} catch (error) {
									console.error(error.message, error);
								}
							});
					}
					return;
				}
				itou.page.__back(params);
			};
			var dtManage = itou.setting.getData("device_token");
			window.setTimeout(function(){
				dtManage.update();
			}, 500);
			itou.__get = itou.get;
			itou.get = function(params){//--封装APP独有接口逻辑
				var url = params.url;
				if(url == "user/info" || url == "user/reglogin" || url == "user/Unbind"){
					return itou.__get(params)
						.then(function(result){
							if(!result.errcode || result.errcode === 0){//--接口正常
								if(url == "user/info" || url == "user/reglogin"){
									dtManage.update(url);//--更新设备token
								}else if(url == "user/Unbind"){
									dtManage.del();//--删除设备token
								}
							}
							return result;
						});
				}else{
					return itou.__get(params);
				}
			};
			document.addEventListener('deviceready', function(res){//--解决cookies问题
				// self.showDemo = true;
				console.log("deviceready：", res);
				console.log("deviceready：", res);
				if(device&&device.platform == "iOS"){
					var args = ['GET', 'https://www.itou.com'];
					cordova.exec(null, null, 'WKWebViewSyncCookies', 'sync', args);
				}
			});
		});

		//--页面链接点击事件委托指令注册
		Gray.entrust.define("single-link-click", function() {
			$(function(){
				var fun = function(e){//console.log("click")//--body点击事件绑定
						try {
							self.parent.history.log = "on";//--修改历史记录开关，使页面跳转正常记录历史状态
						} catch (error) {
							
						}
						var el = this;//--获取事件触发元素
						var href = el.getAttribute("href");
						var openPage = el.getAttribute("target") || "";
						openPage = openPage.has("blank");
						var canback = el.getAttribute("canback") || false;
						var backStamp = el.getAttribute("data-back") || false;
						var backurl =  el.getAttribute("backurl") || "";
						//--tel,msm(通话、短信)唤起处理
						if(!!href && (href.replace(/ /g,"").indexOf("tel:") == 0 || href.replace(/ /g,"").indexOf("sms:") == 0)){
							var a = document.createElement("a");
							a.href = href;
							a.click();
						}else if(!!href && href.replace(/ /g,"").indexOf("javascript:") < 0){//--当触发元素为a，并且href属性不以“javascript:”开头时，委托点击事件，
							if(backStamp == "default"){
								href += (href.has("?")? "&": "?") + "back=" + (window.backurl);
							}else if(backurl){
								href += (href.has("?")? "&": "?") + "back=" + (backurl);
							}
							if(canback){
								itou.page.loadPage(href, openPage);
							}else{
								Gray.$page.loadPage(href, openPage);
							}
						}else if(!!href && href.replace(/ /g,"").indexOf("javascript:history.go(-1)") == 0){
							itou.page.back();
						}
						return false;
					}
					$("a[href]").on("click", fun);
					if(config.isAPP){
						$("a[href]").die("click");
						$("a[href]").live("click", fun);
						//$("a[href^='tel:']").die("click");//--呼叫唤起A标签例外处理
						//$("a[href^='sms:']").die("click");//--短信唤起A标签例外处理
					}
					/**
					 * 链接接管会影响特殊a标签功能。
					 * 例如：唤起呼叫功能的A标签，由于功能接管，会导致地址栏变化，Vue实例销毁而使页面绑定事件失效
					 * 因此，对于特殊链接做例外处理
					 */
					
					//$("a[href^='tel:']").off("click");//--呼叫唤起A标签例外处理
					//$("a[href^='sms:']").off("click");//--短信唤起A标签例外处理
			});
		});

		//--ios系统safari浏览器隐身模式判断
		try{
			localStorage.setItem("ios-localStory-check-msg", "test");
		}catch(e){
			alert("本地储存写入错误，若为safari浏览器请关闭隐身模式浏览。");
		}

		Gray.$entrust["page-load-prev-page"]();
		// Gray.$entrust["single-link-click"]();
		Gray.$entrust["page-load-scene-check"]();//--页面加载场景检测
		Gray.$entrust["page-load-auth-check"]();
		if(config.browser == "wx"){//--全局微信插件初始化和分享功能设置
			Gray.$entrust["page-load-wx-init"]();
		}
		if(config.browser == "android" || config.browser == "ios"  || config.browser == "app"){//--全局APP插件初始化和分享功能设置
			itou.setting.setData("device_token", {//--设备token管理
				key: "__device_token",
				update: function(url){//--设置设备token缓存
					var key = itou.setting.getData("device_token").key,
						device_token = itou.localData.getData(key).device_token;//--缓存的设备token
					Gray.$plugin["init.js"]()
						.then(function(){
							try {
								return Gray.$plugin["getdevicetoken.js"]()//--获取当前设备token
									.then(function(_device_token){
										if(device_token != _device_token.token || url == "user/reglogin"){//--与缓存token进行对比，如果不一样，则调用接口更新设备token
											itou.get({
													url: "app/updatedevicetoken",
													data: {
														device_token: device_token,
														device_token_new: _device_token.token
													},
													formatResult: false
												})
												.then(function(rlt){//--更新缓存设备token
													if(rlt.errcode == 0){
														itou.localData.setData(key, {device_token: _device_token.token});
													}
												});
										}
									});
							} catch (error) {
								console.error(error.message, error);
								return false;
							}
						});
				},
				del: function(){//--清除设备token缓存
					var key = itou.setting.getData("device_token").key,
						device_token = itou.localData.getData(key).device_token;//--缓存的设备token
					Gray.$plugin["init.js"]()
						.then(function(){
							try {
								return Gray.$plugin["getdevicetoken.js"]()//--获取当前设备token
									.then(function(_device_token){
										// if(device_token != _device_token){//--与缓存token进行对比，如果不一样，则两个token全部删除，否则只删除一个
											
										// }else{

										// }
										var _old = device_token,
											_new = _device_token.token;
										itou.localData.setData(key, {device_token: ""});//--清空缓存设备token
										itou.get({//--调用接口，删除设备token
												url: "app/deletedevicetoken",
												data: {
													device_token: _old,
													device_token_new: _new
												}
											})
											.then(function(){
											});
									});
							} catch (error) {
								console.error(error.message, error);
								return false;
							}
						});
				}
			});
			Gray.$entrust["page-load-app-init"]();
		}
		console.log("window.prevPage:",window.prevPage);
		// console.log("window.prevs:",window.prevs);

		window.onpageshow  = function(e) {//--防止IOS返回按钮读取缓存，致使页面事件未加载问题
			if(e.persisted){
				if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
					console.log("iPhone|iPad|iPod|iOS");
					window.location.reload();
				} else if (/(Android)/i.test(navigator.userAgent)) {
					console.log("Android");
				} else {
					console.log("PC");
				};
			}
		};
		//js错误抓取
		window.onerror = function(errorMessage, scriptURI, lineNumber,columnNumber,errorObj){
			var stack = '';
			var u_agent = '';
			if(navigator) u_agent = navigator.userAgent;
			if(errorObj && errorObj.stack) stack = errorObj.stack;
			var ajax_obj = {
				env : window.environment,
				platform : 'koudai_'+ config.browser,
				u_agent : u_agent,
				err: errorMessage,
				url: window.location.href,
				script: scriptURI,
				line: lineNumber,
				column: columnNumber,
				detail: {stack: stack},
			};
			var msg = window.JSON.stringify(ajax_obj);
			$.ajax({
				url: config.api_url + 'common/errorlog',
				data: {msg:msg},
				type: 'post',
				success:function(result){
				}
			});
		};

	})(window, Zepto);


/***/ }
/******/ ]);