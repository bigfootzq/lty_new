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
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {/**
	 * 框架名：Gray
	 * 目标：实现将一套代码，通过不同的gulp方案处理，可以在不同平台运行；
	 * 功能：跨平台api封装，多页面与单页面转换，对象、计时委托听与销毁，页面链接点击事件委托
	 * by.zhaoyf.2016-07-28
	 * ver 0.0.1
	 * 依赖：zepto，需要defer，或者jQuery; zepto优先
	 * 框架使用了Object.defineProperty 和 h5的新特性，低版本浏览器兼容性稍差
	 */

	(function(window, $){
		//$ = $ || document.queryselectorall;//--选择符定义
		
		/**
		 * 框架对象构造函数
		 */
		
		var gray = function(){
			var self = this,
				hasConfig = false,//--是否已经执行config函数
				hasMake = false;//--是否已经执行make函数
			var reservedWords = {//--系统保留字，判断时不区分大小写
				platform: true,
				config: true,
				singleModel: true,
				loadType: true
			};
			//self.Zepto = !!$;//--是否引入Zepto
			self.$config = {};//--config函数和make函数设置的属性
			var singleModel = {//--使用单页模式的框架
				android: true,
				ios: true,
				app: true
			};
			//self.$config.loadType = "ajax";//--页面通过Ajax加载html和js
			if(self.$config.loadType == "ajax"){//--当页面使用Ajax加载html和js时
				window.module = {};
				try{//--使用单页模式的平台
					Object.defineProperty(module, "exports", {//--监听module.exports属性的set事件
						set: function(fun){
							if((typeof fun).toLowerCase() == "function"){fun()}
						}
					});
				}catch(e){//--错误处理
					console.log("error:", "defineProperty", "message:" + e.message);
				}
			}
			try{//--使用单页模式的平台
				Object.defineProperty(self.$config, "singleModel", {
					configurable: false,
					enumerable: false,
					writable: false,
					value: singleModel
				});
			}catch(e){//--错误处理
				console.log("error:", "defineProperty", "message:" + e.message);
			}
			/**
			 * 框架设置函数
			 * 设置框架基本参数，包含API注册，当前平台类型等数据
			 * $params Json对象，包含API注册，当前平台类型等数据
			 * 函数只能在make函数前执行，并且只可以执行一次
			 * 同名属性，只有第一次注册会生效
			 * params = {
			 * 		plugin:  "------url-------"//--插件所在目录
			 * }
			 */
			self.config = function(params){
				if(hasConfig || hasMake){return}//--如果已经执行过config或者make函数，则跳出执行函数
				for(var i in params){//--遍历属性，将属性值设置为￥config的只读属性
					if(reservedWords[i.toLowerCase()] || !!self.$config[i]){//--跳过系统保留字和已注册的同名属性
						continue;
					}
					
					try{
						Object.defineProperty(self.$config, i, {
							configurable: false, //是否可以删除属性,是否可以修改属性的 writable 、 enumerable 、 configurable 属性。
							enumerable: false,   //是否可以枚举,是否可以通过for...in 遍历到，是否可以通过 Object.keys() 方法获取属性名称
							writable: false,     //是否可以对属性进行重新赋值
							value: params[i]       //属性的默认值
						});
					}catch(e){//--错误处理
						console.log("config-error:", "defineProperty", "message:" + e.message);
					}
				}
				hasConfig = true;//--已执行config函数
			};
			/**
			 * 平台实例创建函数
			 * @platform 要创建的平台名称
			 */
			self.make = function(platform){
				try{//--设置当前平台类型名，只读属性
					Object.defineProperty(self.$config, "platform", {//--当前平台类型
						configurable: false,
						enumerable: false,
						writable: false,
						value: platform
					});
					if(!self.$config.plugin){
						Object.defineProperty(self.$config, "plugin", {//--外部插件所在目录
							configurable: false,
							enumerable: false,
							writable: false,
							value: "/static/js/gray/plugin/"
						});
					}
				}catch(e){//--错误处理
					console.log("error:", "defineProperty", "message:" + e.message);
				}
				var platform = self.$config.platform;//--当前平台类型
				var singleModel = !!self.$config.singleModel[platform];//--是否是单页模式

				self.$plugin = {};//--插件定义后的对象载体，用于调用注册后的插件
				self.plugin = new plugin(self);//--插件对象实例，用于注册、加载、调用插件
				var supervisor = {//--资源管理对象
					share: {},//--对象共享
					rubbish: []//--垃圾资源数组，页面跳转时统一销毁
				};
				self.supervisor = new supervise(supervisor);//--资源管理对象实例化，用于共享、废弃、清空垃圾数据
				self.$entrust = {};//--页面委托指令载体对象，对象内指令为只读属性，不可重写，用于调用注册的指令
				self.entrust = new entrust(self);//--页面指令实例对象，用于注册、实例化指令
				self.$page = {};//--自定义平台方法载体，可以调用自定义的跨平台方法
				self.page = new page(self);//--页面平台实例对象，用于，并可以注册自定义跨平台方法
				self.$cache = {};//--页面级缓存数据存储对象
				self.cache = new cache(self);//--页面级缓存方法构造函数


				// self.$entrust["single-link-click"]();//--执行单页模式链接点击委托指令
				if(singleModel){//--单页模式特殊操作
					self.history = new History(self);//--历史纪录实例化，实现单页面后退操作
					try{//--单页模式：执行页面逻辑入口函数
						Object.defineProperty(window, 'pageLoad', {
							set: function(val){
								if(typeof(val) == "function"){
									val();
								};
							}
						});
					}catch(e){
						console.error(e.message);
					}
				}else{
					self.$entrust["on-page-load"]();//--多页模式：执行页面逻辑入口函数
				}

				hasMake = true;//--已经执行make函数
			};

		};

		/**
		 * plugin对象构造函数
		 * 实例化后，实例对象的parent为gray实例
		 * @obj gray的实例对象
		 */
		var plugin = function(obj){
			var self = this;
			self.parent = obj;//--定义parent属性
			var moduleMap = {};//--api的module挂载对象
			var queue = {//--外部接口加载队列
				map: {},//--队列延时对象映射
				arr: [],//--延时对象数组，用来按顺序加载
				hangUp: function(fun){//--事件挂起，等待加载完成后执行
					var arr = queue.arr;
					var script = [];//--拼接延时挂起命令
					for(var i in arr){
						if(i == 0){
							script.push('return arr[' + i + '].promise()');
						}else{
							script.push('.then(function(){return arr[' + i + '].promise();})');
						}
					}
					var $hangUp = new Function("arr", script.join(""));//--创建挂起函数
					return $hangUp(arr).then(function(){//--执行挂起操作
						return fun();
					});
				}
			};
			/**
			 * plugin注册函数
			 * 注册后的plugin会挂载在moduleMap对象里，多次调用注册同名plugin，只有最后一次会生效，直接定义在页面的plugin，不需要使用require函数加载
			 * @name plugin名称
			 * @dependencies 依赖对象的数组
			 * @factory 工厂函数
			 * 注意：@dependencies的值 和 @factory的参数要一一对应
			 * 支持链式写法
			 */
			self.define = function(name, dependencies, factory){
				//--创建plugin的module对象
				var module = {
					name: name,//--plugin名称
					dependencies: dependencies,//--依赖对象数组
					factory: factory//--工厂函数
				};
				moduleMap[name] = module;//--将module对象挂到moduleMap中
				var defer = queue.map[name];
				self.parent.$plugin[name] = function(){//--在Gray.$plugin中设置调用函数
					if(!defer){//--不是外部加载的接口
						return self.use(name);
					}else{//--外部加载的接口
						return queue.hangUp(function(){//--挂起等待借口加载完毕
							return self.use(name);
						});
					}
				};
				defer? defer.resolve(): null;
				return self;
			};
			/**
			 * plugin调用，返回工厂函数的实体
			 * @name 要调用的plugin的名称
			 * 这是一个递归函数
			 * 函数会先查看plugin对象是否拥有entity属性，如果有，则直接返回entity属性，
			 * 如果没有，函数会优先从moduleMap对象中寻找依赖对象，如果依赖对象有entity属性，则entity属性追加到参数数组，如果没有，就递归执行，返回执行结果
			 * 如果在moduleMap中没有依赖对象，则在window中寻找
			 */
			self.use = function(name){
				var module = moduleMap[name];//--api对象
				if (module) {//--对象不存在entity属性
					var args = [];//--工厂函数参数数组
					for (var i = 0; i < module.dependencies.length; i++) {//--循环遍历依赖数组
						if(moduleMap[module.dependencies[i]]){//--依赖对象在moduleMap中存在
							if (moduleMap[module.dependencies[i]].entity) {//--依赖对象有entity属性
								args.push(moduleMap[module.dependencies[i]].entity);//--追加到工厂函数的参数数组中
							}
							else {
								args.push(this.use(module.dependencies[i]));//--递归执行，返回值追加到参数数组中
							}
						}else{//--依赖对象在moduleMap中不存在
							args.push(window[module.dependencies[i]]);//--从window对象中获取依赖，并追加到参数数组中
						}
					}
					module.entity = module.factory.apply(null, args);//--设置module的entity属性为工厂函数的实体
				}
				return module.entity;//--返回entity属性
			};
			/**
			 * 外部接口加载函数，使用ajax加载
			 * @name 接口名称，形式“camera/getPic”,plugin文件夹允许二级，参数代表读取路径是“camera/getPic.js”的js
			 * 用于异步加载外面定义的接口，与define函数配合使用，实现延时执行接口
			 */
			self.requireAjax = function(name){
				if(!name){return};
				if(!!self.parent.$plugin[name]){return;}//--接口已存在则终止加载
				var platform = self.parent.$config.platform;//--当前页面框架类型
				if(self.parent.$config.plugin){//--已设置接口地址
					var path = self.parent.$config.plugin;
					if(!!path){
						var defer = $.Deferred();//--创建延时对象
						self.parent.$plugin[name] = function(){//--在Gray.$plugin中设置调用函数
							if(!defer){//--不是外部加载的接口
								self.use(name);
							}else{//--外部加载的接口
								queue.hangUp(function(){//--挂起等待借口加载完毕
									self.use(name);
								});
							}
						};
						var script = document.createElement("script");//--创建加载标签
						script.type = "text/javascript";
						script.src = path + platform + "/" + name;
						queue.map[name] = defer;//--延时对象加入映射
						queue.arr.push(defer);//--延时对象加入队列
						document.body.appendChild(script);//--标签加入页面，开始加载外部接口
						window.setTimeout(function() {//--延时三秒，如果未加载完成，则执行后续操作
							defer.resolve();
						}, 3000);
					}
				}
			};
			/**
			 * 外部接口加载函数，使用webpack的require加载
			 * @name 接口名称，形式“camera/getPic”,plugin文件夹允许二级，参数代表读取路径是“camera/getPic.js”的js
			 * 用于异步加载外面定义的接口，与define函数配合使用，实现延时执行接口
			 */
			self.requirePackage = function(name){
				if(!name){return};
				if(!!self.parent.$plugin[name]){return;}//--接口已存在则终止加载
				var platform = self.parent.$config.platform;//--当前页面框架类型
				if(self.parent.$config.plugin){//--已设置接口地址
					var path = self.parent.$config.plugin;
					if(!!path){
						//var fun = require("./" + platform + "/" + name);
						var pluginName = platform + "/" + name;
						var fun = __webpack_require__(2)("./" + pluginName);
						fun();
					}
				}
			};

			/**
			 * 外部接口加载函数
			 * @name 接口名称，形式“camera/getPic”,plugin文件夹允许二级，参数代表读取路径是“camera/getPic.js”的js
			 * 用于加载外面定义的接口，通过self.parent.$config.loadType判断加载方式
			 */
			self.require = function(name){
				if(self.parent.$config.loadType != "ajax"){
					self.requirePackage(name);console.log("requirePackage");
				}else{
					self.requireAjax(name);
				}
			};
		};

		/**
		 * 资源管理对象构造函数
		 * @supervisor 框架内置资源载体对象
		 * 实现垃圾回收和单页面模式对象资源共享
		 */
		var supervise = function(supervisor){
			var self = this;
			//--对象或值共享，已放入垃圾箱的对象会从垃圾箱中移除
			self.share = function(name, val){
				supervisor.shara[name] = val;
				delFromRubbish(val);//--将对象从垃圾箱删除
			};
			//--获取共享对象或者值
			self.get = function(name){
				return supervisor.shara[name];
			};
			//--对象放入垃圾箱，页面跳转时统一销毁，参数只能是对象；已共享的对象会从共享对象中删除
			self.rubbish = function(obj){
				if((typeof val).toLowerCase() != "object"){
					return;
				}
				supervisor.rubbish.push(obj);//--向垃圾箱追加对象
				delFromShare(obj);//--从共享对象中删除
			};
			//--清空垃圾箱，销毁放入垃圾箱的对象
			self.empty = function(){
				var r = supervisor.rubbish;
				for(var i = r.length - 1; i >= 0; i--){
					r[i] = null;
					r.splice(i, 1);
				}
			};
			//--从共享对象中删除指定对象
			var delFromShare = function(obj){
				if((typeof val).toLowerCase() != "object"){
					return;
				}
				var s = supervisor.share;
				for(var i in s){//--从共享资源移除指定对象
					if(s[i] == obj){
						delete s[i];
					}
				}
			};
			//--从垃圾箱删除指定对象
			var delFromRubbish = function(val){
				if((typeof val).toLowerCase() != "object"){
					return;
				}
				var r = supervisor.rubbish;
				for(var i = r.length - 1; i >= 0; i--){
					if(!r[i]){//--删除空元素
						r.splice(i, 1);
					}else if(r[i] == val){//--删除指定对象
						r.splice(i, 1);
					}
				}
			};
		};

		/**
		 * 平台对象构造函数
		 * @obj gray实例对象
		 * 针对不同平台，封装方法
		 * $page预定义$page.loadPage 和 $page.getUrlParam 两个方法，可以被 page.define 方法重写
		 * 可以通过page.define函数注册新的方法
		 */
		var page = function(obj){
			var self = this,
				$self = obj.$page;
			self.parent = obj;//--父对象为gray实例
			self.href = null;//--当前加载的页面url，单页模式下生效
			$self.href = null;//--当前加载的页面url
			var moduleMap = {};//--customEvent的module挂载对象
			/**
			 * customEvent注册函数
			 * 注册后的customEvent会挂载在moduleMap对象里，多次调用注册同名customEvent，只有最后一次会生效，直接定义在页面的接口，不需要使用require函数加载
			 * @name customEvent名称
			 * @dependencies 依赖对象的数组
			 * @factory 工厂函数
			 * 注意：@dependencies的值 和 @factory的参数要一一对应
			 * 支持链式写法
			 */
			self.define = function(name, dependencies, factory){
				//--创建customEvent的module对象
				var module = {
					name: name,//--customEvent名称
					dependencies: dependencies,//--依赖对象数组
					factory: factory//--工厂函数
				};
				moduleMap[name] = module;//--将module对象挂到moduleMap中
				// var defer = queue.map[name];
				self.parent.$page[name] = function(){//--在Gray.$platform中设置调用函数
					self.use(name);
				};
				return self;
			};
			/**
			 * customEvent调用，返回工厂函数的实体
			 * @name 要调用的customEvent的名称
			 * 这是一个递归函数
			 * 函数会先查看customEvent对象是否拥有entity属性，如果有，则直接返回entity属性，
			 * 如果没有，函数会优先从moduleMap对象中寻找依赖对象，如果依赖对象有entity属性，则entity属性追加到参数数组，如果没有，就递归执行，返回执行结果
			 * 如果在moduleMap中没有依赖对象，则在window中寻找
			 */
			self.use = function(name){
				var module = moduleMap[name];//--api对象
				if (!module.entity) {//--对象不存在entity属性
					var args = [];//--工厂函数参数数组
					for (var i = 0; i < module.dependencies.length; i++) {//--循环遍历依赖数组
						if(moduleMap[module.dependencies[i]]){//--依赖对象在moduleMap中存在
							if (moduleMap[module.dependencies[i]].entity) {//--依赖对象有entity属性
								args.push(moduleMap[module.dependencies[i]].entity);//--追加到工厂函数的参数数组中
							}
							else {
								args.push(this.use(module.dependencies[i]));//--递归执行，返回值追加到参数数组中
							}
						}else{//--依赖对象在moduleMap中不存在
							args.push(window[module.dependencies[i]]);//--从window对象中获取依赖，并追加到参数数组中
						}
					}
					module.entity = module.factory.apply(null, args);//--设置module的entity属性为工厂函数的实体
				}
				return module.entity;//--返回entity属性
			};


			var platform = self.parent.$config.platform;//--当前平台类型
			var singleModel = !!self.parent.$config.singleModel[platform];//--是否是单页模式
			var $Location = new Location();
			var $loader = new loader(self);
			//var htmlLoader = require("./page.js");

			/**
			 * 根据页面模式，加载参数url指向的页面
			 * @url 要加载/跳转的页面地址，可以是绝对地址或相对地址
			 * @openPage 布尔值，是否模拟新窗口操作
			 * $page预定义方法，可以通过define覆盖
			 */
			$self.loadPage = function(url, openPage){
				if(!singleModel){//--非单页模式
					$self.href = url;//alert(url);
					window.location.href = url;//--直接跳转指定url
				}else{//--单页模式
					self.href = url;
					$self.href = url;
					url = $Location.formatUrl(url);
					console.log(window.backpaths, window.backurl);
					if(!!url){
						url = $Location.formatParams(url);
						if(url == ""){
							return;
						}
						var url1 = "/" + url;
						if(url1 == "/index.html" || url1.has("/android_asset/www/") || url1.has("/ios_asset/www/") || url1.has("/www/")){
							url = "index/index.html"
						}
						self.parent.history.pushState(url);
						if(self.parent.$config.loadType != "ajax"){//--如果设置指定不通过ajax方式加载页面
							// var html = require("./../../../" + url);
							// var html = require("./../../../" + url);
							// var html = require("bundle!./../../../" + url);
							url = "./../../../" + url;
							var html = __webpack_require__(117)(url);
							self.parent.supervisor.empty();//--清空垃圾箱
							window.clearInterval();//--清除计时器
							window.clearTimeout();//--清除计时器
							self.parent.cache.clear();//--清除当页缓存
							if(html){
								var body = self.parent.$config.body || document.body;//--获取容器元素
								body.innerHTML = html;//--单页模式页面加载
								// console.log(html);
								$loader.toTriggerScript(body);//--重新触发运行页面js代码
							}else{
								window.location.reload();
							return;
							}
						}else{//--ajax加载页面
							$loader.loadFile(url)//--加载页面html
								.then(function(html){
									self.parent.supervisor.empty();//--清空垃圾箱
									window.clearInterval();//--清除计时器
									window.clearTimeout();//--清除计时器
									self.parent.cache.clear();//--清除当页缓存
									var body = self.parent.$config.body || document.body;//--获取容器元素
									body.innerHTML = html;//--单页模式页面加载
									$loader.toTriggerScript(body);//--重新触发运行页面js代码
								});
						}
					}
				}
			};
			/**
			 * 根据页面模式获取地址栏参数
			 * @key 地址栏参数名
			 */
			$self.getUrlParam = function(key){
				if(!singleModel){//--非单页模式
					return getUrlParam(key)
				}else{//--单页模式获取地址栏参数
					return $Location.getUrlParam(key);
				}
			};
			//--多页模式获取地址栏参数
			function getUrlParam(key) {
				var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
				var r = window.location.search.substr(1).match(reg);  //匹配目标参数
				if (r != null) return unescape(r[2]); return null; //返回参数值
			}
		};

		//--单页模式url处理对象构造函数
		var Location = function(){
			var self = this;
			self.params = null;//--地址栏参数对象
			self.shotUrl = null;//--不含地址栏参数的网址

			//--检查url类型，并根据类型进行操作,外链直接跳转，内链转为相对地址
			self.formatUrl = function(url){
				var href = window.location.href.toLowerCase(),
					Exp = /(http|https|file):\/\/[^\/]+\/|(http|https|file):\/\/[^\/]+/,
					Exp1 = /\/dist\/pages\/.+/,
					defer = $.Deferred(),
					baseUrl;
				//--得到当前网站的网址
				if(href.match(Exp)){
					baseUrl = href.match(Exp)[0];
				}else{
					baseUrl = href;
				}
				if(url.indexOf("http://") == 0 || url.indexOf("https://") == 0 ){//--绝对地址
					if(baseUrl == url.toLowerCase() || url.toLowerCase().match(Exp)[0] == baseUrl){//--不跨域
						url = url.replace(baseUrl, "");
					}else{//--跨域
						window.location.href = url;
						return false;
					}
				}else if(url.indexOf("file:///") == 0){//--文件地址
					url = url.replace("file:///", "").split(":")[1];
				}
				// if(url.indexOf("/") == 0){//--绝对根路径
				// 	url = url.replace("/", "");
				// }
				if(!url){
					url = "/";
				}
				return url;
			};
			//--检查url是否含有地址栏参数，并将地址栏参数存入对象
			self.formatParams = function(url){console.log("formatParams, url = ", url);
				self.params = null;
				if(url.replace(/ /g, "") == "#"){
					self.shotUrl = "";
					return self.shotUrl;
				}
				var u = url.replace(/\?/g, ""),
					len = url.length,
					l = u.length,
					shotUrl;
				//--判断网址是否有地址栏参数
				if(l == len){//--没有地址栏参数
					shotUrl = url;//--获取不带地址栏参的网址
				}else{//--有地址栏参数
					var Exp = /^[^\?]+\?/;
					if(url.match(Exp)){
						shotUrl = url.match(Exp)[0].replace(/\?/, "");//--获取不带地址栏参的网址
					}
					self.setParams(url);//--获取地址栏参数，并存到对象中
				}
				var Exp = /^[^\?]+\.html/;
				if(!shotUrl.match(Exp)) {//--路径中不含*.html
					if (shotUrl.lastIndexOf("/") == shotUrl.length - 1) {//--路径最后是否以“/”结尾
						shotUrl = shotUrl + "index.html";
					} else {
						shotUrl = shotUrl + "/index.html";
					}
				}
				if(shotUrl && shotUrl.length > 1 && shotUrl.left(1) == "/"){
					shotUrl = shotUrl.replace("/", "");
				}
				self.shotUrl = shotUrl;
				return self.shotUrl;
			};
			//--获取地址栏参数，并存到对象中
			self.setParams = function(url){
				self.params = {};
				var Exp = /^[^\?]+\?/;
				var p = (url + "").replace(Exp, "").split("&");
				for(var i = 0, len = p.length; i < len; i++){//--将地址栏参数存入对象
					var pm = p[i].split("="),
						pm1 = !!pm[1]? decodeURIComponent(pm[1]): "";
					self.params[pm[0]] = pm1;
				}
			};
			//--获取地址栏参数值
			self.getUrlParam = function(key){
				var params = self.params || {};
				return params[key] || "";
			};
		};

		//--页面加载对象构造函数
		var loader = function(page){
			var self = this;
			var loadedScript = {};//--禁止重复加载的JS
			self.parent = page;
			/**
			 * html模板加载函数
			 * @url html模板地址
			 * 需要依赖$.ajax
			 */
			self.loadFile = function(url){
				return $.ajax({
					url: url,
					dataType: "html"
				}).then(
					function(data){
						return data;
					},
					function(err){
						console.log("loader-loadFile-err", err);
					}
				);
			};
			/**
			 * 重新触发页面内script，包括外部script
			 * @body 容器对象
			 * 暂不考虑js重新加载顺序对后续代码的影响
			 */
			self.toTriggerScript = function(body){
				var scripts = body.getElementsByTagName("script"),
					arr = [];
				for(var i = 0; i < scripts.length; i ++){
					var src = scripts[i].src;
					if(!!src){
						if(!!loadedScript[src]){continue}//--跳过禁止重复加载的JS
						var script = document.createElement("script");
						script.type = "text/javascript";
						script.src = src;
					}else{
						var script = document.createElement("script");
						script.type = "text/javascript";
						script.innerText = scripts[i].innerText;
					}
					// var script1 = scripts[i];
					// script1.parentNode.insertBefore(script, script1);//--将克隆后的元素插入原元素之前
					// script1.parentNode.removeChild(script1);//--删除原元素
					// script.onload = function(){
					// 	console.debug(script1, this);
					// };
					var obj = {index: i, script: script, stept: arr.length};
					arr.push(obj);
					obj.init = function(){
						var me = this,
							script1 = scripts[me.index],
							script = me.script;
						script1.parentNode.insertBefore(script, script1);//--将克隆后的元素插入原元素之前
						script1.parentNode.removeChild(script1);//--删除原元素
						if(!!script.src){
							script.onload = function(){
								var next = arr[me.stept * 1 + 1];
								if(next){
									next.init();
								}
							};
						}else{
							var next = arr[me.stept * 1 + 1];
							if(next){
								next.init();
							}
						}
						
					};
				}
				arr[0].init();
				// self.parent.parent.$entrust["on-page-load"]();//--执行页面逻辑入口函数
				// self.parent.parent.$entrust["single-link-click"]();//--执行单页模式链接点击委托指令
			};
			function insertAfter(newEl, targetEl){ 
				var parentEl = targetEl.parentNode; 
				if(parentEl.lastChild == targetEl){
					parentEl.appendChild(newEl);
				}else{
					parentEl.insertBefore(newEl,targetEl.nextSibling);
				}
			}
			//--页面head中的js禁止重复加载，提取禁止加载的js，存入对象
			function getLoadedScriot(){
				var scripts = document.head.getElementsByTagName("script");
				for(var i = 0, len = scripts.length; i < len; i ++){
					var src = scripts[i].src;
					if(!!src){
						loadedScript[src] = true;
					}
				}
			}
			getLoadedScriot();
		};
		

		/**
		 * 委托对象构造函数
		 * @obj gray对象实例
		 * 负责注册、加载、调用委托指令
		 */
		var entrust = function(obj){
			var self = this;
			self.parent = obj;
			var moduleMap = {};
			/**
			 * 委托指令注册函数
			 * 指令为只读属性，第一次注册生效，后续注册同名指令会无效
			 * 注册后的指令会挂载在moduleMap对象里，多次调用注册同名指令，只有最后一次会生效，直接定义在页面的指令，不需要使用require函数加载
			 * @name 指令名称
			 * @factory 指令函数
			 * 支持链式写法
			 */
			self.define = function(name, factory){
				if(!moduleMap[name]){
					//--创建指令的module对象
					var module = {
						name: name,//--指令名称
						factory: factory//--工厂函数
					};
					moduleMap[name] = module;//--将module对象挂到moduleMap中
					try{
						Object.defineProperty(self.parent.$entrust, name, {
							configurable: false,
							enumerable: false,
							writable: false,
							value: function(){//--在Gray.$entrust中设置调用函数
								self.use(name);
							}
						});
					}catch(e){//--错误处理
						console.log("entrust-error:", "defineProperty", "message:" + e.message);
					}
				}
				return self;
			};
			/**
			 * 指令调用，返回指令函数的实体
			 * @name 要调用的指令的名称
			 */
			self.use = function(name){
				var module = moduleMap[name];//--api对象
				module.factory();//--返回entity属性
			};

			// //--单页面链接点击事件委托指令注册
			// self.define("single-link-click", function() {
			// 	$(function(){
			// 		$("a[href]").on("click", function(e){//console.log("click")//--body点击事件绑定
			// 			try {
			// 				self.parent.history.log = "on";//--修改历史记录开关，使页面跳转正常记录历史状态
			// 			} catch (error) {
							
			// 			}
			// 			var el = this;//--获取事件触发元素
			// 			var href = el.getAttribute("href");
			// 			var openPage = el.getAttribute("target") || "";
			// 			openPage = openPage.has("blank");
			// 			//--当触发元素为a，并且href属性不以“javascript:”开头时，委托点击事件，
			// 			if(!!href && href.replace(/ /g,"").indexOf("javascript:") < 0){
			// 				self.parent.$page.loadPage(href, openPage);
			// 			}
			// 			return false;
			// 		});
			// 	});
			// });
			//--页面加载完成后执行入口事件
			self.define("on-page-load", function() {
				$(function(){
					// console.log("load", window.pageLoad)//--body点击事件绑定
					// if(!window.pageLoad){//--页面加载后检查入口函数window.pageLoad，并执行入口函数
					// 		doPageLoad();
					// }else{
					// 	console.log("window.pageLoad 完成");
					// 	window.pageLoad();
					// }
					var timmer = window.setTimeout(function() {
						console.log("入口函数载入超时，请确认设置window.pageLoad函数");
					}, 3000);
					if(window.pageLoad){
						window.clearTimeout(timmer);
						console.log("window.pageLoad 完成");
						window.pageLoad();
					}
					try {
						Object.defineProperty(window, "pageLoad",{
							set: function(fun){
								window.clearTimeout(timmer);
								console.log("pageLoad设置：window.pageLoad 完成");
								fun();
							}
						});
					} catch (error) {
						console.error("pageLoad绑定失败，", error.message)
					}
				});
			});

			var num = 0;//--执行次数
			//--自动执行入口函数
			function doPageLoad(){
				if(!window.pageLoad && num < 100){
					num += 1;
					window.setTimeout(function() {
						doPageLoad();
					}, 20);
				}else{
					if(window.pageLoad){
						console.log("递归：window.pageLoad 完成");
						window.pageLoad();
					}else{
						console.log("没有入口函数");
					}
					
				}
			}
			//--单页模式js禁止重复加载指令
			// self.define("single-js-no-reload", function(){

			// });
		};

		/**
		 * 单页面模式历史纪录对象构造函数
		 */
		var History = function(obj){
			var self = this;
			self.parent = obj;
			/**
			 * 记录功能是否开启，默认开启，popstate触发时改为off，页面点击时，重新设为on
			 * 主要是控制页面正常跳转时，记录历史状态，popstate时，不记录历史状态
			 * 通过单页面的single-link-click指令实现点击页面修改log的值
			 */
			self.log = "on";
			/**
			 * 点击后退是否关闭页面；
			 * 当后退到最后一步时，页面提示再次点击关闭页面，再次点击后，关闭
			 * 默认false；后退到最后一步时，置为true；写入历史记录时值为true
			 */
			var doClose = false;

			/**
			 * 记录历史状态
			 * @url 当前页面模板url
			 * 当self.log == "on"时，记录历史状态
			 */
			self.pushState = function(url){
				if(self.log == "on"){
					doClose = false;
					var href = window.location.href;
					history.pushState(url, '', href);
				}
			};

			/**
			 * popstate触发页面跳转；
			 * @url 跳转的模板url
			 * self.log会被强制设为off
			 */
			self.go = function(url){
				self.log = "off";
				self.parent.$page.loadPage(url);
				self.log = "on";
			};

			/**
			 * 添加页面监听，当popstate触发时实现跳转
			 */
			window.addEventListener("popstate", function () {
				var url = history.state;
				if(!!url){
					self.go(url);
				}else{
					if(doClose == false){
						doClose = true;
						console.log("再次点击将关闭");
					}else{
						window.close();
					}
				}
				
			});
		};

		/**
		 * 页面级缓存对象构造函数
		 * 用户缓存页面级数据，页面跳转时会被清除；
		 */
		var cache = function(obj){
			var self = this;
			self.parent = obj;
			var $cache = obj.$cache;

			self.autocache = false;//--是否自动缓存
			try{
				Object.defineProperty(self, "cacheable", {//--是否允许缓存，开启、关闭时，会同时开启、关闭自动缓存
					set: function(val){
						self.autocache = val;
					}
				})
			}catch(e){
				console.log("ITOU-cache-error:", e.message);
			}

			/**
			 * 设置缓存信息
			 * @key 缓存键值
			 * @val 缓存的值
			 * @msy 异步请求的返回信息
			 */
			self.setCache = function(key, msg){
				if(self.cacheable){
					$cache[key] = msg;
				}
			};

			/**
			 * 检查缓存信息
			 * @key 缓存键值
			 * @val 缓存的值
			 * 返回true或者false
			 */
			self.getCache = function(key){
				if($cache[key]){
					return $cache[key];
				}else{
					return null;
				}
			};
			//--清除缓存
			self.clear = function(){
				for(var i in $cache){
					$cache[i] = null;
				}
			};
		};

		window.Gray = new gray();
	})(window, Zepto || jQuery || null)
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)(module)))

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./ali/camera/chooseimage": 3,
		"./ali/camera/chooseimage.js": 3,
		"./ali/camera/getpic": 4,
		"./ali/camera/getpic.js": 4,
		"./ali/camera/uploadImage": 5,
		"./ali/camera/uploadImage.js": 5,
		"./ali/choosepay": 6,
		"./ali/choosepay.js": 6,
		"./ali/getlocation": 7,
		"./ali/getlocation.js": 7,
		"./ali/init": 8,
		"./ali/init.js": 8,
		"./ali/onmenushareappmessage": 9,
		"./ali/onmenushareappmessage.js": 9,
		"./ali/onmenusharetimeline": 10,
		"./ali/onmenusharetimeline.js": 10,
		"./ali/openlocation": 11,
		"./ali/openlocation.js": 11,
		"./ali/previewImage": 12,
		"./ali/previewImage.js": 12,
		"./ali/scanqrcode": 13,
		"./ali/scanqrcode.js": 13,
		"./ali/scanqrcodeindex": 14,
		"./ali/scanqrcodeindex.js": 14,
		"./ali/share/moments": 15,
		"./ali/share/moments.js": 15,
		"./ali/share/qq": 16,
		"./ali/share/qq.js": 16,
		"./ali/share/qzone": 17,
		"./ali/share/qzone.js": 17,
		"./ali/share/wechat": 18,
		"./ali/share/wechat.js": 18,
		"./android/backbutton": 19,
		"./android/backbutton.js": 19,
		"./android/camera/chooseimage": 20,
		"./android/camera/chooseimage.js": 20,
		"./android/camera/getpic": 21,
		"./android/camera/getpic.js": 21,
		"./android/camera/uploadImage": 22,
		"./android/camera/uploadImage.js": 22,
		"./android/checknetwork": 23,
		"./android/checknetwork.js": 23,
		"./android/endprogress": 24,
		"./android/endprogress.js": 24,
		"./android/exitapp": 25,
		"./android/exitapp.js": 25,
		"./android/getdevicetoken": 26,
		"./android/getdevicetoken.js": 26,
		"./android/getlocation": 27,
		"./android/getlocation.js": 27,
		"./android/init": 28,
		"./android/init.js": 28,
		"./android/onmenushareappmessage": 29,
		"./android/onmenushareappmessage.js": 29,
		"./android/onmenusharetimeline": 30,
		"./android/onmenusharetimeline.js": 30,
		"./android/openlocation": 31,
		"./android/openlocation.js": 31,
		"./android/previewImage": 32,
		"./android/previewImage.js": 32,
		"./android/scanqrcode": 33,
		"./android/scanqrcode.js": 33,
		"./android/scanqrcodeindex": 34,
		"./android/scanqrcodeindex.js": 34,
		"./android/share/moments": 35,
		"./android/share/moments.js": 35,
		"./android/share/qq": 36,
		"./android/share/qq.js": 36,
		"./android/share/qzone": 37,
		"./android/share/qzone.js": 37,
		"./android/share/wechat": 38,
		"./android/share/wechat.js": 38,
		"./android/startprogress": 39,
		"./android/startprogress.js": 39,
		"./app/backbutton": 40,
		"./app/backbutton.js": 40,
		"./app/camera/chooseimage": 41,
		"./app/camera/chooseimage.js": 41,
		"./app/camera/downloadImage": 42,
		"./app/camera/downloadImage.js": 42,
		"./app/camera/getpic": 43,
		"./app/camera/getpic.js": 43,
		"./app/camera/uploadImage": 44,
		"./app/camera/uploadImage.js": 44,
		"./app/chcp-checkupdate": 45,
		"./app/chcp-checkupdate.1": 46,
		"./app/chcp-checkupdate.1.js": 46,
		"./app/chcp-checkupdate.js": 45,
		"./app/checknetwork": 47,
		"./app/checknetwork.js": 47,
		"./app/checkupdate": 48,
		"./app/checkupdate.js": 48,
		"./app/clipboard/check-entrance": 49,
		"./app/clipboard/check-entrance.js": 49,
		"./app/endprogress": 50,
		"./app/endprogress.js": 50,
		"./app/exitapp": 51,
		"./app/exitapp.js": 51,
		"./app/getdevicetoken": 52,
		"./app/getdevicetoken.js": 52,
		"./app/getlocation": 53,
		"./app/getlocation.js": 53,
		"./app/getversioninfo": 54,
		"./app/getversioninfo.js": 54,
		"./app/init": 55,
		"./app/init.js": 55,
		"./app/onmenushareappmessage": 56,
		"./app/onmenushareappmessage.js": 56,
		"./app/onmenusharetimeline": 57,
		"./app/onmenusharetimeline.js": 57,
		"./app/openlocation": 58,
		"./app/openlocation.js": 58,
		"./app/openschemeurl": 59,
		"./app/openschemeurl.js": 59,
		"./app/previewImage": 60,
		"./app/previewImage.js": 60,
		"./app/scanqrcode": 61,
		"./app/scanqrcode.js": 61,
		"./app/scanqrcodeindex": 62,
		"./app/scanqrcodeindex.js": 62,
		"./app/share/moments": 63,
		"./app/share/moments.js": 63,
		"./app/share/qq": 64,
		"./app/share/qq.js": 64,
		"./app/share/qzone": 65,
		"./app/share/qzone.js": 65,
		"./app/share/wechat": 66,
		"./app/share/wechat.js": 66,
		"./app/startprogress": 67,
		"./app/startprogress.js": 67,
		"./ios/backbutton": 68,
		"./ios/backbutton.js": 68,
		"./ios/camera/chooseimage": 69,
		"./ios/camera/chooseimage.js": 69,
		"./ios/camera/getpic": 70,
		"./ios/camera/getpic.js": 70,
		"./ios/camera/uploadImage": 71,
		"./ios/camera/uploadImage.js": 71,
		"./ios/checknetwork": 72,
		"./ios/checknetwork.js": 72,
		"./ios/endprogress": 73,
		"./ios/endprogress.js": 73,
		"./ios/exitapp": 74,
		"./ios/exitapp.js": 74,
		"./ios/getdevicetoken": 75,
		"./ios/getdevicetoken.js": 75,
		"./ios/getlocation": 76,
		"./ios/getlocation.js": 76,
		"./ios/init": 77,
		"./ios/init.js": 77,
		"./ios/onmenushareappmessage": 78,
		"./ios/onmenushareappmessage.js": 78,
		"./ios/onmenusharetimeline": 79,
		"./ios/onmenusharetimeline.js": 79,
		"./ios/openlocation": 80,
		"./ios/openlocation.js": 80,
		"./ios/previewImage": 81,
		"./ios/previewImage.js": 81,
		"./ios/scanqrcode": 82,
		"./ios/scanqrcode.js": 82,
		"./ios/scanqrcodeindex": 83,
		"./ios/scanqrcodeindex.js": 83,
		"./ios/share/moments": 84,
		"./ios/share/moments.js": 84,
		"./ios/share/qq": 85,
		"./ios/share/qq.js": 85,
		"./ios/share/qzone": 86,
		"./ios/share/qzone.js": 86,
		"./ios/share/wechat": 87,
		"./ios/share/wechat.js": 87,
		"./ios/startprogress": 88,
		"./ios/startprogress.js": 88,
		"./mobile/camera/chooseimage": 89,
		"./mobile/camera/chooseimage.js": 89,
		"./mobile/camera/getpic": 90,
		"./mobile/camera/getpic.js": 90,
		"./mobile/camera/uploadImage": 91,
		"./mobile/camera/uploadImage.js": 91,
		"./mobile/getlocation": 92,
		"./mobile/getlocation.js": 92,
		"./mobile/init": 93,
		"./mobile/init.js": 93,
		"./mobile/onmenushareappmessage": 94,
		"./mobile/onmenushareappmessage.js": 94,
		"./mobile/onmenusharetimeline": 95,
		"./mobile/onmenusharetimeline.js": 95,
		"./mobile/openlocation": 96,
		"./mobile/openlocation.js": 96,
		"./mobile/previewImage": 97,
		"./mobile/previewImage.js": 97,
		"./mobile/scanqrcode": 98,
		"./mobile/scanqrcode.js": 98,
		"./mobile/scanqrcodeindex": 99,
		"./mobile/scanqrcodeindex.js": 99,
		"./wx/app/startprogress": 100,
		"./wx/app/startprogress.js": 100,
		"./wx/camera/chooseimage": 101,
		"./wx/camera/chooseimage.js": 101,
		"./wx/camera/getpic": 102,
		"./wx/camera/getpic.js": 102,
		"./wx/camera/uploadImage": 103,
		"./wx/camera/uploadImage.js": 103,
		"./wx/choosepay": 104,
		"./wx/choosepay.js": 104,
		"./wx/getlocation": 105,
		"./wx/getlocation.js": 105,
		"./wx/init": 106,
		"./wx/init.js": 106,
		"./wx/onmenushareappmessage": 107,
		"./wx/onmenushareappmessage.js": 107,
		"./wx/onmenusharetimeline": 108,
		"./wx/onmenusharetimeline.js": 108,
		"./wx/openlocation": 109,
		"./wx/openlocation.js": 109,
		"./wx/previewImage": 110,
		"./wx/previewImage.js": 110,
		"./wx/scanqrcode": 111,
		"./wx/scanqrcode.js": 111,
		"./wx/scanqrcodeindex": 112,
		"./wx/scanqrcodeindex.js": 112,
		"./wx/share/moments": 113,
		"./wx/share/moments.js": 113,
		"./wx/share/qq": 114,
		"./wx/share/qq.js": 114,
		"./wx/share/qzone": 115,
		"./wx/share/qzone.js": 115,
		"./wx/share/wechat": 116,
		"./wx/share/wechat.js": 116
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 2;


