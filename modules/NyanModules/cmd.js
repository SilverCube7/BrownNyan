const day = ['일', '월', '화', '수', '목', '금', '토'];
const rsp_stoi = new Map([
    [kw.ROCK, 0],
    [kw.ROCK_2, 0],
    [kw.SCISSOR, 1],
    [kw.PAPER, 2],
    [kw.PAPER_2, 2]
]);
const rsp_itos = new Map([
    [0, kw.ROCK],
    [1, kw.SCISSOR],
    [2, kw.PAPER]
]);
const rsp_res = [
    ['tie', 'bot', 'me'],
    ['me', 'tie', 'bot'],
    ['bot', 'me', 'tie']
];

function find_in_learn_list(learn_list, s) {
    for(let i=0; i<learn_list.length; i++) {
        if(s == learn_list[i][0]) {
            return i;
        }
    }

    return -1;
}

function learn(room, sender, query) {
    if(query.length == 1) {
        let A = query[0];

        if(A == kw.LIST) {
            return show_learn_list(room, sender, query.slice(1));
        }

        return confirm_learn(room, sender, query);
    }

    if(query.length >= 2) {
        let A = query[0], B = "";

        for(let i=1; i<query.length; i++) {
            B += query[i]+kw.SLASH;
        }
        B = B.substring(0, B.length-1);

        if(A.length <= 1 || B.length == 0) {
            return ans.TOO_SHORT;
        }

        if(is_forbidden_word(A) ||
           in_forbidden_sign(A) ||
           in_forbidden_sign(B) ||
           is_space(A[0]) ||
           is_space(A[A.length-1])) {
            return ans.CAN_NOT_LEARNING;
        }

        let learn_list = learn_map.get(room);
        let learn_id = find_in_learn_list(learn_list, A);

        if(learn_id != -1) {
            learn_list[learn_id][1] = B;
            learn_list[learn_id][2] = sender;
        } else {
            learn_list.push([A, B, sender]);
        }

        db.save_list(db.make_full_path(room+kw.SLASH+kw.LEARNING), learn_list);
        return ans.OK;
    }

    return ans.BLANK;
}

function confirm_learn(room, sender, query) {
    let A = query[0];

    let learn_list = learn_map.get(room);
    let learn_id = find_in_learn_list(learn_list, A);

    if(learn_id != -1) {
        return ans.confirm_learn(learn_list[learn_id][1], learn_list[learn_id][2]);
    }

    return ans.HAVE_NOT_LEARNING;
}

function del(room, sender, query) {
    if(query.length == 1) {
        let A = query[0];

        let learn_list = learn_map.get(room);
        let learn_id = find_in_learn_list(learn_list, A);

        if(learn_id != -1) {
            learn_list.splice(learn_id, 1);
            db.save_list(db.make_full_path(room+kw.SLASH+kw.LEARNING), learn_list);
            return ans.OK;
        }

        return ans.HAVE_NOT_LEARNING;
    }

    return ans.BLANK;
}

function show_prev_msg(room, sender, query) {
    if(query.length == 1) {
        let A = Number(query[0]);
        let msg_list = msg_map.get(room);

        if(!Number.isInteger(A)) {
            return ans.IS_NOT_INT;
        }

        if(!(0 <= A && A < msg_list.length)) {
            return ans.NOT_IN_RANGE;
        }

        return ans.show_prev_msg(msg_list[msg_list.length-(A+1)][0], msg_list[msg_list.length-(A+1)][1]);
    }

    return ans.BLANK;
}

function show_phone_info(room, sender, query) {
    if(query.length == 1) {
        let A = query[0];

        if(A == kw.VERSION) {
            return ans.show_phone_version(Device.getAndroidVersionName());
        }
        if(A == kw.BATTERY) {
            if(Device.getBatteryLevel() == 100) {
                return ans.FULL_CHARGING;
            }
            return ans.show_phone_battery(Device.getBatteryLevel());
        }
        if(A == kw.VOLTAGE) {
            return ans.show_phone_voltage(Device.getBatteryVoltage());
        }
        if(A == kw.TEMPERATURE) {
            return ans.show_phone_temperature(Device.getBatteryTemperature()/10);
        }
        if(A == kw.IS_CHARGING) {
            if(Device.isCharging()) {
                return ans.IS_CHARGING;
            }
            return ans.IS_NOT_CHARGING;
        }

        return ans.SECRET;
    }

    return ans.BLANK;
}

