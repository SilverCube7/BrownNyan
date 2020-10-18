const scriptName = "화냥";

/**
 * (string) room
 * (string) sender
 * (boolean) isGroupChat
 * (void) replier.reply(message)
 * (boolean) replier.reply(room, message, hideErrorToast = false) // 전송 성공시 true, 실패시 false 반환
 * (string) imageDB.getProfileBase64()
 * (string) packageName
 */

/**
 * 봇주인: 화이트냥
 * 봇: 화냥봇
 */

const master = "화이트냥";
let nyanLang = "";
let forbiddenWords = [];
const learnList = new Map();
const msgList = new Map();
const msgListLimit = 500;
const eatFailPercent = 3; // 꿀꺽 실패 확률이 1/eatFailPercent
const eatPocketLimit = 100;
const emojiLenLimit = 5;

const msgRankList = new Map();
const imgRankList = new Map();
const emoticonRankList = new Map();
const nyanBotRankList = new Map();
const LRankList = new Map();
const eatRankList = new Map();
const vomitRankList = new Map();
const runRankList = new Map();
const eatDmgRankList = new Map();
const vomitDmgRankList = new Map();
const eatBattleRankList = new Map();

const eatPocket = new Map();

const NYAN_FILES = "NyanFiles";
const SPACE_TOKEN = "{space}";
const ENTER_TOKEN = "{enter}";
const LEARNING = "냥습";
const FORBIDDEN_WORD = "냥습금지어";
const DEL = "삭제";
const TALK = "말";
const MSG = "메시지";
const PHONE = "화냥폰";
const VERSION = "버전";
const BATTERY = "배터리";
const VOLTAGE = "전압";
const TEMPERATURE = "온도";
const IS_CHARGING = "충전중?";
const RANK = "순위";
const RSP = ["가바보", "가위바위보"];
const SCISSOR = "가위";
const ROCK = "바위";
const PAPER = "보";
const NYAN_LANG = "냥냥어";
const LEARNING_LIST = "냥습목록";
const TODAY = "오늘은";
const TODAY_DAY = "요일은";
const HELLO_LIST = ["안녕", "안녕하세요"];
const NYAN_BOT = "화냥봇";
const YOUR_NAME = "너의 이름은";
const MY_NAME = "내 이름은";
const EAT = "꿀꺽";
const VOMIT = "퉤엣";
const VOMIT_LIST = [VOMIT, "퉷"];
const ESCAPE = "도망";
const EATEN = "꿀꺽당햇";
const VOMITED = "퉤엣당햇";
const VOMITED_LIST = [VOMITED, "퉷당햇"];
const EAT_VS = "꿀꺽대결";
const EAT_POCKET = "꿀꺽주머니";
const DIGESTION = "소화";
const EMOJI = "이모지";
const PI = "PI";
const PICTURE = "사진";
const EMOTICON = "임티";
const L = "L";
const USER = "유저";

const LNames = [L, "l", "ㅣ", "엘", "死神", "사신"];
const day = ['일', '월', '화', '수', '목', '금', '토'];
const resRSP = [
    ['tie', 'bot', 'me'],
    ['me', 'tie', 'bot'],
    ['bot', 'me', 'tie']
]
const forbiddenSigns = [
    '{',
    '}',
    String.fromCharCode(8238) // 뒤집기 문자
];
const spaces = [
    ' ',
    '\n',
    '\r',
    '\t',
    String.fromCharCode(11),
    String.fromCharCode(12),
    String.fromCharCode(133),
    String.fromCharCode(160),
    String.fromCharCode(5760),
    String.fromCharCode(8192),
    String.fromCharCode(8193),
    String.fromCharCode(8194),
    String.fromCharCode(8195),
    String.fromCharCode(8196),
    String.fromCharCode(8197),
    String.fromCharCode(8198),
    String.fromCharCode(8199),
    String.fromCharCode(8200),
    String.fromCharCode(8201),
    String.fromCharCode(8202),
    String.fromCharCode(8232),
    String.fromCharCode(8233),
    String.fromCharCode(8239),
    String.fromCharCode(8287),
    String.fromCharCode(10240),
    String.fromCharCode(12288)
];

