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
function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
  qry = [
    "화냥",
    "화냥 돌아와",
    "화냥 체고"
  ];

  ans = [
    ["냥?", "화냥은 지금 바쁘다냥", "왜 불럿냥", "무슨 일이냥", "화냥은 지금 오프라인이다냥", "화냥 열심히 일하는 중!", "냐아아아아아아아아아아앙", "우선님은 뵨태다냥", "화냥에게 이상한 짓 해버리면 화낼거다냐!!"],
    ["돌아오기 기찮다냥", "싫다냥", sender+"님은 화냥이 돌아오기를 원하냥?"],
    [sender+"님 체고"]
  ];

  mention = ["실버큐브", "실큡", "화이트냥", "화냥", "WhiteNyan"];

  if(room == "실큡" || room == "Happy Room") {
    for(let i=0; i<qry.length; i++) {
      if(msg == qry[i]) {
        let r = Math.floor(Math.random()*ans[i].length);
        replier.reply(ans[i][r]);
        break;
      }
    }

    // 언급 알림
    for(let i=0; i<mention.length; i++) {
      if(msg.indexOf(mention[i]) != -1) {
        replier.reply("실큡", room+"에서 "+mention[i]+"이(가) 언급되었다.");
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