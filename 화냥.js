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
let db = [];
let msgList = [];
let msgListLimit = 100;
let forbiddenSigns = [';', '%', '&'];

function loadForbiddenWords() {
  forbiddenWords = DataBase.getDataBase("냥습_금지어");

  if(forbiddenWords == null || forbiddenWords == "") {
    forbiddenWords = [];
    return;
  }

  forbiddenWords = forbiddenWords.split(';');
}

function loadDB() {
  db = DataBase.getDataBase("냥습");

  if(db == null || db == "") {
    db = [];
    return;
  }

  db = db.split(';');

  for(let i=0; i<db.length; i++)
    db[i] = db[i].split('/');
}

function saveDB() {
  let makeDB = "";

  for(let i=0; i<db.length; i++) {
    makeDB += db[i][0]+'/'+db[i][1]+'/'+db[i][2];

    if(i != db.length-1)
      makeDB += ';';
  }

  DataBase.setDataBase("냥습", makeDB);
}

function loadMsgList() {
  msgList = DataBase.getDataBase("메시지_리스트");

  if(msgList == null || msgList == "") {
    msgList = [];
    return;
  }

  msgList = msgList.split(';ㅇ~ㅇ;');

  for(let i=0; i<msgList.length; i++)
    msgList[i] = msgList[i].split('/ㅇ~ㅇ/');
}

function saveMsgList() {
  let makeMsgList = "";

  for(let i=0; i<msgList.length; i++) {
    makeMsgList += msgList[i][0]+'/ㅇ~ㅇ/'+msgList[i][1];

    if(i != msgList.length-1)
      makeMsgList += ';ㅇ~ㅇ;';
  }

  DataBase.setDataBase("메시지_리스트", makeMsgList);
}

loadForbiddenWords();
loadDB();
loadMsgList();

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
  /**
   * 화냥봇이 참가하고 있는 room이 다음 조건을 만족해야 반응
   *   room이 실큡
   *   room의 접두사가 WN
   */
  if(room == "실큡" || room.substring(0, 2) == "WN") {
    // 메시지 리스트에 msg와 sender 추가
    msgList.push([msg, sender]);
    while(msgList.length > msgListLimit) msgList.shift();
    saveMsgList();

    let query = msg.split('/');

    if(query[0] == "냥습") {
      if(query.length >= 3) {
        /**
         * 명령어: 냥습/A/B
         * 설명: 메시지 A가 왔을 때 메시지 B를 보내도록 학습시킨다.
         */

        let A = query[1], B = query[2];
        let forbad = false;

        // 금지어 탐색
        for(let i=0; i<forbiddenWords.length; i++) {
          if(A == forbiddenWords[i]) {
            forbad = true;
            break;
          }
        }

        // A의 부분문자열에서 금지기호 탐색
        for(let i=0; i<forbiddenSigns.length; i++) {
          if(A.indexOf(forbiddenSigns[i]) != -1 || B.indexOf(forbiddenSigns[i]) != -1) {
            forbad = true;
            break;
          }
        }

        if(A[0] == '\r') forbad = true;
        if(A[0] == '\n') forbad = true;
        if(A[0] == ' ') forbad = true;
        if(A[A.length-1] == '\r') forbad = true;
        if(A[A.length-1] == '\n') forbad = true;
        if(A[A.length-1] == ' ') forbad = true;

        if(A.length <= 1 || B.length == 0) {
          replier.reply("너무 짧다냥!");
        } else if(forbad) {
          replier.reply("냥습할 수 없다냥!");
        } else {
          let learned = false;

          for(let i=0; i<db.length; i++) {
            // 학습을 했을 경우 메시지 덮어쓰기
            if(A == db[i][0]) {
              db[i][1] = B;
              db[i][2] = sender;

              learned = true;
              break;
            }
          }

          // 학습을 안 했을 경우 메시지 추가
          if(!learned)
            db.push([A, B, sender]);

          saveDB();
          replier.reply("냥!");
        }
      } else if(query.length == 2) {
        /**
         * 명령어: 냥습/A
         * 설명: 메시지 A를 학습시켰는지 확인한다.
         */

        let A = query[1], b = "", c = "";
        let learned = false;

        for(let i=0; i<db.length; i++) {
          // 학습을 했는지 확인
          if(A == db[i][0]) {
            B = db[i][1];
            C = db[i][2];

            learned = true;
            break;
          }
        }

        if(learned)
          replier.reply(B+", "+C+"님이 냥습시켯다냥!");
        else
          replier.reply("냥습한게 없다냥!");
      }
    } else if(query[0] == "삭제") {
      if(query.length >= 2) {
        /**
         * 명령어: 삭제/A
         * 설명: 학습되어 있는 메시지 A를 삭제한다.
         */

        let A = query[1];
        let learned = false;

        for(let i=0; i<db.length; i++) {
          // 학습되어 있으면 삭제
          if(A == db[i][0]) {
            db.splice(i, 1);

            saveDB();
            replier.reply("냥!");

            learned = true;
            break;
          }
        }

        if(!learned)
          replier.reply("냥습한게 없다냥!");
      }
    } else if(query[0] == "말") {
      if(query.length >= 2) {
        /**
         * 명령어: 말/A
         * 조건: A는 정수
         * 설명: 이전에 왔던 메시지를 본다.
         */

        let A = Number(query[1]);

        if(!Number.isInteger(A))
          replier.reply("정수가 아니다냥!");
        else if(!(0 <= A && msgList.length-(A+1) >= 0))
          replier.reply("수가 범위를 초과했다냥!");
        else
          replier.reply(msgList[msgList.length-(A+1)][0]+", "+msgList[msgList.length-(A+1)][1]+"님이다냥!");
      }
    } else if(query[0] == "화냥폰") {
      if(query.length >= 2) {
        /**
         * 명령어: 화냥폰/A
         * 설명: 화냥폰의 정보를 본다.
         *   A ∈ { 배터리, 전압 }
         */

        let A = query[1];

        if(A == "배터리")
          replier.reply(Device.getBatteryLevel()+"% 남았다냥!");
        else if(A == "전압")
          replier.reply(Device.getBatteryVoltage()+"mV 이다냥!");
      }
    } else if(msg == "냥습목록") {
      /**
       * 명령어: 냥습목록
       * 설명: 학습 목록을 본다.
       */

      let list = "< 냥습목록 >\n";

      for(let i=0; i<db.length; i++)
        list += String(i+1)+": "+String(db[i])+'\n';

      replier.reply(list);
    } else if(msg == "오늘은") {
      /**
       * 명령어: 오늘은
       * 설명: 오늘 날짜를 본다.
       */

      let now = new Date();
      replier.reply(now.getFullYear()+"년 "+(now.getMonth()+1)+"월 "+now.getDate()+"일이다냥!");
    } else if(msg == "안녕" || msg == "안녕하세요") {
      /**
       * 명령어: 안녕 or 안녕하세요
       */

      replier.reply(sender+"님 환영한다냥!");
    } else if(msg == "화냥봇") {
      /**
       * 명령어: 화냥봇
       */

      let ans = ["냥?", "냐앙?", "왜 불럿냥?", "무슨 일이냥?"];
      let r = Math.floor(Math.random()*ans.length);
      replier.reply(ans[r]);
    } else {
      for(let i=0; i<db.length; i++) {
        // 학습한거 활용
        if(msg == db[i][0]) {
          replier.reply(db[i][1]);
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