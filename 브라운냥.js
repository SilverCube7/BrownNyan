/**
 * 봇주인: 화이트냥
 * 봇: 브라운냥
 */

const scriptName = "브라운냥";

const learn_map = new Map();
const statement_map = new Map();
const msg_map = new Map();
const brown_nyan_msg_map = new Map();

const msg_map_limit = 500;
const brown_nyan_msg_map_limit = 100;
const eat_fail_percent = 4; // 꿀꺽 실패 확률이 1/eat_fail_percent
const lick_and_eat_percent = 4; // 핥짝하고 꿀꺽할 확률이 1/lick_and_eat_percent
const eating_pocket_limit = 100;
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
    for(let i of forbidden_words) {
        if(s.toUpperCase() == i.toUpperCase()) {
            return true;
        }
    }

    return false;
}

function in_forbidden_sign(s) {
    for(let i of forbidden_signs) {
        if(s.indexOf(i) != -1) {
            return true;
        }
    }

    return false;
}

function is_space(c) {
    for(let i of spaces) {
        if(c == i) {
            return true;
        }
    }

    return false;
}

function in_space(s) {
    for(let i of spaces) {
        if(s.indexOf(i) != -1) {
            return true;
        }
    }

    return false;
}

const kw = require("modules/NyanModules/keyword.js");
const lib = require("modules/NyanModules/lib.js");
const ans = require("modules/NyanModules/ans.js");
const db = require("modules/NyanModules/db.js");

const PI_1000 = db.load_txt(db.make_full_path(kw.NYAN_FILES+kw.SLASH+kw.PI));
const nyan_lang = db.load_txt(db.make_full_path(kw.NYAN_FILES+kw.SLASH+kw.NYAN_LANG));
const forbidden_words = db.load_list(db.make_full_path(kw.NYAN_FILES+kw.SLASH+kw.FORBIDDEN_WORD))[0];

const rank = require("modules/NyanModules/rank.js");
const user = require("modules/NyanModules/user.js");
const password = require("modules/NyanModules/password.js");
const profile = require("modules/NyanModules/profile.js");
const statement_graph = require("modules/NyanModules/graph.js");
const cmd = require("modules/NyanModules/cmd.js");
const tmr = require("modules/NyanModules/timer.js");

function find_target(room) {
    let msg_list = msg_map.get(room);

    for(let i=msg_list.length-2; i>=0; i--) {
        if(!lib.in_list(msg_list[i][1], kw.L_NAMES)) {
            return msg_list[i][1];
        }
    }

    return undefined;
}

function is_brown_nyan_last_msg(room, msg) {
    if(brown_nyan_msg_map.has(room)) {
        let len = brown_nyan_msg_map.get(room).length;

        if(len > 0) {
            return brown_nyan_msg_map.get(room)[len-1] == msg;
        }
    }

    return false;
}

function is_room_prefix(room, prefix) {
    return room.substring(0, prefix.length) == prefix;
}

