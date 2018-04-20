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
	 * 基础配置信息，用来设置一些基本不变的固定配置
	 * by zhaoyf	2017-02-14 10:46:31
	 * 依赖：window.itou对象，必须在service.js之后加载
	 */
	(function(window){
		var itou = window.itou;

		//--可选省份设置信息
		itou.setting.setData("province", ["安徽", "北京", "重庆", "福建", "甘肃", "广东", "广西", "贵州", "海南", "河北", "河南", "黑龙江", "湖北", "湖南", "江苏", "江西", "吉林", "辽宁", "内蒙古", "宁夏", "青海", "上海", "山东", "山西", "陕西", "四川", "天津", "新疆", "西藏", "云南", "浙江"]);

		/**
		 * 彩票排列顺序
		 * 应用场景：店铺主页可选彩票列表等
		 * 包含数据处理函数，接收参数：数组，元素形式{name: "GDSYY", name_cn: "广东11选5", check: 1}
		 * 返回值：order，彩种排序（处理后）；lottery，彩种键值对应的设置{GDSYY: {name: "GDSYY", name_cn: "广东11选5", check: 1}, ……}
		 */
		(function(){
			var order = [//--排序模板，“SYY”代表对应的地方彩种
				"jczq", //--竞彩足球
				"jclq", //--竞彩篮球
				"ToTo", //--14场
				"NineToTo", //--任选9
				"SSQ", //--双色球
				"SuperLotto", //--超级大乐透
				"3D", //--3D
				"P3", //--排列3
				"P7", //--七星彩
				"P5", //--排列5
				"7LC", //--七乐彩
				"dc", //--北京单场
				"SYY", //--11选5
				"X3D" //--新3D
			];
			itou.setting.setData("lottery_order", {
				order: order,
				format: function(allowed_lottery_style){
					var lottery = {},
						order = itou.setting.getData("lottery_order").order.slice(0);
					for(var i = 0, len = allowed_lottery_style.length; i < len; i++){
						var opt = allowed_lottery_style[i],
							key = opt.name;
						opt.index = 0;
						if(key.has("SYY")){
							lottery["SYY"] = opt;
						} else {
							lottery[key] = opt;
						}
					}
					var arr = [];
					order.forEach(function(element) {//--循环排列顺序，获取允许的采种的显示循序
						var opt = lottery[element];
						if(opt && opt.check){
							arr.push(element);
							opt.index = arr.length;
						}
					}, this);
					return {
						order: order,
						lottery: lottery
					};
				}
			});
		})();
		/**
		 * 彩票排列顺序——end
		 */

	})(window);

/***/ }
/******/ ]);