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
 * 봇주인: 실큡
 * 봇: 화냥봇
 */

let forbiddenWords = [];
let learnDB = [];
let msgDB = [];
let msgDBLimit = 300;
let forbiddenSigns = ['{', '}'];

// 냥습금지어.txt 데이터 불러오기
function loadForbiddenWords() {
  let name = "냥습금지어";
  forbiddenWords = DataBase.getDataBase(name);

  if(forbiddenWords == null || forbiddenWords == "") {
    forbiddenWords = [];
    return;
  }

  forbiddenWords = forbiddenWords.split("{enter}");
}

// 냥습.txt 데이터 불러오기
function loadLearnDB() {
  let name = "냥습";
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
  let name = "냥습";
  let makeDB = "";

  for(let i=0; i<learnDB.length; i++) {
    makeDB += learnDB[i][0]+"{space}"+learnDB[i][1]+"{space}"+learnDB[i][2];

    if(i != learnDB.length-1)
      makeDB += "{enter}";
  }

  DataBase.setDataBase(name, makeDB);
}

// 메시지.txt 데이터 불러오기
function loadMsgDB() {
  let name = "메시지";
  msgDB = DataBase.getDataBase(name);

  if(msgDB == null || msgDB == "") {
    msgDB = [];
    return;
  }

  msgDB = msgDB.split("{enter}");

  for(let i=0; i<msgDB.length; i++)
    msgDB[i] = msgDB[i].split("{space}");
}

// 메시지.txt에 데이터 저장하기
function saveMsgDB() {
  let name = "메시지";
  let makeMsgDB = "";

  for(let i=0; i<msgDB.length; i++) {
    makeMsgDB += msgDB[i][0]+"{space}"+msgDB[i][1];

    if(i != msgDB.length-1)
      makeMsgDB += "{enter}";
  }

  DataBase.setDataBase(name, makeMsgDB);
}

/**
 * 명령어: 냥습/A/B
 * 설명: 메시지 A가 왔을 때 메시지 B를 보내도록 학습시킨다.
 */
function learn(query, sender) {
  let A = query[1], B = query[2];
  let forbad = false;

  // A가 금지어인지 확인
  for(let i=0; i<forbiddenWords.length; i++) {
    if(A == forbiddenWords[i]) {
      forbad = true;
      break;
    }
  }

  // A 안에 금지기호가 있는지 확인
  for(let i=0; i<forbiddenSigns.length; i++) {
    if(A.indexOf(forbiddenSigns[i]) != -1 || B.indexOf(forbiddenSigns[i]) != -1) {
      forbad = true;
      break;
    }
  }

  // A의 맨 앞 문자 or 맨 뒤 문자가 공백인지 확인
  if(A[0] == '\r') forbad = true;
  if(A[0] == '\n') forbad = true;
  if(A[0] == ' ') forbad = true;
  if(A[A.length-1] == '\r') forbad = true;
  if(A[A.length-1] == '\n') forbad = true;
  if(A[A.length-1] == ' ') forbad = true;

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
 * 설명: 메시지 A를 학습시켰는지 확인한다.
 */
function confirmLearn(query) {
  let A = query[1];

  for(let i=0; i<learnDB.length; i++) {
    // 학습한게 있으면 학습데이터 출력
    if(A == learnDB[i][0])
      return learnDB[i][1]+", "+learnDB[i][2]+"님이 냥습시켯다냥!";
  }

  // 학습한게 없으면 없다고 출력
  return "냥습한게 없다냥!";
}

/**
 * 명령어: 삭제/A
 * 설명: 학습되어 있는 메시지 A를 삭제한다.
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
 * 조건: A는 정수
 * 설명: 이전에 왔던 메시지를 본다.
 */
function prevMsg(query) {
  let A = Number(query[1]);

  // A가 정수여야 함
  if(!Number.isInteger(A))
    return "정수가 아니다냥!";

  // A가 [0, msgDB.length) 범위 안에 있어야 함
  if(!(0 <= A && msgDB.length-(A+1) >= 0))
    return "수가 범위를 초과했다냥!";

  // 이전 메시지 출력
  return msgDB[msgDB.length-(A+1)][0]+", "+msgDB[msgDB.length-(A+1)][1]+"님이다냥!";
}

/**
 * 명령어: 화냥폰/A
 * 설명: 화냥폰의 정보를 본다.
 *   A ∈ { 배터리, 전압 }
 */
function phone(query) {
  let A = query[1];

  // 배터리 출력
  if(A == "배터리")
    return Device.getBatteryLevel()+"% 남았다냥!";

  // 전압 출력
  if(A == "전압")
    return Device.getBatteryVoltage()+"mV 이다냥!";

  // 그 외의 정보는 출력할 수 없음
  return "이 정보는 1급기밀이다냥!";
}

/**
 * 명령어: 냥습목록
 * 설명: 학습 목록을 본다.
 */
function learnList() {
  let list = "< 냥습목록 >\n";

  for(let i=0; i<learnDB.length; i++)
    list += String(i+1)+": "+String(learnDB[i])+'\n';

  return list;
}

/**
 * 명령어: 오늘은
 * 설명: 오늘 날짜를 본다.
 */
function today() {
  let now = new Date();
  return now.getFullYear()+"년 "+(now.getMonth()+1)+"월 "+now.getDate()+"일이다냥!";
}

/**
 * 명령어: 안녕 or 안녕하세요
 */
function hello(sender) {
  return sender+"님 환영한다냥!";
}

/**
 * 명령어: 화냥봇
 */
function nyanBot() {
  let ans = ["냥?", "냐앙?", "왜 불럿냥?", "무슨 일이냥?"];
  let r = Math.floor(Math.random()*ans.length);
  return ans[r];
}

// Database에 있는 데이터 모두 불러오기
loadForbiddenWords();
loadLearnDB();
loadMsgDB();

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
  /**
   * 화냥봇이 참가하고 있는 room이 다음 조건을 만족해야 반응
   *   room이 실큡
   *   room의 접두사가 WN
   */
  if(room == "실큡" || room.substring(0, 2) == "WN") {
    // msgDB에 msg, sender 추가
    msgDB.push([msg, sender]);
    while(msgDB.length > msgDBLimit) msgDB.shift();
    saveMsgDB();

    let query = msg.split('/');

    if(query[0] == "냥습") {
      if(query.length >= 3)
        replier.reply(learn(query, sender)); // 학습시키기
      else if(query.length == 2)
        replier.reply(confirmLearn(query)); // 학습했는지 확인
    } else if(query[0] == "삭제") {
      if(query.length >= 2)
        replier.reply(del(query)); // 학습한거 삭제
    } else if(query[0] == "말") {
      if(query.length >= 2)
        replier.reply(prevMsg(query)); // 이전 메시지 보여주기
    } else if(query[0] == "화냥폰") {
      if(query.length >= 2)
        replier.reply(phone(query)); // 화냥폰 정보 보여주기
    } else if(msg == "냥습목록") {
      replier.reply(learnList()); // 학습목록 보여주기
    } else if(msg == "오늘은") {
      replier.reply(today()); // 오늘 날짜 보여주기
    } else if(msg == "안녕" || msg == "안녕하세요") {
      replier.reply(hello(sender)); // 인사하기
    } else if(msg == "화냥봇") {
      replier.reply(nyanBot()); // 화냥봇을 부르면 반응하기
    } else {
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