function show_rank(room, sender, query) {
    if(query.length == 1) {
        let A = query[0];

        if(A == kw.TALK) return rank.show_talk_rank(room);
        if(A == kw.PICTURE) return rank.show_picture_rank(room);
        if(A == kw.EMOTICON) return rank.show_emoticon_rank(room);
        if(lib.in_list(A, kw.BROWN_NYAN_LIST)) return rank.show_brown_nyan_rank(room);
        if(A == kw.EAT) return rank.show_eat_rank(room);
        if(lib.in_list(A, kw.VOMIT_LIST)) return rank.show_vomit_rank(room);
        if(A == kw.ESCAPE) return rank.show_escape_rank(room);
        if(A == kw.EATEN) return rank.show_eaten_rank(room);
        if(lib.in_list(A, kw.VOMITED_LIST)) return rank.show_vomited_rank(room);
        if(A == kw.EAT_VS) return rank.show_eat_vs_rank(room);
        if(lib.in_list(A, kw.LICK_LIST)) return rank.show_lick_rank(room);
        if(lib.in_list(A, kw.LICKED_LIST)) return rank.show_licked_rank(room);

        return ans.IS_NOT_RANK;
    }

    return ans.BLANK;
}

function show_nyan_lang(room, sender, query) {
    if(!query.length) {
        return nyan_lang;
    }

    return ans.BLANK;
}

function show_learn_list(room, sender, query) {
    if(!query.length) {
        let learn_list = learn_map.get(room);
        let show = "< "+kw.LEARNING_LIST+" >\n\n";

        for(let i=0; i<learn_list.length; i++) {
            show += "("+String(i+1)+") "+String(learn_list[i][0])+kw.SLASH+String(learn_list[i][2])+'\n';
        }

        return show;
    }

    return ans.BLANK;
}

function show_date(room, sender, query, add) {
    if(!query.length) {
        const date = new Date();
        date.setDate(date.getDate()+add);
        return ans.show_date(date.getFullYear(), date.getMonth()+1, date.getDate());
    }

    return ans.BLANK;
}

function show_today(room, sender, query) {
    return show_date(room, sender, query, 0);
}

function show_tomorrow(room, sender, query) {
    return show_date(room, sender, query, 1);
}

function show_two_days_from_today(room, sender, query) {
    return show_date(room, sender, query, 2);
}

function show_three_days_from_today(room, sender, query) {
    return show_date(room, sender, query, 3);
}

function show_four_days_from_today(room, sender, query) {
    return show_date(room, sender, query, 4);
}

function show_yesterday(room, sender, query) {
    return show_date(room, sender, query, -1);
}

function show_two_days_ago(room, sender, query) {
    return show_date(room, sender, query, -2);
}

function show_three_days_ago(room, sender, query) {
    return show_date(room, sender, query, -3);
}

function show_today_day(room, sender, query) {
    if(!query.length) {
        const now = new Date();
        return ans.show_date_day(day[now.getDay()]);
    }

    return ans.BLANK;
}

function say_hello(room, sender, query) {
    if(!query.length) {
        return ans.say_hello(sender);
    }

    return ans.BLANK;
}

function response_brown_nyan(room, sender, query) {
    if(!query.length) {
        rank.update_rank_map(room, sender, rank.brown_nyan_rank_map, kw.BROWN_NYAN);
        return ans.response_brown_nyan();
    }

    return ans.BLANK;
}

function show_your_name(room, sender, query) {
    if(!query.length) {
        return ans.show_your_name(kw.BROWN_NYAN, kw.MASTER);
    }

    return ans.BLANK;
}

function show_my_name(room, sender, query) {
    if(!query.length) {
        return ans.show_my_name(sender);
    }

    return ans.BLANK;
}

function play_rsp(room, sender, query) {
    if(query.length == 1) {
        let me = query[0];

        me = rsp_stoi.get(me);
        if(me == undefined) {
            return ans.SHOW_WHAT;
        }

        let bot = lib.randint(0, 2);

        const res = rsp_res[bot][me];
        bot = rsp_itos.get(bot);

        if(res == 'tie') {
            return ans.rsp_tie(bot);
        }
        if(res == 'bot') {
            return ans.rsp_win(bot);
        }
        return ans.rsp_lose(bot);
    }

    return ans.BLANK;
}

function eat(room, sender, query) {
    if(!query.length) {
        let target = find_target(room);

        if(!target) {
            return ans.HAVE_NOT_TARGET;
        }

        if(target == sender) {
            return ans.CAN_NOT_EAT_ME;
        }

        if(lib.randint(0, eat_fail_percent-1) == 0) {
            rank.update_rank_map(room, target, rank.escape_rank_map, kw.ESCAPE);
            return ans.escape(target);
        }

        user.push_in_eating_pocket(room, sender, target);
        rank.update_rank_map(room, sender, rank.eat_rank_map, kw.EAT);
        rank.update_rank_map(room, target, rank.eaten_rank_map, kw.EATEN);

        return ans.eat(target);
    }

    return ans.BLANK;
}