/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("camera/chooseimage.js", ["self"], function(self){
	        /**
	         * 调用微信插件，拍照
	         */
	        var defer = $.Deferred();
	        self.wx.chooseImage({
	            count: 1, // 默认9
	            sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有['original', 'compressed']
	            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有['album', 'camera']
	            success: function (res) {//alert(JSON.stringify(res));
	                var localIds = res.localIds[0]; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
	                if(res.errMsg && res.errMsg.indexOf(":ok") > 0){
	                    self.localId = localIds;
	                    window.setTimeout(function() {
	                        defer.resolve(localIds);
	                    }, 100);
	                }else{
	                    window.setTimeout(function() {
	                        defer.reject(localIds);
	                        vm.showMsgBox('微信拍照接口错误');
	                    }, 100);
	                }
	            }
	        });
	        return defer.promise();
	    });
	};

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("camera/getpic.js",[], function(){
	        alert("xxxxxxxxxxxxx");
	    });
	};

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("camera/uploadImage.js", ["self"], function(self){
	        /**
	         * 调用微信插件，传图
	         */
	        var localId = self.localId;console.log(localId);
	        var defer = $.Deferred();
	        self.wx.uploadImage({
	            localId: localId, // 需要上传的图片的本地ID，由chooseImage接口获得
	            isShowProgressTips: 1,// 默认为1，显示进度提示
	            success: function (res) {
	                var serverId = res.serverId; // 返回图片的服务器端ID
	                if(res.errMsg && res.errMsg.indexOf(":ok") > 0){
	                    window.setTimeout(function() {
	                        defer.resolve(serverId);
	                    }, 100);
	                }else{
	                    window.setTimeout(function() {
	                        defer.reject(serverId);
	                        vm.showMsgBox('微信拍照接口错误');
	                    }, 100);
	                }
	            }
	        });
	        return defer.promise()
	            .then(function(serverId){
	                return self.itou.get({
	                    url: "upload/WxImage",
	                    data: {
	                        id: serverId
	                    }
	                });
	            });
	    });
	};

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("choosepay.js", ["self"], function(self){
	        /**
	         * 调用支付宝插件，支付
	         */
			var defer = $.Deferred();
	        AlipayJSBridge.call(
	            "tradePay", 
	            {tradeNO: self.data.tradeNO},
	            function(res){
	                defer.resolve(res);
	            }
	        );
	        return defer.promise();
	    });
	};

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("getlocation.js", ["self"], function(self){
	        /**
	         * 调用微信插件，获取当前位置
	         */
	        var location = {};
	        return ap.getLocation()
	            .then(function(obj){
	                var data = {};
	                data.lat = obj.latitude;
	                data.long = obj.longitude;
	                location["wgs84"] = data;
	                return location;
	            });
	    });
	};

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("init.js", ["self", "flag"], function(self, flag){
	        /**
	         * 微信初始化
	         * 先获取微信签名信息，然后进行初始化
	         * 在使用前需要提前注册依赖数据 self 和 flag
	         */

	        
	        /**
	         * 功能完善：允许在一个页面内多次执行初始化函数
	         * 场景：源自“店铺自动绑定”需求，需要在所有页面调用微信功能，为不影响原有代码，增加允许多次调用功能
	         * 原理：微信初始化，分为初始化中（init_doing）、初始化完成（init_ready）、初始化失败（init_error）3个状态，
	         *      当状态为init_doing时，将promise对象存入队列数组，在初始化完成时，队列中的promise对象全部执行resolve
	         *      当状态为init_ready，直接返回promise对象并执行resolve
	         *      当状态为init_error，直接返回promise对象并执行reject
	         *      上述3种情况外为未开始初始化，执行初始化过程
	         * by zhaoyf    2017-02-14 16:57:59
	         */
	        var wxReady = itou.setting.getData("__wxReady"),//--微信初始化是否完成，init_doing || init_ready || init_error
	            initPromise = itou.setting.getData("__initPromise");//--微信初始化队列
	        if(!initPromise){
	            initPromise = [];
	        }

	        if(wxReady == "init_doing"){
	            var defer = $.Deferred();
	            var pro = defer.promise();
	            initPromise.push(defer);
	            itou.setting.setData("__initPromise", initPromise);
	            return pro;
	        }else if(wxReady == "init_ready"){
	            var defer = $.Deferred();
	            defer.resolve();
	            return defer.promise();
	        }else if(wxReady == "init_error"){
	            var defer = $.Deferred();
	            defer.reject();
	            return defer.promise();
	        }
	        /**
	         * 功能完善结束（剩余部分在ready中执行）
	         */
	        itou.setting.setData("__wxReady", "init_doing");
	        function ready(callback) {
	            // 如果jsbridge已经注入则直接调用
	            if (window.AlipayJSBridge) {
	                callback && callback();
	            } else {
	                // 如果没有注入则监听注入的事件
	                document.addEventListener('AlipayJSBridgeReady', callback, false);
	            }
	        }
	        var defer = $.Deferred();
	        ready(function (msg) {
	            try {
	                if(msg && msg.error){
	                    self.wxReady = false;
	                    itou.setting.setData("__wxReady", "init_error");
	                }else{
	                    itou.setting.setData("__wxReady", "init_ready");
	                    defer.resolve();
	                    var initPromise = itou.setting.getData("__initPromise") || [];
	                    for(var i = 0, len = initPromise.length; i < len; i++){
	                        initPromise[i].resolve();
	                    }
	                }
	            } catch (error) {
	                AlipayJSBridge.call('toast', {
	                    content: error.message
	                });
	            }
	        });
	        return defer.promise();
	    });
	};

