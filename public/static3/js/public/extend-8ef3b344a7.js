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
	 * js对象扩展
	 * 对原生js对象进行扩展，增加一些方便的方法；
	 * by zhaoyf    2016-08-13
	 */
	(function(){

		/**
		 * 扩展String对象，增加left 和 right方法；
		 */
		String.prototype.left = function(len){
			if(len>0){
				return this.substring(0,len);
			}else{
				return null;
			}
		};
		String.prototype.right = function(len){
			if (this.length >= len && this.length>=0 && this.length - len <= this.length){
				return this.substring(this.length-len, this.length);
			}else{
				return null;
			}
		};
		//--是否包含子字符串
		String.prototype.has = function(str){
			return (this.indexOf(str) >= 0);
		};

		//--字符串长度，汉字算2字节
		String.prototype.length2 = function(){
			var str = this;
			return str.replace(/[^\x00-\xff]/g,"01").length;
		};

		/**
		 * 格式化时间字符串，返回时间对象
		 */
		String.prototype.toDate = function(){
			var self = this,
				arr = self.split(/[- :]/g),
				len = arr.length;
			for(var i = 0, len = 6; i < len; i++){
				if(!arr[i]){arr[i] = 0}
			}
			var D = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]);
			return D;
		};

		/**
		 * 格式化时间字符串，返回想要的格式
		 * @formatModel: 想要的格式模板
		 */
		String.prototype.Dateformat = function(formatModel){
			var self = this;
			var D = self.toDate();
			if(D instanceof Date){
				return D.Dateformat(formatModel);
			}else{
				return self;
			}
		};


		/**
		 * 返回已添加指定时间间隔的日期对象。
		 * dateObj.dateAdd(interval, number)
		 * 参数
		 * dateObj必选项。任意 Date 对象。
		 * interval必选项。字符串表达式，表示要添加的时间间隔。有关数值，请参阅“设置”部分。
		 * number必选项。数值表达式，表示要添加的时间间隔的个数。数值表达式可以是正数（得到未来的日期）或负数（得到过去的日期）。
		 * interval 参数可以有以下值：
		 * y	年
		 * q	季度
		 * m	月
		 * d	日
		 * w	周
		 * h	小时
		 * n	分钟
		 * s	秒
		 * ms	毫秒
		 */
		Date.prototype.DateAdd = function(strInterval, Number) {
			var dtTmp = this;
			switch (strInterval) {
				case 's' :return new Date(Date.parse(dtTmp) + (1000 * Number));
				case 'n' :return new Date(Date.parse(dtTmp) + (60000 * Number));
				case 'h' :return new Date(Date.parse(dtTmp) + (3600000 * Number));
				case 'd' :return new Date(Date.parse(dtTmp) + (86400000 * Number));
				case 'w' :return new Date(Date.parse(dtTmp) + ((86400000 * 7) * Number));
				case 'q' :return new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) + Number*3, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
				case 'm' :return new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) + Number, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
				case 'y' :return new Date((dtTmp.getFullYear() + Number), dtTmp.getMonth(), dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
			}
		};

		/**
		 * 返回两个日期对象之间的时间间隔。
		 * dateObj.dateDiff(interval, dateObj2)
		 * 参数
		 * interval必选项。字符串表达式，表示用于计算 date1 和 date2 之间的时间间隔。有关数值，请参阅“设置”部分。
		 * dateObj, dateObj2必选项。日期对象。用于计算的两个日期对象。
		 */
		Date.prototype.DateDiff = function(strInterval, dtEnd) {
			var dtStart = this;
			if (typeof dtEnd == 'string' )//如果是字符串转换为日期型
			{
				dtEnd = StringToDate(dtEnd);
			}
			switch (strInterval) {
				case 's' :return Math.floor((dtEnd - dtStart) / 1000);
				case 'n' :return Math.floor((dtEnd - dtStart) / 60000);
				case 'h' :return Math.floor((dtEnd - dtStart) / 3600000);
				case 'd' :return Math.floor((dtEnd - dtStart) / 86400000);
				case 'w' :return Math.floor((dtEnd - dtStart) / (86400000 * 7));
				case 'm' :return (dtEnd.getMonth()+1)+((dtEnd.getFullYear()-dtStart.getFullYear())*12) - (dtStart.getMonth()+1);
				case 'y' :return dtEnd.getFullYear() - dtStart.getFullYear();
			}
		};

		/**
		 * 格式化时间，返回想要的格式
		 * @formatModel: 想要的格式模板
		 */
		Date.prototype.Dateformat = function(formatModel){
			var d = this;
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
					SS = ("00" + ss).right(2),
					ww = d.getDay(),
					a = new Array("日", "一", "二", "三", "四", "五", "六"),
					ww = a[ww];
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
						.replace(/SS/g, SS)
						.replace(/ww/g, ww);
		};

		/**
		 * 获取当月第一天
		 * ios存在bug，不支持new Date("yyyy-mm-dd hh:nn:ss")的写法，因而使用new Date(yyyy,mm,dd,hh,nn,ss)的写法
		 */
		Date.prototype.FirstDay = function(){
			var date_ = this;
			var year = date_.getFullYear();
			var month = date_.getMonth();
			var month_first = new Date(year, month, 1, 0, 0, 0);
			return month_first;
		};

		/**
		 * 获取当月最后一天
		 */
		Date.prototype.LastDay = function(){
			var date_ = this;
			var year = date_.getFullYear();
			var month = date_.getMonth();
			var day = new Date(year,month + 1,0).getDate();
			var month_last = new Date(year, month, day, 23, 59, 59);
			return month_last;
		};


		/**
		* each是一个集合迭代函数，它接受一个函数作为参数和一组可选的参数
		* 这个迭代函数依次将集合的每一个元素和可选参数用函数进行计算，并将计算得的结果集返回
		{%example
		<script>
		var a = [1,2,3,4].each(function(x){return x > 2 ? x : null});
		var b = [1,2,3,4].each(function(x){return x < 0 ? x : null});
		alert(a);
		alert(b);
		</script>
		%}
		* @param {Function} fn 进行迭代判定的函数
		* @param more ... 零个或多个可选的用户自定义参数
		* @returns {Array} 结果集，如果没有结果，返回空集
		*/
		Array.prototype.each = function(fn){
			fn = fn || Function.K;
			var a = [];
			var args = Array.prototype.slice.call(arguments, 1);
			for(var i = 0; i < this.length; i++){
				var res = fn.apply(this,[this[i],i].concat(args));
				if(res != null) a.push(res);
			}
			return a;
		};
		Object.defineProperty(Array.prototype, "each", {
			enumerable: false,//--禁止遍历
			writable: false//--禁止重写
		});

		/**
		* 得到一个数组是否包含某一元素
		* @returns {bool} 是否包含
		*/
		Array.prototype.contains = function(val){
			var self = this,
				len = self.length;
			for(var i = 0; i < len; i++){
				if(self[i] == val){
					return true;
				}
			}
			return false;
		};
		Object.defineProperty(Array.prototype, "contains", {
			enumerable: false,//--禁止遍历
			writable: false//--禁止重写
		});

		/**
		* 得到一个数组不重复的元素集合
		* 唯一化一个数组
		* @returns {Array} 由不重复元素构成的数组
		*/
		Array.prototype.uniquelize = function(){
			var ra = new Array();
			for(var i = 0; i < this.length; i ++){
				if(!ra.contains(this[i])){
					ra.push(this[i]);
				}
			}
			return ra;
		};
		Object.defineProperty(Array.prototype, "uniquelize", {
			enumerable: false,//--禁止遍历
			writable: false//--禁止重写
		});

		/**
		* 求两个集合的补集
		{%example
		<script>
		var a = [1,2,3,4];
		var b = [3,4,5,6];
		alert(Array.complement(a,b));
		</script>
		%}
		* @param {Array} a 集合A
		* @param {Array} b 集合B
		* @returns {Array} 两个集合的补集
		*/
		Array.complement = function(a, b){
			return Array.minus(Array.union(a, b),Array.intersect(a, b));
		};
		Object.defineProperty(Array, "complement", {
			enumerable: false,//--禁止遍历
			writable: false//--禁止重写
		});

		/**
		* 求两个集合的交集
		{%example
		<script>
		var a = [1,2,3,4];
		var b = [3,4,5,6];
		alert(Array.intersect(a,b));
		</script>
		%}
		* @param {Array} a 集合A
		* @param {Array} b 集合B
		* @returns {Array} 两个集合的交集
		*/
		Array.intersect = function(a, b){
			return a.uniquelize().each(function(o){return b.contains(o) ? o : null});
		};
		Object.defineProperty(Array, "intersect", {
			enumerable: false,//--禁止遍历
			writable: false//--禁止重写
		});

		/**
		* 求两个集合的差集
		{%example
		<script>
		var a = [1,2,3,4];
		var b = [3,4,5,6];
		alert(Array.minus(a,b));
		</script>
		%}
		* @param {Array} a 集合A
		* @param {Array} b 集合B
		* @returns {Array} 两个集合的差集
		*/
		Array.minus = function(a, b){
			return a.uniquelize().each(function(o){return b.contains(o) ? null : o});
		};
		Object.defineProperty(Array, "minus", {
			enumerable: false,//--禁止遍历
			writable: false//--禁止重写
		});

		/**
		* 求两个集合的并集
		{%example
		<script>
		var a = [1,2,3,4];
		var b = [3,4,5,6];
		alert(Array.union(a,b));
		</script>
		%}
		* @param {Array} a 集合A
		* @param {Array} b 集合B
		* @returns {Array} 两个集合的并集
		*/
		Array.union = function(a, b){
			return a.concat(b).uniquelize();
		};
		Object.defineProperty(Array, "union", {
			enumerable: false,//--禁止遍历
			writable: false//--禁止重写
		});

		/**
		 * 拆分组合
		 * 从数组取特定长度的所有组合，可以是多维数组
		 * @param len 要取的组合的长度，超过数组长度就娶数组的长度
		 * @returns {Array} 返回二维数组，包含所有组合数组
		 */
		Array.prototype.combination = function(len){
			var self = this,
				l = self.length;
			len = l < len? l: len;
			var strEditions = self;
			var strOptions = [];

			function GetOptionsByLen(len)
			{
				for (var i = 0; i < strEditions.length; i++)
				{
					strOptions = strOptions.concat(GetSubOptions(i, [strEditions[i]], len));
				}
			}

			/**
			 *递归函数，拼接返回值，并将符合条件的返回值存入结果
			 * @param startFrom 起始位置
			 * @param ParentValue   上一级的字符串
			 * @param len   组合长度
			 * @returns {Array} 符合条件的组合数组
			 */
			function GetSubOptions(startFrom, ParentValue, len)
			{
				var strTmpOptions = [];//console.log(ParentValue,ParentValue.length)
				if(ParentValue.length == len){
					strTmpOptions.push(ParentValue);
				}
				if(ParentValue.length < len){
					for(var j = startFrom + 1; j < strEditions.length; j++)
					{
						if(startFrom + 1 < strEditions.length)
						{
							var a = ParentValue.slice(0);
							a.push(strEditions[j]);
							strTmpOptions = strTmpOptions.concat(GetSubOptions(j, a, len));
						}
					}
				}
				return strTmpOptions;
			}
			GetOptionsByLen(len);
			return strOptions;
		};
		Object.defineProperty(Array.prototype, "combination", {
			enumerable: false,//--禁止遍历
			writable: false//--禁止重写
		});

		/**
		 * 数组元素组合
		 * 将多维数组的元素进行组合，获取所有组合，存入数组
		 * 例如： [[1, 2], [3, 4]], 返回结果是：[[1, 3], [1, 4], [2, 3], [3, 4]]
		 */
		Array.prototype.getZuhes = function(){
			var self = this,
				allZuhe = [];
			allZuhe = getZuhes([], self.slice(0));
			return allZuhe;

			/**
			 * 递归函数，用来获取所有组合
			 */
			function getZuhes(r, arr){
				var a = arr[0],
					c = a.slice(0);//console.log(r,b, opts);
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
							f.push(c[ii]);
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
		Object.defineProperty(Array.prototype, "getZuhes", {
			enumerable: false,//--禁止遍历
			writable: false//--禁止重写
		});

	})();

/***/ }
/******/ ]);