const DB = {
    makeDBPath: function(p) {
        return "./"+p+".txt";
    },

    loadDB: function(path) {
        let txt = DataBase.getDataBase(path);

        if(!txt)
            txt = "";

        return txt;
    },

    /**
     * < DB 토큰 >
     * ENTER_TOKEN = '\n'
     * SPACE_TOKEN = ' '
     */
    loadDBAndSplit: function(path) {
        let list = DB.loadDB(path);

        if(!list)
            return [];

        list = list.split(ENTER_TOKEN);

        for(let i=0; i<list.length; i++)
            list[i] = list[i].split(SPACE_TOKEN);

        return list;
    },

    saveDB: function(path, list) {
        let txt = "";

        for(let i=0; i<list.length; i++) {
            for(let j=0; j<list[i].length; j++) {
                txt += list[i][j];
    
                if(j != list[i].length-1)
                    txt += SPACE_TOKEN;
            }

            if(i != list.length-1)
                txt += ENTER_TOKEN;
        }

        DataBase.setDataBase(path, txt);
    }
};

const PI_1000 = DataBase.getDataBase(DB.makeDBPath(NYAN_FILES+"/"+PI));

const Rank = {
    loadRank: function(room, rankList, name) {
        if(!rankList.has(room))
            rankList.set(room, DB.loadDBAndSplit(DB.makeDBPath(room+"/"+RANK+"/"+name)));

        return rankList.get(room);
    },

    updateRank: function(room, who, rankList, name, cnt) {
        if(!cnt)
            cnt = 1;

        let data = Rank.loadRank(room, rankList, name);

        for(let i=0; i<data.length; i++)
            data[i][1] = Number(data[i][1]);

        let inName = false;

        // who를 찾아서 순위 갱신
        for(let i=0; i<data.length; i++) {
            if(data[i][0] == who) {
                data[i][1] += cnt;
                inName = true;
                break;
            }
        }

        if(!inName)
            data.push([who, cnt]);

        data.sort((a, b) => b[1]-a[1]);

        for(let i=0; i<data.length; i++)
            data[i][1] = String(data[i][1]);

        DB.saveDB(DB.makeDBPath(room+"/"+RANK+"/"+name), data);
    },

    showRank: function(title, data) {
        let show = "< "+title+" >\n\n";

        for(let i=0; i<data.length; i++)
            show += "("+String(i+1)+") "+String(data[i][0])+": "+String(data[i][1])+'\n';

        return show;
    },

    showMsgRank: function(room) {
        Rank.loadRank(room, msgRankList, TALK);
        return Rank.showRank(RANK+": 수다쟁이", msgRankList.get(room));
    },

    showImgRank: function(room) {
        Rank.loadRank(room, imgRankList, PICTURE);
        return Rank.showRank(RANK+": 사진을 많이 보낸 사람", imgRankList.get(room));
    },

    showEmoticonRank: function(room) {
        Rank.loadRank(room, emoticonRankList, EMOTICON);
        return Rank.showRank(RANK+": 임티를 많이 보낸 사람", emoticonRankList.get(room));
    },

    showNyanBotRank: function(room) {
        Rank.loadRank(room, nyanBotRankList, NYAN_BOT);
        return Rank.showRank(RANK+": 화냥봇을 많이 부른 사람", nyanBotRankList.get(room));
    },

    showLRank: function(room) {
        Rank.loadRank(room, LRankList, L);
        return Rank.showRank(RANK+": L을 많이 부른 사람", LRankList.get(room));
    },

    showEatRank: function(room) {
        Rank.loadRank(room, eatRankList, EAT);
        return Rank.showRank(RANK+": 먹보", eatRankList.get(room));
    },

    showVomitRank: function(room) {
        Rank.loadRank(room, vomitRankList, VOMIT);
        return Rank.showRank(RANK+": 퉤엣을 많이 한 사람", vomitRankList.get(room));
    },

    showRunRank: function(room) {
        Rank.loadRank(room, runRankList, ESCAPE);
        return Rank.showRank(RANK+": 도망자", runRankList.get(room));
    },

    showEatDmgRank: function(room) {
        Rank.loadRank(room, eatDmgRankList, EATEN);
        return Rank.showRank(RANK+": 꿀꺽당한 희생자", eatDmgRankList.get(room));
    },

    showVomitDmgRank: function(room) {
        Rank.loadRank(room, vomitDmgRankList, VOMITED);
        return Rank.showRank(RANK+": 퉤엣당한 희생자", vomitDmgRankList.get(room));
    },

    updateEatBattleRank: function(room, rankList, name) {
        let data = Rank.loadRank(room, rankList, name);
        while(data.length > 0) data.pop();

        let eatData = Rank.loadRank(room, eatRankList, EAT);
        let eatDmgData = Rank.loadRank(room, eatDmgRankList, EATEN);

        for(let i of eatData)
            data.push([i[0], Number(i[1])]);

        for(let i of eatDmgData) {
            let inName = false;

            for(let j=0; j<data.length; j++) {
                if(data[j][0] == i[0]) {
                    data[j][1] -= Number(i[1]);
                    inName = true;
                    break;
                }
            }

            if(!inName)
                data.push([i[0], -Number(i[1])]);
        }

        data.sort((a, b) => b[1]-a[1]);

        for(let i=0; i<data.length; i++)
            data[i][1] = String(data[i][1]);

        DB.saveDB(DB.makeDBPath(room+"/"+RANK+"/"+name), data);
    },

    showEatBattleRank: function(room) {
        Rank.updateEatBattleRank(room, eatBattleRankList, EAT_VS);
        return Rank.showRank(RANK+": 꿀꺽 대결 (먹은 수 - 먹힌 수)", eatBattleRankList.get(room));
    }
};

