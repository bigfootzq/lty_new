if(typeof(googlestarttime)=='undefined'){
	var googledataobjs=new Date();
	var googlestarttime=googledataobjs.getTime();
}
//获取当前页面url
var current=window.location.hostname;
var googlecurrentlindex='';
var _gaq = _gaq || [];
var urlAge=/^(www|bbs|cdn|buy|data|zucaidanchang|zucai|jingcai|jingcaiwang|shuangseqiu|3d|qilecai|22x5|daletou|qixingcai|p3|p5|shishicai|shiyiyunduojin|klsf|qunyinghui|kuaile8|pk10|11x5|gd11x5|ouguan|i|dejia|yijia|yingchao|xijia|gg)\.okooo\.com/;
if(urlAge.test(current)){
    googlecurrentlindex='.okooo.com';
}else{
    googlecurrentlindex='auto';
}

//google统计
if(typeof(googlegaurl)=='undefined'){
		// var googlegaurl="http://img1.okoooimg.com";
		var googlegaurl=itou.proto.protocol + "//koudai.itou.com";
}
if(typeof(googleversion)=='undefined'){
	var versionobj=new Date();
	var versionval=""+versionobj.getFullYear()+(versionobj.getMonth()+1);
	var googleversion=versionval;
}
_gaq.push(['_setAccount', 'UA-144633-3']);
_gaq.push(['_setDomainName',googlecurrentlindex]);
_gaq.push(['a1._setAccount', 'UA-27437686-1']);
_gaq.push(['a1._setDomainName',googlecurrentlindex]);
_gaq.push(['a2._setAccount', 'UA-27437686-2']);
_gaq.push(['a2._setDomainName',googlecurrentlindex]);
_gaq.push(['_setAllowLinker', true]);
_gaq.push(['_setAllowHash', true]);
_gaq.push(['_addOrganic', 'soso', 'w']);
_gaq.push(['_addOrganic', '3721', 'name']);
_gaq.push(['_addOrganic', 'youdao', 'q']);
_gaq.push(['_addOrganic', 'vnet', 'kw']);
_gaq.push(['_addOrganic', 'sogou', 'query']);
_gaq.push(['_addOrganic', '360', 'q']);
var thisPathName=window.location.pathname;
if(typeof(googleLotteryType)=='undefined' || googleLotteryType==""){
    var pathHtmlAge=/\.html$|\/$|.php$/;
    if(pathHtmlAge.test(thisPathName)){
        _gaq.push(['_trackPageview']);
    }else{
        _gaq.push(['_trackPageview',thisPathName+'/']);
    }
}else{

    var pathNameAge=/\.php$/;
    var pathHtmlAge=/\.html$|\/$/;
    if(pathNameAge.test(thisPathName)){
        thisPathName=thisPathName.replace(pathNameAge,"/"+googleLotteryType+"/");
        _gaq.push(['_trackPageview',thisPathName+window.location.search]);
    }else if(pathHtmlAge.test(thisPathName)){
        _gaq.push(['_trackPageview']);
    }else{
        _gaq.push(['_trackPageview',thisPathName+'/']);
    }
}

(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	// ga.src = (googlegaurl+"/JS/public/ga.js?v="+googleversion);
	ga.src = (googlegaurl+"/static/js/plugin/ga.js?v="+googleversion);
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

//前端性能统计

if (window.addEventListener) {
	window.addEventListener("load",function(){googleinit(2);},false);
}else{
	window.attachEvent("onload",function(){googleinit(2)});
}
var currenturl=gettimeurl();
function googleinit(id){
	var googledataobje=new Date();
	var googleendtime=googledataobje.getTime();
	try{
		var oldtime=googleendtime-googlestarttime;
	}catch(ex){
		return false;
	}
	id=isNaN(id)?1:id;
    var newpagename;
    if(oldtime<0||oldtime>100000){
        newpagename="errorPageLoadTime";
    }else{
        newpagename="PageLoadTime";
    }
	if(id==1){
        _gaq.push(['_trackTiming', newpagename, 'DOMContentloaded', oldtime, currenturl, 100]);
	}else if(id==2){
        _gaq.push(['_trackTiming', newpagename, 'onload', oldtime, currenturl, 100]);
	}

}
function gettimeurl(){
	var hrefurl=window.location.href;
	var proname=location.protocol;
	hrefurl=hrefurl.substr(proname.length+2);
    hrefurl=hrefurl.replace(/.*\.qq\.okooo\.com/,"all.qq.okooo.com");
	if(hrefurl.indexOf("?")>-1){
		var hrefarr=hrefurl.split("?");
        hrefarr[0]=replaceStr(hrefarr[0]);
		if(hrefarr[1].indexOf("LotteryType=")>-1){
			var hrefget=hrefarr[1].split("LotteryType=");
			if(hrefget[1].indexOf("&")>-1){
				var LotteryTypeval=hrefget[1].split("&");
				return hrefarr[0]+"?LotteryType="+LotteryTypeval[0];
			}else{
				return hrefarr[0]+"?LotteryType="+hrefget[1];
			}
		}else{
			return hrefarr[0];
		}
	}else{
		return replaceStr(hrefurl);
	}
}
function replaceStr(str){
    var age=/\/\d+\//g;
    while(age.test(str)){
        str=str.replace(age,"/no/");
    }
    var age=/\-\d+\-\d+\-\d+\./g;
    while(age.test(str)){
        str=str.replace(age,"-no-no-no.");
    }
    var age=/\/\d+\./g;
    while(age.test(str)){
        str=str.replace(age,"/no.");
    }
    return str;
}
if (document.addEventListener) {
	document.addEventListener("DOMContentLoaded",googleinit,false);
}else{
	 if ( document.documentElement.doScroll )
	(function(){
		try {
			document.documentElement.doScroll("left");
			googleinit(1)
		} catch( error ) {
			setTimeout( arguments.callee, 0 );
			return;
		}
	})();

}
//google统计函数，添加开关
function google_p(data,type,user){
    user = user ? user+".":"";
    type = type ? type :"_trackEvent";
    if(!data){
        return true;
    }
    for(var i in data){
        if(typeof(data[i])=="string"){
            data[i]="'"+data[i]+"'";
        }else{
            data[i]=Number(data[i]);
        }
    }
    if(typeof(GoogleTJKG)=="undefined" || GoogleTJKG){
        eval("_gaq.push(['"+user+type+"',"+data.join(",")+"])");
    }
}
//ajax 请求统计（ajax 开始触发，执行完回调函数后统计时间）
//ajax_google_KG 开关
function ajax_google_Tj_fun($){

}
