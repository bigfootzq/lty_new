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

	/***
		Vue.js全局设置
	**/
	(function(){
		/**
		Vue.js 全局混合，引入组件及其对应事件
		srart
		**/
	  /*font-size rem 单位计算调整*/
		(function(_D){
					$(function(){
		        var _self = {};
		        _self.resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize';
		        _self.Html = _D.getElementsByTagName("html")[0];
		        _self.widthProportion = function(){
		            var p = Number((_D.body&&_D.body.clientWidth||_self.Html.offsetWidth)/640).toFixed(3);
		            return p>1.2?1.2:p<0.5?0.5:p;
		        };
		        _self.changePage = function(){
		            _self.Html.setAttribute("style","font-size:"+_self.widthProportion()*64+"px");
		            _self.correctPx();
		        };
						_self.correctPx = function(){
	             var docEl = document.documentElement;
	             var clientWidth = docEl.clientWidth;
	             if (!clientWidth || clientWidth > 768) return;
	             var div = document.createElement('div');
	             div.style.width = '1.4rem';
	             div.style.height = '0';
	             document.body.appendChild(div);
	             var ideal = 140 * clientWidth / 640;
	             var rmd = (div.clientWidth / ideal);
	             console.log(rmd);
	             if(rmd > 1.2 || rmd < 0.5){
	                 docEl.style.fontSize = 64 * (clientWidth / 640) / rmd + 'px';
	                 document.body.removeChild(div);
	             }

	         };
		        _self.changePage();
		        if (!document.addEventListener) return;
		        window.addEventListener(_self.resizeEvt,_self.changePage,false);
		        document.addEventListener('DOMContentLoaded', _self.changePage, false);
				})
	 })(document);


		var msgbox = __webpack_require__(1);//--弹窗组件
		var icondel = __webpack_require__(8);//--文本框清空组件
		var numkeyboard = __webpack_require__(11);//--弹窗组件
		var openapp = __webpack_require__(16);//--弹窗组件

		var action = {//--功能是否开放
			avatar: config.browser == "wx",//--头像功能是否开放
			share: config.browser == "wx",//--分享功能是否开放
			guanzhu: config.browser == "wx",//--关注公众号功能是否开放
			dingyue: config.browser == "wx",//--消息订阅功能是否开放
		};
		action.avatar = ["wx", "ios", "android", "app"].indexOf(config.browser) != -1;
		action.share = ["wx", "ios", "android", "app"].indexOf(config.browser) != -1;
		action.dingyue = ["wx", "ios", "android", "app"].indexOf(config.browser) != -1;

		var mixin = {
			components:{//--引入组件
				'msgbox':msgbox,
				'icondel': icondel,
				'numkeyboard': numkeyboard,
				'openapp': openapp
			},
			init: function(){
				if(["ios", "android", "app"].indexOf(config.browser) != -1){//--单页模式原页面body标签class属性处理
					var class_name = $("#_document_html").attr("class");
					$("html").removeClass().addClass(class_name);
					$("#_document_html").remove();
					var class_name = $("#_document_body").attr("class");
					$("body").removeClass().addClass(class_name);
					$("#_document_body").removeClass();
				}
			},
			created: function(){
				window.vm = this;
				if(!window.vueObj){
					window.vueObj = [];
				}
				window.vueObj.push(this);
				this.$set("Action", action);//--功能是否开放
				this.$set("isAPP", config.isAPP);//--是否是APP模式
				this.$set("browser", config.browser);//--是否是APP模式
			},
			ready: function(){//--记录vue对象实例，用于单页面模式销毁
				// console.error("Vue ready!");
				var url = itou.outil.getBackUrl();
				this.$set("backurl", url.backurl);//--包含当前页面url的返回地址
				this.$set("backpaths", url.paths);//--所有back参数解析数组，不包括url.backurl
				window.backurl = url.backurl;
				window.backpaths =  url.paths;
				window.setTimeout(function() {
					Gray.$entrust["single-link-click"]();
				}, 100);
				this.numkeyboard = this.$refs.numkeyboard;
				window.vm = this;
				var proto = {};
				proto.protocol = itou.proto.protocol;//--当前环境属性
				this.$set("proto", proto);
				var fromApp = Gray.$page.getUrlParam("fromApp");
				this.$set("fromApp", !!fromApp);//--连接是否来自APP分享
				this.$set("showAppLink", true);//--是否展示打开APP链接
				if(config.isAPP){
					Gray.plugin.require("init.js");
					Gray.plugin.require("checknetwork.js");
					Gray.$plugin["init.js"]()
						.then(function(){
							try {
								Gray.$plugin["checknetwork.js"]();
								// Gray.$plugin["startprogress.js"]();
							} catch (error) {
								console.error(error.message, error);
							}
						});
				}
			},
			beforeDestroy: function(){//--vue实例销毁时，同时销毁dropload对象
				// console.debug("Vue beforeDestory!");
				if(window.__MyDropLoad){
					window.__MyDropLoad.destroy();
				}
				if(vm.ascroll && vm.ascroll.unbind){
					vm.ascroll.unbind();
				}
				itou.outil.timmer.clearTimmer();
			},
			methods: {
				back: function(){//--默认返回事件
					// console.debug(this.backUrl);return;
					itou.page.back();
				},
				showToast: function(msg, event_from, show_time){//--显示消息弹窗,alert形式
					this.$refs.msgbox.toast(msg, true, event_from, show_time);
				},
				showMsgBox: function(msg, title, event_from, event_text){//--显示消息弹窗,alert形式
					this.$refs.msgbox.show(msg, true, title, event_from, event_text);
				},
				showConfirmBox: function(msg, title, event_from, event_ok, ok_text, close_text){//--显示消息弹窗2,confirm形式
					this.$refs.msgbox.showConfirm(msg, true, title, event_from, event_ok, ok_text, close_text);
				},
				closeMsgBox: function(){//--关闭消息弹窗，按取消处理
					this.$refs.msgbox.close();
				},
				okMsgBox: function(){//--关闭消息弹窗，按同意处理
					this.$refs.msgbox.ok();
				},
				focusInput: function(key){//--文本框获得焦点
					if(!this.focused){
						this.$set("focused",key);
					}else{
						this.focused = key;
					}
				},
				blurInput: function(){//--文本框失去焦点
					if(!this.focused){
						this.$set("focused",'');
					}else{
						this.focused = '';
					}
				},
				goShopExplain: function(id){
					if(!id){
						Gray.$page.loadPage("/user/shop/nocert/?back=" + this.backurl);
						return;
					}
					Gray.$page.loadPage("/user/shop/explain/?id=" + id + "&back=" + this.backurl);
				},
				destroy: function(){
					this.$destroy();
				},
				gotoTaps: function(url){
					itou.outil.gotoTaps(url);
				},
				openApp: function(params){//--唤起APP
					var self = this,
						openapp = self.$refs.openapp;
					if(openapp){
						openapp.init(params);
					}
				}
			}
		};
		if(!window.Vue_hasMixined){
			Vue.mixin(mixin);
			console.log("Vue.mixin 完成。");
			window.Vue_hasMixined = true;
		}
		/***
		end
		全局混合结束
		***/
	})();


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(2)
	__vue_script__ = __webpack_require__(6)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] dist/components/msgbox.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(7)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}
	if (false) {(function () {  module.hot.accept()
	  var hotAPI = require("vue-hot-reload-api")
	  hotAPI.install(require("vue"), false)
	  if (!hotAPI.compatible) return
	  var id = "_v-033e7150/msgbox.vue"
	  if (!module.hot.data) {
	    hotAPI.createRecord(id, module.exports)
	  } else {
	    hotAPI.update(id, module.exports, __vue_template__)
	  }
	})()}

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(3);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(5)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/css-loader/index.js!./../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-033e7150&scoped=true!./../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./msgbox.vue", function() {
				var newContent = require("!!./../../node_modules/css-loader/index.js!./../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-033e7150&scoped=true!./../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./msgbox.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(4)();
	// imports


	// module
	exports.push([module.id, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\r\n.no-padding[_v-033e7150]{\r\n    padding: 0px;\r\n    min-height: 1.6rem;\r\n}\r\n", ""]);

	// exports


/***/ },
/* 4 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];

		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};

		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];

	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();

		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

		var styles = listToStyles(list);
		addStylesToDom(styles, options);

		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}

	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}

	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}

		update(obj);

		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	var replaceText = (function () {
		var textStore = [];

		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();

	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;

		if (media) {
			styleElement.setAttribute("media", media);
		}

		if (sourceMap) {
			// https://developer.chrome.com/devtools/docs/javascript-debugging
			// this makes source maps inside style tags work properly in Chrome
			css += '\n/*# sourceURL=' + sourceMap.sources[0] + ' */';
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}


/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';

	module.exports = {
		props: ['msg', 'is_show', 'title', 'event_from', 'show_type', 'event_ok', 'class', 'ok_text', 'close_text', 'show_time'],
		methods: {
			close: function close() {
				this.event_from = this.event_from || "";
				if (!this.event_from.has("@noClose")) {
					this.is_show = false;
					this.msg = '';
					this.title = '';
					this.show_type = '';
					this.event_from = !this.event_from || this.event_from.lengt === 0 ? 'default' : this.event_from;
					this.$dispatch('msgbox_close', this.event_from);
					this.event_from = '';
					this.event_ok = '';
				} else {
					this.$dispatch('msgbox_close', this.event_from);
				}
			},

			ok: function ok() {
				this.event_ok = this.event_ok || "";
				if (!this.event_ok.has("@noClose")) {
					this.is_show = false;
					this.msg = '';
					this.title = '';
					this.show_type = '';
					this.event_ok = !this.event_ok || this.event_ok.lengt === 0 ? 'default' : this.event_ok;
					this.$dispatch('msgbox_ok', this.event_ok);
					this.event_from = '';
					this.event_ok = '';
				} else {
					this.$dispatch('msgbox_ok', this.event_ok);
				}
			},

			show: function show(msg, is_show, title, event_from, event_text) {
				this.is_show = is_show;
				this.msg = msg;
				this.title = title;
				this.event_from = event_from;
				this.close_text = event_text;
				this.show_type = "alert";
				this.class = "alertlayer";
			},

			showConfirm: function showConfirm(msg, is_show, title, event_from, event_ok, ok_text, close_text) {
				this.is_show = is_show;
				this.msg = msg;
				this.title = title;
				this.event_from = event_from;
				this.event_ok = event_ok;
				this.ok_text = ok_text;
				this.close_text = close_text;
				this.show_type = "confirm";
				this.class = "alertlayer";
			},

			toast: function toast(msg, is_show, event_from, show_time) {
				var self = this;
				this.is_show = is_show;
				this.msg = msg;
				this.title = '';
				this.event_from = event_from;
				this.show_type = "toast";
				this.class = "alertlayer no-padding";
				this.show_time = show_time ? show_time : 2000;
				window.setTimeout(function () {
					self.is_show = false;
					self.msg = '';
					self.title = '';
					self.show_type = '';
					self.event_from = !self.event_from || self.event_from.lengt === 0 ? 'default' : self.event_from;
					self.$dispatch('msgbox_toast', self.event_from);
					self.event_from = '';
					self.event_ok = '';
				}, this.show_time);
			}
		}
	};

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = "\n<div @touchmove.stop.prevent=\"\" class=\"layerbox\" style=\"display:none;z-index:9999\" v-show=\"is_show\" _v-033e7150=\"\">\n  <div :class=\"class\" _v-033e7150=\"\">\n\t<h2 class=\"alertlayerh2\" v-show=\"title.length > 0\" _v-033e7150=\"\">{{title}}</h2>\n\t<div class=\"alertlayercon\" _v-033e7150=\"\"><p class=\"textc\" _v-033e7150=\"\">{{{msg}}}</p></div>\n\t<a class=\"closebtn\" v-on:click.prevent=\"close\" v-if=\"show_type == 'alert'\" v-text=\"close_text || '确定'\" _v-033e7150=\"\">确定</a>\n\t<div class=\"clearfix alertbtn\" v-if=\"show_type == 'confirm'\" _v-033e7150=\"\">\n\t\t<a class=\"btn btn_gray mr10\" v-on:click.prevent=\"close\" _v-033e7150=\"\">{{close_text || '取消'}}</a>\n\t\t<a class=\"fr btn btn_blue\" v-on:click.prevent=\"ok\" _v-033e7150=\"\">{{ok_text || '知道了'}}</a>\n\t</div>\n  </div>\n</div>\n";

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__vue_script__ = __webpack_require__(9)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] dist/components/icondel.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(10)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}
	if (false) {(function () {  module.hot.accept()
	  var hotAPI = require("vue-hot-reload-api")
	  hotAPI.install(require("vue"), false)
	  if (!hotAPI.compatible) return
	  var id = "_v-2be06988/icondel.vue"
	  if (!module.hot.data) {
	    hotAPI.createRecord(id, module.exports)
	  } else {
	    hotAPI.update(id, module.exports, __vue_template__)
	  }
	})()}