function vomit(room, sender, query) {
    if(!query.length) {
        let target = user.pop_in_eating_pocket(room, sender);

        if(!target) {
            return ans.EMPTY_EATING_POCKET;
        }

        rank.update_rank_map(room, sender, rank.vomit_rank_map, kw.VOMIT);
        rank.update_rank_map(room, target, rank.vomited_rank_map, kw.VOMITED);

        return ans.vomit(target);
    }

    return ans.BLANK;
}

function show_eating_pocket(room, sender, query) {
    if(!query.length) {
        let user_info = user.load_user_info(room, sender, user.eating_pocket, kw.EATING_POCKET);
        let show = "< "+sender+"님의 꿀꺽주머니 >\n\n";

        for(let i=user_info.length-1; i>=0; i--) {
            show += "("+String(user_info.length-i)+") "+String(user_info[i][0])+'\n';
        }

        return show;
    }

    return ans.BLANK;
}

function digest(room, sender, query) {
    if(!query.length) {
        let user_info = user.load_user_info(room, sender, user.eating_pocket, kw.EATING_POCKET);

        if(!user_info.length) {
            return ans.EMPTY_EATING_POCKET;
        }

        user.clear_eating_pocket(room, sender);

        return ans.FORCIBLY_DIGEST;
    }

    return ans.BLANK;
}

function lick(room, sender, query) {
    if(!query.length) {
        let target = find_target(room);

        if(!target) {
            return ans.HAVE_NOT_TARGET;
        }

        if(target == sender) {
            return ans.CAN_NOT_LICK_ME;
        }

        rank.update_rank_map(room, sender, rank.lick_rank_map, kw.LICK);
        rank.update_rank_map(room, target, rank.licked_rank_map, kw.LICKED);

        if(lib.randint(0, lick_and_eat_percent-1) == 0) {
            user.push_in_eating_pocket(room, sender, target);
            rank.update_rank_map(room, sender, rank.eat_rank_map, kw.EAT);
            rank.update_rank_map(room, target, rank.eaten_rank_map, kw.EATEN);

            return ans.lick_and_eat(target);
        }

        return ans.lick(target);
    }

    return ans.BLANK;
}

function make_emoji(room, sender, query) {
    let A = query[0];

    if(!(1 <= A.length && A.length <= emoji_len_limit)) {
        return [ans.len_between_a_and_b(1, emoji_len_limit)];
    }

    let emoji_list = [];
    for(let i of A) {
        emoji_list.push(i+kw.EMOJI_CODE);
    }

    return emoji_list;
}

function find_in_statement_list(statement_list, s1, s2) {
    for(let i=0; i<statement_list.length; i++) {
        if(s1 == statement_list[i][0] && s2 == statement_list[i][1]) {
            return i;
        }
    }

    return -1;
}

function process_statement(room, sender, query) {
    if(query.length == 1) {
        let A = query[0];

        if(A == kw.LIST) return show_statement_list(room, sender, query.slice(1));
    }

    if(query.length == 2) {
        return confirm_statement(room, sender, query);
    }

    if(query.length == 3) {
        let A = query[0];

        if(A == kw.ADD) return set_statement(room, sender, query.slice(1));
        if(A == kw.DEL) return del_statement(room, sender, query.slice(1));
    }

    return ans.BLANK;
}

function set_statement(room, sender, query) {
    let A = query[0], B = query[1];

    if(!(A.length && B.length)) {
        return ans.TOO_SHORT;
    }

    const re = /^!?[\wㄱ-ㅎㅏ-ㅣ가-힣]+$/;

    if(!re.test(A) ||
       !re.test(B) ||
       is_forbidden_word(A) ||
       is_forbidden_word(B) ||
       (A[0] == "!" && is_forbidden_word(A.substring(1))) ||
       (B[0] == "!" && is_forbidden_word(B.substring(1)))) {
        return ans.CAN_NOT_SET_STATEMENT;
    }

    let statement_list = statement_map.get(room);
    let statement_id = find_in_statement_list(statement_list, A, B);

    if(statement_id != -1) {
        statement_list[statement_id][0] = A;
        statement_list[statement_id][1] = B;
        statement_list[statement_id][2] = sender;
    } else {
        statement_list.push([A, B, sender]);
    }

    db.save_list(db.make_full_path(room+kw.SLASH+kw.STATEMENT), statement_list);
    return ans.OK;
}

function confirm_statement(room, sender, query) {
    let A = query[0], B = query[1];

    let statement_list = statement_map.get(room);
    let statement_id = find_in_statement_list(statement_list, A, B);

    if(statement_id != -1) {
        return ans.confirm_statement(statement_list[statement_id][0], statement_list[statement_id][1], statement_list[statement_id][2]);
    }

    return ans.HAVE_NOT_STATEMENT;
}