/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("onmenushareappmessage.js", ["self"], function(self){
	        /**
	         * 调用微信插件，分享给微信好友
	         */
	        var defer = $.Deferred();
			defer.resolve();
			return defer.promise();
	    });
	};

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("onmenusharetimeline.js", ["self"], function(self){
	        /**
	         * 调用微信插件，分享给微信朋友圈
	         */
	        var defer = $.Deferred();
			defer.resolve();
			return defer.promise();
	    });
	};

/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("openlocation.js", ["self"], function(self){
	        /**
	         * 调用微信插件，查看地图
	         */
	        function openlocation(data){
	            var defer = $.Deferred();
	            self.wx.openLocation({
	                latitude: new Number(data.lat).toFixed(5), // 纬度，浮点数，范围为90 ~ -90
	                longitude: new Number(data.long).toFixed(5), // 经度，浮点数，范围为180 ~ -180。
	                name: data.name, // 位置名
	                address: data.address, // 地址详情说明
	                scale: 20, // 地图缩放级别,整形值,范围从1~28。默认为最大
	                infoUrl: '' // 在查看位置界面底部显示的超链接,可点击跳转
	            });
	            defer.resolve();
	            return defer.promise();
	        }

	        var data = {
	            lat: self.data.latitude,
	            long: self.data.longitude,
	            name: self.data.name,
	            address: self.data.address
	        };
	        return openlocation(data);
	    });
	};

/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("previewImage.js", ["self"], function(self){
	        /**
	         * 调用微信插件，图片预览
	         */
	        var defer = $.Deferred();
	        self.wx.previewImage({
	            current: self.previewImage.current, // 当前显示图片的http链接
	            urls: self.previewImage.urls // 需要预览的图片http链接列表
	        });
	        return defer.promise();
	    });
	};

/***/ },
/* 13 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("scanqrcode.js", ["self"], function(self){
	        /**
	         * 调用微信插件，扫描二维码
	         */
	        var defer = $.Deferred();
	        self.wx.scanQRCode({
	            desc: 'scanQRCode desc',
	            needResult: 0, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
	            scanType: ["qrCode","barCode"], // 可以指定扫二维码还是一维码，默认二者都有
	            success: function (res) {
	                var result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
	                defer.resolve();
	            }
	        });
	        return defer.promise();
	    });
	};

/***/ },
/* 14 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("scanqrcodeindex.js", ["self"], function(self){
	        /**
	         * 调用支付宝插件，扫描二维码
	         */
	        return ap.scan()
	            .then(function(obj){
	                var result = obj.code; // 当needResult 为 1 时，扫码返回的结果
	                var Exp = /\/\d+$/g;//--正则，获取ID
	                var id = result.match(Exp);
	                id = id? id[0]: "0";
	                id = id.replace(/\D/g, "");
	                Gray.$page.loadPage("/user/shop/details/?id=" + id + "&scene=scan&station_id=" + id);
	            });
	    });
	};

/***/ },
/* 15 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("share/moments.js", ["self"], function(self){
	        /**
	         * 调用插件，分享到微信朋友圈
	         */
			var defer = $.Deferred();
			defer.resolve();
			return defer.promise();
	    });
	};

/***/ },
/* 16 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("share/qq.js", ["self"], function(self){
	        /**
	         * 调用插件，分享到QQ好友
	         */
			var defer = $.Deferred();
			defer.resolve();
			return defer.promise();
	    });
	};

/***/ },
/* 17 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("share/qzone.js", ["self"], function(self){
	        /**
	         * 调用插件，分享到QQ好友
	         */
			var defer = $.Deferred();
			defer.resolve();
			return defer.promise();
	    });
	};

/***/ },
/* 18 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("share/wechat.js", ["self"], function(self){
	        /**
	         * 调用插件，分享到微信好友
	         */
			var defer = $.Deferred();
			defer.resolve();
			return defer.promise();
	    });
	};

/***/ },
/* 19 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("backbutton.js", ["self"], function(self){
	        /**
	         * 调用插件，监听返回按钮，APP模式独有
	         */
			function onBackKeyDown(){//--返回按钮监听
				itou.page.back();
			}
	        var defer = $.Deferred();
	        document.addEventListener("backbutton", onBackKeyDown, false);
			defer.resolve();
	        return defer.promise();
	    });
	};

/***/ },
/* 20 */
/***/ function(module, exports) {

	module.exports = function(){
		Gray.plugin.define("camera/chooseimage.js", ["self"], function(self){
			/**
			 * 调用插件，拍照
			 */
			function callChoose(model, defer){//--唤起图片选择功能
				var params;
				if(model == "camera"){
					params = {};
				}else if(model == "media"){
					params = {sourceType:Camera.PictureSourceType.PHOTOLIBRARY};
				}
				navigator.camera.getPicture(
					function(imageData) {
						defer.resolve(imageData);
					},
					function(error) {
						defer.reject(error);
					},
					params
				);
			}
			var defer = $.Deferred();
			navigator.camera.choosePhotoSource(//--唤起图片选择选项
				function(data) {
					switch (data) {
						case "takePhoto":
							callChoose("camera", defer);
							break;
						case "photoAlbum":
							callChoose("media", defer);
							break;
						default:
							break;
					}
				}, function(error) {
					console.error(error);
				},
				{}
			);
			return defer.promise();
		});
	};

/***/ },
/* 21 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("camera/getpic.js",[], function(){
	        console.debug("camera/getpic.js：", "获取图片，未使用！");
	    });
	};

/***/ },
/* 22 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("camera/uploadImage.js", ["self"], function(self){
	        /**
	         * 调用微信插件，传图
	         */
	        var localId = self.localId;
	        var defer = $.Deferred();
	        var serverId = 0;
	        defer.resolve(serverId);
	        console.debug("camera/uploadImage.js:", "图片上传，仅测试用！");
	        return defer.promise()
	            .then(function(serverId){
	                return self.itou.get({
	                    url: "upload/WxImage",
	                    data: {
	                        id: serverId
	                    }
	                });
	            });
	    });
	};

/***/ },
/* 23 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("checknetwork.js", ["self"], function(self){
	        /**
	         * 调用插件，检查当前网络状态，APP模式独有
	         */
	        var defer = $.Deferred();
	        var networkState = navigator.connection.type;
	        var states = {};
	        states[Connection.UNKNOWN]  = 'Unknown connection';
	        states[Connection.ETHERNET] = 'Ethernet connection';
	        states[Connection.WIFI]     = 'WiFi connection';
	        states[Connection.CELL_2G]  = 'Cell 2G connection';
	        states[Connection.CELL_3G]  = 'Cell 3G connection';
	        states[Connection.CELL_4G]  = 'Cell 4G connection';
	        states[Connection.CELL]     = 'Cell generic connection';
	        states[Connection.NONE]     = 'No network connection';

	        // alert('Connection type: ' + states[networkState]);
	        if (networkState == Connection.NONE) {
	            // alert('无网络');
	            itou.msg.toast = "没有网络";
	        } else {
	            // alert('有网络');
	        }
			defer.resolve();
	        return defer.promise();
	    });
	};

/***/ },
/* 24 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("endprogress.js", ["self"], function(self){
	        /**
	         * 调用插件，结束并隐藏加载进度条，APP模式独有
	         */
	        var defer = $.Deferred();
	        progressNotification.finish(0, 100);
			defer.resolve();
	        return defer.promise();
	    });
	};

/***/ },
/* 25 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("exitapp.js", ["self"], function(self){
	        /**
	         * 调用插件，关闭APP，APP模式独有
	         */
	        var defer = $.Deferred();
			navigator.app.exitApp();
			defer.resolve();
	        return defer.promise();
	    });
	};

/***/ },
/* 26 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("getdevicetoken.js", ["self"], function(self){
	        /**
	         * 调用插件，获取设备token，APP模式独有
	         */
			
			var defer = $.Deferred();
			function getDeviceToken(){//--获取设备token
				var devicetoken = {};
				try {
					///todo:调用接口获取设备token
					devicetoken.err = 0;
					devicetoken.msg = "";
					MobclickAgent.getDeviceId(function(data) {
						devicetoken.token = data;
						defer.resolve(devicetoken);
					});
				} catch (error) {
					devicetoken.err = 1;
					devicetoken.msg = error.message;
					devicetoken.token = "";
					defer.resolve(devicetoken);
				}
			}
			getDeviceToken();
	        return defer.promise();
	    });
	};

/***/ },
/* 27 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("getlocation.js", ["self"], function(self){
	        /**
	         * 调用插件，获取当前位置
	         */
	        var defer = $.Deferred();
	        baidumap_location.getCurrentPosition(
	            function (result) {
	                //window.location.href='map.html?'+'longitude='+result.longitude+'&latitude='+result.longitude;
	                var location = {};
	                location["wgs84"] = result;
	                location["wgs84"].lat = location["wgs84"].latitude;
	                location["wgs84"].long = location["wgs84"].longitude;
	                defer.resolve(location);
	            }, function (error) {
	                console.error(error);
	            }
	        );
	        return defer.promise();
	    });
	};

/***/ },
/* 28 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("init.js", ["self", "flag"], function(self, flag){
	        /**
	         * APP设备初始化
	         */
	        
	        /**
	         * 功能完善：允许在一个页面内多次执行初始化函数
	         * 场景：源自“店铺自动绑定”需求，需要在所有页面调用微信功能，为不影响原有代码，增加允许多次调用功能
	         * 原理：微信初始化，分为初始化中（init_doing）、初始化完成（init_ready）、初始化失败（init_error）3个状态，
	         *      当状态为init_doing时，将promise对象存入队列数组，在初始化完成时，队列中的promise对象全部执行resolve
	         *      当状态为init_ready，直接返回promise对象并执行resolve
	         *      当状态为init_error，直接返回promise对象并执行reject
	         *      上述3种情况外为未开始初始化，执行初始化过程
	         * by zhaoyf    2017-02-14 16:57:59
	         */
	        var wxReady = itou.setting.getData("__wxReady"),//--微信初始化是否完成，init_doing || init_ready || init_error
	            initPromise = itou.setting.getData("__initPromise");//--微信初始化队列
	        if(!initPromise){
	            initPromise = [];
	        }
	        // alert("wxReady:" + wxReady)
	        if(wxReady == "init_doing"){
	            var defer = $.Deferred();
	            var pro = defer.promise();
	            initPromise.push(defer);
	            itou.setting.setData("__initPromise", initPromise);
	            return pro;
	        }else if(wxReady == "init_ready"){
	            var defer = $.Deferred();
	            defer.resolve();
	            return defer.promise();
	        }else if(wxReady == "init_error"){
	            var defer = $.Deferred();
	            defer.reject();
	            return defer.promise();
	        }
	        /**
	         * 功能完善结束（剩余部分在deviceready中执行）
	         */
	        itou.setting.setData("__wxReady", "init_doing"); 
	        function getPushData(){
	            window.setTimeout(function() {
	                MobclickAgent.getPushData(function (data) {
	                    if(!!data){
	                        Gray.$page.loadPage(data);
	                    }
	                });
	            }, 0);
	        }
	        document.addEventListener('deviceready', function(res){
	            // self.showDemo = true;
	            console.log("deviceready：", res);
	            itou.setting.setData("__wxReady", "init_ready");
	            getPushData();
	            document.addEventListener("resume", function(){
	                getPushData();
	            }, false);
	            /**
	             * 功能完善，使初始化函数可多次执行
	             */
	            var initPromise = itou.setting.getData("__initPromise") || [];
	            for(var i = 0, len = initPromise.length; i < len; i++){
	                initPromise[i].resolve();
	            }
	        }, false);
	        var defer = $.Deferred();
	        var pro = defer.promise();
	        initPromise.push(defer);
	        itou.setting.setData("__initPromise", initPromise);
	        return pro;
	    });
	};

