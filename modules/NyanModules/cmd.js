const day = ['일', '월', '화', '수', '목', '금', '토'];
const rsp_stoi = new Map([
    [kw.ROCK, 0],
    [kw.SCISSOR, 1],
    [kw.PAPER, 2]
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

function find_in_learn_list(s) {
    for(let i=0; i<learn_list.length; i++)
        if(s == learn_list[i][0])
            return i;

    return -1;
}

function learn(room, query, sender) {
    let A = query[1], B = "";

    for(let i=2; i<query.length; i++) B += query[i]+kw.SLASH;
    B = B.substring(0, B.length-1);

    if(A.length <= 1 || B.length == 0)
        return "너무 짧다냥!";

    if(is_forbidden_word(A) ||
       in_forbidden_sign(A) ||
       in_forbidden_sign(B) ||
       is_space(A[0]) ||
       is_space(A[A.length-1]))
        return "냥습할 수 없다냥!";

    let learn_list = learn_map.get(room);
    let learn_id = find_in_learn_list(A);

    if(learn_id != -1) {
        learn_list[learn_id][1] = B;
        learn_list[learn_id][2] = sender;
    } else {
        learn_list.push([A, B, sender]);
    }

    db.save_list(db.make_full_path(room+kw.SLASH+kw.LEARNING), learn_list);
    return "냥!";
}

function confirm_learn(room, query) {
    let A = query[1];

    let learn_list = learn_map.get(room);
    let learn_id = find_in_learn_list(A);

    if(learn_id != -1)
        return learn_list[learn_id][1]+", "+learn_list[learn_id][2]+"님이 냥습시켰다냥!";

    return "냥습한게 없다냥!";
}

function del(room, query) {
    let A = query[1];

    let learn_list = learn_map.get(room);
    let learn_id = find_in_learn_list(A);

    if(learn_id != -1) {
        learn_list.splice(learn_id, 1);
        db.save_list(db.make_full_path(room+kw.SLASH+kw.LEARNING), learn_list);
        return "냥!";
    }

    return "냥습한게 없다냥!";
}

function show_prev_msg(room, query) {
    let A = Number(query[1]);
    let msg_list = msg_map.get(room);

    if(!Number.isInteger(A))
        return "정수가 아니다냥!";

    if(!(0 <= A && A < msg_list.length))
        return "수가 범위를 초과했다냥!";

    return msg_list[msg_list.length-(A+1)][0]+", "+msg_list[msg_list.length-(A+1)][1]+"님이다냥!";
}

function show_phone_info(query) {
    let A = query[1];

    if(A == kw.VERSION)
        return "ver"+Device.getAndroidVersionName()+" 이다냥!";

    if(A == kw.BATTERY) {
        if(Device.getBatteryLevel() == 100) return "풀 차지 상태다냥!!";
        return Device.getBatteryLevel()+"% 남았다냥!";
    }

    if(A == kw.VOLTAGE)
        return Device.getBatteryVoltage()+"mV 이다냥!";

    if(A == kw.TEMPERATURE)
        return Device.getBatteryTemperature()/10+"℃ 이다냥!";

    if(A == kw.IS_CHARGING) {
        if(Device.isCharging()) return "충전 중이다냥!";
        return "충전 중이 아니다냥!";
    }

    return "이 정보는 1급기밀이다냥!";
}

function show_rank(room, query) {
    let A = query[1];

    if(A == kw.TALK) return rank.show_talk_rank(room);
    if(A == kw.PICTURE) return rank.show_picture_rank(room);
    if(A == kw.EMOTICON) return rank.show_emoticon_rank(room);
    if(A == kw.NYAN_BOT) return rank.show_nyan_bot_rank(room);
    if(A == kw.EAT) return rank.show_eat_rank(room);
    if(lib.in_list(A, kw.VOMIT_LIST)) return rank.show_vomit_rank(room);
    if(A == kw.ESCAPE) return rank.show_escape_rank(room);
    if(A == kw.EATEN) return rank.show_eaten_rank(room);
    if(lib.in_list(A, kw.VOMITED_LIST)) return rank.show_vomited_rank(room);
    if(A == kw.EAT_VS) return rank.show_eat_vs_rank(room);

    return "그런 순위는 없다냥!";
}

function show_learn_list(room) {
    let learn_list = learn_map.get(room);
    let show = "< "+kw.LEARNING_LIST+" >\n\n";

    for(let i=0; i<learn_list.length; i++)
        show += "("+String(i+1)+") "+String(learn_list[i][0])+kw.SLASH+String(learn_list[i][2])+'\n';

    return show;
}

function show_today() {
    const now = new Date();
    return now.getFullYear()+"년 "+(now.getMonth()+1)+"월 "+now.getDate()+"일이다냥!";
}

function show_today_day() {
    const now = new Date();
    return day[now.getDay()]+"요일이다냥!";
}

function say_hello(sender) {
    return sender+"님 "+lib.choose(["환영한다냥!", "반갑다냥!", "어서오라냥!"]);
}

function response_nyan_bot() {
    return lib.choose(["냥?", "냐앙?", "왜 불렀냥?", "무슨 일이냥?"]);
}

function play_rsp(query) {
    let me = query[1];

    me = rsp_stoi.get(me);
    if(me == undefined)
        return "무엇을 낸 거냥?";

    let bot = lib.randint(0, 2);

    const res = rsp_res[bot][me];
    bot = rsp_itos.get(bot);

    if(res == 'tie') return bot+"! "+lib.choose(["무승부다냥!", "비겼다냥!"]);
    if(res == 'bot') return bot+"! 내가 이겼다냥!";
    return bot+"! 내가 졌다냥..";
}

function eat(room, sender) {
    let target = find_target(room);

    if(!target)
        return "꿀꺽할 사람이 없다냥!";

    if(target == sender)
        return "자신을 꿀꺽할 수 없다냥!";

    if(lib.randint(0, eat_fail_percent-1) == 0) {
        rank.update_rank_map(room, target, rank.escape_rank_map, kw.ESCAPE);
        return target+"님을 꿀꺽하려고 했지만, 도망갔다냥!";
    }

    user.push_in_eat_pocket(room, sender, target);
    rank.update_rank_map(room, sender, rank.eat_rank_map, kw.EAT);
    rank.update_rank_map(room, target, rank.eaten_rank_map, kw.EATEN);

    return target+"님을 꿀꺽했다냥!";
}

function vomit(room, sender) {
    let target = user.pop_in_eat_pocket(room, sender);

    if(!target)
        return "꿀꺽주머니에 아무것도 없다냥!";

    rank.update_rank_map(room, sender, rank.vomit_rank_map, kw.VOMIT);
    rank.update_rank_map(room, target, rank.vomited_rank_map, kw.VOMITED);

    return target+"님을 뱉었다냥!";
}

function show_eat_pocket(room, sender) {
    let user_info = user.load_user_info(room, sender, user.eat_pocket, kw.EAT_POCKET);
    let show = "< "+sender+"님의 꿀꺽주머니 >\n\n";

    for(let i=user_info.length-1; i>=0; i--)
        show += "("+String(user_info.length-i)+") "+String(user_info[i][0])+'\n';

    return show;
}

function digest(room, sender) {
    let user_info = user.load_user_info(room, sender, user.eat_pocket, kw.EAT_POCKET);

    if(!user_info.length)
        return "꿀꺽주머니에 아무것도 없다냥!";

    user.clear_eat_pocket(room, sender);

    return "소화제를 사용해서 강제로 소화했다냥!";
}

function make_emoji(query) {
    let A = query[1];

    if(!(1 <= A.length && A.length <= emoji_len_limit))
        return ["길이는 "+"1~"+emoji_len_limit+" 사이여야 한다냥!"];

    let emoji_list = [];
    for(let i of A) emoji_list.push(i+kw.EMOJI_CODE);

    return emoji_list;
}

function PI() {
    return PI_1000+" 이다냥!";
}

const obj = {
    learn: learn,
    confirm_learn: confirm_learn,
    del: del,
    show_prev_msg: show_prev_msg,
    show_phone_info: show_phone_info,
    show_rank: show_rank,
    show_learn_list: show_learn_list,
    show_today: show_today,
    show_today_day: show_today_day,
    say_hello: say_hello,
    response_nyan_bot: response_nyan_bot,
    play_rsp: play_rsp,
    eat: eat,
    vomit: vomit,
    show_eat_pocket: show_eat_pocket,
    digest: digest,
    make_emoji: make_emoji,
    PI: PI
};

module.exports = obj;
