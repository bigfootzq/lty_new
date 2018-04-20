/**
 * 微信C端     竞彩设置js
 * Created by 赵宇飞 on 2016/9/26.
 */
$(function(){
    var opts = {
        SportteryNWDL: {//--胜平负玩法对应编码
            single: {"胜": "3", "平": "1", "负": "0"},//--单一投注对应编码
            mixed: {"胜": "16", "平": "15", "负": "14"}//--混合投注对应编码
        },
        SportteryWDL: {//--让球胜平负玩法对应编码
            single: {"胜": "3", "平": "1", "负": "0"},//--单一投注对应编码
            mixed: {"胜": "13", "平": "11", "负": "10"}//--混合投注对应编码
        },
        SportteryScore: {//--比分玩法对应编码
            single: {//--单一投注对应编码
                "1:0": "10",
                "2:0": "20",
                "2:1": "21",
                "3:0": "30",
                "3:1": "31",
                "3:2": "32",
                "4:0": "40",
                "4:1": "41",
                "4:2": "42",
                "5:0": "50",
                "5:1": "51",
                "5:2": "52",
                "胜其他": "43",
                "0:0": "00",
                "1:1": "11",
                "2:2": "22",
                "3:3": "33",
                "平其他": "44",
                "0:1": "01",
                "0:2": "02",
                "1:2": "12",
                "0:3": "03",
                "1:3": "13",
                "2:3": "23",
                "0:4": "04",
                "1:4": "14",
                "2:4": "24",
                "0:5": "05",
                "1:5": "15",
                "2:5": "25",
                "负其他": "34"
            },
            mixed: {//--混合投注对应编码
                "1:0": "30",
                "2:0": "31",
                "2:1": "32",
                "3:0": "33",
                "3:1": "34",
                "3:2": "35",
                "4:0": "36",
                "4:1": "37",
                "4:2": "38",
                "5:0": "39",
                "5:1": "40",
                "5:2": "41",
                "胜其他": "42",
                "0:0": "43",
                "1:1": "44",
                "2:2": "45",
                "3:3": "46",
                "平其他": "47",
                "0:1": "48",
                "0:2": "49",
                "1:2": "50",
                "0:3": "51",
                "1:3": "52",
                "2:3": "53",
                "0:4": "54",
                "1:4": "55",
                "2:4": "56",
                "0:5": "57",
                "1:5": "58",
                "2:5": "59",
                "负其他": "60"
            }
        },
        SportteryTotalGoals:{//--总进球玩法对应编码
            single: {//--单一投注对应编码
                "0球": "0",
                "1球": "1",
                "2球": "2",
                "3球": "3",
                "4球": "4",
                "5球": "5",
                "6球": "6",
                "7+": "7"
            },
            mixed: {//--混合投注对应编码
                "0球": "00",
                "1球": "01",
                "2球": "02",
                "3球": "03",
                "4球": "04",
                "5球": "05",
                "6球": "06",
                "7+": "07"
            }
        },
        SportteryHalfFull:{//--半全场玩法对应编码
            single: {//--单一投注对应编码
                "胜/胜": "33",
                "胜/平": "31",
                "胜/负": "30",
                "平/胜": "13",
                "平/平": "11",
                "平/负": "10",
                "负/胜": "03",
                "负/平": "01",
                "负/负": "00"
            },
            mixed: {//--混合投注对应编码
                "胜/胜": "20",
                "胜/平": "21",
                "胜/负": "22",
                "平/胜": "23",
                "平/平": "24",
                "平/负": "25",
                "负/胜": "26",
                "负/平": "27",
                "负/负": "28"
            }
        }
    };
    itou.setting.setData("jingcai_config_opts", opts);
    if($.lottery){
        $.lottery.jingcai.football.config(opts);
    }
});
