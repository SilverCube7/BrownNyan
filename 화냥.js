/**
 * 봇주인: 화이트냥
 * 봇: 화냥봇
 */

const scriptName = "화냥";

const learn_map = new Map();
const msg_map = new Map();
const nyan_bot_msg_map = new Map();

const msg_map_limit = 500;
const nyan_bot_msg_map_limit = 100;
const eat_fail_percent = 3; // 꿀꺽 실패 확률이 1/eat_fail_percent
const eat_pocket_limit = 100;
const emoji_len_limit = 5;

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

function is_forbidden_word(s) {
    for(let i of forbidden_words)
        if(s.toUpperCase() == i.toUpperCase())
            return true;

    return false;
}

function in_forbidden_sign(s) {
    for(let i of forbidden_signs)
        if(s.indexOf(i) != -1)
            return true;

    return false;
}

function is_space(c) {
    for(let i of spaces)
        if(c == i)
            return true;

    return false;
}

const keyword = require("modules/NyanModules/keyword.js");
const lib = require("modules/NyanModules/lib.js");
const db = require("modules/NyanModules/db.js");

const PI_1000 = db.load_txt(db.make_full_path(keyword.NYAN_FILES+"/"+keyword.PI));
const nyan_lang = db.load_txt(db.make_full_path(keyword.NYAN_FILES+"/"+keyword.NYAN_LANG));
const forbidden_words = db.load_list(db.make_full_path(keyword.NYAN_FILES+"/"+keyword.FORBIDDEN_WORD))[0];

const rank = require("modules/NyanModules/rank.js");
const user = require("modules/NyanModules/user.js");
const tmr = require("modules/NyanModules/timer.js");
const cmd = require("modules/NyanModules/cmd.js");

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

function find_target(room) {
    let msg_list = msg_map.get(room);

    for(let i=msg_list.length-2; i>=0; i--)
        if(!lib.in_list(msg_list[i][1], keyword.L_NAMES))
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
                let choose_one = lib.strip(lib.choose(token.split(",")));
                new_value += choose_one;
                i = j;
                continue;
            }
        }

        new_value += value[i];
    }

    return new_value;
}

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
        if(lib.in_list(sender, keyword.L_NAMES)) {
            let msg_list = msg_map.get(room);

            // L이 똑같은 메시지를 계속 보내서 무한정 반응해버리는 현상 방지
            if(!(msg_list.length >= 2 && lib.in_list(msg_list[msg_list.length-2][1], keyword.L_NAMES))) {
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
                send_msg(replier, room, cmd.learn(room, query, sender)); // 학습시키기
            else if(query.length == 2)
                send_msg(replier, room, cmd.confirm_learn(room, query)); // 학습했는지 확인
        }
        else if(query[0] == keyword.DEL) {
            if(query.length >= 2)
                send_msg(replier, room, cmd.del(room, query)); // 학습한거 삭제
        }
        else if(query[0] == keyword.TALK) {
            if(query.length >= 2)
                send_msg(replier, room, cmd.show_prev_msg(room, query)); // 이전 메시지 보여주기
        }
        else if(query[0] == keyword.PHONE) {
            if(query.length >= 2)
                send_msg(replier, room, cmd.show_phone_info(query)); // 화냥폰 정보 보여주기
        }
        else if(query[0] == keyword.RANK) {
            if(query.length >= 2)
                send_msg(replier, room, cmd.show_rank(room, query)); // 순위 보여주기
        }
        else if(lib.in_list(query[0], keyword.RSP)) {
            if(query.length >= 2)
                send_msg(replier, room, cmd.play_rsp(query)); // 가위바위보를 하기
        }
        else if(msg == keyword.NYAN_LANG) {
            send_msg(replier, room, nyan_lang); // 명령어 목록 보여주기
        }
        else if(msg == keyword.LEARNING_LIST) {
            send_msg(replier, room, cmd.show_learn_list(room)); // 학습 목록 보여주기
        }
        else if(msg == keyword.TODAY) {
            send_msg(replier, room, cmd.show_today()); // 오늘 날짜 보여주기
        }
        else if(msg == keyword.TODAY_DAY) {
            send_msg(replier, room, cmd.show_today_day()); // 오늘 요일 보여주기
        }
        else if(lib.in_list(msg, keyword.HELLO_LIST)) {
            send_msg(replier, room, cmd.say_hello(sender)); // 인사하기
        }
        else if(msg == keyword.NYAN_BOT) {
            send_msg(replier, room, cmd.response_nyan_bot()); // 화냥봇을 부르면 반응하기
            rank.update_rank_map(room, sender, rank.nyan_bot_rank_map, keyword.NYAN_BOT);
        }
        else if(msg == keyword.YOUR_NAME) {
            send_msg(replier, room, keyword.NYAN_BOT+"이다냥! "+keyword.MASTER+"님이 만들었다냥!"); // 화냥봇의 이름 말하기
        }
        else if(msg == keyword.MY_NAME) {
            send_msg(replier, room, sender+"님이다냥!"); // 메시지 보낸 사람의 이름 말하기
        }
        else if(msg == keyword.EAT) {
            send_msg(replier, room, cmd.eat(room, sender)); // 가장 최근에 메시지를 보낸 사람을 꿀꺽하기
        }
        else if(lib.in_list(msg, keyword.VOMIT_LIST)) {
            send_msg(replier, room, cmd.vomit(room, sender)); // 가장 최근에 꿀꺽한 사람을 퉤엣하기
        }
        else if(msg == keyword.EAT_POCKET) {
            send_msg(replier, room, cmd.show_eat_pocket(room, sender)); // 꿀꺽주머니 보여주기
        }
        else if(msg == keyword.DIGESTION) {
            send_msg(replier, room, cmd.digest(room, sender)); // 소화하기
        }
        else if(query[0] == keyword.EMOJI) {
            if(query.length >= 2)
                for(let i of cmd.make_emoji(query))
                    send_msg(replier, room, i); // 글자 이모지 만들기
        }
        else if(msg.toUpperCase() == keyword.PI) {
            send_msg(replier, room, cmd.PI()); // PI 보여주기
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

const delay = 1000;
tmr.set_interval(enter_frame, delay, delay);

function enter_frame() {

    if(!Api.isOn(scriptName))
        tmr.clear_all();
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