const User = {
    loadUserInfo: function(room, who, userInfoList, name) {
        if(!userInfoList.has(room))
            userInfoList.set(room, new Map());

        if(!userInfoList.get(room).has(who))
            userInfoList.get(room).set(who, DB.loadDBAndSplit(DB.makeDBPath(room+"/"+USER+"/"+who+"/"+name)));

        return userInfoList.get(room).get(who);
    },

    pushEatPocket: function(room, sender, target) {
        let data = User.loadUserInfo(room, sender, eatPocket, EAT_POCKET);

        data.push([target]);

        while(data.length > eatPocketLimit+1)
            data.shift();

        DB.saveDB(DB.makeDBPath(room+"/"+USER+"/"+sender+"/"+EAT_POCKET), data);
    },

    popEatPocket: function(room, sender) {
        let data = User.loadUserInfo(room, sender, eatPocket, EAT_POCKET);

        let top = data.pop();
        DB.saveDB(DB.makeDBPath(room+"/"+USER+"/"+sender+"/"+EAT_POCKET), data);

        if(!top)
            return undefined;

        return top[0];
    },

    clearEatPocket: function(room, sender) {
        let data = User.loadUserInfo(room, sender, eatPocket, EAT_POCKET);
        while(data.pop());

        DB.saveDB(DB.makeDBPath(room+"/"+USER+"/"+sender+"/"+EAT_POCKET), data);
    }
};