/***/ },
/* 9 */
/***/ function(module, exports) {

	'use strict';

	module.exports = {
		props: ['key', 'focused', 'class'],
		methods: {
			clearInfo: function clearInfo() {
				this.$root[this.key] = "";
			}
		}
	};

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = "\r\n<label :for='key'><em class=\"icon_del\" :class=\"class\" style=\"display:none\" @tap=\"clearInfo()\" v-show=\"focused == key\"></em></label>\r\n";

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(12)
	__vue_script__ = __webpack_require__(14)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] dist/components/numkeyboard.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(15)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}
	if (false) {(function () {  module.hot.accept()
	  var hotAPI = require("vue-hot-reload-api")
	  hotAPI.install(require("vue"), false)
	  if (!hotAPI.compatible) return
	  var id = "_v-0d6edd37/numkeyboard.vue"
	  if (!module.hot.data) {
	    hotAPI.createRecord(id, module.exports)
	  } else {
	    hotAPI.update(id, module.exports, __vue_template__)
	  }
	})()}

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(13);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(5)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/css-loader/index.js!./../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-0d6edd37&scoped=true!./../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./numkeyboard.vue", function() {
				var newContent = require("!!./../../node_modules/css-loader/index.js!./../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-0d6edd37&scoped=true!./../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./numkeyboard.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(4)();
	// imports


	// module
	exports.push([module.id, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", ""]);

	// exports


/***/ },
/* 14 */
/***/ function(module, exports) {

	"use strict";

	module.exports = {
		data: function data() {
			return new function () {
				var self = this,
				    Model = {};
				self.isShow = false;

				self.key = null;
				self.num = "1";
				self.oldNum = "1";
				self.numMax = "1000";
				self.setNum = null;
				self.config = {};
				self.config.topKey = [2, 5, 10, 20, 50];
				self.config.text = "倍";
				self.style = "";
				self.callBack = null;

				self.canreplace = false;
				self.downNum = 0;

				self.init = function (config) {
					for (var i in config) {
						if (self.config[i] && self.config[i] != config[i]) {
							self.config[i] = config[i];
						}
					}
				};

				self.open = function (key, maxKey, VueData, style, callBack) {
					if (key.key) {
						maxKey = key.maxKey;
						VueData = key.VueData;
						style = key.style;
						callBack = key.callBack || null;
						key = key.key;
					}
					Model = VueData;
					if (key != self.key) {
						self.num = new Function("Model", "return Model." + key + ";")(Model) || "1";
						if (isNaN(self.num)) {
							self.num = "1";
						}
						self.oldNum = self.num;
						self.numMax = new Function("Model", "return Model." + maxKey + ";")(Model) || "1";
						if (isNaN(self.num)) {
							self.num = "1000";
						}
						self.setNum = new Function("Model", "code", "Model." + key + " = new String(code);");
					}
					self.style = style || "";
					self.canreplace = self.num == "1";
					self.downNum = 0;
					self.isShow = !!self.setNum;
					self.callBack = callBack || null;
				};
				self.close = function () {
					self.isShow = false;
				};

				self.keyTop = function (code) {
					if (self.num != code) {
						self.num = code;
						self.canReplace = false;
						if (self.num * 1 > self.numMax * 1) {
							self.num = self.numMax;
						} else if (self.num * 1 < 1) {
							self.num = "1";
						}
						self.setNum(Model, self.num);
					}
					self.close();
					if (typeof self.callBack == "function") {
						self.callBack(self.num);
					}
				};

				self.keyNum = function (code) {
					if (!self.downNum) {
						self.num = code;
					} else {
						self.num = self.canReplace ? code * 1 : self.num + "" + code;
					}
					self.canReplace = false;
					if (self.num * 1 > self.numMax * 1) {
						self.num = self.numMax;
					} else if (self.num * 1 < 1) {
						self.num = "1";
					}
					if (self.num * 1 != self.oldNum * 1) {
						self.setNum(Model, self.num);
					}
					self.downNum += 1;
					if (typeof self.callBack == "function") {
						self.callBack(self.num);
					}
				};

				self.keydel = function () {
					var len = (self.num + "").length;
					if (!self.downNum) {
						self.num = 1;
					} else {
						self.num = (self.num + "").left(len - 1) || "1";
					}
					if (self.num * 1 > self.numMax * 1) {
						self.num = self.numMax;
					} else if (self.num * 1 < 1) {
						self.num = "1";
					}
					self.canReplace = self.num == "1";

					self.setNum(Model, self.num);

					self.firstKeyDown = true;
					if (typeof self.callBack == "function") {
						self.callBack(self.num);
					}
				};
			}();
		},
		methods: {}
	};

/***/ },
/* 15 */
/***/ function(module, exports) {

	module.exports = "\n\n<div @touchmove.stop.prevent=\"\" class=\"layerbox layer_numkey layerbox_jincaibtm\" :style=\"'display:none;' + style\" v-show=\"isShow\" @click=\"close()\" _v-0d6edd37=\"\">\n\t<div class=\"jincaibtmcon numkeybox\" @click.stop=\"\" _v-0d6edd37=\"\">\n\t\t<div class=\"numkeyboxtit\" _v-0d6edd37=\"\">\n\t\t<div class=\"flexbox quick_multple\" _v-0d6edd37=\"\">\n\t\t\t<p class=\"boxflex numkeybtn\" v-for=\"key in config.topKey\" @click=\"keyTop(key)\" v-text=\"key + config.text\" _v-0d6edd37=\"\">2倍</p>\n\t\t</div>\n\t\t</div>\n\n\t\t<div class=\"mult_numkeyboard\" _v-0d6edd37=\"\">\n\t\t\t<ul class=\"clearfix\" _v-0d6edd37=\"\">\n\t\t\t<li _v-0d6edd37=\"\"><p class=\"numkeybtn\" @tap=\"keyNum(1)\" _v-0d6edd37=\"\">1</p></li>\n\t\t\t<li _v-0d6edd37=\"\"><p class=\"numkeybtn\" @tap=\"keyNum(2)\" _v-0d6edd37=\"\">2</p></li>\n\t\t\t<li _v-0d6edd37=\"\"><p class=\"numkeybtn\" @tap=\"keyNum(3)\" _v-0d6edd37=\"\">3</p></li>\n\t\t\t<li _v-0d6edd37=\"\"><p class=\"numkeybtn\" @tap=\"keyNum(4)\" _v-0d6edd37=\"\">4</p></li>\n\t\t\t<li _v-0d6edd37=\"\"><p class=\"numkeybtn\" @tap=\"keyNum(5)\" _v-0d6edd37=\"\">5</p></li>\n\t\t\t<li _v-0d6edd37=\"\"><p class=\"numkeybtn\" @tap=\"keyNum(6)\" _v-0d6edd37=\"\">6</p></li>\n\t\t\t<li _v-0d6edd37=\"\"><p class=\"numkeybtn\" @tap=\"keyNum(7)\" _v-0d6edd37=\"\">7</p></li>\n\t\t\t<li _v-0d6edd37=\"\"><p class=\"numkeybtn\" @tap=\"keyNum(8)\" _v-0d6edd37=\"\">8</p></li>\n\t\t\t<li _v-0d6edd37=\"\"><p class=\"numkeybtn\" @tap=\"keyNum(9)\" _v-0d6edd37=\"\">9</p></li>\n\t\t\t<li _v-0d6edd37=\"\"><p class=\"mult_del\" @tap=\"keydel()\" _v-0d6edd37=\"\"><em class=\"mult_delicon\" _v-0d6edd37=\"\"></em>删除</p></li>\n\t\t\t<li _v-0d6edd37=\"\"><p class=\"numkeybtn\" @tap=\"keyNum(0)\" _v-0d6edd37=\"\">0</p></li>\n\t\t\t<li _v-0d6edd37=\"\"><p class=\"btn btn_blue\" @click=\"close()\" _v-0d6edd37=\"\">确定</p></li>\n\t\t\t</ul>\n\t\t</div>\n\t</div>\n</div>\n";

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(17)
	__vue_script__ = __webpack_require__(19)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] dist/components/openapp.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(20)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}
	if (false) {(function () {  module.hot.accept()
	  var hotAPI = require("vue-hot-reload-api")
	  hotAPI.install(require("vue"), false)
	  if (!hotAPI.compatible) return
	  var id = "_v-78c55f61/openapp.vue"
	  if (!module.hot.data) {
	    hotAPI.createRecord(id, module.exports)
	  } else {
	    hotAPI.update(id, module.exports, __vue_template__)
	  }
	})()}

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(18);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(5)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/css-loader/index.js!./../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-78c55f61&scoped=true!./../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./openapp.vue", function() {
				var newContent = require("!!./../../node_modules/css-loader/index.js!./../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-78c55f61&scoped=true!./../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./openapp.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(4)();
	// imports


	// module
	exports.push([module.id, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\r\n.no-padding[_v-78c55f61]{\r\n    padding: 0px;\r\n    min-height: 1.6rem;\r\n}\r\n", ""]);

	// exports


/***/ },
/* 19 */
/***/ function(module, exports) {

	"use strict";

	module.exports = {
		data: function data() {
			return new function () {
				var self = this,
				    Model = {};
				self.link = {
					ios: null,
					android: "http://a.app.qq.com/o/simple.jsp?pkgname=com.itou.cordova.koudai"
				};
				var UA = navigator.userAgent + "";
				self.isAndriod = /(Android)/i.test(UA);
				self.isIOS = /(iPhone|iPad|iPod|iOS)/i.test(UA);
				self.isAPP = true;
				self.fromApp = false;
				self.showAppLink = self.isAndriod && !!self.link["android"] || self.isIOS && !!self.link["ios"];
				self.currLink = self.isAndriod ? self.link["android"] : self.link["ios"];
				self.kouling = "$店铺口令$长按复制本条消息，打开口袋彩店App即可进入";
				self.clipboard = null;
				var url = window.location.href,
				    page = url.split("?")[0];
				self.init = function (params) {
					var vm = params.vm;
					self.isAPP = vm.isAPP;
					self.fromApp = vm.fromApp;
					if (params.name) {
						self.kouling += "[" + params.name + "]";
					}
					if (params.id) {
						self.kouling += "，" + window.btoa(params.id);
					} else {
						self.showAppLink = false;
					}
					var data = itou.sessionData.getData("__component_openapp"),
					    isShow = data[page] != "0";
					self.showAppLink = self.showAppLink && isShow;
					if (self.showAppLink && Clipboard) {
						self.clipboard = new Clipboard('#__openApp_clipboard').on('success', function (e) {
							var e = e || window.event;
							console.log(e);
						}).on('error', function (e) {
							console.log(e);
						});
					}
					console.log(navigator.userAgent, config.browser, self);
				};
				self.gotoApp = function () {
					if (self.currLink) {
						var el = document.getElementById("__openApp_clipboard");
						if (el && Clipboard && self.clipboard) {
							el.click();
						}
						Gray.$page.loadPage(self.currLink);
					}
					self.showAppLink = false;
				};
				self.hideLink = function () {
					self.showAppLink = false;
					var o = {};
					o[page] = "0";
					itou.sessionData.setData("__component_openapp", o);
				};
			}();
		},
		methods: {}
	};

/***/ },
/* 20 */
/***/ function(module, exports) {

	module.exports = "\n<div class=\"koudaibanner topcenter\" style=\"display:none\" v-show=\"!isAPP &amp;&amp; fromApp &amp;&amp; showAppLink\" _v-78c55f61=\"\">\n\t<img src=\"/static/images/koudailogred-2271431a89.png\" alt=\"口袋彩店\" _v-78c55f61=\"\">\n\t<p class=\"boxflex\" _v-78c55f61=\"\">口袋里的彩店，想用就用</p>\n\t<a :href=\"currLink\" @click=\"gotoApp\" class=\"openlink\" _v-78c55f61=\"\">打开</a>\n\t<a class=\"flexcenter closebtnbox\" @click=\"hideLink\" _v-78c55f61=\"\"><em class=\"closebtn\" _v-78c55f61=\"\">×</em></a>\n\t<div style=\"display:none\" id=\"__openApp_clipboard\" :data-clipboard-text=\"kouling\" _v-78c55f61=\"\"></div>\n</div>\n";

/***/ }
/******/ ]);