function parse_learn_data_value(room, sender, value) {
    target = find_target(room);
    if(!target) {
        target = sender;
    }

    while(value.indexOf(kw.ME_TOKEN) != -1) {
        value = value.replace(kw.ME_TOKEN, sender);
    }
    while(value.indexOf(kw.YOU_TOKEN) != -1) {
        value = value.replace(kw.YOU_TOKEN, target);
    }

    let new_value = "";

    // % a1, a2, ... % 파싱
    for(let i=0; i<value.length; i++) {
        if(value[i] == '%') {
            let token = "", j = i+1;

            for(; (j<value.length && value[j]!='%'); j++) {
                token += value[j];
            }

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

function push_in_brown_nyan_msg_map(room, msg) {
    if(!brown_nyan_msg_map.has(room)) {
        brown_nyan_msg_map.set(room, []);
    }

    while(brown_nyan_msg_map.get(room).length > brown_nyan_msg_map_limit) {
        brown_nyan_msg_map.get(room).shift();
    }

    brown_nyan_msg_map.get(room).push(msg);
}

function send_emoji(replier, room, sender, query) {
    if(query.length == 1) {
        for(let i of cmd.make_emoji(room, sender, query)) {
            send_msg(replier, room, i);
        }
    }
}

function send_msg(replier, room, msg) {
    push_in_brown_nyan_msg_map(room, msg);

    if(!msg) {
        return false;
    }

    return replier.reply(msg);
}

const cmd_map = new Map([
    [kw.LEARNING, cmd.learn],
    [kw.DEL, cmd.del],
    [kw.TALK, cmd.show_prev_msg],
    [kw.PHONE, cmd.show_phone_info],
    [kw.RANK, cmd.show_rank],
    [kw.NYAN_LANG, cmd.show_nyan_lang],
    [kw.LEARNING_LIST, cmd.show_learn_list],
    [kw.TODAY, cmd.show_today],
    [kw.TOMORROW, cmd.show_tomorrow],
    [kw.TWO_DAYS_FROM_TODAY, cmd.show_two_days_from_today],
    [kw.THREE_DAYS_FROM_TODAY, cmd.show_three_days_from_today],
    [kw.FOUR_DAYS_FROM_TODAY, cmd.show_four_days_from_today],
    [kw.YESTERDAY, cmd.show_yesterday],
    [kw.TWO_DAYS_AGO, cmd.show_two_days_ago],
    [kw.THREE_DAYS_AGO, cmd.show_three_days_ago],
    [kw.TODAY_DAY, cmd.show_today_day],
    [kw.BROWN_NYAN, cmd.response_brown_nyan],
    [kw.YOUR_NAME, cmd.show_your_name],
    [kw.MY_NAME, cmd.show_my_name],
    [kw.EAT, cmd.eat],
    [kw.EATING_POCKET, cmd.show_eating_pocket],
    [kw.DIGESTION, cmd.digest],
    [kw.STATEMENT, cmd.process_statement],
    [kw.STATEMENT_LIST, cmd.show_statement_list],
    [kw.DEV, cmd.dev_command]
]);
for(let k of kw.RSP) {
    cmd_map.set(k, cmd.play_rsp);
}
for(let k of kw.HELLO_LIST) {
    cmd_map.set(k, cmd.say_hello);
}
for(let k of kw.VOMIT_LIST) {
    cmd_map.set(k, cmd.vomit);
}
for(let k of kw.LICK_LIST) {
    cmd_map.set(k, cmd.lick);
}
for(let k of kw.ADMIN_LIST) {
    cmd_map.set(k, cmd.admin_command);
}

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    /**
     * 브라운냥이 참가하고 있는 room이 다음 조건들 중 하나를 만족해야 반응
     *     room이 화이트냥
     *     room의 접두사가 [BN]
     */
    if(room == kw.MASTER || is_room_prefix(room, "[BN]")) {
        if(!learn_map.has(room)) {
            learn_map.set(room, db.load_list(db.make_full_path(room+kw.SLASH+kw.LEARNING)));
        }

        if(!statement_map.has(room)) {
            statement_map.set(room, db.load_list(db.make_full_path(room+kw.SLASH+kw.STATEMENT)));
        }

        if(!msg_map.has(room)) {
            msg_map.set(room, db.load_list(db.make_full_path(room+kw.SLASH+kw.MSG)));
        }

        msg_map.get(room).push([msg, sender]);

        while(msg_map.get(room).length > msg_map_limit+1) {
            msg_map.get(room).shift();
        }

        db.save_list(db.make_full_path(room+kw.SLASH+kw.MSG), msg_map.get(room));

        profile.update_profile(room, sender, imageDB);

        // L의 메시지에 반응하지 않음 (특정 메시지는 제외)
        if(lib.in_list(sender, kw.L_NAMES)) {
            let msg_list = msg_map.get(room);

            // L이 똑같은 메시지를 계속 보내서 무한정 반응해버리는 현상 방지
            if(!(msg_list.length >= 2 && lib.in_list(msg_list[msg_list.length-2][1], kw.L_NAMES))) {
                // L이 특정 메시지를 보내면 반응
                if((msg == kw.BROWN_NYAN+"님, 죽어주세요 !") ||
                   (msg == "탕" && is_brown_nyan_last_msg(room, "러시안룰렛"))) { // FIXME: ;;;
                    send_msg(replier, room, "꾸에에엑");
                } else if(msg.indexOf(kw.BROWN_NYAN+"님") != -1) {
                    send_msg(replier, room, "냥!?");
                }
            }

            return;
        }

        if(msg == kw.SEND_PICTURE) {
            rank.update_rank_map(room, sender, rank.picture_rank_map, kw.PICTURE);
        } else if(msg == kw.SEND_EMOTICON) {
            rank.update_rank_map(room, sender, rank.emoticon_rank_map, kw.EMOTICON);
        } else {
            rank.update_rank_map(room, sender, rank.talk_rank_map, kw.TALK);
        }

        let query = msg.split('/');
        const statement = cmd.convert_statement(msg);

        if(query[0].toUpperCase() == kw.PI) {
            send_msg(replier, room, cmd.PI(room, sender, query.slice(1)));
        } else if(query[0] == kw.EMOJI) {
            send_emoji(replier, room, sender, query.slice(1));
        } else if(cmd_map.get(query[0])) {
            send_msg(replier, room, cmd_map.get(query[0])(room, sender, query.slice(1)));
        } else if(statement) {
            send_msg(replier, room, cmd.is_true_statement(statement_map.get(room), statement));
        } else {
            let learn_list = learn_map.get(room);

            // 메시지가 오면 학습데이터에 따라 반응하기
            for(let i=0; i<learn_list.length; i++) {
                if(msg == learn_list[i][0]) {
                    send_msg(replier, room, parse_learn_data_value(room, sender, learn_list[i][1]));
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