const CMD = {
    learn: function(room, query, sender) {
        let A = query[1], B = "";
        let forbad = false;

        for(let i=2; i<query.length; i++) B += query[i]+"/";
        B = B.substring(0, B.length-1);

        // A가 금지어인지 확인
        for(let i of forbiddenWords) {
            if(A.toUpperCase() == i.toUpperCase()) {
                forbad = true;
                break;
            }
        }

        // A 안에 금지기호가 있는지 확인
        for(let i of forbiddenSigns) {
            if(A.indexOf(i) != -1 || B.indexOf(i) != -1) {
                forbad = true;
                break;
            }
        }

        // A의 맨 앞 or 맨 뒤 문자가 공백인지 확인
        for(let i of spaces) {
            if(A[0] == i) {
                forbad = true;
                break;
            }

            if(A[A.length-1] == i) {
                forbad = true;
                break;
            }
        }

        if(A.length <= 1 || B.length == 0)
            return "너무 짧다냥!";

        if(forbad)
            return "냥습할 수 없다냥!";

        let data = learnList.get(room);
        let learned = false;

        for(let i=0; i<data.length; i++) {
            // 학습한게 있으면 learnList[room] 안에 있는 학습데이터 덮어쓰기
            if(A == data[i][0]) {
                data[i][1] = B;
                data[i][2] = sender;
                learned = true;
                break;
            }
        }

        if(!learned)
            data.push([A, B, sender]);

        DB.saveDB(DB.makeDBPath(room+"/"+LEARNING), data);
        return "냥!";
    },

    confirmLearn: function(room, query) {
        let data = learnList.get(room);
        let A = query[1];

        for(let i=0; i<data.length; i++) {
            // 학습한게 있으면 학습데이터 출력
            if(A == data[i][0])
                return data[i][1]+", "+data[i][2]+"님이 냥습시켰다냥!";
        }

        return "냥습한게 없다냥!";
    },

    del: function(room, query) {
        let data = learnList.get(room);
        let A = query[1];

        for(let i=0; i<data.length; i++) {
            // 학습한게 있으면 삭제
            if(A == data[i][0]) {
                data.splice(i, 1);
                DB.saveDB(DB.makeDBPath(room+"/"+LEARNING), data);
                return "냥!";
            }
        }

        return "냥습한게 없다냥!";
    },

    showPrevMsg: function(room, query) {
        let A = Number(query[1]);
        let data = msgList.get(room);

        if(!Number.isInteger(A))
            return "정수가 아니다냥!";

        // !(0 <= A < data.length)
        if(!(0 <= A && data.length-(A+1) >= 0))
            return "수가 범위를 초과했다냥!";

        return data[data.length-(A+1)][0]+", "+data[data.length-(A+1)][1]+"님이다냥!";
    },

    showPhoneInfo: function(query) {
        let A = query[1];

        if(A == VERSION)
            return "ver"+Device.getAndroidVersionName()+" 이다냥!";

        if(A == BATTERY) {
            if(Device.getBatteryLevel() == 100) return "풀 차지 상태다냥!!";
            return Device.getBatteryLevel()+"% 남았다냥!";
        }

        if(A == VOLTAGE)
            return Device.getBatteryVoltage()+"mV 이다냥!";

        if(A == TEMPERATURE)
            return Device.getBatteryTemperature()/10+"℃ 이다냥!";

        if(A == IS_CHARGING) {
            if(Device.isCharging()) return "충전 중이다냥!";
            return "충전 중이 아니다냥!";
        }

        return "이 정보는 1급기밀이다냥!";
    },

    showRank: function(room, query) {
        let A = query[1];

        if(A == TALK) return Rank.showMsgRank(room);
        if(A == PICTURE) return Rank.showImgRank(room);
        if(A == EMOTICON) return Rank.showEmoticonRank(room);
        if(A == NYAN_BOT) return Rank.showNyanBotRank(room);
        if(A == L) return Rank.showLRank(room);
        if(A == EAT) return Rank.showEatRank(room);
        if(In(A, VOMIT_LIST)) return Rank.showVomitRank(room);
        if(A == ESCAPE) return Rank.showRunRank(room);
        if(A == EATEN) return Rank.showEatDmgRank(room);
        if(In(A, VOMITED_LIST)) return Rank.showVomitDmgRank(room);
        if(A == EAT_VS) return Rank.showEatBattleRank(room);

        return "그런 순위는 없다냥!";
    },

    showLearnList: function(room) {
        let data = learnList.get(room);
        let show = "< "+LEARNING_LIST+" >\n\n";

        for(let i=0; i<data.length; i++)
            show += "("+String(i+1)+") "+String(data[i][0])+"/"+String(data[i][2])+'\n';

        return show;
    },

    showToday: function() {
        const now = new Date();
        return now.getFullYear()+"년 "+(now.getMonth()+1)+"월 "+now.getDate()+"일이다냥!";
    },

    showTodayDay: function() {
        const now = new Date();
        return day[now.getDay()]+"요일이다냥!";
    },

    sayHello: function(sender) {
        return sender+"님 "+choose(["환영한다냥!", "반갑다냥!", "어서오라냥!"]);
    },

    responseNyanBot: function() {
        return choose(["냥?", "냐앙?", "왜 불렀냥?", "무슨 일이냥?"]);
    },

    playRSP: function(query) {
        let me = query[1];

        if(me == SCISSOR) me = 1;
        else if(me == ROCK) me = 0;
        else if(me == PAPER) me = 2;
        else return "무엇을 낸 거냥?";

        let bot = Math.floor(Math.random()*3);
        const res = resRSP[bot][me];

        if(bot == 0) bot = ROCK;
        else if(bot == 1) bot = SCISSOR;
        else bot = PAPER;

        if(res == 'tie') return bot+"! "+choose(["무승부다냥!", "비겼다냥!"]);
        if(res == 'bot') return bot+"! 내가 이겼다냥!";
        return bot+"! 내가 졌다냥..";
    },

    eat: function(room, sender) {
        let data = msgList.get(room);
        let target = findTarget(room);

        if(!target)
            return "꿀꺽할 사람이 없다냥!";

        if(target == sender)
            return "자신을 꿀꺽할 수 없다냥!";

        if(Math.floor(Math.random()*eatFailPercent) == 0) {
            Rank.updateRank(room, target, runRankList, ESCAPE);
            return target+"님을 꿀꺽하려고 했지만, 도망갔다냥!";
        }

        User.pushEatPocket(room, sender, target);
        Rank.updateRank(room, sender, eatRankList, EAT);
        Rank.updateRank(room, target, eatDmgRankList, EATEN);

        return target+"님을 꿀꺽했다냥!";
    },

    vomit: function(room, sender) {
        let target = User.popEatPocket(room, sender);

        if(!target)
            return "꿀꺽주머니에 아무것도 없다냥!";

        Rank.updateRank(room, sender, vomitRankList, VOMIT);
        Rank.updateRank(room, target, vomitDmgRankList, VOMITED);

        return target+"님을 뱉었다냥!";
    },

    showEatPocket: function(room, sender) {
        let data = User.loadUserInfo(room, sender, eatPocket, EAT_POCKET);
        let show = "< "+sender+"님의 꿀꺽주머니 >\n\n";

        for(let i=data.length-1; i>=0; i--)
            show += "("+String(data.length-i)+") "+String(data[i][0])+'\n';

        return show;
    },

    digest: function(room, sender) {
        let data = User.loadUserInfo(room, sender, eatPocket, EAT_POCKET);

        if(!data.length)
            return "꿀꺽주머니에 아무것도 없다냥!";

        User.clearEatPocket(room, sender);

        return "소화제를 사용해서 강제로 소화했다냥!";
    },

    makeEmoji: function(query) {
        let A = query[1];

        if(!(1 <= A.length && A.length <= emojiLenLimit))
            return ["길이는 "+"1~"+emojiLenLimit+" 사이여야 한다냥!"];

        let emojiList = [];
        for(let i of A) emojiList.push(i+String.fromCharCode(8205));

        return emojiList;
    },

    PI: function() {
        return PI_1000+" 이다냥!";
    }
};

