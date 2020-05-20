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

let forbiddenWords = "";
let db = "";

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

loadForbiddenWords();
loadDB();

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
  if(room == "실큡" || room.substring(0, 2) == "WN") {
    let query = msg.substring(0, 3);

    if(query == "냥습 ") {
      if(msg.indexOf('/') != -1) {
        let l = msg.substring(3).split('/');
        let a = l[0], b = l[1];
        let inForbiddenWord = false;

        // 금지어 탐색
        for(let i=0; i<forbiddenWords.length; i++) {
          if(a == forbiddenWords[i]) {
            inForbiddenWord = true;
            break;
          }
        }

        // 부분문자열에서 금지어 탐색
        if(a.length >= 2 && a.substring(0, 2) == "냥습") inForbiddenWord = true;
        if(a.length >= 2 && a.substring(0, 2) == "삭제") inForbiddenWord = true;
        if(a.indexOf(';') != -1 || b.indexOf(';') != -1) inForbiddenWord = true;
        if(a[0] == '\r') inForbiddenWord = true;
        if(a[0] == '\n') inForbiddenWord = true;
        if(a[0] == ' ') inForbiddenWord = true;
        if(a[a.length-1] == '\r') inForbiddenWord = true;
        if(a[a.length-1] == '\n') inForbiddenWord = true;
        if(a[a.length-1] == ' ') inForbiddenWord = true;

        if(a.length <= 1 || b.length == 0) {
          replier.reply("너무 짧다냥!");
        } else if(inForbiddenWord) {
          replier.reply("냥습할 수 없다냥!");
        } else {
          let learned = false;

          for(let i=0; i<db.length; i++) {
            // 냥습 했을 경우 덮어쓰기
            if(a == db[i][0]) {
              db[i][1] = b;
              db[i][2] = sender;

              learned = true;
              break;
            }
          }

          // 냥습 안 했을 경우 추가
          if(!learned)
            db.push([a, b, sender]);

          saveDB();
          replier.reply("냥!");
        }
      } else {
        let a = msg.substring(3), b = "", c = "";
        let learned = false;

        for(let i=0; i<db.length; i++) {
          // 냥습 했는지 확인
          if(a == db[i][0]) {
            b = db[i][1];
            c = db[i][2];

            learned = true;
            break;
          }
        }

        if(learned)
          replier.reply(b+", "+c+"님이 냥습시켯다냥!");
        else
          replier.reply("냥습한게 없다냥!");
      }
    } else if(query == "삭제 ") {
      let a = msg.substring(3);
      let learned = false;

      for(let i=0; i<db.length; i++) {
        // 냥습되어 있으면 삭제
        if(a == db[i][0]) {
          db.splice(i, 1);

          saveDB();
          replier.reply("냥!");

          learned = true;
          break;
        }
      }

      if(!learned)
        replier.reply("냥습한게 없다냥!");
    } else if(msg == "냥습목록") {
      let list = "< 냥습목록 >\n";

      for(let i=0; i<db.length; i++)
        list += String(i+1)+": "+String(db[i])+'\n';

      replier.reply(list);
    } else {
      if(msg == "안녕" || msg == "안녕하세요") replier.reply(sender+"님 환영한다냥!");
      else if(msg == "화냥봇") replier.reply("냥?");
      else if(msg == "화냥폰 배터리") replier.reply(Device.getBatteryLevel()+"% 남았다냥!");
      else if(msg == "화냥폰 버전") replier.reply(Device.getAndroidVersionName()+"이다냥!");
      else if(msg == "화냥폰 온도") replier.reply(Device.getBatteryTemperature()+"이다냥!");
      else if(msg == "화냥폰 전압") replier.reply(Device.getBatteryVoltage()+"mV 이다냥!");
      else {
        for(let i=0; i<db.length; i++) {
          // 냥습한거 활용
          if(msg == db[i][0]) {
            replier.reply(db[i][1]);
            break;
          }
        }
      }
    }
  }

  let mention = ["실버큐브", "실큡", "화이트냥", "화냥"];

  // 언급 알림
  if(room != "화냥봇") {
    for(let i=0; i<mention.length; i++) {
      if(msg.indexOf(mention[i]) != -1) {
        replier.reply("실큡", room+"에서 "+mention[i]+"이(가) 언급되었다냥!");
        break;
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