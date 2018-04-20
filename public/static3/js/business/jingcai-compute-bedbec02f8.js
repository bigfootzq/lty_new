/**
微信C端 竞彩投注——最大奖金计算
by zhaoyf 2016年11月15日11:21:29
 */
(function(){

	var JianZhong = function(){
		var self = this;
		self.bifen = {};
		self.bifen["胜"] = ["1:0", "2:0", "2:1", "3:0", "3:1", "3:2", "4:0", "4:1", "4:2", "5:0", "5:1", "5:2", "胜其他"];//--比分胜选项
		self.bifen["平"] = ["0:0", "1:1", "2:2", "3:3", "平其他"];//--比分平选项
		self.bifen["负"] = ["0:1", "0:2", "1:2", "0:3", "1:3", "2:3", "0:4", "1:4", "2:4", "0:5", "1:5", "2:5", "负其他"];//--比分负选项
		self.jinqiu = ["0球", "1球", "2球", "3球", "4球", "5球", "6球", "7+"];//--总进球选项
		self.bqc = ["胜/胜", "胜/平", "胜/负", "平/胜", "平/平", "平/负", "负/胜", "负/平", "负/负"];//--半全场选项
		self.rq_p = ["胜*p", "平*p", "负*p"];//--让球胜平负选项，格式胜*盘口
		self.rq = [];
		self.spf = ["胜", "平", "负"];

		// self.bqc_spf_maps = {//--半全场与胜平负关系
		// 	"胜": ["胜/胜", "胜/平", "胜/负", "平/胜", "负/胜"],
		// 	"平": ["胜/负", "平/平", "负/胜"],
		// 	"负": ["负/负", "负/平", "胜/负", "平/负", "负/胜"]
		// };
		self.bqc_spf_maps = {//--半全场与胜平负关系
			"胜": ["胜/胜", "平/胜", "负/胜"],
			"平": ["胜/平", "平/平", "负/平"],
			"负": ["胜/负", "平/负", "负/负"]
		};
		self.minBifen = {//--半全场各选项最小进球数
			"胜/胜": 1,
			"胜/平": 2,
			"胜/负": 3,
			"平/胜": 1,
			"平/平": 0,
			"平/负": 1,
			"负/胜": 3,
			"负/平": 2,
			"负/负": 1
		};

		self.maps = {};

		self.initRQ();//--让球胜平负初始化
		self.initSPF();//--胜平负初始化
		self.initBQC();//--半全场初始化
		self.initBF();//--比分初始化
		self.initJQ();//--总进球初始化
	};

	JianZhong.prototype.initRQ = function(){//--让球胜平负兼中映射初始化
		var self = this,
			maps = self.maps,
			spf = self.spf,
			rq_p = self.rq_p,
			rq = self.rq;
		for(var i = 1, len = 7; i <= len; i++){
			rq_p.each(function(val){
				var str = "+" + i;
				var key = val.replace("p", str);
				rq.push(key);
				maps[key] = [];
				maps[key] = maps[key].concat(self.getBF(key));//--比分
				maps[key] = maps[key].concat(self.getJQ(key));//--总进球
				maps[key] = maps[key].concat(self.getSPF(key));//--胜平负
				maps[key] = maps[key].concat(self.getBQC(key));//--半全场
				var str = "-" + i;
				var key = val.replace("p", str);
				rq.push(key);
				maps[key] = [];
				maps[key] = maps[key].concat(self.getBF(key));//--比分
				maps[key] = maps[key].concat(self.getJQ(key));//--总进球
				maps[key] = maps[key].concat(self.getSPF(key));//--胜平负
				maps[key] = maps[key].concat(self.getBQC(key));//--半全场
			});
		}
	};

	JianZhong.prototype.initSPF = function(){//--胜平负兼中映射初始化
		var self = this,
			maps = self.maps,
			spf = self.spf;
		for(var i = 0, len = spf.length; i < len; i ++){
			var key = spf[i];
			maps[key] = [];
			//--各玩法可兼中选项映射数组
			maps[key] = maps[key].concat(self.getBF(key));//--比分
			maps[key] = maps[key].concat(self.getBQC(key));//--半全场
			maps[key] = maps[key].concat(self.getJQ(key));//--总进球
			maps[key] = maps[key].concat(self.getRQ(key));//--让球胜平负
		}
	};

	JianZhong.prototype.initBQC = function(){//--半全场兼中映射初始化
		var self = this,
			maps = self.maps,
			bqc = self.bqc;
		for(var i = 0, len = bqc.length; i < len; i ++){
			var key = bqc[i];
			maps[key] = [];
			//--各玩法可兼中选项映射数组
			maps[key] = maps[key].concat(self.getBF(key));//--比分
			maps[key] = maps[key].concat(self.getJQ(key));//--总进球
			maps[key] = maps[key].concat(self.getSPF(key));//--胜平负
			maps[key] = maps[key].concat(self.getRQ(key));//--让球胜平负
		}
	};

	JianZhong.prototype.initJQ = function(){//--总进球兼中映射初始化
		var self = this,
			maps = self.maps,
			jinqiu = self.jinqiu;
		for(var i = 0, len = jinqiu.length; i < len; i ++){
			var key = jinqiu[i];
			maps[key] = [];
			//--各玩法可兼中选项映射数组
			maps[key] = maps[key].concat(self.getSPF(key));//--胜平负
			maps[key] = maps[key].concat(self.getBQC(key));//--半全场
			maps[key] = maps[key].concat(self.getRQ(key));//--让球胜平负
			maps[key] = maps[key].concat(self.getBF(key));//--比分
		}
	};

	JianZhong.prototype.initBF = function(){//--半全场兼中映射初始化
		var self = this,
			maps = self.maps,
			bifen = self.bifen;
		for(var o in bifen){
			var bf = bifen[o];
			for(var i = 0, len = bf.length; i < len; i ++){
				var key = bf[i];
				maps[key] = [];
				//--各玩法可兼中选项映射数组
				maps[key] = maps[key].concat(self.getSPF(key));//--胜平负
				maps[key] = maps[key].concat(self.getBQC(key));//--半全场
				maps[key] = maps[key].concat(self.getJQ(key));//--总进球
				maps[key] = maps[key].concat(self.getRQ(key));//--让球胜平负
			}
		}
	};

	JianZhong.prototype.getRQ = function(key){//--根据条件，筛选符合条件的让球胜平负选项
		var self = this,
			_maps = self.bqc_spf_maps,
			r = [];
		switch (true) {
			case (key == "胜" || (key.has("/") && _maps["胜"].contains(key)))://--胜平负
				self.rq.each(function(val){
					var _arr = val.split("*"),
						pk = _arr[1] * 1;
					switch (true) {
						case (_arr[0] == "胜" && pk > 0):
							r.push(val);
							break;
						case (_arr[0] == "胜" && pk < 0):
							r.push(val);
							break;
						// case (_arr[0] == "平" && pk > 0):
						// 	r.push(val);
						// 	break;
						case (_arr[0] == "平" && pk < 0):
							r.push(val);
							break;
						// case (_arr[0] == "负" && pk > 0):
						// 	r.push(val);
						// 	break;
						case (_arr[0] == "负" && pk < -1):
							r.push(val);
							break;
					}
				});
				break;
			case (key == "平" || (key.has("/") && _maps["平"].contains(key)))://--胜平负
				self.rq.each(function(val){
					var _arr = val.split("*"),
						pk = _arr[1] * 1;
					switch (true) {
						case (_arr[0] == "胜" && pk > 0):
							r.push(val);
							break;
						case (_arr[0] == "负" && pk < 0):
							r.push(val);
							break;
					}
				});
				break;
			case (key == "负" || (key.has("/") && _maps["负"].contains(key)))://--胜平负
				self.rq.each(function(val){
					var _arr = val.split("*"),
						pk = _arr[1] * 1;
					switch (true) {
						case (_arr[0] == "胜" && pk > 1):
							r.push(val);
							break;
						// case (_arr[0] == "胜" && pk < 0):
						// 	r.push(val);
						// 	break;
						case (_arr[0] == "平" && pk > 0):
							r.push(val);
							break;
						// case (_arr[0] == "平" && pk < 0):
						// 	r.push(val);
						// 	break;
						case (_arr[0] == "负" && pk > 0):
							r.push(val);
							break;
						case (_arr[0] == "负" && pk < 0):
							r.push(val);
							break;
					}
				});
				break;
			// case (key.has("/"))://--半全场
			// 	r = self.rq
			// 	break;
			case (key.has(":"))://--比分
				var arr = key.split(":");
				// var diff = arr[0] * 1 - arr[1] * 1;
				self.rq.each(function(val){
					var _arr = val.split("*"),
						pk = _arr[1] * 1;
					if(_arr[0] == "胜"){
						if(arr[0] * 1 + pk > arr[1] * 1){
							r.push(val);
						}
					}else if(_arr[0] == "平"){
						if(arr[0] * 1 + pk == arr[1] * 1){
							r.push(val);
						}
					}else if(_arr[0] == "负"){
						if(arr[0] * 1 + pk < arr[1] * 1){
							r.push(val);
						}
					}
				});
				break;
			case (key.has("其他"))://--比分
				// r = self.rq
				var w = key.replace("其他", "");
				switch (w) {
					case "胜"://--让胜 || (让平 && 盘口 > 0) || (让负 && 盘口 > 0) 
						self.rq.each(function(val){
							if(val.has("胜") || val.has("平*-") || val.has("负*-")){
								r.push(val);
							}
						});
						break;
					case "平":
						self.rq.each(function(val){
							if(val.has("胜*+") || val.has("负*-")){
								r.push(val);
							}
						});
						break;
					case "负":
						self.rq.each(function(val){
							if(val.has("胜*+") || val.has("平*+") || val.has("负")){
								r.push(val);
							}
						});
						break;
				}
				break;
			case (key.has("球"))://--总进球
				var v = key.replace("球", "") * 1;
				self.rq.each(function(val){
					var _arr = val.split("*"),
						pk = _arr[1] * 1;
					if(_arr[0] == "胜"){
						// if(v + pk > 0){
						// 	r.push(val);
						// }
						if(pk > 0){
							r.push(val);
						}else if(pk < 0 && v > Math.abs(pk) * 2){
							r.push(val);
						}
					}else if(_arr[0] == "平"){
						if(v >= Math.abs(pk) && (v - Math.abs(pk)) % 2 == 0){
							r.push(val);
						}
					}else if(_arr[0] == "负"){
						// if(v - pk > 0){
						// 	r.push(val);
						// }
						if(pk < 0){
							r.push(val);
						}else if(pk > 0 && v > Math.abs(pk) * 2){
							r.push(val);
						}
					}
				});
				break;
			case (key == "7+")://--总进球
				self.rq.each(function(val){
					r.push(val);
				});
				break;
		}
		return r;
	};

	JianZhong.prototype.getBQC = function(key){//--根据条件，筛选符合条件的半全场选项
		var self = this,
			_maps = self.bqc_spf_maps,
			r = [];
		switch (true) {
			case (key == "胜" || key == "平" || key == "负")://--胜平负
				r = _maps[key];
				break;
			case (key.has("*"))://--让球胜平负
				var _arr = key.split("*"),
					pk = _arr[1] * 1;
				switch (true) {
					case (_arr[0] == "胜" && pk > 0):
						r = self.bqc;
						break;
					case (_arr[0] == "胜" && pk < 0):
						r = _maps["胜"];
						break;
					case (_arr[0] == "平" && pk > 0):
						r = _maps["负"];
						break;
					case (_arr[0] == "平" && pk < 0):
						r = _maps["胜"];
						break;
					case (_arr[0] == "负" && pk > 0):
						r = _maps["负"];
						break;
					case (_arr[0] == "负" && pk < 0):
						r = self.bqc;
						break;
				}
				break;
			case (key.has("球") || key == "7+")://--总进球
				var v = key.replace("球", "").replace("+", "") * 1;
				self.bqc.each(function(val){
					var min = self.minBifen[val];
					if(val.has("/胜")){
						if(v >= min || v == 7){
							r.push(val);
						}
					}else if(val.has("/平")){
						if((v >= min || v % 2 == 0) || v == 7){
							r.push(val);
						}
					}else if(val.has("/负")){
						if(v >= min || v == 7){
							r.push(val);
						}
					}
				});
				break;
			case (key.has(":"))://--比分
				var arr = key.split(":");
				var diff = arr[0] * 1 - arr[1] * 1;
				var sum = arr[0] * 1 + arr[1] * 1;
				self.bqc.each(function(val){
					var min = self.minBifen[val];
					if(val.has("/胜")){
						if(diff > 0 && sum >= min){
							r.push(val);
						}
					}else if(val.has("/平")){
						if(diff == 0 && sum >= min){
							r.push(val);
						}
					}else if(val.has("/负")){
						if(diff < 0 && sum >= min){
							r.push(val);
						}
					}
				});
				break;
			case (key.has("其他"))://--比分
				var v = key.replace("其他", "");
				r = _maps[v];
				break;
		}
		return r;
	};

	JianZhong.prototype.getBF = function(key){//--根据条件，筛选符合条件的比分选项
		var self = this,
			_maps = self.bqc_spf_maps,
			r = [];
		switch (true) {
			case (key == "胜" || key == "平" || key == "负")://--胜平负
				r = r.concat(self.bifen[key]);
				break;
			case (key.has("球") || key == "7+")://--总进球
				var v = key.replace("球", "").replace("+", "") * 1;//console.log(v);
				for(var i in self.bifen){
					var bf = self.bifen[i];
					bf.each(function(val){
						if(val.has(":")){
							var arr = val.split(":");
							if(arr[0] * 1 + arr[1] * 1 == v){
								r.push(val);
							}
						}else{
							if(key == "7+"){
								r.push(val);
							}
						}
					});
				}
				break;
			case (key.has("/"))://--半全场
				var k = key.split("/")[1]
				var bf = self.bifen[k];
				var min = self.minBifen[key];
				bf.each(function(val){
					if(val.has(":")){
						var _arr = val.split(":");
						var sum = _arr[0] * 1 + _arr[1] * 1;
						if(sum >= min){
							r.push(val);
						}
					}else{
						r.push(val);
					}
				});
				break;
			case (key.has("*"))://--让球胜平负
				var _arr = key.split("*"),
					pk = _arr[1] * 1;
				for(var i in self.bifen){
					var bf = self.bifen[i];//console.log(bf);
					bf.each(function(val){
						if(val.has(":")){
							var arr = val.split(":");
							var diff = arr[0] * 1 - arr[1] * 1;//console.log(diff, pk, _arr[0], diff + pk, _arr[0] == "胜", diff + pk > 0);
							if(_arr[0] == "胜"){
								if(diff + pk > 0){
									r.push(val);
								}
							}else if(_arr[0] == "平"){
								if(diff + pk == 0){
									r.push(val);
								}
							}else if(_arr[0] == "负"){
								if(diff + pk < 0){
									r.push(val);
								}
							}
						}else{
							// r.push(val);
							switch (true) {
								case (_arr[0] == "胜" && pk > 0):
									r.push(val);
									break;
								case (_arr[0] == "胜" && pk < 0 && val.has("胜")):
									r.push(val);
									break;
								case (_arr[0] == "平" && pk > 0 && val.has("负")):
									r.push(val);
									break;
								case (_arr[0] == "平" && pk < 0 && val.has("胜")):
									r.push(val);
									break;
								case (_arr[0] == "负" && pk > 0 && val.has("负")):
									r.push(val);
									break;
								case (_arr[0] == "负" && pk < 0):
									r.push(val);
									break;
							}
						}
					});
				}
				break;
		}
		return r;
	};

	JianZhong.prototype.getSPF = function(key){//--根据条件，筛选符合条件的胜平负选项
		var self = this,
			spf = self.spf,
			_maps = self.bqc_spf_maps,
			r = [];//console.log(key);
		switch (true) {
			case (key.has("*"))://--让球胜平负
				var _arr = key.split("*"),
					pk = _arr[1] * 1;
				switch (true) {
					case (_arr[0] == "胜" && pk > 0):
						r = self.spf;
						break;
					case (_arr[0] == "胜" && pk < 0):
						r = ["胜"];
						break;
					case (_arr[0] == "平" && pk > 0):
						r = ["负"];
						break;
					case (_arr[0] == "平" && pk < 0):
						r = ["胜"];
						break;
					case (_arr[0] == "负" && pk > 0):
						r = ["负"];
						break;
					case (_arr[0] == "负" && pk < 0):
						r = self.spf;
						break;
				}
				break;
			case (key.has("球") || key == "7+")://--总比分
				var v = key.replace("球", "").replace("+", "") * 1;
				if(v == 0){
					r = ["平"];
				}else if(v % 2 == 0 || key == "7+"){
					r = spf;
				}else{
					r = ["胜", "负"];
				}
				break;
			case (key.has(":"))://--比分
				var arr = key.split(":");
				if(arr[0] > arr[1]){
					r = spf[0];
				}else if(arr[0] == arr[1]){
					r = spf[1];
				}else if(arr[0] < arr[1]){
					r = spf[2];
				}
				break;
			case (key.has("其他"))://--比分
				r = [key.replace("其他", "")];
				break;
			case (key.has("/"))://--半全场
				r = [key.split("/")[1]];
				break;
		}
		return r;
	};

	JianZhong.prototype.getJQ = function(key){//--根据条件，筛选符合条件的进球选项
		var self = this,
			jinqiu = self.jinqiu,
			_maps = self.bqc_spf_maps,
			r = [];
		switch (true) {
			case (key == "胜" || key == "负")://--胜负可兼中进球选项
				r = jinqiu.each(function(val){
					v = val.replace(/\D/g, "") * 1;
					if(v > 0){
						return val;
					}
				});
				break;
			case (key == "平")://--平可兼中进球选项
				r = jinqiu.each(function(val){
					v = val.replace(/\D/g, "") * 1;
					if(v % 2 == 0 || val.has("+")){
						return val;
					}
				});
				break;
			case (key.has(":"))://--比分可兼中进球选项
				var arr = key.split(":"),
					sum = arr[0] * 1 + arr[1] * 1;
				r = jinqiu.each(function(val){
					v = val.replace(/\D/g, "") * 1;
					if(v == sum){
						return val;
					}
				});
				break;
			case (key.has("其他"))://--比分可兼中进球选项
				r = jinqiu.each(function(val){
					if(val.has("+")){
						return val;
					}
				});
				break;
			case (key.has("*") || key.has("/"))://--让球胜平负可兼中进球选项
				self.maps[key].each(function(val){
					if(val.has(":")){
						var _arr = val.split(":");
						var sum = _arr[0] * 1 + _arr[1] * 1;
						if(sum < 7){
							r.push(sum + "球");
						}else{
							r.push("7+");
						}
					}
					if(val.has("其他")){
						r.push("7+");
					}
				});
				r = r.uniquelize();
				break;
		}
		return r;
	};

	window.jianzhong = new JianZhong();

	console.log(window.jianzhong);
	var maps = window.jianzhong.maps;
	
	// console.log("胜", maps["胜"]);
	// console.log("平", maps["平"]);
	// console.log("负", maps["负"]);


	// console.log("0球", maps["0球"]);
	// console.log("1球", maps["1球"]);
	// console.log("2球", maps["2球"]);
	// console.log("3球", maps["3球"]);
	// console.log("4球", maps["4球"]);
	// console.log("5球", maps["5球"]);
	// console.log("6球", maps["6球"]);
	// console.log("7+", maps["7+"], JSON.stringify(maps["7+"]));

	// console.log("5:2", maps["5:2"]);


	// console.log("负/胜", maps["负/胜"]);

	// console.log("胜*-3", maps["胜*-3"]);
	// console.log("平*-3", maps["平*-3"]);
	// console.log("负*-3", maps["负*-3"]);
	// console.log("胜*+3", maps["胜*+3"]);
	// console.log("平*+3", maps["平*+3"]);
	// console.log("负*+3", maps["负*+3"]);

})();