/***/ },
/* 29 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("onmenushareappmessage.js", ["self"], function(self){
	        /**
	         * 调用微信插件，分享给微信好友
	         */
	        // alert("onmenushareappmessage");
	        Gray.plugin.require("share/wechat.js");
	        Gray.plugin.require("share/moments.js");
	        Gray.plugin.require("share/qq.js");
	        Gray.plugin.require("share/qzone.js");
	        function startBottomShare(){
	            window.navigator.dialogsPlus.bottomShare(//--展示底部分享条
	                function (type) {
	                    switch(type) {
	                        case "wechat":
	                            Gray.$plugin["share/wechat.js"]();
	                            break;
	                        case "moments":
	                            Gray.$plugin["share/moments.js"]();
	                            break;
	                        case "qq":
	                            Gray.$plugin["share/qq.js"]();
	                            break;
	                        case "qzone":
	                            Gray.$plugin["share/qzone.js"]();
	                            break;
	                    }
	                }, function (error) {
	                    console.error(error);
	                }
	            );
	        }
	        var defer = $.Deferred();
	        defer.resolve();
	        try{
	            vm.$watch('isShowShareInfo', function (newVal, oldVal) {
	              if(newVal){
	                vm.isShowShareInfo = false;
	                startBottomShare();
	              }
	            });
	            vm.$watch('layer_show', function (newVal, oldVal) {
	              if(newVal){
	                vm.isShowShareInfo = false;
	                startBottomShare();
	              }
	            });
	        }catch(e){
	            console.error(e.message);
	        }
	        return defer.promise();
	    });
	};

/***/ },
/* 30 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("onmenusharetimeline.js", ["self"], function(self){
	        /**
	         * 调用微信插件，分享给微信朋友圈
	         */
	        var defer = $.Deferred();
	        defer.resolve();
	        console.debug("onmenusharetimeline.js：", "调用微信插件，分享给微信朋友圈");
	        return defer.promise();
	    });
	};

/***/ },
/* 31 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("openlocation.js", ["self"], function(self){
	        /**
	         * 调用插件，查看地图
	         */
	        var defer = $.Deferred(),
	            data = {
	            lat: self.data.latitude,
	            long: self.data.longitude,
	            name: self.data.name,
	            address: self.data.address
	        };
	        defer.resolve();
	        baidumap_location.getLocate(data.lat, data.long);
	        return defer.promise();
	    });
	};

/***/ },
/* 32 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("previewImage.js", ["self"], function(self){
	        /**
	         * 调用微信插件，图片预览
	         */
	        var defer = $.Deferred();
	        defer.resolve();
	        alert("previewImage.js：\n调用插件，图片预览。\n暂时未有预览功能");
	        return defer.promise();
	    });
	};

/***/ },
/* 33 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("scanqrcode.js", ["self"], function(self){
	        /**
	         * 调用插件，扫描二维码
	         */
	        var defer = $.Deferred();
	        cordova.plugins.barcodeScanner.scan(
	            function (result) {
	                if(result.cancelled){//--取消
	                    defer.reject();
	                }else{//--获得结果
	                    var res = result.text;
	                    defer.resolve(res);
	                }
	            },
	            function (error) {
	               console.error(error);
	            },
	            {
	                preferFrontCamera : false, // iOS and Android
	                showFlipCameraButton : true, // iOS and Android
	                showTorchButton : true, // iOS and Android
	                torchOn: true, // Android, launch with the torch switched on (if available)
	                saveHistory: true, // Android, save scan history (default false)
	                prompt : "Place a barcode inside the scan area", // Android
	                resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
	                formats : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
	                orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
	                disableAnimations : true, // iOS
	                disableSuccessBeep: false // iOS and Android
	            }
	        );
	        return defer.promise();
	    });
	};

/***/ },
/* 34 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("scanqrcodeindex.js", ["self"], function(self){
	        /**
	         * 调用插件，扫描二维码
	         */
	        var defer = $.Deferred();
	        cordova.plugins.barcodeScanner.scan(
	            function (result) {
	                if(result.cancelled){//--取消
	                    defer.reject();
	                }else{//--获得结果
	                    var res = result.text;
	                    var Exp = /\/\d+$/g;//--正则，获取ID
	                    var id = res.match(Exp);
	                    id = id? id[0]: "0";
	                    id = id.replace(/\D/g, "");
	                    Gray.$page.loadPage("/user/shop/details/?id=" + id + "&scene=scan&station_id=" + id);
	                    defer.resolve();
	                }
	            },
	            function (error) {
	               console.error(error);
	            },
	            {
	                preferFrontCamera : false, // iOS and Android
	                showFlipCameraButton : true, // iOS and Android
	                showTorchButton : true, // iOS and Android
	                torchOn: true, // Android, launch with the torch switched on (if available)
	                saveHistory: true, // Android, save scan history (default false)
	                prompt : "Place a barcode inside the scan area", // Android
	                resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
	                formats : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
	                orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
	                disableAnimations : true, // iOS
	                disableSuccessBeep: false // iOS and Android
	            }
	        );
	        return defer.promise();
	    });
	};

/***/ },
/* 35 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("share/moments.js", ["self"], function(self){
	        /**
	         * 调用插件，分享到微信朋友圈
	         */
			var link = self.data.shareMess.link || "";
	        var back = itou.outil.getUrlParam(link, "back");
	        if(back){
	            link = link.replace("back=" + back, "").replace("back=" + encodeURIComponent(back), "");
	            link = link.replace("?&", "?").replace("&&", "&").replace(/&$/, "");
	        }
			var defer = $.Deferred();
			Wechat.share({
				message: {
					title: self.data.shareMess.title, // 分享标题
					description: self.data.shareMess.desc, // 分享描述
					thumb: self.data.shareMess.imgUrl, // 分享图标
					media: {
						type: Wechat.Type.WEBPAGE,
						webpageUrl: link // 分享链接
					},
				},
				scene: Wechat.Scene.Moments
			}, function () {
				if(self.data.shareMess.success){
					self.data.shareMess.success(self);
				}
				if(self.isShowShareInfo){
					self.isShowShareInfo = false;
				}
				defer.resolve();
			}, function (reason) {
				// alert("Failed: " + reason);
				if(reason == "用户点击取消并返回"){
					// 用户取消分享后执行的回调函数
	                if(self.isShowShareInfo){
	                    self.isShowShareInfo = false;
	                }
				}
			});
			return defer.promise();
	    });
	};

/***/ },
/* 36 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("share/qq.js", ["self"], function(self){
	        /**
	         * 调用插件，分享到QQ好友
	         */
			var link = self.data.shareMess.link || "";
	        var back = itou.outil.getUrlParam(link, "back");
	        if(back){
	            link = link.replace("back=" + back, "").replace("back=" + encodeURIComponent(back), "");
	            link = link.replace("?&", "?").replace("&&", "&").replace(/&$/, "");
	        }
			var defer = $.Deferred();
			var args = {};
			args.client = QQSDK.ClientType.QQ;//QQSDK.ClientType.QQ,QQSDK.ClientType.TIM;
			args.scene = QQSDK.Scene.QQ;//QQSDK.Scene.QQZone,QQSDK.Scene.Favorite
			args.url = link; // 分享链接
			args.title = self.data.shareMess.title; // 分享标题
			args.description = self.data.shareMess.desc; // 分享描述
			args.image = self.data.shareMess.imgUrl; // 分享图标
			QQSDK.shareNews(
				function () {
					if(self.data.shareMess.success){
						self.data.shareMess.success(self);
					}
					if(self.isShowShareInfo){
						self.isShowShareInfo = false;
					}
					defer.resolve();
				}, function (failReason) {
					if(failReason == "用户点击取消并返回"){
						// 用户取消分享后执行的回调函数
						if(self.isShowShareInfo){
							self.isShowShareInfo = false;
						}
					}
				}, args
			);
			return defer.promise();
	    });
	};

/***/ },
/* 37 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("share/qzone.js", ["self"], function(self){
	        /**
	         * 调用插件，分享到QQ好友
	         */
			var link = self.data.shareMess.link || "";
	        var back = itou.outil.getUrlParam(link, "back");
	        if(back){
	            link = link.replace("back=" + back, "").replace("back=" + encodeURIComponent(back), "");
	            link = link.replace("?&", "?").replace("&&", "&").replace(/&$/, "");
	        }
			var defer = $.Deferred();
			var args = {};
			args.client = QQSDK.ClientType.QQ;//QQSDK.ClientType.QQ,QQSDK.ClientType.TIM;
			args.scene = QQSDK.Scene.QQZone;//QQSDK.Scene.QQZone,QQSDK.Scene.Favorite
			args.url = link; // 分享链接
			args.title = self.data.shareMess.title; // 分享标题
			args.description = self.data.shareMess.desc; // 分享描述
			args.image = self.data.shareMess.imgUrl; // 分享图标
			QQSDK.shareNews(
				function () {
					if(self.data.shareMess.success){
						self.data.shareMess.success(self);
					}
					if(self.isShowShareInfo){
						self.isShowShareInfo = false;
					}
					defer.resolve();
				}, function (failReason) {
					if(failReason == "用户点击取消并返回"){
						// 用户取消分享后执行的回调函数
						if(self.isShowShareInfo){
							self.isShowShareInfo = false;
						}
					}
				}, args
			);
			return defer.promise();
	    });
	};

/***/ },
/* 38 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("share/wechat.js", ["self"], function(self){
	        /**
	         * 调用插件，分享到微信好友
	         */
			var link = self.data.shareMess.link || "";
	        var back = itou.outil.getUrlParam(link, "back");
	        if(back){
	            link = link.replace("back=" + back, "").replace("back=" + encodeURIComponent(back), "");
	            link = link.replace("?&", "?").replace("&&", "&").replace(/&$/, "");
	        }
			var defer = $.Deferred();
			Wechat.share({
				message: {
					title: self.data.shareMess.title, // 分享标题
					description: self.data.shareMess.desc, // 分享描述
					thumb: self.data.shareMess.imgUrl, // 分享图标
					media: {
						type: Wechat.Type.WEBPAGE,
						webpageUrl: link // 分享链接
					},
				},
				scene: Wechat.Scene.SESSION
			}, function () {
				if(self.data.shareMess.success){
					self.data.shareMess.success(self);
				}
				if(self.isShowShareInfo){
					self.isShowShareInfo = false;
				}
				defer.resolve();
			}, function (reason) {
				// alert("Failed: " + reason);
				if(reason == "用户点击取消并返回"){
					// 用户取消分享后执行的回调函数
	                if(self.isShowShareInfo){
	                    self.isShowShareInfo = false;
	                }
				}
			});
			return defer.promise();
	    });
	};

/***/ },
/* 39 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("startprogress.js", ["self"], function(self){
	        /**
	         * 调用插件，扫描开始展示加载进度条，APP模式独有
	         */
			Gray.plugin.require("endprogress.js");
	        var defer = $.Deferred();
	        progressNotification.show(0);
			var rate = 0;
			var iv = setInterval(function () {
				if (rate < 10) {
					progressNotification.update(0, rate*10);
					rate = rate + 1;
				} else {
					clearInterval(iv);
					var documentStatus = itou.setting.getData("__app_document_ready");
					if(documentStatus.status == "ready"){
						Gray.$plugin["endprogress.js"]();
					}
					defer.resolve();
				}
			}, 100);
	        return defer.promise();
	    });
	};

/***/ },
/* 40 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("backbutton.js", ["self"], function(self){
	        /**
	         * 调用插件，监听返回按钮，APP模式独有
	         */
	        function onBackKeyDown(){//--返回按钮监听
	            if(vm && vm.back){
	                vm.back();
	            }else{
	                itou.page.back();
	            }
			}
	        var defer = $.Deferred();
	        document.addEventListener("backbutton", onBackKeyDown, false);
			defer.resolve();
	        return defer.promise();
	    });
	};

/***/ },
/* 41 */
/***/ function(module, exports) {

	module.exports = function(){
		Gray.plugin.define("camera/chooseimage.js", ["self"], function(self){
			/**
			 * 调用插件，拍照
			 */
			function callChoose(model, defer){//--唤起图片选择功能
				var params;
				if(model == "camera"){
					params = {destinationType: Camera.DestinationType.FILE_URI};
				}else if(model == "media"){
					params = {
						sourceType:Camera.PictureSourceType.PHOTOLIBRARY,
						destinationType: Camera.DestinationType.FILE_URI
					};
				}
				navigator.camera.getPicture(
					function(imageData) {
						defer.resolve(imageData);
					},
					function(error) {
						defer.reject(error);
					},
					params
				);
			}
			var defer = $.Deferred();
			navigator.camera.choosePhotoSource(//--唤起图片选择选项
				function(data) {
					switch (data) {
						case "takePhoto":
							callChoose("camera", defer);
							break;
						case "photoAlbum":
							callChoose("media", defer);
							break;
						default:
							break;
					}
				}, function(error) {
					console.error(error);
				},
				{}
			);
			return defer.promise();
		});
	};

/***/ },
/* 42 */
/***/ function(module, exports) {

	module.exports = function(){

	    Gray.plugin.define("camera/downloadImage.js", ["self"], function(self){

	        /**

	         * 调用插件，下载图片

	         */

	        var defer = $.Deferred(),
	            img = self.downloadImgElt,
	            canvas = document.createElement('CANVAS'),//--生成canvas对象
	            ctx = canvas.getContext('2d');
	        canvas.width = img.naturalWidth;//--获取图片原始宽度
	        canvas.height = img.naturalHeight;//--获取图片原始高度
	        ctx.drawImage(img, 0, 0);//--canvas重绘图片
	        if(config.platform == "ios"){
	            try{
	                var xhr = new XMLHttpRequest(),  
	                    url = img.src;//alert(url);
	                xhr.withCredentials = true;
	                xhr.open('get', url, true);
	                xhr.responseType = 'blob';
	                xhr.onload = function() {
	                    // 注意这里的this.response 是一个blob对象 就是文件对象
	                    //callback(this.status == 200 ? this.response : false);
	                    // alert(this.status);
	                    // alert(this.response);
	                    var blobFile = this.response,
	                        fileReader = new FileReader();
	                    fileReader.readAsDataURL(blobFile);
	                    fileReader.onload = function() {  
	                        // alert(this.result);//这里输出的数据放到url里能生成图片
	                        var imageBase64Data = this.result;
	                        imageBase64Data = imageBase64Data.replace(/data:image\/jpeg;base64,/, '');
	                        // alert(imageBase64Data);
	                        canvas2ImagePlugin.saveImageBase64DataToLibrary(
	                            callback,
	                            errback,
	                            imageBase64Data
	                        );
	                    };  
	                }  
	                xhr.send();
	            }catch(e){
	                // alert(e.message);
	            }
	        }else{
	            canvas2ImagePlugin.saveImageDataToLibrary(
	                callback,
	                errback,
	                canvas
	            );
	        }
	        function callback(rlt){
	            // alert(["成功", JSON.stringify(rlt, null, 4)].join("\n"));
	            // vm.showToast("下载成功");
	            canvas = null;
	            defer.resolve({errcode: 0});
	        }
	        function errback(err){
	            // alert(["失敗", JSON.stringify(err, null, 4)].join("\n"));
	            canvas = null;
	            defer.resolve({errcode: 1});
	        }
	        return defer.promise();
	    });
	};

/***/ },
/* 43 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("camera/getpic.js",[], function(){
	        console.debug("camera/getpic.js：", "获取图片，未使用！");
	    });
	};

/***/ },
/* 44 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("camera/uploadImage.js", ["self"], function(self){
	        /**
	         * 调用微信插件，传图
	         */
	        var fileURL = self.localIds;
	        var defer = $.Deferred();
	        var success = function (r) {
	            // alert("上传成功! Code = " + r.responseCode);
	            var result = r.response;
	            // alert(typeof result);
	            result = typeof result == "object"? result: JSON.parse(result);
	            if(result.errcode == 0){
	                var data = result.data;
	                //alert(data.path);
	                // alert(data.path);
	                // alert(["data = ", JSON.stringify(data, null, 2)]);
	                defer.resolve(data);
	            }else{
	                defer.reject(result);
	            }
	        }
	        //上传失败
	        var fail = function (error) {
	            // alert("上传失败! Code = " + error.code);
	            defer.reject(error);
	        }

	        var options = new FileUploadOptions();
	        options.fileKey = "file1";
	        options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
	        //options.mimeType = "text/plain";

	        //上传参数
	        var params = {};
	        // params.value1 = "test";
	        // params.value2 = "param";
	        // options.params = params;

	        var ft = new FileTransfer();
	        //上传地址
	        var SERVER = config.api_url + "/upload/UploadImage";
	        ft.upload(fileURL, encodeURI(SERVER), success, fail, options); 
	        return defer.promise();
	    });
	};

/***/ },
/* 45 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("chcp-checkupdate.js", ["self"], function(self){
	        /**
	         * 检查是否需要热更新，APP模式独有
	         */
	        var defer = $.Deferred();
	        chcp.fetchUpdate(function (data) {
	            chcp.getVersionInfo(function (error, data) {
	                document.getElementById("currentWebVersion").innerText = data.currentWebVersion;
	                document.getElementById("readyToInstallWebVersion").innerText = data.readyToInstallWebVersion;
	            });
	        });
			defer.resolve();
	        return defer.promise();
	    });
	};

/***/ },
/* 46 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("chcp-checkupdate.js", ["self"], function(self){
	        /**
	         * 检查是否需要热更新，APP模式独有
	         */
	        var defer = $.Deferred();
	        chcp.fetchUpdate(function (data) {
	            chcp.getVersionInfo(function (error, data) {
	                document.getElementById("currentWebVersion").innerText = data.currentWebVersion;
	                document.getElementById("readyToInstallWebVersion").innerText = data.readyToInstallWebVersion;
	            });
	        });
			defer.resolve();
	        return defer.promise();
	    });
	};

/***/ },
/* 47 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("checknetwork.js", ["self"], function(self){
	        /**
	         * 调用插件，检查当前网络状态，APP模式独有
	         * UNKNOWN: "unknown",
	            ETHERNET: "ethernet",
	            WIFI: "wifi",
	            CELL_2G: "2g",
	            CELL_3G: "3g",
	            CELL_4G: "4g",
	            CELL:"cellular",
	            NONE: "none"
	         */
	        var defer = $.Deferred();
	        if(!(Gray.$page.href + "").has(itou.apiTimeout.errUrl)){//--非网络错误展示页面进行网络状态判断
	            var states = {};
	            states[Connection.UNKNOWN]  = 'Unknown connection';
	            states[Connection.ETHERNET] = 'Ethernet connection';
	            states[Connection.WIFI]     = 'WiFi connection';
	            states[Connection.CELL_2G]  = 'Cell 2G connection';
	            states[Connection.CELL_3G]  = 'Cell 3G connection';
	            states[Connection.CELL_4G]  = 'Cell 4G connection';
	            states[Connection.CELL]     = 'Cell generic connection';
	            states[Connection.NONE]     = 'No network connection';

	            // alert('Connection type: ' + states[networkState]);
	            var doTimeout = itou.sessionData.getData("__network_check_timeout") || {};//--是否开启延时模式
	            doTimeout = doTimeout.key || "0";
	            itou.sessionData.setData("__network_check_timeout", {key: 0});//--关闭延时模式
	            navigator.connection.getInfo(function(networkState){
	                window.__networkState = networkState;
	            });
	            if(doTimeout == "1"){//--延时检查网络
	                var hasNet = false,
	                    num = 0,
	                    key = "__network_check_timeout_key";
	                itou.outil.timmer.clearTimmer(key);
	                var el = $('#loaderbox1');
	                if(el.length == 0){
	                    el = $('#loaderbox').clone();
	                    el.attr("id", "loaderbox1");
	                    el.appendTo("body");
	                }
	                el.show();
	                itou.outil.timmer.newTimmer({
	                    key: key,
	                    timeout: 1000,
	                    fun: function(){
	                        if(__networkState == "none"){
	                            num += 1;
	                            if(num > 3){
	                                itou.outil.timmer.clearTimmer(key);
	                                itou.msg.toast = "";
	                                itou.msg.toast = "连接失败，请检查您的网络！";
	                                itou.apiTimeout.timeoutErr();
	                            }
	                        }else{
	                            itou.outil.timmer.clearTimmer(key);
	                            el.hide();
	                        }
	                    }
	                });
	            }else{
	                if (__networkState == "none") {
	                    // alert('无网络');
	                    itou.msg.toast = "";
	                    itou.msg.toast = "连接失败，请检查您的网络！";
	                    itou.apiTimeout.timeoutErr();
	                } else {
	                    // alert('有网络');
	                }
	            }
	        }
			defer.resolve();
	        return defer.promise();
	    });
	};

