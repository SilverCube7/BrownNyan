/**
 * 봇주인: 화이트냥
 * 봇: 화냥봇
 */

const scriptName = "화냥";

let nyan_lang = "";
let forbidden_words = [];

const learn_map = new Map();
const msg_map = new Map();
const nyan_bot_msg_map = new Map();

const msg_map_limit = 500;
const nyan_bot_msg_map_limit = 100;
const eat_fail_percent = 3; // 꿀꺽 실패 확률이 1/eat_fail_percent
const eat_pocket_limit = 100;
const emoji_len_limit = 5;

const day = ['일', '월', '화', '수', '목', '금', '토'];
const rsp_res = [
    ['tie', 'bot', 'me'],
    ['me', 'tie', 'bot'],
    ['bot', 'me', 'tie']
]
const forbidden_signs = [
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

const keyword = require("modules/NyanModules/keyword.js");
const db = require("modules/NyanModules/db.js");
const rank = require("modules/NyanModules/rank.js");
const user = require("modules/NyanModules/user.js");

const PI_1000 = db.load_txt(db.make_full_path(keyword.NYAN_FILES+"/"+keyword.PI));

const CMD = {
    learn: function(room, query, sender) {
        let A = query[1], B = "";
        let forbad = false;

        for(let i=2; i<query.length; i++) B += query[i]+"/";
        B = B.substring(0, B.length-1);

        // A가 금지어인지 확인
        for(let i of forbidden_words) {
            if(A.toUpperCase() == i.toUpperCase()) {
                forbad = true;
                break;
            }
        }

        // A 안에 금지기호가 있는지 확인
        for(let i of forbidden_signs) {
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

        let data = learn_map.get(room);
        let learned = false;

        for(let i=0; i<data.length; i++) {
            // 학습한게 있으면 learn_map[room] 안에 있는 학습데이터 덮어쓰기
            if(A == data[i][0]) {
                data[i][1] = B;
                data[i][2] = sender;
                learned = true;
                break;
            }
        }

        if(!learned)
            data.push([A, B, sender]);

        db.save_list(db.make_full_path(room+"/"+keyword.LEARNING), data);
        return "냥!";
    },

    confirmLearn: function(room, query) {
        let data = learn_map.get(room);
        let A = query[1];

        for(let i=0; i<data.length; i++) {
            // 학습한게 있으면 학습데이터 출력
            if(A == data[i][0])
                return data[i][1]+", "+data[i][2]+"님이 냥습시켰다냥!";
        }

        return "냥습한게 없다냥!";
    },

    del: function(room, query) {
        let data = learn_map.get(room);
        let A = query[1];

        for(let i=0; i<data.length; i++) {
            // 학습한게 있으면 삭제
            if(A == data[i][0]) {
                data.splice(i, 1);
                db.save_list(db.make_full_path(room+"/"+keyword.LEARNING), data);
                return "냥!";
            }
        }

        return "냥습한게 없다냥!";
    },

    showPrevMsg: function(room, query) {
        let A = Number(query[1]);
        let data = msg_map.get(room);

        if(!Number.isInteger(A))
            return "정수가 아니다냥!";

        // !(0 <= A < data.length)
        if(!(0 <= A && data.length-(A+1) >= 0))
            return "수가 범위를 초과했다냥!";

        return data[data.length-(A+1)][0]+", "+data[data.length-(A+1)][1]+"님이다냥!";
    },

    showPhoneInfo: function(query) {
        let A = query[1];

        if(A == keyword.VERSION)
            return "ver"+Device.getAndroidVersionName()+" 이다냥!";

        if(A == keyword.BATTERY) {
            if(Device.getBatteryLevel() == 100) return "풀 차지 상태다냥!!";
            return Device.getBatteryLevel()+"% 남았다냥!";
        }

        if(A == keyword.VOLTAGE)
            return Device.getBatteryVoltage()+"mV 이다냥!";

        if(A == keyword.TEMPERATURE)
            return Device.getBatteryTemperature()/10+"℃ 이다냥!";

        if(A == keyword.IS_CHARGING) {
            if(Device.isCharging()) return "충전 중이다냥!";
            return "충전 중이 아니다냥!";
        }

        return "이 정보는 1급기밀이다냥!";
    },

    showRank: function(room, query) {
        let A = query[1];

        if(A == keyword.TALK) return rank.show_talk_rank(room);
        if(A == keyword.PICTURE) return rank.show_picture_rank(room);
        if(A == keyword.EMOTICON) return rank.show_emoticon_rank(room);
        if(A == keyword.NYAN_BOT) return rank.show_nyan_bot_rank(room);
        if(A == keyword.EAT) return rank.show_eat_rank(room);
        if(In(A, keyword.VOMIT_LIST)) return rank.show_vomit_rank(room);
        if(A == keyword.ESCAPE) return rank.show_escape_rank(room);
        if(A == keyword.EATEN) return rank.show_eaten_rank(room);
        if(In(A, keyword.VOMITED_LIST)) return rank.show_vomited_rank(room);
        if(A == keyword.EAT_VS) return rank.show_eat_vs_rank(room);

        return "그런 순위는 없다냥!";
    },

    showLearnList: function(room) {
        let data = learn_map.get(room);
        let show = "< "+keyword.LEARNING_LIST+" >\n\n";

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

        if(me == keyword.SCISSOR) me = 1;
        else if(me == keyword.ROCK) me = 0;
        else if(me == keyword.PAPER) me = 2;
        else return "무엇을 낸 거냥?";

        let bot = Math.floor(Math.random()*3);
        const res = rsp_res[bot][me];

        if(bot == 0) bot = keyword.ROCK;
        else if(bot == 1) bot = keyword.SCISSOR;
        else bot = keyword.PAPER;

        if(res == 'tie') return bot+"! "+choose(["무승부다냥!", "비겼다냥!"]);
        if(res == 'bot') return bot+"! 내가 이겼다냥!";
        return bot+"! 내가 졌다냥..";
    },

    eat: function(room, sender) {
        let data = msg_map.get(room);
        let target = find_target(room);

        if(!target)
            return "꿀꺽할 사람이 없다냥!";

        if(target == sender)
            return "자신을 꿀꺽할 수 없다냥!";

        if(Math.floor(Math.random()*eat_fail_percent) == 0) {
            rank.update_rank_map(room, target, rank.escape_rank_map, keyword.ESCAPE);
            return target+"님을 꿀꺽하려고 했지만, 도망갔다냥!";
        }

        user.push_in_eat_pocket(room, sender, target);
        rank.update_rank_map(room, sender, rank.eat_rank_map, keyword.EAT);
        rank.update_rank_map(room, target, rank.eaten_rank_map, keyword.EATEN);

        return target+"님을 꿀꺽했다냥!";
    },

    vomit: function(room, sender) {
        let target = user.pop_in_eat_pocket(room, sender);

        if(!target)
            return "꿀꺽주머니에 아무것도 없다냥!";

        rank.update_rank_map(room, sender, rank.vomit_rank_map, keyword.VOMIT);
        rank.update_rank_map(room, target, rank.vomited_rank_map, keyword.VOMITED);

        return target+"님을 뱉었다냥!";
    },

    showEatPocket: function(room, sender) {
        let data = user.load_user_info(room, sender, user.eat_pocket, keyword.EAT_POCKET);
        let show = "< "+sender+"님의 꿀꺽주머니 >\n\n";

        for(let i=data.length-1; i>=0; i--)
            show += "("+String(data.length-i)+") "+String(data[i][0])+'\n';

        return show;
    },

    digest: function(room, sender) {
        let data = user.load_user_info(room, sender, user.eat_pocket, keyword.EAT_POCKET);

        if(!data.length)
            return "꿀꺽주머니에 아무것도 없다냥!";

        user.clear_eat_pocket(room, sender);

        return "소화제를 사용해서 강제로 소화했다냥!";
    },

    makeEmoji: function(query) {
        let A = query[1];

        if(!(1 <= A.length && A.length <= emoji_len_limit))
            return ["길이는 "+"1~"+emoji_len_limit+" 사이여야 한다냥!"];

        let emojiList = [];
        for(let i of A) emojiList.push(i+String.fromCharCode(8205));

        return emojiList;
    },

    PI: function() {
        return PI_1000+" 이다냥!";
    },

    test: function(replier, imageDB) {
        return sum;
    }
};

function send_msg(replier, room, msg) {
    push_in_nyan_bot_msg_map(room, msg);
    return replier.reply(msg);
}

function push_in_nyan_bot_msg_map(room, msg) {
    if(!nyan_bot_msg_map.has(room))
        nyan_bot_msg_map.set(room, []);

    while(nyan_bot_msg_map.get(room).length > nyan_bot_msg_map_limit)
        nyan_bot_msg_map.get(room).shift();

    nyan_bot_msg_map.get(room).push(msg);
}

function is_room_prefix(room, prefix) {
    return room.substring(0, prefix.length) == prefix;
}

function is_nyan_bot_last_msg(room, msg) {
    if(nyan_bot_msg_map.has(room)) {
        let len = nyan_bot_msg_map.get(room).length;

        if(len > 0)
            return nyan_bot_msg_map.get(room)[len-1] == msg;
    }

    return false;
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

function strip(s) {
    let l = 0, r = s.length-1;

    while(l < s.length && In(s[l], spaces)) l++;
    while(r >= 0 && In(s[r], spaces)) r--;

    let new_s = "";
    for(let i=l; i<=r; i++) new_s += s[i];

    return new_s;
}

function find_target(room) {
    let msg_list = msg_map.get(room);

    for(let i=msg_list.length-2; i>=0; i--)
        if(!In(msg_list[i][1], keyword.L_NAMES))
            return msg_list[i][1];

    return undefined;
}

function parse_learn_data_value(room, sender, value) {
    target = find_target(room);
    if(!target) target = sender;

    while(value.indexOf(keyword.ME_TOKEN) != -1) value = value.replace(keyword.ME_TOKEN, sender);
    while(value.indexOf(keyword.YOU_TOKEN) != -1) value = value.replace(keyword.YOU_TOKEN, target);

    let new_value = "";

    // % a1, a2, ... % 파싱
    for(let i=0; i<value.length; i++) {
        if(value[i] == '%') {
            let token = "", j = i+1;

            for(; (j<value.length && value[j]!='%'); j++)
                token += value[j];

            if(j < value.length) {
                let choose_one = strip(choose(token.split(",")));
                new_value += choose_one;
                i = j;
                continue;
            }
        }

        new_value += value[i];
    }

    return new_value;
}

nyan_lang = db.load_txt(db.make_full_path(keyword.NYAN_FILES+"/"+keyword.NYAN_LANG));
forbidden_words = db.load_list(db.make_full_path(keyword.NYAN_FILES+"/"+keyword.FORBIDDEN_WORD))[0];

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    /**
     * 화냥봇이 참가하고 있는 room이 다음 조건들 중 하나를 만족해야 반응
     *     room이 화이트냥
     *     room의 접두사가 [WN]
     */
    if(room == keyword.MASTER || is_room_prefix(room, "[WN]")) {
        if(!learn_map.has(room))
            learn_map.set(room, db.load_list(db.make_full_path(room+"/"+keyword.LEARNING)));

        if(!msg_map.has(room))
            msg_map.set(room, db.load_list(db.make_full_path(room+"/"+keyword.MSG)));

        msg_map.get(room).push([msg, sender]);

        while(msg_map.get(room).length > msg_map_limit+1)
            msg_map.get(room).shift();

        db.save_list(db.make_full_path(room+"/"+keyword.MSG), msg_map.get(room));

        // L의 메시지에 반응하지 않음 (특정 메시지는 제외)
        if(In(sender, keyword.L_NAMES)) {
            let msg_list = msg_map.get(room);

            // L이 똑같은 메시지를 계속 보내서 무한정 반응해버리는 현상 방지
            if(!(msg_list.length >= 2 && In(msg_list[msg_list.length-2][1], keyword.L_NAMES))) {
                // L이 특정 메시지를 보내면 반응
                if((msg == keyword.NYAN_BOT+"님, 죽어주세요 !") ||
                   (msg == "탕" && is_nyan_bot_last_msg(room, "러시안룰렛"))) { // FIXME: ;;;
                    send_msg(replier, room, "꾸에에엑");
                } else if(msg.indexOf(keyword.NYAN_BOT+"님") != -1) {
                    send_msg(replier, room, "냥!?");
                }
            }

            return;
        }

        if(msg == keyword.SEND_PICTURE)
            rank.update_rank_map(room, sender, rank.picture_rank_map, keyword.PICTURE);
        else if(msg == keyword.SEND_EMOTICON)
            rank.update_rank_map(room, sender, rank.emoticon_rank_map, keyword.EMOTICON);
        else
            rank.update_rank_map(room, sender, rank.talk_rank_map, keyword.TALK);

        let query = msg.split('/');

        if(query[0] == keyword.LEARNING) {
            if(query.length >= 3)
                send_msg(replier, room, CMD.learn(room, query, sender)); // 학습시키기
            else if(query.length == 2)
                send_msg(replier, room, CMD.confirmLearn(room, query)); // 학습했는지 확인
        }
        else if(query[0] == keyword.DEL) {
            if(query.length >= 2)
                send_msg(replier, room, CMD.del(room, query)); // 학습한거 삭제
        }
        else if(query[0] == keyword.TALK) {
            if(query.length >= 2)
                send_msg(replier, room, CMD.showPrevMsg(room, query)); // 이전 메시지 보여주기
        }
        else if(query[0] == keyword.PHONE) {
            if(query.length >= 2)
                send_msg(replier, room, CMD.showPhoneInfo(query)); // 화냥폰 정보 보여주기
        }
        else if(query[0] == keyword.RANK) {
            if(query.length >= 2)
                send_msg(replier, room, CMD.showRank(room, query)); // 순위 보여주기
        }
        else if(In(query[0], keyword.RSP)) {
            if(query.length >= 2)
                send_msg(replier, room, CMD.playRSP(query)); // 가위바위보를 하기
        }
        else if(msg == keyword.NYAN_LANG) {
            send_msg(replier, room, nyan_lang); // 명령어 목록 보여주기
        }
        else if(msg == keyword.LEARNING_LIST) {
            send_msg(replier, room, CMD.showLearnList(room)); // 학습 목록 보여주기
        }
        else if(msg == keyword.TODAY) {
            send_msg(replier, room, CMD.showToday()); // 오늘 날짜 보여주기
        }
        else if(msg == keyword.TODAY_DAY) {
            send_msg(replier, room, CMD.showTodayDay()); // 오늘 요일 보여주기
        }
        else if(In(msg, keyword.HELLO_LIST)) {
            send_msg(replier, room, CMD.sayHello(sender)); // 인사하기
        }
        else if(msg == keyword.NYAN_BOT) {
            send_msg(replier, room, CMD.responseNyanBot()); // 화냥봇을 부르면 반응하기
            rank.update_rank_map(room, sender, rank.nyan_bot_rank_map, keyword.NYAN_BOT);
        }
        else if(msg == keyword.YOUR_NAME) {
            send_msg(replier, room, keyword.NYAN_BOT+"이다냥! "+keyword.MASTER+"님이 만들었다냥!"); // 화냥봇의 이름 말하기
        }
        else if(msg == keyword.MY_NAME) {
            send_msg(replier, room, sender+"님이다냥!"); // 메시지 보낸 사람의 이름 말하기
        }
        else if(msg == keyword.EAT) {
            send_msg(replier, room, CMD.eat(room, sender)); // 가장 최근에 메시지를 보낸 사람을 꿀꺽하기
        }
        else if(In(msg, keyword.VOMIT_LIST)) {
            send_msg(replier, room, CMD.vomit(room, sender)); // 가장 최근에 꿀꺽한 사람을 퉤엣하기
        }
        else if(msg == keyword.EAT_POCKET) {
            send_msg(replier, room, CMD.showEatPocket(room, sender)); // 꿀꺽주머니 보여주기
        }
        else if(msg == keyword.DIGESTION) {
            send_msg(replier, room, CMD.digest(room, sender)); // 소화하기
        }
        else if(query[0] == keyword.EMOJI) {
            if(query.length >= 2)
                for(let i of CMD.makeEmoji(query))
                    send_msg(replier, room, i); // 글자 이모지 만들기
        }
        else if(msg.toUpperCase() == keyword.PI) {
            send_msg(replier, room, CMD.PI()); // PI 보여주기
        }
        else if(msg == keyword.TEST) {
            send_msg(replier, room, CMD.test(replier, imageDB));
        }
        else {
            let learn_list = learn_map.get(room);

            for(let i=0; i<learn_list.length; i++) {
                if(msg == learn_list[i][0]) {
                    send_msg(replier, room, parse_learn_data_value(room, sender, learn_list[i][1])); // 메시지가 오면 학습데이터에 따라 반응하기
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