function isRoomPrefix(room, prefix) {
    return room.substring(0, prefix.length) == prefix;
}

function In(s, l) {
    for(let i of l)
        if(s == i)
            return true;
    
    return false;
}

function choose(list) {
    const r = Math.floor(Math.random()*list.length);
    return list[r];
}

function findTarget(room) {
    let data = msgList.get(room);

    for(let i=data.length-2; i>=0; i--)
        if(!In(data[i][1], LNames))
            return data[i][1];

    return undefined;
}

function parseLearnDataValue(room, sender, value) {
    target = findTarget(room);

    value = value.replace("[m]", sender)
                 .replace("[y]", target ? target : sender);

    return value;
}

nyanLang = DB.loadDB(DB.makeDBPath(NYAN_FILES+"/"+NYAN_LANG));
forbiddenWords = DB.loadDBAndSplit(DB.makeDBPath(NYAN_FILES+"/"+FORBIDDEN_WORD))[0];

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    /**
     * 화냥봇이 참가하고 있는 room이 다음 조건들 중 하나를 만족해야 반응
     *     room이 화이트냥
     *     room의 접두사가 [WN]
     */
    if(room == master || isRoomPrefix(room, "[WN]")) {
        if(!learnList.has(room))
            learnList.set(room, DB.loadDBAndSplit(DB.makeDBPath(room+"/"+LEARNING)));

        if(!msgList.has(room))
            msgList.set(room, DB.loadDBAndSplit(DB.makeDBPath(room+"/"+MSG)));

        msgList.get(room).push([msg, sender]);

        while(msgList.get(room).length > msgListLimit+1)
            msgList.get(room).shift();

        DB.saveDB(DB.makeDBPath(room+"/"+MSG), msgList.get(room));

        // L의 메시지에 반응하지 않음 (특정 메시지는 제외)
        if(In(sender, LNames)) {
            let data = msgList.get(room);

            // L이 똑같은 메시지를 계속 보내서 무한정 반응해버리는 현상 방지
            if(!(data.length-2 >= 0 && In(data[data.length-2][1], LNames))) {
                // L이 특정 메시지를 보내면 반응
                if(msg == NYAN_BOT+"님, 죽어주세요 !")
                    replier.reply("꾸에에엑");
                else if(msg.indexOf(NYAN_BOT+"님") != -1)
                    replier.reply("냥!?");
            }

            return;
        }

        if(msg == "사진을 보냈습니다.")
            Rank.updateRank(room, sender, imgRankList, PICTURE);
        else if(msg == "이모티콘을 보냈습니다.")
            Rank.updateRank(room, sender, emoticonRankList, EMOTICON);
        else
            Rank.updateRank(room, sender, msgRankList, TALK);

        let query = msg.split('/');

        if(query[0] == LEARNING) {
            if(query.length >= 3)
                replier.reply(CMD.learn(room, query, sender)); // 학습시키기
            else if(query.length == 2)
                replier.reply(CMD.confirmLearn(room, query)); // 학습했는지 확인
        }
        else if(query[0] == DEL) {
            if(query.length >= 2)
                replier.reply(CMD.del(room, query)); // 학습한거 삭제
        }
        else if(query[0] == TALK) {
            if(query.length >= 2)
                replier.reply(CMD.showPrevMsg(room, query)); // 이전 메시지 보여주기
        }
        else if(query[0] == PHONE) {
            if(query.length >= 2)
                replier.reply(CMD.showPhoneInfo(query)); // 화냥폰 정보 보여주기
        }
        else if(query[0] == RANK) {
            if(query.length >= 2)
                replier.reply(CMD.showRank(room, query)); // 순위 보여주기
        }
        else if(In(query[0], RSP)) {
            if(query.length >= 2)
                replier.reply(CMD.playRSP(query)); // 가위바위보를 하기
        }
        else if(msg == NYAN_LANG) {
            replier.reply(nyanLang); // 명령어 목록 보여주기
        }
        else if(msg == LEARNING_LIST) {
            replier.reply(CMD.showLearnList(room)); // 학습 목록 보여주기
        }
        else if(msg == TODAY) {
            replier.reply(CMD.showToday()); // 오늘 날짜 보여주기
        }
        else if(msg == TODAY_DAY) {
            replier.reply(CMD.showTodayDay()); // 오늘 요일 보여주기
        }
        else if(In(msg, HELLO_LIST)) {
            replier.reply(CMD.sayHello(sender)); // 인사하기
        }
        else if(msg == NYAN_BOT) {
            replier.reply(CMD.responseNyanBot()); // 화냥봇을 부르면 반응하기
            Rank.updateRank(room, sender, nyanBotRankList, NYAN_BOT);
        }
        else if(In(msg, LNames)) {
            Rank.updateRank(room, sender, LRankList, L);
        }
        else if(msg == YOUR_NAME) {
            replier.reply(NYAN_BOT+"이다냥! "+master+"님이 만들었다냥!"); // 화냥봇의 이름 말하기
        }
        else if(msg == MY_NAME) {
            replier.reply(sender+"님이다냥!"); // 메시지 보낸 사람의 이름 말하기
        }
        else if(msg == EAT) {
            replier.reply(CMD.eat(room, sender)); // 가장 최근에 메시지를 보낸 사람을 꿀꺽하기
        }
        else if(In(msg, VOMIT_LIST)) {
            replier.reply(CMD.vomit(room, sender)); // 가장 최근에 꿀꺽한 사람을 퉤엣하기
        }
        else if(msg == EAT_POCKET) {
            replier.reply(CMD.showEatPocket(room, sender)); // 꿀꺽주머니 보여주기
        }
        else if(msg == DIGESTION) {
            replier.reply(CMD.digest(room, sender)); // 소화하기
        }
        else if(query[0] == EMOJI) {
            if(query.length >= 2)
                for(let i of CMD.makeEmoji(query))
                    replier.reply(i); // 글자 이모지 만들기
        }
        else if(msg.toUpperCase() == PI) {
            replier.reply(CMD.PI()); // PI 보여주기
        }
        else {
            let data = learnList.get(room);

            for(let i=0; i<data.length; i++) {
                if(msg == data[i][0]) {
                    replier.reply(parseLearnDataValue(room, sender, data[i][1])); // 메시지가 오면 학습데이터에 따라 반응하기
                    break;
                }
            }
        }
    }
}

//아래 4개의 메소드는 액티비티 화면을 수정할때 사용됩니다.
function onCreate(savedInstanceState, activity) {
    var textView = new android.widget.TextView(activity);
    textView.setText("Hello, World!");
    textView.setTextColor(android.graphics.Color.DKGRAY);
    activity.setContentView(textView);
}

function onStart(activity) {}

function onResume(activity) {}

function onPause(activity) {}

function onStop(activity) {}