/***/ },
/* 48 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("checkupdate.js", ["self"], function(self){
	        /**
	         * 检查是否需要壳更新，APP模式独有
	         */
	        var defer = $.Deferred();
	        var appId = "1290028147";
	        if(device.platform != "iOS"){
	            var isChecked = itou.sessionData.getData("__checkupdate_isChecked").isChecked;
	            if(!isChecked){
	                cordova.getAppUpdate.checkUpdate(appId, function (data) {
	                    console.log(data);
	                }, function (error) {
	                    console.log(error);
	                });
	                itou.sessionData.setData("__checkupdate_isChecked", {isChecked: true});
	            }
	        }
	        defer.resolve();
	        return defer.promise();
	    });
	};

/***/ },
/* 49 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("clipboard/check-entrance.js", ["self"], function(self){
	        /**
	         * 检查剪贴板是否有店铺信息，APP模式独有
	         */
	        var defer = $.Deferred();
	        cordova.plugins.clipboard.paste(function (text) {
	            // alert(text);
	            /**
	             * 店铺口令格式:$店铺口令$长按复制本条消息，打开口袋彩店App即可进入[xxxx彩店]，MjEyNDk1NDA=
	             * 判定：有以$店铺口令$开头的文本，取最后一个中文逗号后的字符串，base64解码，就能得到店铺id
	             * var a = window.btoa("21249540");//"MjEyNDk1NDA="
	             * alert(a)
	             * var b = window.atob(a);//"21249540"
	             * alert(b)
	             */
	            if(text && text.has("$店铺口令$")){
					var b64ID = text.split("，").pop();
					cordova.plugins.clipboard.copy("");
					try{
						var id = window.atob(b64ID);
						if(id && !isNaN(id)){
	                        Gray.$page.loadPage("/user/shop/details/?id=" + id + "&back=" + window.backurl);
	                    }
					}catch(e){}
				}
	        });
			defer.resolve();
	        return defer.promise();
	    });
	};

/***/ },
/* 50 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("endprogress.js", ["self"], function(self){
	        /**
	         * 调用插件，结束并隐藏加载进度条，APP模式独有
	         */
	        var defer = $.Deferred();
	        // progressNotification.finish(0, 100);
	        if (device.platform == "iOS") {
	            window.navigator.dialogsPlus.setProgress(100);
	        } else {
	            progressNotification.finish(0, 100); 
	        }
			defer.resolve();
	        return defer.promise();
	    });
	};

/***/ },
/* 51 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("exitapp.js", ["self"], function(self){
	        /**
	         * 调用插件，关闭APP，APP模式独有
	         */
	        var defer = $.Deferred();
			navigator.app.exitApp();
			defer.resolve();
	        return defer.promise();
	    });
	};

/***/ },
/* 52 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("getdevicetoken.js", ["self"], function(self){
	        /**
	         * 调用插件，获取设备token，APP模式独有
	         */
			
			var defer = $.Deferred();
			function getDeviceToken(){//--获取设备token
				var devicetoken = {};
				try {
					///todo:调用接口获取设备token
					devicetoken.err = 0;
					devicetoken.msg = "";
					UmengPush.getDeviceId(function(data) {
						devicetoken.token = data;
						defer.resolve(devicetoken);
					});
				} catch (error) {
					devicetoken.err = 1;
					devicetoken.msg = error.message;
					devicetoken.token = "";
					defer.resolve(devicetoken);
				}
			}
			getDeviceToken();
	        return defer.promise();
	    });
	};

/***/ },
/* 53 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("getlocation.js", ["self"], function(self){
	        /**
	         * 调用插件，获取当前位置
	         */
	        var defer = $.Deferred();
	        baidumap_location.getCurrentPosition(
	            function (result) {
	                //window.location.href='map.html?'+'longitude='+result.longitude+'&latitude='+result.longitude;
	                var location = {};
	                location["wgs84"] = result;
	                location["wgs84"].lat = location["wgs84"].latitude;
	                location["wgs84"].long = location["wgs84"].longitude;
	                defer.resolve(location);
	            }, function (error) {
	                console.error(error);
	            }
	        );
	        return defer.promise();
	    });
	};

/***/ },
/* 54 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("getversioninfo.js", ["self"], function(self){
	        /**
	         * 调用插件，获取设备版本号，APP模式独有
	         */
			
			var defer = $.Deferred();
			function getVersionInfo(){//--获取设备token
				var devicetoken = {};
				try {
					cordova.getAppVersion.getVersionNumber(function (getVersionNumber) {
						defer.resolve(getVersionNumber);
					});
				} catch (error) {
					defer.resolve("");
				}
			}
			getVersionInfo();
	        return defer.promise();
	    });
	};

/***/ },
/* 55 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("init.js", ["self", "flag"], function(self, flag){
	        /**
	         * APP设备初始化
	         */
	        
	        /**
	         * 功能完善：允许在一个页面内多次执行初始化函数
	         * 场景：源自“店铺自动绑定”需求，需要在所有页面调用微信功能，为不影响原有代码，增加允许多次调用功能
	         * 原理：微信初始化，分为初始化中（init_doing）、初始化完成（init_ready）、初始化失败（init_error）3个状态，
	         *      当状态为init_doing时，将promise对象存入队列数组，在初始化完成时，队列中的promise对象全部执行resolve
	         *      当状态为init_ready，直接返回promise对象并执行resolve
	         *      当状态为init_error，直接返回promise对象并执行reject
	         *      上述3种情况外为未开始初始化，执行初始化过程
	         * by zhaoyf    2017-02-14 16:57:59
	         */
	        var wxReady = itou.setting.getData("__wxReady"),//--微信初始化是否完成，init_doing || init_ready || init_error
	            initPromise = itou.setting.getData("__initPromise");//--微信初始化队列
	        if(!initPromise){
	            initPromise = [];
	        }
	        // alert("wxReady:" + wxReady)
	        if(wxReady == "init_doing"){
	            var defer = $.Deferred();
	            var pro = defer.promise();
	            initPromise.push(defer);
	            itou.setting.setData("__initPromise", initPromise);
	            return pro;
	        }else if(wxReady == "init_ready"){
	            var defer = $.Deferred();
	            defer.resolve();
	            return defer.promise();
	        }else if(wxReady == "init_error"){
	            var defer = $.Deferred();
	            defer.reject();
	            return defer.promise();
	        }
	        /**
	         * 功能完善结束（剩余部分在deviceready中执行）
	         */
	        itou.setting.setData("__wxReady", "init_doing"); 
	        function getPushData(callback){//--获取推送消息
	            window.setTimeout(function() {
	                UmengPush.getPushData(function (data) {
	                    if(!!data){
	                        data = JSON.parse(data);
	                        if(data.type && (data.type == "scheme" || data.type == "push") && data.url){
	                            // alert(["APP被唤醒", "type: " + data.type, "URL: " + data.url].join("\n"));
	                            Gray.$page.loadPage(data.url);
	                        }
	                    }else{
	                        callback();
	                    }
	                });
	            }, 0);
	        }
	        //--APP模式下，链接唤醒APP，在device ready后会调用全局函数，跳转url
	        window.handleOpenURL = function(url){
	            // alert(["链接唤醒APP", "url = " + url].join("\n"));
	            if(url && typeof url == "string" && url.left(9) == "koudai://"){
	                Gray.$page.loadPage(url.replace("koudai://", ""));
	            }
	        }
	        document.addEventListener('deviceready', function(res){
	            // self.showDemo = true;
	            console.log("deviceready：", res);
	            if(device && device.platform == "iOS"){
	                var args = ['GET', 'https://www.itou.com'];
	                cordova.exec(null, null, 'WKWebViewSyncCookies', 'sync', args);
	            }
	            Gray.plugin.require("checkupdate.js");
	            Gray.plugin.require("chcp-checkupdate.js");
	            Gray.plugin.require("clipboard/check-entrance.js");
	            itou.setting.setData("__wxReady", "init_ready");
	            getPushData(function(){Gray.$plugin["clipboard/check-entrance.js"]();});//--优先检查推送消息，推送消息为空，检查剪贴板
	            window.setTimeout(function () {
	                Gray.$plugin["checkupdate.js"]();//--检查是否需要壳更新
	                Gray.$plugin["chcp-checkupdate.js"]();//--检查是否需要热更新
	            }, 0);
	            document.addEventListener("resume", function(){
	                getPushData(function(){Gray.$plugin["clipboard/check-entrance.js"]();});
	                window.setTimeout(function () {
	                    Gray.$plugin["chcp-checkupdate.js"]();//--检查是否需要热更新
	                }, 0);
	            }, false);
	            /**
	             * 功能完善，使初始化函数可多次执行
	             */
	            var initPromise = itou.setting.getData("__initPromise") || [];
	            for(var i = 0, len = initPromise.length; i < len; i++){
	                initPromise[i].resolve();
	            }
	        }, false);
	        var defer = $.Deferred();
	        var pro = defer.promise();
	        initPromise.push(defer);
	        itou.setting.setData("__initPromise", initPromise);
	        return pro;
	    });
	};

/***/ },
/* 56 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("onmenushareappmessage.js", ["self"], function(self){
	        /**
	         * 调用微信插件，分享给微信好友
	         */
	        // alert("onmenushareappmessage");
	        var link = self.data.shareMess.link || "";
	        var back = itou.outil.getUrlParam(link, "back");
	        if(back){
	            link = link.replace("back=" + back, "").replace("back=" + encodeURIComponent(back), "");
	            link = link.replace("?&", "?").replace("&&", "&").replace(/&$/, "");
			}
			var p_station_id = itou.outil.getUrlParam(link, "p_station_id");
			if(p_station_id){
				link += (link.has("?")? "&": "?") + "back=" + encodeURIComponent("/user/shop/details/?id=" + p_station_id);
			}
	        self.data.shareMess.link = link + (link.has("?")? "&": "?") + "fromApp=1"
	        Gray.plugin.require("share/wechat.js");
	        Gray.plugin.require("share/moments.js");
	        Gray.plugin.require("share/qq.js");
	        Gray.plugin.require("share/qzone.js");
	        function startBottomShare(){
	            var href = Gray.$page.href + "",
	                setting = {
	                    "/activity/receivebonus/share/": {
	                        "content": "share content",
	                        "showWeChat": true,
	                        "showMoments": true,
	                        "showQQ": false,
	                        "showQzone": false
	                    },
	                    default: {
	                        "content": "share content",
	                        "showWeChat": true,
	                        "showMoments": true,
	                        "showQQ": true,
	                        "showQzone": true
	                    }
	                };
	            href = href.split("?")[0];
	            var opts = setting[href] || setting.default;
	            cordova.getAppShare.share(
	                opts,
	                function (type) {
	                    switch (type) {
	                        case 0:
	                            Gray.$plugin["share/wechat.js"]();
	                            break;
	                        case 1:
	                            Gray.$plugin["share/moments.js"]();
	                            break;
	                        case 2:
	                            Gray.$plugin["share/qq.js"]();
	                            break;
	                        case 3:
	                            Gray.$plugin["share/qzone.js"]();
	                            break;
	                    }
	                },
	                function (error) {
	                    console.error(error);
	                }
	            );
	        }
	        var defer = $.Deferred();
	        defer.resolve();
	        try{
	            vm.$watch('isShowShareInfo', function (newVal, oldVal) {
	                if(newVal){
	                    vm.isShowShareInfo = false;
	                    startBottomShare();
	                }
	            });
	            vm.$watch('layer_show', function (newVal, oldVal) {
	                if(newVal){
	                    vm.layer_show = false;
	                    startBottomShare();
	                }
	            });
	        }catch(e){
	            console.error(e.message);
	        }
	        return defer.promise();
	    });
	};

/***/ },
/* 57 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("onmenusharetimeline.js", ["self"], function(self){
	        /**
	         * 调用微信插件，分享给微信朋友圈
	         */
	        var defer = $.Deferred();
	        defer.resolve();
	        console.debug("onmenusharetimeline.js：", "调用微信插件，分享给微信朋友圈");
	        return defer.promise();
	    });
	};

/***/ },
/* 58 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("openlocation.js", ["self"], function(self){
	        /**
	         * 调用插件，查看地图
	         */
	        var defer = $.Deferred(),
	            data = {
	            lat: self.data.latitude,
	            long: self.data.longitude,
	            name: self.data.name,
	            address: self.data.address
	        };
	        defer.resolve();
	        baidumap_location.getLocate(data.lat, data.long);
	        return defer.promise();
	    });
	};

/***/ },
/* 59 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("openschemeurl.js", ["self"], function(self){
	        /**
	         * 调用插件，app唤起微信或支付宝，APP模式独有
	         */
			
			var defer = $.Deferred();
	        var OpenSchemeUrl = window.cordova.plugins.OpenSchemeUrl,
	            urls = {
	                alipay: "alipayqr://platformapi/startapp?saId=10000007",//--唤醒支付宝扫码
	                wx: "weixin://"//--唤醒微信
	            },
	            url = urls[self.schemeUrl] || self.schemeUrl;
	        OpenSchemeUrl.open(url, function(){
	            console.log('URL opened successfully.');
	            defer.resolve({errcode: 0});
	        }, function(){
	            console.log('URL schema not handled.');
	            defer.resolve({errcode: 1});
	        });
	        return defer.promise();
	    });
	};

/***/ },
/* 60 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("previewImage.js", ["self"], function(self){
	        /**
	         * 调用微信插件，图片预览
	         */
	        var defer = $.Deferred();
	        defer.resolve();
	        alert(self.previewImage.current);
	        return defer.promise();
	    });
	};

/***/ },
/* 61 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("scanqrcode.js", ["self"], function(self){
	        /**
	         * 调用插件，扫描二维码
	         */
	        var defer = $.Deferred();
	        cordova.plugins.barcodeScanner.scan(
	            function (result) {
	                if(result.cancelled){//--取消
	                    defer.reject();
	                }else{//--获得结果
	                    var res = result.text;
	                    defer.resolve(res);
	                }
	            },
	            function (error) {
	               console.error(error);
	            },
	            {
	                preferFrontCamera : false, // iOS and Android
	                showFlipCameraButton : true, // iOS and Android
	                showTorchButton : true, // iOS and Android
	                torchOn: true, // Android, launch with the torch switched on (if available)
	                saveHistory: true, // Android, save scan history (default false)
	                prompt : "Place a barcode inside the scan area", // Android
	                resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
	                formats : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
	                orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
	                disableAnimations : true, // iOS
	                disableSuccessBeep: false // iOS and Android
	            }
	        );
	        return defer.promise();
	    });
	};

/***/ },
/* 62 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("scanqrcodeindex.js", ["self"], function(self){
	        /**
	         * 调用插件，扫描二维码
	         */
	        var defer = $.Deferred();
	        cordova.plugins.barcodeScanner.scan(
	            function (result) {
	                if(result.cancelled){//--取消
	                    defer.reject();
	                }else{//--获得结果
	                    var res = result.text;
	                    var Exp = /\/\d+$/g;//--正则，获取ID
	                    var id = res.match(Exp);
	                    id = id? id[0]: "0";
	                    id = id.replace(/\D/g, "");
	                    if(!(id > 0)){
	                        Gray.$page.loadPage("/errors/scan/");
	                    }else{
	                        Gray.$page.loadPage("/user/shop/details/?id=" + id + "&scene=scan&station_id=" + id);
	                    }
	                    defer.resolve();
	                }
	            },
	            function (error) {
	                console.error(error);
	                var msg = "无法开启摄像头，请检查口袋彩店是否有访问摄像头的权限，或重启设备后重试";
	                vm.showConfirmBox(msg ,"", "", "_scanqrcodeindex_err", "查看帮助", "我知道了");
	                vm.$on('msgbox_ok', function(msg){
	                    if(msg == "_scanqrcodeindex_err"){//--弹窗点击确定是执行
	                        // alert("跳转到帮助页面");
	                        Gray.$page.loadPage("/help/payscan/?back=" + window.backurl);
	                    }
	                });
	            },
	            {
	                preferFrontCamera : false, // iOS and Android
	                showFlipCameraButton : true, // iOS and Android
	                showTorchButton : true, // iOS and Android
	                torchOn: true, // Android, launch with the torch switched on (if available)
	                saveHistory: true, // Android, save scan history (default false)
	                prompt : "Place a barcode inside the scan area", // Android
	                resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
	                formats : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
	                orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
	                disableAnimations : true, // iOS
	                disableSuccessBeep: false // iOS and Android
	            }
	        );
	        return defer.promise();
	    });
	};

/***/ },
/* 63 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("share/moments.js", ["self"], function(self){
	        /**
	         * 调用插件，分享到微信朋友圈
	         */
			var link = self.data.shareMess.link || "";
			var defer = $.Deferred();
			Wechat.share({
				message: {
					title: self.data.shareMess.title, // 分享标题
					description: self.data.shareMess.desc, // 分享描述
					thumb: self.data.shareMess.imgUrl, // 分享图标
					media: {
						type: Wechat.Type.WEBPAGE,
						webpageUrl: link // 分享链接
					},
				},
				scene: Wechat.Scene.Moments
			}, function () {
				if(self.data.shareMess.success){
					self.data.shareMess.success(self);
				}
				if(self.isShowShareInfo){
					self.isShowShareInfo = false;
				}
				defer.resolve();
			}, function (reason) {
				// alert("Failed: " + reason);
				if(reason == "用户点击取消并返回"){
					// 用户取消分享后执行的回调函数
	                if(self.isShowShareInfo){
	                    self.isShowShareInfo = false;
	                }
				}
			});
			return defer.promise();
	    });
	};

/***/ },
/* 64 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("share/qq.js", ["self"], function(self){
	        /**
	         * 调用插件，分享到QQ好友
	         */
			var link = self.data.shareMess.link || "";
			var defer = $.Deferred();
			var args = {};
			args.client = QQSDK.ClientType.QQ;//QQSDK.ClientType.QQ,QQSDK.ClientType.TIM;
			args.scene = QQSDK.Scene.QQ;//QQSDK.Scene.QQZone,QQSDK.Scene.Favorite
			args.url = link; // 分享链接
			args.title = self.data.shareMess.title; // 分享标题
			args.description = self.data.shareMess.desc; // 分享描述
			args.image = self.data.shareMess.imgUrl; // 分享图标
			QQSDK.shareNews(
				function () {
					if(self.data.shareMess.success){
						self.data.shareMess.success(self);
					}
					if(self.isShowShareInfo){
						self.isShowShareInfo = false;
					}
					defer.resolve();
				}, function (failReason) {
					if(failReason == "用户点击取消并返回"){
						// 用户取消分享后执行的回调函数
						if(self.isShowShareInfo){
							self.isShowShareInfo = false;
						}
					}
				}, args
			);
			return defer.promise();
	    });
	};