function del_statement(room, sender, query) {
    let A = query[0], B = query[1];

    let statement_list = statement_map.get(room);
    let statement_id = find_in_statement_list(statement_list, A, B);

    if(statement_id != -1) {
        statement_list.splice(statement_id, 1);
        db.save_list(db.make_full_path(room+kw.SLASH+kw.STATEMENT), statement_list);
        return ans.OK;
    }

    return ans.HAVE_NOT_STATEMENT;
}

function show_statement_list(room, sender, query) {
    if(!query.length) {
        let statement_list = statement_map.get(room);
        let show = "< "+kw.STATEMENT_LIST+" >\n\n";

        for(let i=0; i<statement_list.length; i++) {
            show += "("+String(i+1)+") "+String(statement_list[i][0])+kw.RIGHT_ARROW+String(statement_list[i][1])+kw.SLASH+String(statement_list[i][2])+'\n';
        }

        return show;
    }

    return ans.BLANK;
}

function convert_statement(msg) {
    // A은[는] B(이)다!
    if(/^!?[\wㄱ-ㅎㅏ-ㅣ가-힣]+[은는] +!?[\wㄱ-ㅎㅏ-ㅣ가-힣]+이?다!$/.test(msg)) {
        const re1 = /[은는] +/, re2 = /이?다!$/;
        const k1 = re1.exec(msg).index, k2 = re2.exec(msg).index;

        /*
            (자음)+은
            (모음)+는
        */
        if(!lib.is_end_of_vowel(msg.substring(0, k1)) != (msg[k1] == "은")) {
            return undefined;
        }

        /*
            (자음)+이다!
            (모음)+이다!/다!
        */
        if(!lib.is_end_of_vowel(msg.substring(k1+2, k2)) && (msg[k2] != "이")) {
            return undefined;
        }

        return msg.replace(re2, "").split(re1);
    }

    // A -> B
    if(/^!?[\wㄱ-ㅎㅏ-ㅣ가-힣]+ *-> *!?[\wㄱ-ㅎㅏ-ㅣ가-힣]+$/.test(msg)) {
        return msg.split(/ *-> */);
    }

    // A → B
    if(/^!?[\wㄱ-ㅎㅏ-ㅣ가-힣]+ *→ *!?[\wㄱ-ㅎㅏ-ㅣ가-힣]+$/.test(msg)) {
        return msg.split(/ *→ */);
    }

    return undefined;
}

function is_true_statement(statement_list, query) {
    let A = query[0], B = query[1];

    statement_graph.clear();

    for(let i of statement_list) {
        statement_graph.connect(i[0], i[1]);
        statement_graph.connect(("!"+i[1]).replace("!!", ""), ("!"+i[0]).replace("!!", ""));
    }

    if(statement_graph.dfs(A, B)) {
        return ans.IS_TRUE_STATEMENT;
    }

    return ans.IS_FALSE_STATEMENT;
}

function PI(room, sender, query) {
    if(!query.length) {
        return ans.show(PI_1000);
    }

    return ans.BLANK;
}


// TODO: 아직 구현 안함
function dev_command(room, sender, query) {
    if(query.length >= 1) {
        const pw = Number(query[0]);

        if(pw == password.load_pw()) {
        }

        password.generate_pw();
    }

    return ans.BLANK;
}

// TODO: 아직 구현 안함
function admin_command(room, sender, query) {
    if(query.length >= 1) {
    }

    return ans.BLANK;
}

const obj = {
    learn: learn,
    del: del,
    show_prev_msg: show_prev_msg,
    show_phone_info: show_phone_info,
    show_rank: show_rank,
    show_nyan_lang: show_nyan_lang,
    show_learn_list: show_learn_list,
    show_today: show_today,
    show_tomorrow: show_tomorrow,
    show_two_days_from_today: show_two_days_from_today,
    show_three_days_from_today : show_three_days_from_today,
    show_four_days_from_today : show_four_days_from_today,
    show_yesterday : show_yesterday,
    show_two_days_ago : show_two_days_ago,
    show_three_days_ago : show_three_days_ago,
    show_today_day: show_today_day,
    say_hello: say_hello,
    response_brown_nyan: response_brown_nyan,
    show_your_name: show_your_name,
    show_my_name: show_my_name,
    play_rsp: play_rsp,
    eat: eat,
    vomit: vomit,
    show_eating_pocket: show_eating_pocket,
    digest: digest,
    lick: lick,
    make_emoji: make_emoji,
    process_statement: process_statement,
    set_statement: set_statement,
    confirm_statement: confirm_statement,
    del_statement: del_statement,
    show_statement_list: show_statement_list,
    convert_statement: convert_statement,
    is_true_statement: is_true_statement,
    PI: PI,
    dev_command: dev_command,
    admin_command: admin_command
};

module.exports = obj;
