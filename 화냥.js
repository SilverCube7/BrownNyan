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
let learnList = [];
const msgList = new Map();
const msgListLimit = 500;
const eatFailPercent = 3; // 꿀꺽 실패 확률이 1/eatFailPercent
const eatPocketLimit = 100;
const factorialLimit = 100;
const C = [];
const PI_1000 = DataBase.getDataBase(makeDBPath("NyanFiles/파이"));

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

const eatPocket = new Map();

const LNames = ["L", "l", "엘", "死神", "사신"];

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

const expressions = [
    "{int}!",
    "{int}P{int}",
    "{int}C{int}",
    "{int}π{int}",
    "{int}^{int}",
    "{int}H{int}",
    "C{int}",
    "sin{number}",
    "cos{number}",
    "tan{number}",
    "asin{number}",
    "acos{number}",
    "atan{number}",
    "log{number}",
    "ln{number}",
    "sqrt{number}",
    "abs{number}"
];

function makeDBPath(p) {
    return "./"+p+".txt";
}

function loadDB(path) {
    let txt = DataBase.getDataBase(path);

    if(txt == null)
        txt = "";

    return txt;
}

/**
 * < DB의 토큰 종류 >
 * {enter}: '\n'을 의미
 * {space}: ' '을 의미
 */

function loadDBAndSplit(path) {
    let list = loadDB(path);

    if(list == "")
        return [];

    list = list.split("{enter}");

    for(let i=0; i<list.length; i++)
        list[i] = list[i].split("{space}");

    return list;
}

function saveDB(path, list) {
    let txt = "";

    for(let i=0; i<list.length; i++) {
        // XXX: 왜 가끔 list[i]가 undefined 되는거지?
        if(list[i] == undefined) {
            Log.e("Runtime Error\nTypeError: Cannot read property \"length\" from undefined\nPath: "+path);
            return;
        }

        for(let j=0; j<list[i].length; j++) {
            txt += list[i][j];

            if(j != list[i].length-1)
                txt += "{space}";
        }

        if(i != list.length-1)
            txt += "{enter}";
    }

    DataBase.setDataBase(path, txt);
}