/***/ },
/* 65 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("share/qzone.js", ["self"], function(self){
	        /**
	         * 调用插件，分享到QQ好友
	         */
			var link = self.data.shareMess.link || "";
			var defer = $.Deferred();
			var args = {};
			args.client = QQSDK.ClientType.QQ;//QQSDK.ClientType.QQ,QQSDK.ClientType.TIM;
			args.scene = QQSDK.Scene.QQZone;//QQSDK.Scene.QQZone,QQSDK.Scene.Favorite
			args.url = link; // 分享链接
			args.title = self.data.shareMess.title; // 分享标题
			args.description = self.data.shareMess.desc; // 分享描述
			args.image = self.data.shareMess.imgUrl; // 分享图标
			QQSDK.shareNews(
				function () {
					if(self.data.shareMess.success){
						self.data.shareMess.success(self);
					}
					if(self.isShowShareInfo){
						self.isShowShareInfo = false;
					}
					defer.resolve();
				}, function (failReason) {
					if(failReason == "用户点击取消并返回"){
						// 用户取消分享后执行的回调函数
						if(self.isShowShareInfo){
							self.isShowShareInfo = false;
						}
					}
				}, args
			);
			return defer.promise();
	    });
	};

/***/ },
/* 66 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("share/wechat.js", ["self"], function(self){
	        /**
	         * 调用插件，分享到微信好友
	         */
			var link = self.data.shareMess.link || "";
			var defer = $.Deferred();
			Wechat.share({
				message: {
					title: self.data.shareMess.title, // 分享标题
					description: self.data.shareMess.desc, // 分享描述
					thumb: self.data.shareMess.imgUrl, // 分享图标
					media: {
						type: Wechat.Type.WEBPAGE,
						webpageUrl: link // 分享链接
					},
				},
				scene: Wechat.Scene.SESSION
			}, function () {
				if(self.data.shareMess.success){
					self.data.shareMess.success(self);
				}
				if(self.isShowShareInfo){
					self.isShowShareInfo = false;
				}
				defer.resolve();
			}, function (reason) {
				// alert("Failed: " + reason);
				if(reason == "用户点击取消并返回"){
					// 用户取消分享后执行的回调函数
	                if(self.isShowShareInfo){
	                    self.isShowShareInfo = false;
	                }
				}
			});
			return defer.promise();
	    });
	};

/***/ },
/* 67 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("startprogress.js", ["self"], function(self){
	        /**
	         * 调用插件，扫描开始展示加载进度条，APP模式独有
	         */
			Gray.plugin.require("endprogress.js");
	        var defer = $.Deferred();
	        progressNotification.show(0);
			var rate = 0;
			// var iv = setInterval(function () {
			// 	if (rate < 10) {
			// 		progressNotification.update(0, rate*10);
			// 		rate = rate + 1;
			// 	} else {
			// 		clearInterval(iv);
			// 		var documentStatus = itou.setting.getData("__app_document_ready");
			// 		if(documentStatus.status == "ready"){
			// 			Gray.$plugin["endprogress.js"]();
			// 		}
			// 		defer.resolve();
			// 	}
			// }, 100);
			var rate = 0;
			if (device.platform == "iOS") {
				window.navigator.dialogsPlus.showProgress();
				var iv = setInterval(function () {
					if (rate < 10) {
						window.navigator.dialogsPlus.setProgress(rate * 10);
						rate = rate + 1;
					} else {
						clearInterval(iv);
						var documentStatus = itou.setting.getData("__app_document_ready");
						if(documentStatus.status == "ready"){
							Gray.$plugin["endprogress.js"]();
						}
						defer.resolve();
					}
				}, 100);
			} else {
				progressNotification.show(0);
				var iv = setInterval(function () {
					if (rate < 10) {
						progressNotification.update(0, rate * 10);
						rate = rate + 1;
					} else {
						clearInterval(iv);
						var documentStatus = itou.setting.getData("__app_document_ready");
						if(documentStatus.status == "ready"){
							Gray.$plugin["endprogress.js"]();
						}
						defer.resolve();
					}
				}, 100);
			}
	        return defer.promise();
	    });
	};

/***/ },
/* 68 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("backbutton.js", ["self"], function(self){
	        /**
	         * 调用插件，监听返回按钮，APP模式独有
	         */
			function onBackKeyDown(){//--返回按钮监听
				itou.page.back();
			}
	        var defer = $.Deferred();
	        document.addEventListener("backbutton", onBackKeyDown, false);
			defer.resolve();
	        return defer.promise();
	    });
	};

/***/ },
/* 69 */
/***/ function(module, exports) {

	module.exports = function(){
		Gray.plugin.define("camera/chooseimage.js", ["self"], function(self){
			/**
			 * 调用插件，拍照
			 */
			function callChoose(model, defer){//--唤起图片选择功能
				var params;
				if(model == "camera"){
					params = {};
				}else if(model == "media"){
					params = {sourceType:Camera.PictureSourceType.PHOTOLIBRARY};
				}
				navigator.camera.getPicture(
					function(imageData) {
						defer.resolve(imageData);
					},
					function(error) {
						defer.reject(error);
					},
					params
				);
			}
			var defer = $.Deferred();
			navigator.camera.choosePhotoSource(//--唤起图片选择选项
				function(data) {
					switch (data) {
						case "takePhoto":
							callChoose("camera", defer);
							break;
						case "photoAlbum":
							callChoose("media", defer);
							break;
						default:
							break;
					}
				}, function(error) {
					console.error(error);
				},
				{}
			);
			return defer.promise();
		});
	};

/***/ },
/* 70 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("camera/getpic.js",[], function(){
	        console.debug("camera/getpic.js：", "获取图片，未使用！");
	    });
	};

/***/ },
/* 71 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("camera/uploadImage.js", ["self"], function(self){
	        /**
	         * 调用微信插件，传图
	         */
	        var localId = self.localId;
	        var defer = $.Deferred();
	        var serverId = 0;
	        defer.resolve(serverId);
	        console.debug("camera/uploadImage.js:", "图片上传，仅测试用！");
	        return defer.promise()
	            .then(function(serverId){
	                return self.itou.get({
	                    url: "upload/WxImage",
	                    data: {
	                        id: serverId
	                    }
	                });
	            });
	    });
	};

/***/ },
/* 72 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("checknetwork.js", ["self"], function(self){
	        /**
	         * 调用插件，检查当前网络状态，APP模式独有
	         */
	        var defer = $.Deferred();
	        var networkState = navigator.connection.type;
	        var states = {};
	        states[Connection.UNKNOWN]  = 'Unknown connection';
	        states[Connection.ETHERNET] = 'Ethernet connection';
	        states[Connection.WIFI]     = 'WiFi connection';
	        states[Connection.CELL_2G]  = 'Cell 2G connection';
	        states[Connection.CELL_3G]  = 'Cell 3G connection';
	        states[Connection.CELL_4G]  = 'Cell 4G connection';
	        states[Connection.CELL]     = 'Cell generic connection';
	        states[Connection.NONE]     = 'No network connection';

	        // alert('Connection type: ' + states[networkState]);
	        if (networkState == Connection.NONE) {
	            // alert('无网络');
	            itou.msg.toast = "没有网络";
	        } else {
	            // alert('有网络');
	        }
			defer.resolve();
	        return defer.promise();
	    });
	};

/***/ },
/* 73 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("endprogress.js", ["self"], function(self){
	        /**
	         * 调用插件，结束并隐藏加载进度条，APP模式独有
	         */
	        var defer = $.Deferred();
	        progressNotification.finish(0, 100);
			defer.resolve();
	        return defer.promise();
	    });
	};

/***/ },
/* 74 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("exitapp.js", ["self"], function(self){
	        /**
	         * 调用插件，关闭APP，APP模式独有
	         */
	        var defer = $.Deferred();
			navigator.app.exitApp();
			defer.resolve();
	        return defer.promise();
	    });
	};

/***/ },
/* 75 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("getdevicetoken.js", ["self"], function(self){
	        /**
	         * 调用插件，获取设备token，APP模式独有
	         */
			
			var defer = $.Deferred();
			function getDeviceToken(){//--获取设备token
				var devicetoken = {};
				try {
					///todo:调用接口获取设备token
					devicetoken.err = 0;
					devicetoken.msg = "";
					MobclickAgent.getDeviceId(function(data) {
						devicetoken.token = data;
						defer.resolve(devicetoken);
					});
				} catch (error) {
					devicetoken.err = 1;
					devicetoken.msg = error.message;
					devicetoken.token = "";
					defer.resolve(devicetoken);
				}
			}
			getDeviceToken();
	        return defer.promise();
	    });
	};

/***/ },
/* 76 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("getlocation.js", ["self"], function(self){
	        /**
	         * 调用插件，获取当前位置
	         */
	        var defer = $.Deferred();
	        baidumap_location.getCurrentPosition(
	            function (result) {
	                //window.location.href='map.html?'+'longitude='+result.longitude+'&latitude='+result.longitude;
	                var location = {};
	                location["wgs84"] = result;
	                location["wgs84"].lat = location["wgs84"].latitude;
	                location["wgs84"].long = location["wgs84"].longitude;
	                defer.resolve(location);
	            }, function (error) {
	                console.error(error);
	            }
	        );
	        return defer.promise();
	    });
	};

/***/ },
/* 77 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("init.js", ["self", "flag"], function(self, flag){
	        /**
	         * APP设备初始化
	         */
	        
	        /**
	         * 功能完善：允许在一个页面内多次执行初始化函数
	         * 场景：源自“店铺自动绑定”需求，需要在所有页面调用微信功能，为不影响原有代码，增加允许多次调用功能
	         * 原理：微信初始化，分为初始化中（init_doing）、初始化完成（init_ready）、初始化失败（init_error）3个状态，
	         *      当状态为init_doing时，将promise对象存入队列数组，在初始化完成时，队列中的promise对象全部执行resolve
	         *      当状态为init_ready，直接返回promise对象并执行resolve
	         *      当状态为init_error，直接返回promise对象并执行reject
	         *      上述3种情况外为未开始初始化，执行初始化过程
	         * by zhaoyf    2017-02-14 16:57:59
	         */
	        var wxReady = itou.setting.getData("__wxReady"),//--微信初始化是否完成，init_doing || init_ready || init_error
	            initPromise = itou.setting.getData("__initPromise");//--微信初始化队列
	        if(!initPromise){
	            initPromise = [];
	        }
	        // alert("wxReady:" + wxReady)
	        if(wxReady == "init_doing"){
	            var defer = $.Deferred();
	            var pro = defer.promise();
	            initPromise.push(defer);
	            itou.setting.setData("__initPromise", initPromise);
	            return pro;
	        }else if(wxReady == "init_ready"){
	            var defer = $.Deferred();
	            defer.resolve();
	            return defer.promise();
	        }else if(wxReady == "init_error"){
	            var defer = $.Deferred();
	            defer.reject();
	            return defer.promise();
	        }
	        /**
	         * 功能完善结束（剩余部分在deviceready中执行）
	         */
	        itou.setting.setData("__wxReady", "init_doing"); 
	        function getPushData(){
	            window.setTimeout(function() {
	                MobclickAgent.getPushData(function (data) {
	                    if(!!data){
	                        Gray.$page.loadPage(data);
	                    }
	                });
	            }, 0);
	        }
	        document.addEventListener('deviceready', function(res){
	            // self.showDemo = true;
	            console.log("deviceready：", res);
	            itou.setting.setData("__wxReady", "init_ready");
	            getPushData();
	            document.addEventListener("resume", function(){
	                getPushData();
	            }, false);
	            /**
	             * 功能完善，使初始化函数可多次执行
	             */
	            var initPromise = itou.setting.getData("__initPromise") || [];
	            for(var i = 0, len = initPromise.length; i < len; i++){
	                initPromise[i].resolve();
	            }
	        }, false);
	        var defer = $.Deferred();
	        var pro = defer.promise();
	        initPromise.push(defer);
	        itou.setting.setData("__initPromise", initPromise);
	        return pro;
	    });
	};

/***/ },
/* 78 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("onmenushareappmessage.js", ["self"], function(self){
	        /**
	         * 调用微信插件，分享给微信好友
	         */
	        // alert("onmenushareappmessage");
	        Gray.plugin.require("share/wechat.js");
	        Gray.plugin.require("share/moments.js");
	        Gray.plugin.require("share/qq.js");
	        Gray.plugin.require("share/qzone.js");
	        function startBottomShare(){
	            window.navigator.dialogsPlus.bottomShare(//--展示底部分享条
	                function (type) {
	                    switch(type) {
	                        case "wechat":
	                            Gray.$plugin["share/wechat.js"]();
	                            break;
	                        case "moments":
	                            Gray.$plugin["share/moments.js"]();
	                            break;
	                        case "qq":
	                            Gray.$plugin["share/qq.js"]();
	                            break;
	                        case "qzone":
	                            Gray.$plugin["share/qzone.js"]();
	                            break;
	                    }
	                }, function (error) {
	                    console.error(error);
	                }
	            );
	        }
	        var defer = $.Deferred();
	        defer.resolve();
	        try{
	            vm.$watch('isShowShareInfo', function (newVal, oldVal) {
	              if(newVal){
	                vm.isShowShareInfo = false;
	                startBottomShare();
	              }
	            });
	            vm.$watch('layer_show', function (newVal, oldVal) {
	              if(newVal){
	                vm.isShowShareInfo = false;
	                startBottomShare();
	              }
	            });
	        }catch(e){
	            console.error(e.message);
	        }
	        return defer.promise();
	    });
	};

/***/ },
/* 79 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("onmenusharetimeline.js", ["self"], function(self){
	        /**
	         * 调用微信插件，分享给微信朋友圈
	         */
	        var defer = $.Deferred();
	        defer.resolve();
	        console.debug("onmenusharetimeline.js：", "调用微信插件，分享给微信朋友圈");
	        return defer.promise();
	    });
	};

/***/ },
/* 80 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("openlocation.js", ["self"], function(self){
	        /**
	         * 调用插件，查看地图
	         */
	        var defer = $.Deferred(),
	            data = {
	            lat: self.data.latitude,
	            long: self.data.longitude,
	            name: self.data.name,
	            address: self.data.address
	        };
	        defer.resolve();
	        baidumap_location.getLocate(data.lat, data.long);
	        return defer.promise();
	    });
	};

/***/ },
/* 81 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("previewImage.js", ["self"], function(self){
	        /**
	         * 调用微信插件，图片预览
	         */
	        var defer = $.Deferred();
	        defer.resolve();
	        alert("previewImage.js：\n调用插件，图片预览。\n暂时未有预览功能");
	        return defer.promise();
	    });
	};

/***/ },
/* 82 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("scanqrcode.js", ["self"], function(self){
	        /**
	         * 调用插件，扫描二维码
	         */
	        var defer = $.Deferred();
	        cordova.plugins.barcodeScanner.scan(
	            function (result) {
	                if(result.cancelled){//--取消
	                    defer.reject();
	                }else{//--获得结果
	                    var res = result.text;
	                    defer.resolve(res);
	                }
	            },
	            function (error) {
	               console.error(error);
	            },
	            {
	                preferFrontCamera : false, // iOS and Android
	                showFlipCameraButton : true, // iOS and Android
	                showTorchButton : true, // iOS and Android
	                torchOn: true, // Android, launch with the torch switched on (if available)
	                saveHistory: true, // Android, save scan history (default false)
	                prompt : "Place a barcode inside the scan area", // Android
	                resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
	                formats : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
	                orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
	                disableAnimations : true, // iOS
	                disableSuccessBeep: false // iOS and Android
	            }
	        );
	        return defer.promise();
	    });
	};

/***/ },
/* 83 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("scanqrcodeindex.js", ["self"], function(self){
	        /**
	         * 调用插件，扫描二维码
	         */
	        var defer = $.Deferred();
	        cordova.plugins.barcodeScanner.scan(
	            function (result) {
	                if(result.cancelled){//--取消
	                    defer.reject();
	                }else{//--获得结果
	                    var res = result.text;
	                    var Exp = /\/\d+$/g;//--正则，获取ID
	                    var id = res.match(Exp);
	                    id = id? id[0]: "0";
	                    id = id.replace(/\D/g, "");
	                    Gray.$page.loadPage("/user/shop/details/?id=" + id + "&scene=scan&station_id=" + id);
	                    defer.resolve();
	                }
	            },
	            function (error) {
	               console.error(error);
	            },
	            {
	                preferFrontCamera : false, // iOS and Android
	                showFlipCameraButton : true, // iOS and Android
	                showTorchButton : true, // iOS and Android
	                torchOn: true, // Android, launch with the torch switched on (if available)
	                saveHistory: true, // Android, save scan history (default false)
	                prompt : "Place a barcode inside the scan area", // Android
	                resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
	                formats : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
	                orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
	                disableAnimations : true, // iOS
	                disableSuccessBeep: false // iOS and Android
	            }
	        );
	        return defer.promise();
	    });
	};

/***/ },
/* 84 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("share/moments.js", ["self"], function(self){
	        /**
	         * 调用插件，分享到微信朋友圈
	         */
			var link = self.data.shareMess.link || "";
	        var back = itou.outil.getUrlParam(link, "back");
	        if(back){
	            link = link.replace("back=" + back, "").replace("back=" + encodeURIComponent(back), "");
	            link = link.replace("?&", "?").replace("&&", "&").replace(/&$/, "");
	        }
			var defer = $.Deferred();
			Wechat.share({
				message: {
					title: self.data.shareMess.title, // 分享标题
					description: self.data.shareMess.desc, // 分享描述
					thumb: self.data.shareMess.imgUrl, // 分享图标
					media: {
						type: Wechat.Type.WEBPAGE,
						webpageUrl: link // 分享链接
					},
				},
				scene: Wechat.Scene.Moments
			}, function () {
				if(self.data.shareMess.success){
					self.data.shareMess.success(self);
				}
				if(self.isShowShareInfo){
					self.isShowShareInfo = false;
				}
				defer.resolve();
			}, function (reason) {
				// alert("Failed: " + reason);
				if(reason == "用户点击取消并返回"){
					// 用户取消分享后执行的回调函数
	                if(self.isShowShareInfo){
	                    self.isShowShareInfo = false;
	                }
				}
			});
			return defer.promise();
	    });
	};

/***/ },
/* 85 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("share/qq.js", ["self"], function(self){
	        /**
	         * 调用插件，分享到QQ好友
	         */
			var link = self.data.shareMess.link || "";
	        var back = itou.outil.getUrlParam(link, "back");
	        if(back){
	            link = link.replace("back=" + back, "").replace("back=" + encodeURIComponent(back), "");
	            link = link.replace("?&", "?").replace("&&", "&").replace(/&$/, "");
	        }
			var defer = $.Deferred();
			var args = {};
			args.client = QQSDK.ClientType.QQ;//QQSDK.ClientType.QQ,QQSDK.ClientType.TIM;
			args.scene = QQSDK.Scene.QQ;//QQSDK.Scene.QQZone,QQSDK.Scene.Favorite
			args.url = link; // 分享链接
			args.title = self.data.shareMess.title; // 分享标题
			args.description = self.data.shareMess.desc; // 分享描述
			args.image = self.data.shareMess.imgUrl; // 分享图标
			QQSDK.shareNews(
				function () {
					if(self.data.shareMess.success){
						self.data.shareMess.success(self);
					}
					if(self.isShowShareInfo){
						self.isShowShareInfo = false;
					}
					defer.resolve();
				}, function (failReason) {
					if(failReason == "用户点击取消并返回"){
						// 用户取消分享后执行的回调函数
						if(self.isShowShareInfo){
							self.isShowShareInfo = false;
						}
					}
				}, args
			);
			return defer.promise();
	    });
	};

