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

let nyanLang = "";
let forbiddenWords = [];
let learnDB = [];
const msgDB = new Map();
const msgDBLimit = 500;
const factorialLimit = 100;
const C = [];
const PI_1000 = DataBase.getDataBase("파이");

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

const condStrs = [
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

// 냥냥어.txt 데이터 불러오기
function loadNyanLang() {
  const name = "냥냥어";
  nyanLang = DataBase.getDataBase(name);

  if(nyanLang == null)
    nyanLang = "";
}

// 냥습금지어.txt 데이터 불러오기
function loadForbiddenWords() {
  const name = "냥습금지어";
  forbiddenWords = DataBase.getDataBase(name);

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

// 냥습.txt 데이터 불러오기
function loadLearnDB() {
  const name = "냥습";
  learnDB = DataBase.getDataBase(name);

  if(learnDB == null || learnDB == "") {
    learnDB = [];
    return;
  }

  learnDB = learnDB.split("{enter}");

  for(let i=0; i<learnDB.length; i++)
    learnDB[i] = learnDB[i].split("{space}");
}

// 냥습.txt에 데이터 저장하기
function saveLearnDB() {
  const name = "냥습";
  let makeDB = "";

  for(let i=0; i<learnDB.length; i++) {
    makeDB += learnDB[i][0]+"{space}"+learnDB[i][1]+"{space}"+learnDB[i][2];

    if(i != learnDB.length-1)
      makeDB += "{enter}";
  }

  DataBase.setDataBase(name, makeDB);
}

// 메시지.txt 데이터 불러오기
function loadMsgDB(room) {
  const name = "메시지_"+room;
  let data = DataBase.getDataBase(name);

  msgDB.set(room, []);

  if(data == null || data == "")
    return;

  data = data.split("{enter}");

  for(let i=0; i<data.length; i++)
    msgDB.get(room).push(data[i].split("{space}"));
}

// 메시지.txt에 데이터 저장하기
function saveMsgDB(room) {
  const name = "메시지_"+room;
  let data = msgDB.get(room);

  if(data == undefined)
    data = [];

  let makeMsgDB = "";

  for(let i=0; i<data.length; i++) {
    makeMsgDB += data[i][0]+"{space}"+data[i][1];

    if(i != data.length-1)
      makeMsgDB += "{enter}";
  }

  DataBase.setDataBase(name, makeMsgDB);
}

// in 연산을 해주는 함수
function In(s, l) {
  for(let i of l)
    if(s == i)
      return true;
  
  return false;
}

// 배열의 요소들 중 하나를 선택해주는 함수
function choose(l) {
  let r = Math.floor(Math.random()*l.length);
  return l[r];
}

/**
 * s1이 s2 표현식을 만족하는지 확인
 * 
 * < 표현식 문법 >
 * {int}: 정수
 * {number}: 실수
 * 
 * (주의!) 여는 중괄호를 해줬으면 닫는 중괄호도 해줘야 오류 안 남
 */
function isCondStr(s1, s2) {
  let l1 = [], l2 = [];

  // s1 파싱
  for(let i=0; i<s1.length; i++) {
    let s = "";

    if(Number.isInteger(Number(s1[i]))) {
      let inDot = false;

      /**
       * 예외 처리 해주면서 수 파싱
       * 
       * < 예시 >
       * 0 (o)
       * 0.9 (o)
       * 000 (o)
       * 00.090 (o)
       * 0P (x)
       * 0. (x)
       * 0.P (x)
       * 0.0.0 (x)
       */
      let j = i;

      for(; (j<s1.length && (Number.isInteger(Number(s1[j])) || (s1[j] == '.' && !inDot && j+1<s1.length && Number.isInteger(Number(s1[j+1]))))); j++) {
        s += s1[j];

        if(s1[j] == '.')
          inDot = true;
      }
      
      i = j-1;
    } else if(s1.substring(i, i+2).toUpperCase() == 'PI') {
      s = String(Math.PI);
      i++;
    } else if(s1[i].toUpperCase() == 'E') {
      s = String(Math.E);
    } else {
      let j = i;

      for(; (j<s1.length && !Number.isInteger(Number(s1[j])) && s1.substring(j, j+2).toUpperCase()!='PI' && s1[j].toUpperCase()!='E'); j++)
        s += s1[j];
      
      i = j-1;
    }

    // 음수 판별
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

  // 표현식을 만족하는 문자열인지 판별
  // 실패
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

  // 성공
  return true;
}

/**
 * 문자열을 수로 변환
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

// nCr 배열 초기화
function init_nCr() {
  for(let i=0; i<=factorialLimit; i++) {
    C.push([]);

    for(let j=0; j<=factorialLimit; j++)
      C[i].push(0);
  }

  for(let i=0; i<=factorialLimit; i++) {
    C[i][0] = 1;

    for(let j=1; j<=i; j++)
      C[i][j] = C[i-1][j-1]+C[i-1][j];
  }
}

/**
 * 명령어: 냥습/A/B
 */
function learn(query, sender) {
  let A = query[1], B = query[2];
  let forbad = false;

  // A가 금지어인지 확인
  for(let i of forbiddenWords) {
    if(A == i) {
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

  // A가 특정 수식인지 확인
  for(let i of condStrs) {
    if(isCondStr(A, i)) {
      forbad = true;
      break;
    }
  }

  // A or B가 너무 짧으면 안 됨
  if(A.length <= 1 || B.length == 0)
    return "너무 짧다냥!";

  // A가 금지어이거나 A 안에 금지기호가 있으면 안 됨
  if(forbad)
    return "냥습할 수 없다냥!";

  let learned = false;

  for(let i=0; i<learnDB.length; i++) {
    // 학습한게 있으면 learnDB 안에 있는 학습데이터 덮어쓰기
    if(A == learnDB[i][0]) {
      learnDB[i][1] = B;
      learnDB[i][2] = sender;
      learned = true;
      break;
    }
  }

  // 학습한게 없으면 learnDB에 학습데이터 추가
  if(!learned)
    learnDB.push([A, B, sender]);

  saveLearnDB();
  return "냥!";
}

/**
 * 명령어: 냥습/A
 */
function confirmLearn(query) {
  let A = query[1];

  for(let i=0; i<learnDB.length; i++) {
    // 학습한게 있으면 학습데이터 출력
    if(A == learnDB[i][0])
      return learnDB[i][1]+", "+learnDB[i][2]+"님이 냥습시켰다냥!";
  }

  // 학습한게 없으면 없다고 출력
  return "냥습한게 없다냥!";
}

/**
 * 명령어: 삭제/A
 */
function del(query) {
  let A = query[1];

  for(let i=0; i<learnDB.length; i++) {
    // 학습한게 있으면 삭제
    if(A == learnDB[i][0]) {
      learnDB.splice(i, 1);
      saveLearnDB();
      return "냥!";
    }
  }

  // 학습한게 없으면 아무것도 안함
  return "냥습한게 없다냥!";
}

/**
 * 명령어: 말/A
 */
function prevMsg(room, query) {
  let A = Number(query[1]);
  let data = msgDB.get(room);

  // A가 정수여야 함
  if(!Number.isInteger(A))
    return "정수가 아니다냥!";

  // A가 [0, data.length) 범위 안에 있어야 함
  if(!(0 <= A && data.length-(A+1) >= 0))
    return "수가 범위를 초과했다냥!";

  // 이전 메시지 출력
  return data[data.length-(A+1)][0]+", "+data[data.length-(A+1)][1]+"님이다냥!";
}

/**
 * 명령어: 화냥폰/A
 *   A ∈ { 버전, 배터리, 전압, 온도, 충전중? }
 */
function phone(query) {
  let A = query[1];

  // 안드로이드 버전 이름 출력
  if(A == "버전")
    return Device.getAndroidVersionName()+"버전 이다냥!";

  // 배터리 출력
  if(A == "배터리") {
    if(Device.getBatteryLevel() == 100)
      return "풀 차지 상태다냥!!";

    return Device.getBatteryLevel()+"% 남았다냥!";
  }

  // 전압 출력
  if(A == "전압")
    return Device.getBatteryVoltage()+"mV 이다냥!";

  // 온도 출력
  if(A == "온도")
    return Device.getBatteryTemperature()/10+"℃ 이다냥!";

  // 충전 중인지 출력
  if(A == "충전중?") {
    if(Device.isCharging())
      return "충전 중이다냥!";

    return "충전 중이 아니다냥!";
  }

  // 그 외의 정보는 출력할 수 없음
  return "이 정보는 1급기밀이다냥!";
}

/**
 * 명령어: L, l, 엘
 */
function L() {
  return choose(["L이다냥!", "엘!", "L!"]);
}

/**
 * 명령어: 사신, 死神
 */
function Death() {
  return choose(["꺆", "냐아아아앗!", "전방에 사신 출현이다냥!", "사신이다냥! 도망쳐야 한다냥!"]);
}

/**
 * 명령어: 냥습목록
 */
function learnList() {
  let list = "< 냥습목록 >\n\n";

  for(let i=0; i<learnDB.length; i++)
    list += "("+String(i+1)+") "+String(learnDB[i][0])+"/"+String(learnDB[i][2])+'\n';

  return list;
}

/**
 * 명령어: 오늘은
 */
function today() {
  let now = new Date();
  return now.getFullYear()+"년 "+(now.getMonth()+1)+"월 "+now.getDate()+"일이다냥!";
}

/**
 * 명령어: 요일은
 */
function today_day() {
  let now = new Date();
  return day[now.getDay()]+"요일이다냥!";
}

/**
 * 명령어: 안녕, 안녕하세요
 */
function hello(sender) {
  return sender+"님 "+choose(["환영한다냥!", "반갑다냥!", "어서오라냥!"]);
}

/**
 * 명령어: 화냥봇
 */
function nyanBot() {
  return choose(["냥?", "냐앙?", "왜 불렀냥?", "무슨 일이냥?"]);
}

/**
 * 명령어: 가위, 바위, 보
 */
function rsp(me) {
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

/**
 * 명령어: n!
 */
function nfact(msg) {
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

/**
 * 명령어: nPr
 */
function nPr(msg) {
  let splitMsg = msg.split('P');
  let n = Number(splitMsg[0]), r = Number(splitMsg[1]);

  // n과 r이 [0, factorialLimit] 범위 안에 있어야 함
  if(!(0 <= n && n <= factorialLimit) || !(0 <= r && r <= factorialLimit))
    return "0~"+factorialLimit+" 사이의 수여야 한다냥!";

  return Math.round(factorial(n)/factorial(n-r))+" 이다냥!";
}

/**
 * 명령어: nCr
 */
function nCr(msg) {
  let splitMsg = msg.split('C');
  let n = Number(splitMsg[0]), r = Number(splitMsg[1]);

  // n과 r이 [0, factorialLimit] 범위 안에 있어야 함
  if(!(0 <= n && n <= factorialLimit) || !(0 <= r && r <= factorialLimit))
    return "0~"+factorialLimit+" 사이의 수여야 한다냥!";

  return C[n][r]+" 이다냥!";
}

/**
 * 명령어: nπr
 */
function nπr(msg) {
  let splitMsg = msg.split('π');
  let n = Number(splitMsg[0]), r = Number(splitMsg[1]);

  // n과 r이 [0, factorialLimit] 범위 안에 있어야 함
  if(!(0 <= n && n <= factorialLimit) || !(0 <= r && r <= factorialLimit))
    return "0~"+factorialLimit+" 사이의 수여야 한다냥!";

  return Math.pow(n, r)+" 이다냥!";
}

/**
 * 명령어: n^r
 */
function pow(msg) {
  let splitMsg = msg.split('^');
  let n = Number(splitMsg[0]), r = Number(splitMsg[1]);

  // n과 r이 [0, factorialLimit] 범위 안에 있어야 함
  if(!(0 <= n && n <= factorialLimit) || !(0 <= r && r <= factorialLimit))
    return "0~"+factorialLimit+" 사이의 수여야 한다냥!";

  return Math.pow(n, r)+" 이다냥!";
}

/**
 * 명령어: nHr
 */
function nHr(msg) {
  let splitMsg = msg.split('H');
  let n = Number(splitMsg[0]), r = Number(splitMsg[1]);

  // n, r, n+r-1이 [0, factorialLimit] 범위 안에 있어야 함
  if(!(0 <= n && n <= factorialLimit) || !(0 <= r && r <= factorialLimit) || !(0 <= n+r-1 && n+r-1 <= factorialLimit))
    return "0 <= n, r, n+r-1 <= "+factorialLimit+" 을 만족해야 한다냥!";

  return nCr((n+r-1)+'C'+r);
}

/**
 * 명령어: Cn
 */
function Cn(msg) {
  let n = Number(msg.substring(1));

  // 2n이 [0, factorialLimit] 범위 안에 있어야 함
  if(!(0 <= n*2 && n*2 <= factorialLimit))
    return "0 <= 2n <= "+factorialLimit+" 을 만족해야 한다냥!";

  let res = nCr(n*2+'C'+n).replace(" 이다냥!", "");
  return Math.round(Number(res)/(n+1))+" 이다냥!";
}

/**
 * 명령어: sinA
 */
function sin(msg) {
  let A = ston(msg.substring(3));
  return Math.sin(A)+" 이다냥!";
}

/**
 * 명령어: cosA
 */
function cos(msg) {
  let A = ston(msg.substring(3));
  return Math.cos(A)+" 이다냥!";
}

/**
 * 명령어: tanA
 */
function tan(msg) {
  let A = ston(msg.substring(3));
  return Math.tan(A)+" 이다냥!";
}

/**
 * 명령어: asinA
 */
function asin(msg) {
  let A = ston(msg.substring(4));
  return Math.asin(A)+" 이다냥!";
}

/**
 * 명령어: acosA
 */
function acos(msg) {
  let A = ston(msg.substring(4));
  return Math.acos(A)+" 이다냥!";
}

/**
 * 명령어: atanA
 */
function atan(msg) {
  let A = ston(msg.substring(4));
  return Math.atan(A)+" 이다냥!";
}

/**
 * 명령어: logA
 */
function log(msg) {
  let A = ston(msg.substring(3));
  return Math.log10(A)+" 이다냥!";
}

/**
 * 명령어: lnA
 */
function ln(msg) {
  let A = ston(msg.substring(2));
  return Math.log(A)+" 이다냥!";
}

/**
 * 명령어: sqrtA
 */
function sqrt(msg) {
  let A = ston(msg.substring(4));
  return Math.sqrt(A)+" 이다냥!";
}

/**
 * 명령어: absA
 */
function abs(msg) {
  let A = ston(msg.substring(3));
  return Math.abs(A)+" 이다냥!";
}

/**
 * 명령어: pi, pI, Pi, PI
 */
function PI() {
  return PI_1000+" 이다냥!";
}

/**
 * 명령어: e, E
 */
function E() {
  return Math.E+" 이다냥!";
}

// Database에 있는 txt 불러오기 (메시지_room.txt는 제외)
loadNyanLang();
loadForbiddenWords();
loadLearnDB();

// 배열 초기화
init_nCr();

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
  /**
   * 화냥봇이 참가하고 있는 room이 다음 조건을 만족해야 반응
   *   room이 화이트냥
   *   room의 접두사가 WN
   */
  if(room == "화이트냥" || room.substring(0, 2) == "WN") {
    // msgDB[room]에 데이터가 없는 경우 Database에 있는 메시지_room.txt 불러오기
    if(!msgDB.has(room))
      loadMsgDB(room);

    // msgDB[room]에 msg, sender 추가
    msgDB.get(room).push([msg, sender]);
    while(msgDB.get(room).length > msgDBLimit) msgDB.get(room).shift();
    saveMsgDB(room);

    // 일부 상황을 제외하고 L과 대화하는거 방지
    if(In(sender, LNames)) {
      let data = msgDB.get(room);

      // L이 같은 말을 2번 이상 해서 무한루프 걸리게 되는거 방지
      if(!(data.length-2 >= 0 && In(data[data.length-2][1], LNames))) {
        if(msg == "화냥봇님, 죽어주세요 !")
          replier.reply("꾸에에엑"); // L에게 살해당했을 때
        else if(msg.indexOf("화냥봇님") != -1)
          replier.reply("냥!?"); // L이 화냥봇을 언급했을 때
      }

      return;
    }

    let query = msg.split('/');

    if(query[0] == "냥습") {
      if(query.length >= 3)
        replier.reply(learn(query, sender)); // 학습시키기
      else if(query.length == 2)
        replier.reply(confirmLearn(query)); // 학습했는지 확인
    }
    else if(query[0] == "삭제") {
      if(query.length >= 2)
        replier.reply(del(query)); // 학습한거 삭제
    }
    else if(query[0] == "말") {
      if(query.length >= 2)
        replier.reply(prevMsg(room, query)); // 이전 메시지 보여주기
    }
    else if(query[0] == "화냥폰") {
      if(query.length >= 2)
        replier.reply(phone(query)); // 화냥폰 정보 보여주기
    }
    else if(msg == "냥냥어") {
      replier.reply(nyanLang); // 명령어 목록 보여주기
    }
    else if(In(msg, ["L", "l", "엘"])) {
      //replier.reply(L()); // L을 부르면 반응하기
    }
    else if(In(msg, ["사신", "死神"])) {
      //replier.reply(Death()); // 사신을 부르면 반응하기
    }
    else if(msg == "냥습목록") {
      replier.reply(learnList()); // 학습 목록 보여주기
    }
    else if(msg == "오늘은") {
      replier.reply(today()); // 오늘 날짜 보여주기
    }
    else if(msg == "요일은") {
      replier.reply(today_day()); // 오늘 요일 보여주기
    }
    else if(In(msg, ["안녕", "안녕하세요"])) {
      replier.reply(hello(sender)); // 인사하기
    }
    else if(msg == "화냥봇") {
      replier.reply(nyanBot()); // 화냥봇을 부르면 반응하기
    }
    else if(msg == "가위") {
      replier.reply(rsp(1)); // 화냥봇과 가위바위보: 가위 내기
    }
    else if(msg == "바위") {
      replier.reply(rsp(0)); // 화냥봇과 가위바위보: 바위 내기
    }
    else if(msg == "보") {
      replier.reply(rsp(2)); // 화냥봇과 가위바위보: 보 내기
    }
    else if(msg == "너의 이름은") {
      replier.reply("화냥봇이다냥! 화이트냥님이 만들었다냥!"); // 화냥봇의 이름 말하기
    }
    else if(msg == "내 이름은") {
      replier.reply(sender+"님이다냥!"); // 메시지 보낸 사람의 이름 말하기
    }
    else if(isCondStr(msg, "{int}!")) {
      replier.reply(nfact(msg)); // n! 보여주기
    }
    else if(isCondStr(msg, "{int}P{int}")) {
      replier.reply(nPr(msg)); // nPr 보여주기
    }
    else if(isCondStr(msg, "{int}C{int}")) {
      replier.reply(nCr(msg)); // nCr 보여주기
    }
    else if(isCondStr(msg, "{int}π{int}")) {
      replier.reply(nπr(msg)); // nπr 보여주기
    }
    else if(isCondStr(msg, "{int}^{int}")) {
      replier.reply(pow(msg)); // n^r 보여주기
    }
    else if(isCondStr(msg, "{int}H{int}")) {
      replier.reply(nHr(msg)); // nHr 보여주기
    }
    else if(isCondStr(msg, "C{int}")) {
      replier.reply(Cn(msg)); // Cn 보여주기
    }
    else if(isCondStr(msg, "sin{number}")) {
      replier.reply(sin(msg)); // sinA 보여주기
    }
    else if(isCondStr(msg, "cos{number}")) {
      replier.reply(cos(msg)); // cosA 보여주기
    }
    else if(isCondStr(msg, "tan{number}")) {
      replier.reply(tan(msg)); // tanA 보여주기
    }
    else if(isCondStr(msg, "asin{number}")) {
      replier.reply(asin(msg)); // asinA 보여주기
    }
    else if(isCondStr(msg, "acos{number}")) {
      replier.reply(acos(msg)); // acosA 보여주기
    }
    else if(isCondStr(msg, "atan{number}")) {
      replier.reply(atan(msg)); // atanA 보여주기
    }
    else if(isCondStr(msg, "log{number}")) {
      replier.reply(log(msg)); // logA 보여주기
    }
    else if(isCondStr(msg, "ln{number}")) {
      replier.reply(ln(msg)); // lnA 보여주기
    }
    else if(isCondStr(msg, "sqrt{number}")) {
      replier.reply(sqrt(msg)); // sqrtA 보여주기
    }
    else if(isCondStr(msg, "abs{number}")) {
      replier.reply(abs(msg)); // absA 보여주기
    }
    else if(msg.toUpperCase() == 'PI') {
      replier.reply(PI()); // PI 보여주기
    }
    else if(msg.toUpperCase() == 'E') {
      replier.reply(E()); // E 보여주기
    }
    else {
      // 메시지가 오면 학습데이터에 따라 반응하기
      for(let i=0; i<learnDB.length; i++) {
        if(msg == learnDB[i][0]) {
          replier.reply(learnDB[i][1]);
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