function loadForbiddenWords() {
    const path = makeDBPath("NyanFiles/냥습금지어");
    forbiddenWords = DataBase.getDataBase(path);

    if(forbiddenWords == null || forbiddenWords == "") {
        forbiddenWords = [];
        return;
    }

    forbiddenWords = forbiddenWords.split("{enter}");

    for(let i=0; i<forbiddenWords.length; i++) {
        forbiddenWords[i] = forbiddenWords[i].replace('\n', '');
        forbiddenWords[i] = forbiddenWords[i].replace('\r', '');
    }
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

/**
 * 문자열 s1이 표현식 s2와 같은 구조인지 확인하는 함수
 * 
 * < 표현식 문법 >
 * {int}: 정수
 * {number}: 실수
 * 
 * < 주의! >
 * 여는 중괄호를 해줬으면 닫는 중괄호도 해줘야 오류 안 남
 */
function isCondExp(s1, s2) {
    let l1 = [], l2 = [];

    // s1 파싱
    for(let i=0; i<s1.length; i++) {
        let s = "";

        if(Number.isInteger(Number(s1[i]))) {
            let inDot = false;

            // Number로 형 변환 했을 때 정수 또는 실수가 되는 [i, j) 부분문자열 추출
            let j = i;
            for(; (j<s1.length && (Number.isInteger(Number(s1[j])) || (s1[j] == '.' && !inDot && j+1<s1.length && Number.isInteger(Number(s1[j+1]))))); j++) {
                s += s1[j];

                if(s1[j] == '.')
                    inDot = true;
            }

            i = j-1;
        } else if(s1.substring(i, i+2).toUpperCase() == 'PI') {
            // PI 추출
            s = String(Math.PI);
            i++;
        } else if(s1[i].toUpperCase() == 'E') {
            // E 추출
            s = String(Math.E);
        } else {
            // 그 외 [i, j) 부분문자열 추출
            let j = i;
            for(; (j<s1.length && !Number.isInteger(Number(s1[j])) && s1.substring(j, j+2).toUpperCase()!='PI' && s1[j].toUpperCase()!='E'); j++)
                s += s1[j];

            i = j-1;
        }

        // 음수 처리
        if(Number.isFinite(Number(s)) && l1.length >= 1) {
            let last = l1[l1.length-1];

            if(last[last.length-1] == '-') {
                l1[l1.length-1] = last.substring(0, last.length-1);

                if(l1[l1.length-1] == '')
                    l1.pop();

                s = '-'+s;
            }
        }

        l1.push(s);
    }

    // s2 파싱
    for(let i=0; i<s2.length; i++) {
        let s = "";

        if(s2[i] == '{') {
            let j = i;
            for(; s2[j]!='}'; j++)
                s += s2[j];

            s += '}';
            i = j;
        } else {
            let j = i;
            for(; (j<s2.length && s2[j]!='{'); j++)
                s += s2[j];

            i = j-1;
        }

        l2.push(s);
    }

    // s1이 s2와 같은 구조인지 확인해서 참 or 거짓 반환

    if(l1.length != l2.length)
        return false;

    for(let i=0; i<l1.length; i++) {
        if(l2[i] == "{int}") {
            if(!Number.isInteger(Number(l1[i])))
                return false;
        } else if(l2[i] == "{number}") {
            if(!Number.isFinite(Number(l1[i])))
                return false;
        } else {
            if(l1[i] != l2[i])
                return false;
        }
    }

    return true;
}

/**
 * 문자열을 수로 변환하는 함수
 * PI, E는 해당 상수로 자동 변환
 */
function ston(s) {
    s = s.toUpperCase();

    // PI 변환
    if(s.substring(s.length-2) == 'PI')
        s = s.substring(0, s.length-2)+Math.PI;

    // E 변환
    if(s[s.length-1] == 'E')
        s = s.substring(0, s.length-1)+Math.E;

    return Number(s);
}

function init_nCr() {
    // 배열 C 초기화
    for(let i=0; i<=factorialLimit; i++) {
        C.push([]);

        for(let j=0; j<=factorialLimit; j++)
            C[i].push(0);
    }

    // 배열 C 채우기
    for(let i=0; i<=factorialLimit; i++) {
        C[i][0] = 1;

        for(let j=1; j<=i; j++)
            C[i][j] = C[i-1][j-1]+C[i-1][j];
    }
}

function cmd_learn(query, sender) {
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

    // A의 맨 앞 문자 or 맨 뒤 문자가 공백인지 확인
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

    // A가 특정 표현식을 만족하는지 확인
    for(let i of expressions) {
        if(isCondExp(A, i)) {
            forbad = true;
            break;
        }
    }

    // A or B가 너무 짧으면 안 됨
    if(A.length <= 1 || B.length == 0)
        return "너무 짧다냥!";

    // A가 금지어이거나 특정 표현식을 만족하거나 A 안에 금지기호가 있으면 안 됨
    if(forbad)
        return "냥습할 수 없다냥!";

    let learned = false;

    for(let i=0; i<learnList.length; i++) {
        // 학습한게 있으면 learnList 안에 있는 학습데이터 덮어쓰기
        if(A == learnList[i][0]) {
            learnList[i][1] = B;
            learnList[i][2] = sender;
            learned = true;
            break;
        }
    }

    // 학습한게 없으면 learnList에 학습데이터 추가
    if(!learned)
        learnList.push([A, B, sender]);

    saveDB(makeDBPath("냥습"), learnList);
    return "냥!";
}

function cmd_confirmLearn(query) {
    let A = query[1];

    for(let i=0; i<learnList.length; i++) {
        // 학습한게 있으면 학습데이터 출력
        if(A == learnList[i][0])
            return learnList[i][1]+", "+learnList[i][2]+"님이 냥습시켰다냥!";
    }

    return "냥습한게 없다냥!";
}

function cmd_del(query) {
    let A = query[1];

    for(let i=0; i<learnList.length; i++) {
        // 학습한게 있으면 삭제
        if(A == learnList[i][0]) {
            learnList.splice(i, 1);
            saveDB(makeDBPath("냥습"), learnList);
            return "냥!";
        }
    }

    return "냥습한게 없다냥!";
}

function cmd_prvMsg(room, query) {
    let A = Number(query[1]);
    let data = msgList.get(room);

    // A가 정수여야 함
    if(!Number.isInteger(A))
        return "정수가 아니다냥!";

    // A가 [0, data.length) 범위 안에 있어야 함
    if(!(0 <= A && data.length-(A+1) >= 0))
        return "수가 범위를 초과했다냥!";

    // 이전 메시지 출력
    return data[data.length-(A+1)][0]+", "+data[data.length-(A+1)][1]+"님이다냥!";
}

function cmd_phone(query) {
    let A = query[1];

    if(A == "버전")
        return "ver"+Device.getAndroidVersionName()+" 이다냥!";

    if(A == "배터리") {
        if(Device.getBatteryLevel() == 100)
            return "풀 차지 상태다냥!!";

        return Device.getBatteryLevel()+"% 남았다냥!";
    }

    if(A == "전압")
        return Device.getBatteryVoltage()+"mV 이다냥!";

    if(A == "온도")
        return Device.getBatteryTemperature()/10+"℃ 이다냥!";

    if(A == "충전중?") {
        if(Device.isCharging())
            return "충전 중이다냥!";

        return "충전 중이 아니다냥!";
    }

    return "이 정보는 1급기밀이다냥!";
}

function cmd_rank(room, query) {
    let A = query[1];

    if(A == "말") return msgRank(room);
    if(A == "사진") return imgRank(room);
    if(A == "임티") return emoticonRank(room);
    if(A == "화냥봇") return nyanBotRank(room);
    if(A == "L") return rankL(room);
    if(A == "꿀꺽") return eatRank(room);
    if(A == "퉤엣") return vomitRank(room);
    if(A == "도망") return runRank(room);
    if(A == "꿀꺽당햇") return eatDmgRank(room);
    if(A == "퉤엣당햇") return vomitDmgRank(room);

    return "그런 순위는 없다냥!";
}

function loadRank(room, rankList, name) {
    if(!rankList.has(room))
        rankList.set(room, loadDBAndSplit(makeDBPath(room+"/순위/"+name)));

    return rankList.get(room);
}

function updateRank(room, who, rankList, name, cnt) {
    if(cnt == undefined)
        cnt = 1;

    let data = loadRank(room, rankList, name);

    // 문자열 데이터를 수로 변환
    for(let i=0; i<data.length; i++)
        data[i][1] = Number(data[i][1]);

    let inName = false;

    // who를 찾아서 cnt 만큼 횟수 증가
    for(let i=0; i<data.length; i++) {
        if(data[i][0] == who) {
            data[i][1] += cnt;
            inName = true;
            break;
        }
    }

    // who가 없으면 데이터 추가
    if(!inName)
        data.push([who, cnt]);

    // 횟수가 큰 순으로 정렬
    data.sort((a, b) => b[1]-a[1]);

    // 수 데이터를 문자열로 변환
    for(let i=0; i<data.length; i++)
        data[i][1] = String(data[i][1]);

    saveDB(makeDBPath(room+"/순위/"+name), data);
}

function showRank(title, data) {
    let show = "< "+title+" >\n\n";

    for(let i=0; i<data.length; i++)
        show += "("+String(i+1)+") "+String(data[i][0])+": "+String(data[i][1])+'\n';

    return show;
}

function msgRank(room) {
    loadRank(room, msgRankList, "말");
    return showRank("수다쟁이 순위", msgRankList.get(room));
}

function imgRank(room) {
    loadRank(room, imgRankList, "사진");
    return showRank("사진가 순위", imgRankList.get(room));
}

function emoticonRank(room) {
    loadRank(room, emoticonRankList, "임티");
    return showRank("임티뿅 순위", emoticonRankList.get(room));
}

function nyanBotRank(room) {
    loadRank(room, nyanBotRankList, "화냥봇");
    return showRank("외쳐 화냥봇 순위", nyanBotRankList.get(room));
}

function rankL(room) {
    loadRank(room, LRankList, "L");
    return showRank("외쳐 L 순위", LRankList.get(room));
}

function eatRank(room) {
    loadRank(room, eatRankList, "꿀꺽");
    return showRank("먹보 순위", eatRankList.get(room));
}

function vomitRank(room) {
    loadRank(room, vomitRankList, "퉤엣");
    return showRank("퉤엣 순위", vomitRankList.get(room));
}

function runRank(room) {
    loadRank(room, runRankList, "도망");
    return showRank("도망자 순위", runRankList.get(room));
}

function eatDmgRank(room) {
    loadRank(room, eatDmgRankList, "꿀꺽당햇");
    return showRank("꿀꺽 희생자 순위", eatDmgRankList.get(room));
}

function vomitDmgRank(room) {
    loadRank(room, vomitDmgRankList, "퉤엣당햇");
    return showRank("퉤엣 희생자 순위", vomitDmgRankList.get(room));
}

function cmd_learnList() {
    let show = "< 냥습목록 >\n\n";

    for(let i=0; i<learnList.length; i++)
        show += "("+String(i+1)+") "+String(learnList[i][0])+"/"+String(learnList[i][2])+'\n';

    return show;
}

function cmd_today() {
    const now = new Date();
    return now.getFullYear()+"년 "+(now.getMonth()+1)+"월 "+now.getDate()+"일이다냥!";
}

function cmd_todayDay() {
    const now = new Date();
    return day[now.getDay()]+"요일이다냥!";
}

function cmd_hello(sender) {
    return sender+"님 "+choose(["환영한다냥!", "반갑다냥!", "어서오라냥!"]);
}

function cmd_nyanBot() {
    return choose(["냥?", "냐앙?", "왜 불렀냥?", "무슨 일이냥?"]);
}

function cmd_rsp(query) {
    let me = query[1];

    if(me == '가위') me = 1;
    else if(me == '바위') me = 0;
    else if(me == '보') me = 2;
    else return "무엇을 낸거냥?";

    let bot = Math.floor(Math.random()*3);
    const res = resRSP[bot][me];

    if(bot == 0) bot = '바위';
    else if(bot == 1) bot = '가위';
    else bot = '보';

    // 비김
    if(res == 'tie')
        return bot+"! "+choose(["무승부다냥!", "비겼다냥!"]);

    // 봇이 이김
    if(res == 'bot')
        return bot+"! 내가 이겼다냥!";

    // 봇이 짐
    return bot+"! 내가 졌다냥..";
}

function cmd_test(query) {
    let A = query[1];

    // 테스트/냥습/A/B/sender
    if(A == "냥습")
        return cmd_learn(query.slice(1), query[4]);

    // 테스트/정보로그/A
    if(A == "정보로그") {
        Log.i(query[2]);
        return "정보로그!";
    }

    // 테스트/로그클리어
    if(A == "로그클리어") {
        Log.clear();
        return "로그클리어!";
    }

    return "테스트!";
}

function loadUserInfo(room, who, userInfoList, name) {
    if(!userInfoList.has(room))
        userInfoList.set(room, new Map());

    if(!userInfoList.get(room).has(who))
        userInfoList.get(room).set(who, loadDBAndSplit(makeDBPath(room+"/유저/"+who+"/"+name)));

    return userInfoList.get(room).get(who);
}

function pushEatPocket(room, sender, target) {
    let data = loadUserInfo(room, sender, eatPocket, "꿀꺽주머니");

    data.push([target]);

    // data의 길이는 eatPocketLimit를 넘을 수 없음
    while(data.length > eatPocketLimit+1)
        data.shift();

    saveDB(makeDBPath(room+"/유저/"+sender+"/꿀꺽주머니"), data);
}

function popEatPocket(room, sender) {
    let data = loadUserInfo(room, sender, eatPocket, "꿀꺽주머니");

    let top = data.pop();
    saveDB(makeDBPath(room+"/유저/"+sender+"/꿀꺽주머니"), data);

    if(top == undefined)
        return undefined;

    return top[0];
}

function cmd_eat(room, sender) {
    let data = msgList.get(room);
    let target = null;

    for(let i=data.length-2; i>=0; i--) {
        // L을 제외한 사람을 꿀꺽 목표로 지정
        if(!In(data[i][1], LNames)) {
            target = data[i][1];
            break;
        }
    }

    // 꿀꺽 목표가 없음
    if(target == null)
        return "꿀꺽할 사람이 없다냥!";

    // 자신을 꿀꺽할 수 없음
    if(target == sender)
        return "자신을 꿀꺽할 수 없다냥!";

    // 꿀꺽 실패
    if(Math.floor(Math.random()*eatFailPercent) == 0) {
        updateRank(room, target, runRankList, "도망");
        return target+"님을 꿀꺽하려고 했지만, 도망갔다냥!";
    }

    pushEatPocket(room, sender, target);
    updateRank(room, sender, eatRankList, "꿀꺽");
    updateRank(room, target, eatDmgRankList, "꿀꺽당햇");

    return target+"님을 꿀꺽했다냥!";
}

function cmd_vomit(room, sender) {
    let data = loadUserInfo(room, sender, eatPocket, "꿀꺽주머니");
    let target = popEatPocket(room, sender);

    if(target == undefined)
        return "꿀꺽주머니에 아무것도 없다냥!";

    updateRank(room, sender, vomitRankList, "퉤엣");
    updateRank(room, target, vomitDmgRankList, "퉤엣당햇");

    return target+"님을 뱉었다냥!";
}

function cmd_eatPocket(room, sender) {
    let data = loadUserInfo(room, sender, eatPocket, "꿀꺽주머니");
    let show = "< "+sender+"님의 꿀꺽주머니 >\n\n";

    for(let i=data.length-1; i>=0; i--)
        show += "("+String(data.length-i)+") "+String(data[i][0])+'\n';

    return show;
}

function cmd_emoji(query) {
    let A = query[1];

    if(A.length != 1)
        return "한 글자여야 한다냥!";

    return A+String.fromCharCode(8205);
}

function retentionPeriod() {
    const now = new Date();
    const d = now.getDay();

    const a = new Date();
    const b = new Date();

    a.setDate(now.getDate()-d);
    b.setDate(now.getDate()-d+6);

    return [[a.getFullYear(), a.getMonth()+1, a.getDate()], [b.getFullYear(), b.getMonth()+1, b.getDate()]];
}

function cmd_retentionPeriod() {
    const r = retentionPeriod();
    const a = r[0][0]+"/"+r[0][1]+"/"+r[0][2];
    const b = r[1][0]+"/"+r[1][1]+"/"+r[1][2];

    let show = "매주 일요일마다 초기화된다냥!\n"+"( "+a+" ~ "+b+" )";

    // TODO: 보유기간목록도 보여줘야 함

    return show;
}

function cmd_factorial(msg) {
    let n = Number(msg.substring(0, msg.length-1));

    // n이 [0, factorialLimit] 범위 안에 있어야 함
    if(!(0 <= n && n <= factorialLimit))
        return "0~"+factorialLimit+" 사이의 수여야 한다냥!";

    return factorial(n)+" 이다냥!";
}

function factorial(n) {
    if(n <= 1) return 1;
    return n*factorial(n-1);
}

function cmd_nPr(msg) {
    let splitMsg = msg.split('P');
    let n = Number(splitMsg[0]), r = Number(splitMsg[1]);

    // n과 r이 [0, factorialLimit] 범위 안에 있어야 함
    if(!(0 <= n && n <= factorialLimit) || !(0 <= r && r <= factorialLimit))
        return "0~"+factorialLimit+" 사이의 수여야 한다냥!";

    return factorial(n)/factorial(n-r)+" 이다냥!";
}

function cmd_nCr(msg) {
    let splitMsg = msg.split('C');
    let n = Number(splitMsg[0]), r = Number(splitMsg[1]);

    // n과 r이 [0, factorialLimit] 범위 안에 있어야 함
    if(!(0 <= n && n <= factorialLimit) || !(0 <= r && r <= factorialLimit))
        return "0~"+factorialLimit+" 사이의 수여야 한다냥!";

    return C[n][r]+" 이다냥!";
}

function cmd_nπr(msg) {
    let splitMsg = msg.split('π');
    let n = Number(splitMsg[0]), r = Number(splitMsg[1]);

    // n과 r이 [0, factorialLimit] 범위 안에 있어야 함
    if(!(0 <= n && n <= factorialLimit) || !(0 <= r && r <= factorialLimit))
        return "0~"+factorialLimit+" 사이의 수여야 한다냥!";

    return Math.pow(n, r)+" 이다냥!";
}

function cmd_pow(msg) {
    let splitMsg = msg.split('^');
    let n = Number(splitMsg[0]), r = Number(splitMsg[1]);

    // n과 r이 [0, factorialLimit] 범위 안에 있어야 함
    if(!(0 <= n && n <= factorialLimit) || !(0 <= r && r <= factorialLimit))
        return "0~"+factorialLimit+" 사이의 수여야 한다냥!";

    return Math.pow(n, r)+" 이다냥!";
}

function cmd_nHr(msg) {
    let splitMsg = msg.split('H');
    let n = Number(splitMsg[0]), r = Number(splitMsg[1]);

    // n, r, n+r-1이 [0, factorialLimit] 범위 안에 있어야 함
    if(!(0 <= n && n <= factorialLimit) || !(0 <= r && r <= factorialLimit) || !(0 <= n+r-1 && n+r-1 <= factorialLimit))
        return "0 <= n, r, n+r-1 <= "+factorialLimit+" 을 만족해야 한다냥!";

    return cmd_nCr((n+r-1)+'C'+r);
}

function cmd_Cn(msg) {
    let n = Number(msg.substring(1));

    // 2n이 [0, factorialLimit] 범위 안에 있어야 함
    if(!(0 <= n*2 && n*2 <= factorialLimit))
        return "0 <= 2n <= "+factorialLimit+" 을 만족해야 한다냥!";

    let res = cmd_nCr(n*2+'C'+n).replace(" 이다냥!", "");
    return Number(res)/(n+1)+" 이다냥!";
}

function cmd_sin(msg) {
    const A = ston(msg.substring(3));
    return Math.sin(A)+" 이다냥!";
}

function cmd_cos(msg) {
    const A = ston(msg.substring(3));
    return Math.cos(A)+" 이다냥!";
}

function cmd_tan(msg) {
    const A = ston(msg.substring(3));
    return Math.tan(A)+" 이다냥!";
}

function cmd_asin(msg) {
    const A = ston(msg.substring(4));
    return Math.asin(A)+" 이다냥!";
}

function cmd_acos(msg) {
    const A = ston(msg.substring(4));
    return Math.acos(A)+" 이다냥!";
}

function cmd_atan(msg) {
    const A = ston(msg.substring(4));
    return Math.atan(A)+" 이다냥!";
}

function cmd_log(msg) {
    const A = ston(msg.substring(3));
    return Math.log10(A)+" 이다냥!";
}

function cmd_ln(msg) {
    const A = ston(msg.substring(2));
    return Math.log(A)+" 이다냥!";
}

function cmd_sqrt(msg) {
    const A = ston(msg.substring(4));
    return Math.sqrt(A)+" 이다냥!";
}

function cmd_abs(msg) {
    const A = ston(msg.substring(3));
    return Math.abs(A)+" 이다냥!";
}

function cmd_PI() {
    return PI_1000+" 이다냥!";
}

function cmd_E() {
    return Math.E+" 이다냥!";
}

// DB에 있는 데이터 불러오기
nyanLang = loadDB(makeDBPath("NyanFiles/냥냥어"));
loadForbiddenWords();
learnList = loadDBAndSplit(makeDBPath("냥습"));

init_nCr();

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    /**
     * 화냥봇이 참가하고 있는 room이 다음 조건들 중 하나를 만족해야 반응
     *     room이 화이트냥
     *     room의 접두사가 WN
     */
    if(room == master || room.substring(0, 2) == "WN") {
        // msgList[room]에 데이터가 없는 경우 DB에서 불러오기
        if(!msgList.has(room))
            msgList.set(room, loadDBAndSplit(makeDBPath(room+"/메시지")));

        msgList.get(room).push([msg, sender]);

        // msgList[room]의 길이는 msgListLimit를 넘을 수 없음
        while(msgList.get(room).length > msgListLimit+1)
            msgList.get(room).shift();

        saveDB(makeDBPath(room+"/메시지"), msgList.get(room));

        // L의 메시지에 반응하지 않음 (특정 메시지는 제외)
        if(In(sender, LNames)) {
            let data = msgList.get(room);

            // L이 똑같은 메시지를 계속 보내서 무한정 반응해버리는 현상 방지
            if(!(data.length-2 >= 0 && In(data[data.length-2][1], LNames))) {
                // L이 특정 메시지를 보내면 반응
                if(msg == "화냥봇님, 죽어주세요 !")
                    replier.reply("꾸에에엑");
                else if(msg.indexOf("화냥봇님") != -1)
                    replier.reply("냥!?");
            }

            return;
        }

        if(msg == "사진을 보냈습니다.")
            updateRank(room, sender, imgRankList, "사진");
        else if(msg == "이모티콘을 보냈습니다.")
            updateRank(room, sender, emoticonRankList, "임티");
        else
            updateRank(room, sender, msgRankList, "말");

        let query = msg.split('/');

        if(query[0] == "냥습") {
            if(query.length >= 3)
                replier.reply(cmd_learn(query, sender)); // 학습시키기
            else if(query.length == 2)
                replier.reply(cmd_confirmLearn(query)); // 학습했는지 확인
        }
        else if(query[0] == "삭제") {
            if(query.length >= 2)
                replier.reply(cmd_del(query)); // 학습한거 삭제
        }
        else if(query[0] == "말") {
            if(query.length >= 2)
                replier.reply(cmd_prvMsg(room, query)); // 이전 메시지 보여주기
        }
        else if(query[0] == "화냥폰") {
            if(query.length >= 2)
                replier.reply(cmd_phone(query)); // 화냥폰 정보 보여주기
        }
        else if(query[0] == "순위") {
            if(query.length >= 2)
                replier.reply(cmd_rank(room, query)); // 순위 보여주기
        }
        else if(In(query[0], ["가바보", "가위바위보"])) {
            if(query.length >= 2)
                replier.reply(cmd_rsp(query)); // 가위바위보를 하기
        }
        else if(query[0] == "테스트") {
            if(sender == master && query.length >= 2)
                replier.reply(cmd_test(query)); // 테스트!
        }
        else if(msg == "냥냥어") {
            replier.reply(nyanLang); // 명령어 목록 보여주기
        }
        else if(msg == "냥습목록") {
            replier.reply(cmd_learnList()); // 학습 목록 보여주기
        }
        else if(msg == "오늘은") {
            replier.reply(cmd_today()); // 오늘 날짜 보여주기
        }
        else if(msg == "요일은") {
            replier.reply(cmd_todayDay()); // 오늘 요일 보여주기
        }
        else if(In(msg, ["안녕", "안녕하세요"])) {
            replier.reply(cmd_hello(sender)); // 인사하기
        }
        else if(msg == "화냥봇") {
            replier.reply(cmd_nyanBot()); // 화냥봇을 부르면 반응하기
            updateRank(room, sender, nyanBotRankList, "화냥봇");
        }
        else if(In(msg, LNames)) {
            updateRank(room, sender, LRankList, "L");
        }
        else if(msg == "너의 이름은") {
            replier.reply("화냥봇이다냥! "+master+"님이 만들었다냥!"); // 화냥봇의 이름 말하기
        }
        else if(msg == "내 이름은") {
            replier.reply(sender+"님이다냥!"); // 메시지 보낸 사람의 이름 말하기
        }
        else if(msg == "꿀꺽") {
            replier.reply(cmd_eat(room, sender)); // 가장 최근에 메시지를 보낸 사람을 꿀꺽하기
        }
        else if(In(msg, ["퉤엣", "퉷"])) {
            replier.reply(cmd_vomit(room, sender)); // 가장 최근에 꿀꺽한 사람을 퉤엣하기
        }
        else if(msg == "꿀꺽주머니") {
            replier.reply(cmd_eatPocket(room, sender)); // 꿀꺽주머니 보여주기
        }
        else if(query[0] == "이모지") {
            if(query.length >= 2)
                replier.reply(cmd_emoji(query)); // 글자 이모지 만들기
        }
        else if(msg == "보유기간") {
            replier.reply(cmd_retentionPeriod()); // 보유기간 정보 보여주기
        }
        else if(isCondExp(msg, "{int}!")) {
            replier.reply(cmd_factorial(msg)); // n! 보여주기
        }
        else if(isCondExp(msg, "{int}P{int}")) {
            replier.reply(cmd_nPr(msg)); // nPr 보여주기
        }
        else if(isCondExp(msg, "{int}C{int}")) {
            replier.reply(cmd_nCr(msg)); // nCr 보여주기
        }
        else if(isCondExp(msg, "{int}π{int}")) {
            replier.reply(cmd_nπr(msg)); // nπr 보여주기
        }
        else if(isCondExp(msg, "{int}^{int}")) {
            replier.reply(cmd_pow(msg)); // n^r 보여주기
        }
        else if(isCondExp(msg, "{int}H{int}")) {
            replier.reply(cmd_nHr(msg)); // nHr 보여주기
        }
        else if(isCondExp(msg, "C{int}")) {
            replier.reply(cmd_Cn(msg)); // Cn 보여주기
        }
        else if(isCondExp(msg, "sin{number}")) {
            replier.reply(cmd_sin(msg)); // sinA 보여주기
        }
        else if(isCondExp(msg, "cos{number}")) {
            replier.reply(cmd_cos(msg)); // cosA 보여주기
        }
        else if(isCondExp(msg, "tan{number}")) {
            replier.reply(cmd_tan(msg)); // tanA 보여주기
        }
        else if(isCondExp(msg, "asin{number}")) {
            replier.reply(cmd_asin(msg)); // asinA 보여주기
        }
        else if(isCondExp(msg, "acos{number}")) {
            replier.reply(cmd_acos(msg)); // acosA 보여주기
        }
        else if(isCondExp(msg, "atan{number}")) {
            replier.reply(cmd_atan(msg)); // atanA 보여주기
        }
        else if(isCondExp(msg, "log{number}")) {
            replier.reply(cmd_log(msg)); // logA 보여주기
        }
        else if(isCondExp(msg, "ln{number}")) {
            replier.reply(cmd_ln(msg)); // lnA 보여주기
        }
        else if(isCondExp(msg, "sqrt{number}")) {
            replier.reply(cmd_sqrt(msg)); // sqrtA 보여주기
        }
        else if(isCondExp(msg, "abs{number}")) {
            replier.reply(cmd_abs(msg)); // absA 보여주기
        }
        else if(msg.toUpperCase() == 'PI') {
            replier.reply(cmd_PI()); // PI 보여주기
        }
        else if(msg.toUpperCase() == 'E') {
            replier.reply(cmd_E()); // E 보여주기
        }
        else {
            // 메시지가 오면 학습데이터에 따라 반응하기
            for(let i=0; i<learnList.length; i++) {
                if(msg == learnList[i][0]) {
                    replier.reply(learnList[i][1]);
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