/***/ },
/* 86 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("share/qzone.js", ["self"], function(self){
	        /**
	         * 调用插件，分享到QQ好友
	         */
			var link = self.data.shareMess.link || "";
	        var back = itou.outil.getUrlParam(link, "back");
	        if(back){
	            link = link.replace("back=" + back, "").replace("back=" + encodeURIComponent(back), "");
	            link = link.replace("?&", "?").replace("&&", "&").replace(/&$/, "");
	        }
			var defer = $.Deferred();
			var args = {};
			args.client = QQSDK.ClientType.QQ;//QQSDK.ClientType.QQ,QQSDK.ClientType.TIM;
			args.scene = QQSDK.Scene.QQZone;//QQSDK.Scene.QQZone,QQSDK.Scene.Favorite
			args.url = link; // 分享链接
			args.title = self.data.shareMess.title; // 分享标题
			args.description = self.data.shareMess.desc; // 分享描述
			args.image = self.data.shareMess.imgUrl; // 分享图标
			QQSDK.shareNews(
				function () {
					if(self.data.shareMess.success){
						self.data.shareMess.success(self);
					}
					if(self.isShowShareInfo){
						self.isShowShareInfo = false;
					}
					defer.resolve();
				}, function (failReason) {
					if(failReason == "用户点击取消并返回"){
						// 用户取消分享后执行的回调函数
						if(self.isShowShareInfo){
							self.isShowShareInfo = false;
						}
					}
				}, args
			);
			return defer.promise();
	    });
	};

/***/ },
/* 87 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("share/wechat.js", ["self"], function(self){
	        /**
	         * 调用插件，分享到微信好友
	         */
			var link = self.data.shareMess.link || "";
	        var back = itou.outil.getUrlParam(link, "back");
	        if(back){
	            link = link.replace("back=" + back, "").replace("back=" + encodeURIComponent(back), "");
	            link = link.replace("?&", "?").replace("&&", "&").replace(/&$/, "");
	        }
			var defer = $.Deferred();
			Wechat.share({
				message: {
					title: self.data.shareMess.title, // 分享标题
					description: self.data.shareMess.desc, // 分享描述
					thumb: self.data.shareMess.imgUrl, // 分享图标
					media: {
						type: Wechat.Type.WEBPAGE,
						webpageUrl: link // 分享链接
					},
				},
				scene: Wechat.Scene.SESSION
			}, function () {
				if(self.data.shareMess.success){
					self.data.shareMess.success(self);
				}
				if(self.isShowShareInfo){
					self.isShowShareInfo = false;
				}
				defer.resolve();
			}, function (reason) {
				// alert("Failed: " + reason);
				if(reason == "用户点击取消并返回"){
					// 用户取消分享后执行的回调函数
	                if(self.isShowShareInfo){
	                    self.isShowShareInfo = false;
	                }
				}
			});
			return defer.promise();
	    });
	};

/***/ },
/* 88 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("startprogress.js", ["self"], function(self){
	        /**
	         * 调用插件，扫描开始展示加载进度条，APP模式独有
	         */
			Gray.plugin.require("endprogress.js");
	        var defer = $.Deferred();
	        progressNotification.show(0);
			var rate = 0;
			var iv = setInterval(function () {
				if (rate < 10) {
					progressNotification.update(0, rate*10);
					rate = rate + 1;
				} else {
					clearInterval(iv);
					var documentStatus = itou.setting.getData("__app_document_ready");
					if(documentStatus.status == "ready"){
						Gray.$plugin["endprogress.js"]();
					}
					defer.resolve();
				}
			}, 100);
	        return defer.promise();
	    });
	};

/***/ },
/* 89 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("camera/chooseimage.js", ["self"], function(self){
	        var defer = $.Deferred();
	        defer.resolve();
	        return defer.promise();
	    });
	};

/***/ },
/* 90 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("camera/getpic.js",[], function(){
	        var defer = $.Deferred();
	        defer.resolve();
	        return defer.promise();
	    });
	};

/***/ },
/* 91 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("camera/uploadImage.js", ["self"], function(self){
	        var defer = $.Deferred();
	        defer.resolve();
	        return defer.promise();
	    });
	};

/***/ },
/* 92 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("getlocation.js", ["self"], function(self){
	        var defer = $.Deferred();
	        defer.resolve();
	        return defer.promise();
	    });
	};

/***/ },
/* 93 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("init.js", ["self", "flag"], function(self, flag){
	        var defer = $.Deferred();
	        defer.resolve();
	        return defer.promise();
	    });
	};

/***/ },
/* 94 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("onmenushareappmessage.js", ["self"], function(self){
	        var defer = $.Deferred();
	        defer.resolve();
	        return defer.promise();
	    });
	};

/***/ },
/* 95 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("onmenusharetimeline.js", ["self"], function(self){
	        var defer = $.Deferred();
	        defer.resolve();
	        return defer.promise();
	    });
	};

/***/ },
/* 96 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("openlocation.js", ["self"], function(self){
	        var defer = $.Deferred();
	        defer.resolve();
	        return defer.promise();
	    });
	};

/***/ },
/* 97 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("previewImage.js", ["self"], function(self){
	        var defer = $.Deferred();
	        defer.resolve();
	        return defer.promise();
	    });
	};

/***/ },
/* 98 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("scanqrcode.js", ["self"], function(self){
	        var defer = $.Deferred();
	        defer.resolve();
	        return defer.promise();
	    });
	};

/***/ },
/* 99 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("scanqrcodeindex.js", ["self"], function(self){
	        var defer = $.Deferred();
	        defer.resolve();
	        return defer.promise();
	    });
	};

/***/ },
/* 100 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("startprogress.js", ["self"], function(self){
	        /**
	         * 调用插件，扫描开始展示加载进度条，APP模式独有
	         */
			Gray.plugin.require("endprogress.js");
	        var defer = $.Deferred();
	        progressNotification.show(0);
			var rate = 0;
			// var iv = setInterval(function () {
			// 	if (rate < 10) {
			// 		progressNotification.update(0, rate*10);
			// 		rate = rate + 1;
			// 	} else {
			// 		clearInterval(iv);
			// 		var documentStatus = itou.setting.getData("__app_document_ready");
			// 		if(documentStatus.status == "ready"){
			// 			Gray.$plugin["endprogress.js"]();
			// 		}
			// 		defer.resolve();
			// 	}
			// }, 100);
			var rate = 0;
			if (device.platform == "iOS") {
				window.navigator.dialogsPlus.showProgress();
				var iv = setInterval(function () {
					if (rate < 10) {
						window.navigator.dialogsPlus.setProgress(rate * 10);
						rate = rate + 1;
					} else {
						clearInterval(iv);
						var documentStatus = itou.setting.getData("__app_document_ready");
						if(documentStatus.status == "ready"){
							Gray.$plugin["endprogress.js"]();
						}
						defer.resolve();
					}
				}, 100);
			} else {
				progressNotification.show(0);
				var iv = setInterval(function () {
					if (rate < 10) {
						progressNotification.update(0, rate * 10);
						rate = rate + 1;
					} else {
						clearInterval(iv);
						var documentStatus = itou.setting.getData("__app_document_ready");
						if(documentStatus.status == "ready"){
							Gray.$plugin["endprogress.js"]();
						}
						defer.resolve();
					}
				}, 100);
			}
	        return defer.promise();
	    });
	};

/***/ },
/* 101 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("camera/chooseimage.js", ["self"], function(self){
	        /**
	         * 调用微信插件，拍照
	         */
	        var defer = $.Deferred();
	        self.wx.chooseImage({
	            count: 1, // 默认9
	            sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有['original', 'compressed']
	            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有['album', 'camera']
	            success: function (res) {//alert(JSON.stringify(res));
	                var localIds = res.localIds[0]; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
	                if(res.errMsg && res.errMsg.indexOf(":ok") > 0){
	                    self.localId = localIds;
	                    window.setTimeout(function() {
	                        defer.resolve(localIds);
	                    }, 100);
	                }else{
	                    window.setTimeout(function() {
	                        defer.reject(localIds);
	                        vm.showMsgBox('微信拍照接口错误');
	                    }, 100);
	                }
	            }
	        });
	        return defer.promise();
	    });
	};

/***/ },
/* 102 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("camera/getpic.js",[], function(){
	        alert("xxxxxxxxxxxxx");
	    });
	};

/***/ },
/* 103 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("camera/uploadImage.js", ["self"], function(self){
	        /**
	         * 调用微信插件，传图
	         */
	        var localId = self.localId;console.log(localId);
	        var defer = $.Deferred();
	        self.wx.uploadImage({
	            localId: localId, // 需要上传的图片的本地ID，由chooseImage接口获得
	            isShowProgressTips: 1,// 默认为1，显示进度提示
	            success: function (res) {
	                var serverId = res.serverId; // 返回图片的服务器端ID
	                if(res.errMsg && res.errMsg.indexOf(":ok") > 0){
	                    window.setTimeout(function() {
	                        defer.resolve(serverId);
	                    }, 100);
	                }else{
	                    window.setTimeout(function() {
	                        defer.reject(serverId);
	                        vm.showMsgBox('微信上传图片接口错误');
	                    }, 100);
	                }
	            }
	        });
	        return defer.promise()
	            .then(function(serverId){
	                return itou.get({
	                    url: "upload/WxImage",
	                    data: {
	                        id: serverId
	                    }
	                });
	            });
	    });
	};

/***/ },
/* 104 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("choosepay.js", ["self"], function(self){
	        /**
	         * 调用微信插件，支付
	         */
			var defer = $.Deferred();
			// console.log(self.data.timeStamp, self.data.nonceStr, self.data.package, self.data.signType, self.data.paySign);
	        // self.wx.chooseWXPay({
	        //     timestamp: self.data.timeStamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
			// 	nonceStr: self.data.nonceStr, // 支付签名随机串，不长于 32 位
			// 	package: self.data.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
			// 	signType: self.data.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
			// 	paySign: self.data.paySign, // 支付签名
	        //     success: function (res) {
	        //         defer.resolve(res);
	        //     }
			// });
			WeixinJSBridge.invoke(
				'getBrandWCPayRequest',
				{
					"appId": self.data.appId, //公众号名称，由商户传入
					"timeStamp": self.data.timeStamp, //时间戳，自1970 年以来的秒数
					"nonceStr": self.data.nonceStr, //随机串
					"package": self.data.package,
					"signType": self.data.signType, //微信签名方式:
					"paySign": self.data.paySign //微信签名
				},function(res){
					// if(res.err_msg == "get_brand_wcpay_request:ok" ) {}
					defer.resolve(res);
				}
			);
	        return defer.promise();
	    });
	};

/***/ },
/* 105 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("getlocation.js", ["self"], function(self){
	        /**
	         * 调用微信插件，获取当前位置
	         */
	        function getlocation(type){
	            var defer = $.Deferred();
	            self.wx.getLocation({
	                type: type, // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
	                success: function (res) {
	                    var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
	                    var longitude = res.longitude ; // 经度，浮点数，范围为180 ~ -180。
	                    // var speed = res.speed; // 速度，以米/每秒计
	                    // var accuracy = res.accuracy; // 位置精度
	                    defer.resolve({lat: latitude, long: longitude});
	                },
	                fail:function(res){
	                   defer.resolve('getlocation_fail');
	                },
	            });
	            return defer.promise();
	        }

	        var location = {};
	        return getlocation("wgs84")
	            .then(function(data){
	                location["wgs84"] = data;
	                return getlocation('gcj02');
	            })
	            .then(function(data){
	                location["gcj02"] = data;
	                return location;
	            })
	    });
	};

/***/ },
/* 106 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("init.js", ["self", "flag"], function(self, flag){
	        /**
	         * 微信初始化
	         * 先获取微信签名信息，然后进行初始化
	         * 在使用前需要提前注册依赖数据 self 和 flag
	         */

	        
	        /**
	         * 功能完善：允许在一个页面内多次执行初始化函数
	         * 场景：源自“店铺自动绑定”需求，需要在所有页面调用微信功能，为不影响原有代码，增加允许多次调用功能
	         * 原理：微信初始化，分为初始化中（init_doing）、初始化完成（init_ready）、初始化失败（init_error）3个状态，
	         *      当状态为init_doing时，将promise对象存入队列数组，在初始化完成时，队列中的promise对象全部执行resolve
	         *      当状态为init_ready，直接返回promise对象并执行resolve
	         *      当状态为init_error，直接返回promise对象并执行reject
	         *      上述3种情况外为未开始初始化，执行初始化过程
	         * by zhaoyf    2017-02-14 16:57:59
	         */
	        var wxReady = itou.setting.getData("__wxReady"),//--微信初始化是否完成，init_doing || init_ready || init_error
	            initPromise = itou.setting.getData("__initPromise");//--微信初始化队列
	        if(!initPromise){
	            initPromise = [];
	        }

	        if(wxReady == "init_doing"){
	            var defer = $.Deferred();
	            var pro = defer.promise();
	            initPromise.push(defer);
	            itou.setting.setData("__initPromise", initPromise);
	            return pro;
	        }else if(wxReady == "init_ready"){
	            var defer = $.Deferred();
	            defer.resolve();
	            return defer.promise();
	        }else if(wxReady == "init_error"){
	            var defer = $.Deferred();
	            defer.reject();
	            return defer.promise();
	        }
	        /**
	         * 功能完善结束（剩余部分在wx.ready中执行）
	         */

	        self.wxConfig = self.wxConfig || {};
	        self.wx = self.wx || window.wx;
	        itou.setting.setData("__wxReady", "init_doing");
	        return itou.get({//--获取微信签名信息
	            url: "config/getWXjsSDKSignature",
	            data: {
	                'flag': window.location.href
	            }
	        })
	        .then(function(data){//--微信签名信息
	            self.wxConfig.appid = data.appid;
	            self.wxConfig.timestamp = data.timestamp;
	            self.wxConfig.noncestr = data.noncestr;
	            self.wxConfig.signature = data.signature;
	            var defer = $.Deferred();
	            //微信WeixinJSBridgeReady报错修改
	            // function wx_resolve(){
	            //      defer.resolve();
	            // }
	            // document.addEventListener('WeixinJSBridgeReady', wx_resolve, false);
	           
	            //微信WeixinJSBridgeReady修改结束
	            defer.resolve();
	            return defer.promise();
	        })
	        .then(function(){//--微信对象初始化
	            var defer = $.Deferred();
	            self.wxReady = true;
	            self.wx.config({
	                debug: false,
	                appId: self.wxConfig.appid, // 必填，企业号的唯一标识，此处填写企业号corpid
	                timestamp: self.wxConfig.timestamp, // 必填，生成签名的时间戳
	                nonceStr: self.wxConfig.noncestr, // 必填，生成签名的随机串
	                signature: self.wxConfig.signature,// 必填，签名，见附录1
	                jsApiList: [
	                    "chooseImage",//--图片选择
	                    "previewImage",//--图片预览
	                    "uploadImage",//--图片上传
	                    "downloadImage",
	                    "getLocation",//--取地理位置
	                    "openLocation",
	                    "onMenuShareAppMessage",//--分享给微信好友
	                    "onMenuShareTimeline",//--分享给微信好友
	                    "onMenuShareQQ",//--分享给QQ好友
	                    "onMenuShareQZone",//--分享给QQ空间
	                    "scanQRCode",//--扫描二维码
	                    "chooseWXPay"//--微信支付
	                ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
	                // jsApiList: [
	                //     "onMenuShareTimeline",
	                //     "onMenuShareAppMessage",
	                //     "onMenuShareQQ",
	                //     "onMenuShareWeibo",
	                //     "onMenuShareQZone",
	                //     "startRecord",
	                //     "stopRecord",
	                //     "onVoiceRecordEnd",
	                //     "playVoice",
	                //     "pauseVoice",
	                //     "stopVoice",
	                //     "onVoicePlayEnd",
	                //     "uploadVoice",
	                //     "downloadVoice",
	                //     "chooseImage",
	                //     "previewImage",
	                //     "uploadImage",
	                //     "downloadImage",
	                //     "translateVoice",
	                //     "getNetworkType",
	                //     "openLocation",
	                //     "getLocation",
	                //     "hideOptionMenu",
	                //     "showOptionMenu",
	                //     "hideMenuItems",
	                //     "showMenuItems",
	                //     "hideAllNonBaseMenuItem",
	                //     "showAllNonBaseMenuItem",
	                //     "closeWindow",
	                //     "scanQRCode"
	                // ]
	            });
	            
	            self.wx.error(function(res){
	                console.log('err:',res);
	                self.wxReady = false;
	                itou.setting.setData("__wxReady", "init_error");
	                // alert(JSON.stringify(res));
	            });
	            self.wx.ready(function(res){
	                // self.showDemo = true;
	                console.log(res);
	                if(self.wxReady){
	                    itou.setting.setData("__wxReady", "init_ready");
	                    
	                    defer.resolve();
	                    /**
	                     * 功能完善，使微信初始化函数可多次执行
	                     */
	                    var initPromise = itou.setting.getData("__initPromise") || [];
	                    for(var i = 0, len = initPromise.length; i < len; i++){
	                        initPromise[i].resolve();
	                    }
	                }
	            });
	            return defer.promise();
	        });
	    });
	};

/***/ },
/* 107 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("onmenushareappmessage.js", ["self"], function(self){
	        /**
	         * 调用微信插件，分享给微信好友
	         * 发送给朋友: "menuItem:share:appMessage"
	         * 分享到朋友圈: "menuItem:share:timeline"
	         * 分享到QQ: "menuItem:share:qq"
	         * 分享到 QQ 空间："menuItem:share:QZone"
	         */
	        var link = self.data.shareMess.link || "";
	        var back = itou.outil.getUrlParam(link, "back");
	        if(back){
	            link = link.replace("back=" + back, "").replace("back=" + encodeURIComponent(back), "");
	            link = link.replace("?&", "?").replace("&&", "&").replace(/&$/, "");
			}
			var p_station_id = itou.outil.getUrlParam(link, "p_station_id");
			if(p_station_id){
				link += (link.has("?")? "&": "?") + "back=" + encodeURIComponent("/user/shop/details/?id=" + p_station_id);
	        }
	        self.data.shareMess.link = link;
	        var href = Gray.$page.href + "",
	            setting = {
	                "/activity/receivebonus/share/": {
	                    "content": "share content",
	                    "showWeChat": true,
	                    "showMoments": true,
	                    "showQQ": false,
	                    "showQzone": false
	                },
	                default: {
	                    "content": "share content",
	                    "showWeChat": true,
	                    "showMoments": true,
	                    "showQQ": true,
	                    "showQzone": true
	                }
	            },
	            menuItem = {//--微信按钮
	                "showWeChat": "menuItem:share:appMessage",
	                "showMoments": "menuItem:share:timeline",
	                "showQQ": "menuItem:share:qq",
	                "showQzone": "menuItem:share:QZone"
	            };
	        href = href.split("?")[0];
	        var opts = setting[href] || setting.default,
	            hideList = [];
	        for(var i in opts){
	            if(opts[i] == false){
	                hideList.push(menuItem[i]);
	            }
	        }
	        if(hideList.length > 0){
	            self.wx.hideMenuItems({//--隐藏被禁止的分享按钮
	                menuList: hideList // 要隐藏的菜单项，只能隐藏“传播类”和“保护类”按钮，所有menu项见附录3
	            });
	        }
	        Gray.plugin.require("share/wechat.js");
	        Gray.plugin.require("share/moments.js");
	        Gray.plugin.require("share/qq.js");
	        Gray.plugin.require("share/qzone.js");
	        Gray.$plugin["share/wechat.js"]();
	        Gray.$plugin["share/moments.js"]();
	        Gray.$plugin["share/qq.js"]();
	        Gray.$plugin["share/qzone.js"]();
	        var defer = $.Deferred();
			defer.resolve();
			return defer.promise();
	    });
	};

/***/ },
/* 108 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("onmenusharetimeline.js", ["self"], function(self){
	        /**
	         * 调用微信插件，分享给微信朋友圈
	         */
	        var defer = $.Deferred();
			defer.resolve();
			return defer.promise();
	    });
	};

/***/ },
/* 109 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("openlocation.js", ["self"], function(self){
	        /**
	         * 调用微信插件，查看地图
	         */
	        function openlocation(data){
	            var defer = $.Deferred();
	            self.wx.openLocation({
	                latitude: new Number(data.lat).toFixed(5), // 纬度，浮点数，范围为90 ~ -90
	                longitude: new Number(data.long).toFixed(5), // 经度，浮点数，范围为180 ~ -180。
	                name: data.name, // 位置名
	                address: data.address, // 地址详情说明
	                scale: 20, // 地图缩放级别,整形值,范围从1~28。默认为最大
	                infoUrl: '' // 在查看位置界面底部显示的超链接,可点击跳转
	            });
	            defer.resolve();
	            return defer.promise();
	        }

	        var data = {
	            lat: self.data.latitude,
	            long: self.data.longitude,
	            name: self.data.name,
	            address: self.data.address
	        };
	        return openlocation(data);
	    });
	};

/***/ },
/* 110 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("previewImage.js", ["self"], function(self){
	        /**
	         * 调用微信插件，图片预览
	         */
	        var defer = $.Deferred();
	        self.wx.previewImage({
	            current: self.previewImage.current, // 当前显示图片的http链接
	            urls: self.previewImage.urls // 需要预览的图片http链接列表
	        });
	        return defer.promise();
	    });
	};

/***/ },
/* 111 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("scanqrcode.js", ["self"], function(self){
	        /**
	         * 调用微信插件，扫描二维码
	         */
	        var defer = $.Deferred();
	        self.wx.scanQRCode({
	            desc: 'scanQRCode desc',
	            needResult: 0, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
	            scanType: ["qrCode","barCode"], // 可以指定扫二维码还是一维码，默认二者都有
	            success: function (res) {
	                var result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
	                defer.resolve();
	            }
	        });
	        return defer.promise();
	    });
	};

/***/ },
/* 112 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("scanqrcodeindex.js", ["self"], function(self){
	        /**
	         * 调用微信插件，扫描二维码
	         */
	        var defer = $.Deferred();
	        self.wx.scanQRCode({
	            desc: 'scanQRCode desc',
	            needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
	            scanType: ["qrCode","barCode"], // 可以指定扫二维码还是一维码，默认二者都有
	            success: function (res) {
	                var result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
	                var Exp = /\/\d+$/g;//--正则，获取ID
	                var id = result.match(Exp);
	                id = id? id[0]: "0";
	                id = id.replace(/\D/g, "");
	                if(!(id > 0)){
	                    Gray.$page.loadPage("/errors/scan/");
	                }else{
	                    Gray.$page.loadPage("/user/shop/details/?id=" + id + "&scene=scan&station_id=" + id);
	                }
	                defer.resolve();
	            }
	        });
	        return defer.promise();
	    });
	};

/***/ },
/* 113 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("share/moments.js", ["self"], function(self){
	        /**
	         * 调用插件，分享到微信朋友圈
	         */
			var link = self.data.shareMess.link || "";
	        var back = itou.outil.getUrlParam(link, "back");
	        // if(back){
	        //     link = link.replace("back=" + back, "").replace("back=" + encodeURIComponent(back), "");
	        //     link = link.replace("?&", "?").replace("&&", "&").replace(/&$/, "");
	        // }
	        var defer = $.Deferred();
	        self.wx.onMenuShareTimeline({
	            title: self.data.shareMess.title, // 分享标题
	            link: link, // 分享链接
	            imgUrl: self.data.shareMess.imgUrl, // 分享图标
	            success: function () {
	                // 用户确认分享后执行的回调函数
	                if(typeof self.data.shareMess.success == 'function'){
	                    self.data.shareMess.success(self);
	                }
	                
	                if(self.isShowShareInfo){
	                    self.isShowShareInfo = false;
	                }
	                defer.resolve();
	            },
	            cancel: function () {
	                // 用户取消分享后执行的回调函数
	                if(self.isShowShareInfo){
	                    self.isShowShareInfo = false;
	                }
	            }
	        });
	        return defer.promise();
	    });
	};

/***/ },
/* 114 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("share/qq.js", ["self"], function(self){
	        /**
	         * 调用插件，分享到QQ好友 
	         */
			var link = self.data.shareMess.link || "";
	        var back = itou.outil.getUrlParam(link, "back");
	        // if(back){
	        //     link = link.replace("back=" + back, "").replace("back=" + encodeURIComponent(back), "");
	        //     link = link.replace("?&", "?").replace("&&", "&").replace(/&$/, "");
	        // }
	        var defer = $.Deferred();
	        self.wx.onMenuShareQQ({
	            title: self.data.shareMess.title, // 分享标题
	            desc: self.data.shareMess.desc, // 分享描述
	            link: link, // 分享链接
	            imgUrl: self.data.shareMess.imgUrl, // 分享图标
	            success: function () {
	                // 用户确认分享后执行的回调函数
	                if(self.data.shareMess.success){
	                    self.data.shareMess.success(self);
	                }
	                if(self.isShowShareInfo){
	                    self.isShowShareInfo = false;
	                }
	                defer.resolve();
	            },
	            cancel: function () {
	                // 用户取消分享后执行的回调函数
	                if(self.isShowShareInfo){
	                    self.isShowShareInfo = false;
	                }
	            }
	        });
	        return defer.promise();
	    });
	};

/***/ },
/* 115 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("share/qzone.js", ["self"], function(self){
	        /**
	         * 调用插件，分享到QQ好友
	         */
			var link = self.data.shareMess.link || "";
	        var back = itou.outil.getUrlParam(link, "back");
	        // if(back){
	        //     link = link.replace("back=" + back, "").replace("back=" + encodeURIComponent(back), "");
	        //     link = link.replace("?&", "?").replace("&&", "&").replace(/&$/, "");
	        // }
	        var defer = $.Deferred();
	        self.wx.onMenuShareQZone({
	            title: self.data.shareMess.title, // 分享标题
	            link: link, // 分享链接
	            imgUrl: self.data.shareMess.imgUrl, // 分享图标
	            success: function () {
	                // 用户确认分享后执行的回调函数
	                if(typeof self.data.shareMess.success == 'function'){
	                    self.data.shareMess.success(self);
	                }
	                
	                if(self.isShowShareInfo){
	                    self.isShowShareInfo = false;
	                }
	                defer.resolve();
	            },
	            cancel: function () {
	                // 用户取消分享后执行的回调函数
	                if(self.isShowShareInfo){
	                    self.isShowShareInfo = false;
	                }
	            }
	        });
	        return defer.promise();
	    });
	};

/***/ },
/* 116 */
/***/ function(module, exports) {

	module.exports = function(){
	    Gray.plugin.define("share/wechat.js", ["self"], function(self){
	        /**
	         * 调用微信插件，分享给微信好友
	         */
	        var link = self.data.shareMess.link || "";
	        var back = itou.outil.getUrlParam(link, "back");
	        // if(back){
	        //     link = link.replace("back=" + back, "").replace("back=" + encodeURIComponent(back), "");
	        //     link = link.replace("?&", "?").replace("&&", "&").replace(/&$/, "");
	        // }
	        var defer = $.Deferred();
	        self.wx.onMenuShareAppMessage({
	            title: self.data.shareMess.title, // 分享标题
	            desc: self.data.shareMess.desc, // 分享描述
	            link: link, // 分享链接
	            imgUrl: self.data.shareMess.imgUrl, // 分享图标
	            type: 'link', // 分享类型,music、video或link，不填默认为link
	            dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
	            success: function () {
	                // 用户确认分享后执行的回调函数
	                if(self.data.shareMess.success){
	                    self.data.shareMess.success(self);
	                }
	                if(self.isShowShareInfo){
	                    self.isShowShareInfo = false;
	                }
	                defer.resolve();
	            },
	            cancel: function () {
	                // 用户取消分享后执行的回调函数
	                if(self.isShowShareInfo){
	                    self.isShowShareInfo = false;
	                }
	            }
	        });
	        return defer.promise();
	    });
	};

/***/ },
/* 117 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./gulp/gulp": 118,
		"./gulp/gulp.js": 118,
		"./plugin/ali/camera/chooseimage": 3,
		"./plugin/ali/camera/chooseimage.js": 3,
		"./plugin/ali/camera/getpic": 4,
		"./plugin/ali/camera/getpic.js": 4,
		"./plugin/ali/camera/uploadImage": 5,
		"./plugin/ali/camera/uploadImage.js": 5,
		"./plugin/ali/choosepay": 6,
		"./plugin/ali/choosepay.js": 6,
		"./plugin/ali/getlocation": 7,
		"./plugin/ali/getlocation.js": 7,
		"./plugin/ali/init": 8,
		"./plugin/ali/init.js": 8,
		"./plugin/ali/onmenushareappmessage": 9,
		"./plugin/ali/onmenushareappmessage.js": 9,
		"./plugin/ali/onmenusharetimeline": 10,
		"./plugin/ali/onmenusharetimeline.js": 10,
		"./plugin/ali/openlocation": 11,
		"./plugin/ali/openlocation.js": 11,
		"./plugin/ali/previewImage": 12,
		"./plugin/ali/previewImage.js": 12,
		"./plugin/ali/scanqrcode": 13,
		"./plugin/ali/scanqrcode.js": 13,
		"./plugin/ali/scanqrcodeindex": 14,
		"./plugin/ali/scanqrcodeindex.js": 14,
		"./plugin/ali/share/moments": 15,
		"./plugin/ali/share/moments.js": 15,
		"./plugin/ali/share/qq": 16,
		"./plugin/ali/share/qq.js": 16,
		"./plugin/ali/share/qzone": 17,
		"./plugin/ali/share/qzone.js": 17,
		"./plugin/ali/share/wechat": 18,
		"./plugin/ali/share/wechat.js": 18,
		"./plugin/android/backbutton": 19,
		"./plugin/android/backbutton.js": 19,
		"./plugin/android/camera/chooseimage": 20,
		"./plugin/android/camera/chooseimage.js": 20,
		"./plugin/android/camera/getpic": 21,
		"./plugin/android/camera/getpic.js": 21,
		"./plugin/android/camera/uploadImage": 22,
		"./plugin/android/camera/uploadImage.js": 22,
		"./plugin/android/checknetwork": 23,
		"./plugin/android/checknetwork.js": 23,
		"./plugin/android/endprogress": 24,
		"./plugin/android/endprogress.js": 24,
		"./plugin/android/exitapp": 25,
		"./plugin/android/exitapp.js": 25,
		"./plugin/android/getdevicetoken": 26,
		"./plugin/android/getdevicetoken.js": 26,
		"./plugin/android/getlocation": 27,
		"./plugin/android/getlocation.js": 27,
		"./plugin/android/init": 28,
		"./plugin/android/init.js": 28,
		"./plugin/android/onmenushareappmessage": 29,
		"./plugin/android/onmenushareappmessage.js": 29,
		"./plugin/android/onmenusharetimeline": 30,
		"./plugin/android/onmenusharetimeline.js": 30,
		"./plugin/android/openlocation": 31,
		"./plugin/android/openlocation.js": 31,
		"./plugin/android/previewImage": 32,
		"./plugin/android/previewImage.js": 32,
		"./plugin/android/scanqrcode": 33,
		"./plugin/android/scanqrcode.js": 33,
		"./plugin/android/scanqrcodeindex": 34,
		"./plugin/android/scanqrcodeindex.js": 34,
		"./plugin/android/share/moments": 35,
		"./plugin/android/share/moments.js": 35,
		"./plugin/android/share/qq": 36,
		"./plugin/android/share/qq.js": 36,
		"./plugin/android/share/qzone": 37,
		"./plugin/android/share/qzone.js": 37,
		"./plugin/android/share/wechat": 38,
		"./plugin/android/share/wechat.js": 38,
		"./plugin/android/startprogress": 39,
		"./plugin/android/startprogress.js": 39,
		"./plugin/app/backbutton": 40,
		"./plugin/app/backbutton.js": 40,
		"./plugin/app/camera/chooseimage": 41,
		"./plugin/app/camera/chooseimage.js": 41,
		"./plugin/app/camera/downloadImage": 42,
		"./plugin/app/camera/downloadImage.js": 42,
		"./plugin/app/camera/getpic": 43,
		"./plugin/app/camera/getpic.js": 43,
		"./plugin/app/camera/uploadImage": 44,
		"./plugin/app/camera/uploadImage.js": 44,
		"./plugin/app/chcp-checkupdate": 45,
		"./plugin/app/chcp-checkupdate.1": 46,
		"./plugin/app/chcp-checkupdate.1.js": 46,
		"./plugin/app/chcp-checkupdate.js": 45,
		"./plugin/app/checknetwork": 47,
		"./plugin/app/checknetwork.js": 47,
		"./plugin/app/checkupdate": 48,
		"./plugin/app/checkupdate.js": 48,
		"./plugin/app/clipboard/check-entrance": 49,
		"./plugin/app/clipboard/check-entrance.js": 49,
		"./plugin/app/endprogress": 50,
		"./plugin/app/endprogress.js": 50,
		"./plugin/app/exitapp": 51,
		"./plugin/app/exitapp.js": 51,
		"./plugin/app/getdevicetoken": 52,
		"./plugin/app/getdevicetoken.js": 52,
		"./plugin/app/getlocation": 53,
		"./plugin/app/getlocation.js": 53,
		"./plugin/app/getversioninfo": 54,
		"./plugin/app/getversioninfo.js": 54,
		"./plugin/app/init": 55,
		"./plugin/app/init.js": 55,
		"./plugin/app/onmenushareappmessage": 56,
		"./plugin/app/onmenushareappmessage.js": 56,
		"./plugin/app/onmenusharetimeline": 57,
		"./plugin/app/onmenusharetimeline.js": 57,
		"./plugin/app/openlocation": 58,
		"./plugin/app/openlocation.js": 58,
		"./plugin/app/openschemeurl": 59,
		"./plugin/app/openschemeurl.js": 59,
		"./plugin/app/previewImage": 60,
		"./plugin/app/previewImage.js": 60,
		"./plugin/app/scanqrcode": 61,
		"./plugin/app/scanqrcode.js": 61,
		"./plugin/app/scanqrcodeindex": 62,
		"./plugin/app/scanqrcodeindex.js": 62,
		"./plugin/app/share/moments": 63,
		"./plugin/app/share/moments.js": 63,
		"./plugin/app/share/qq": 64,
		"./plugin/app/share/qq.js": 64,
		"./plugin/app/share/qzone": 65,
		"./plugin/app/share/qzone.js": 65,
		"./plugin/app/share/wechat": 66,
		"./plugin/app/share/wechat.js": 66,
		"./plugin/app/startprogress": 67,
		"./plugin/app/startprogress.js": 67,
		"./plugin/ios/backbutton": 68,
		"./plugin/ios/backbutton.js": 68,
		"./plugin/ios/camera/chooseimage": 69,
		"./plugin/ios/camera/chooseimage.js": 69,
		"./plugin/ios/camera/getpic": 70,
		"./plugin/ios/camera/getpic.js": 70,
		"./plugin/ios/camera/uploadImage": 71,
		"./plugin/ios/camera/uploadImage.js": 71,
		"./plugin/ios/checknetwork": 72,
		"./plugin/ios/checknetwork.js": 72,
		"./plugin/ios/endprogress": 73,
		"./plugin/ios/endprogress.js": 73,
		"./plugin/ios/exitapp": 74,
		"./plugin/ios/exitapp.js": 74,
		"./plugin/ios/getdevicetoken": 75,
		"./plugin/ios/getdevicetoken.js": 75,
		"./plugin/ios/getlocation": 76,
		"./plugin/ios/getlocation.js": 76,
		"./plugin/ios/init": 77,
		"./plugin/ios/init.js": 77,
		"./plugin/ios/onmenushareappmessage": 78,
		"./plugin/ios/onmenushareappmessage.js": 78,
		"./plugin/ios/onmenusharetimeline": 79,
		"./plugin/ios/onmenusharetimeline.js": 79,
		"./plugin/ios/openlocation": 80,
		"./plugin/ios/openlocation.js": 80,
		"./plugin/ios/previewImage": 81,
		"./plugin/ios/previewImage.js": 81,
		"./plugin/ios/scanqrcode": 82,
		"./plugin/ios/scanqrcode.js": 82,
		"./plugin/ios/scanqrcodeindex": 83,
		"./plugin/ios/scanqrcodeindex.js": 83,
		"./plugin/ios/share/moments": 84,
		"./plugin/ios/share/moments.js": 84,
		"./plugin/ios/share/qq": 85,
		"./plugin/ios/share/qq.js": 85,
		"./plugin/ios/share/qzone": 86,
		"./plugin/ios/share/qzone.js": 86,
		"./plugin/ios/share/wechat": 87,
		"./plugin/ios/share/wechat.js": 87,
		"./plugin/ios/startprogress": 88,
		"./plugin/ios/startprogress.js": 88,
		"./plugin/mobile/camera/chooseimage": 89,
		"./plugin/mobile/camera/chooseimage.js": 89,
		"./plugin/mobile/camera/getpic": 90,
		"./plugin/mobile/camera/getpic.js": 90,
		"./plugin/mobile/camera/uploadImage": 91,
		"./plugin/mobile/camera/uploadImage.js": 91,
		"./plugin/mobile/getlocation": 92,
		"./plugin/mobile/getlocation.js": 92,
		"./plugin/mobile/init": 93,
		"./plugin/mobile/init.js": 93,
		"./plugin/mobile/onmenushareappmessage": 94,
		"./plugin/mobile/onmenushareappmessage.js": 94,
		"./plugin/mobile/onmenusharetimeline": 95,
		"./plugin/mobile/onmenusharetimeline.js": 95,
		"./plugin/mobile/openlocation": 96,
		"./plugin/mobile/openlocation.js": 96,
		"./plugin/mobile/previewImage": 97,
		"./plugin/mobile/previewImage.js": 97,
		"./plugin/mobile/scanqrcode": 98,
		"./plugin/mobile/scanqrcode.js": 98,
		"./plugin/mobile/scanqrcodeindex": 99,
		"./plugin/mobile/scanqrcodeindex.js": 99,
		"./plugin/wx/app/startprogress": 100,
		"./plugin/wx/app/startprogress.js": 100,
		"./plugin/wx/camera/chooseimage": 101,
		"./plugin/wx/camera/chooseimage.js": 101,
		"./plugin/wx/camera/getpic": 102,
		"./plugin/wx/camera/getpic.js": 102,
		"./plugin/wx/camera/uploadImage": 103,
		"./plugin/wx/camera/uploadImage.js": 103,
		"./plugin/wx/choosepay": 104,
		"./plugin/wx/choosepay.js": 104,
		"./plugin/wx/getlocation": 105,
		"./plugin/wx/getlocation.js": 105,
		"./plugin/wx/init": 106,
		"./plugin/wx/init.js": 106,
		"./plugin/wx/onmenushareappmessage": 107,
		"./plugin/wx/onmenushareappmessage.js": 107,
		"./plugin/wx/onmenusharetimeline": 108,
		"./plugin/wx/onmenusharetimeline.js": 108,
		"./plugin/wx/openlocation": 109,
		"./plugin/wx/openlocation.js": 109,
		"./plugin/wx/previewImage": 110,
		"./plugin/wx/previewImage.js": 110,
		"./plugin/wx/scanqrcode": 111,
		"./plugin/wx/scanqrcode.js": 111,
		"./plugin/wx/scanqrcodeindex": 112,
		"./plugin/wx/scanqrcodeindex.js": 112,
		"./plugin/wx/share/moments": 113,
		"./plugin/wx/share/moments.js": 113,
		"./plugin/wx/share/qq": 114,
		"./plugin/wx/share/qq.js": 114,
		"./plugin/wx/share/qzone": 115,
		"./plugin/wx/share/qzone.js": 115,
		"./plugin/wx/share/wechat": 116,
		"./plugin/wx/share/wechat.js": 116
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 117;


/***/ },
/* 118 */
/***/ function(module, exports) {

	

/***/ }
/******/ ]);