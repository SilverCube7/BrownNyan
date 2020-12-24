const talk_rank_map = new Map();
const picture_rank_map = new Map();
const emoticon_rank_map = new Map();
const brown_nyan_rank_map = new Map();
const eat_rank_map = new Map();
const vomit_rank_map = new Map();
const escape_rank_map = new Map();
const eaten_rank_map = new Map();
const vomited_rank_map = new Map();
const eat_vs_rank_map = new Map();

function load_rank_list(room, rank_map, rank_name) {
    if(!rank_map.has(room)) {
        rank_map.set(room, db.load_list(db.make_full_path(room+kw.SLASH+kw.RANK+kw.SLASH+rank_name)));
    }

    return rank_map.get(room);
}

function convert_str_to_num(k, rank_list) {
    rank_list[k][1] = Number(rank_list[k][1]);
}

function convert_num_to_str(k, rank_list) {
    rank_list[k][1] = String(rank_list[k][1]);
}

function find_who_in_rank_list(who, rank_list) {
    for(let i=0; i<rank_list.length; i++) {
        if(rank_list[i][0] == who) {
            return i;
        }
    }

    return -1;
}

function update_rank_list(k, rank_list, cnt) {
    rank_list[k][1] += cnt;
}

function push_in_rank_list(who, rank_list, cnt) {
    rank_list.push([who, cnt]);
}

function update_rank_map(room, who, rank_map, rank_name, cnt) {
    if(!cnt) {
        cnt = 1;
    }

    let rank_list = load_rank_list(room, rank_map, rank_name);

    for(let i=0; i<rank_list.length; i++) {
        convert_str_to_num(i, rank_list);
    }

    let k = find_who_in_rank_list(who, rank_list);

    if(k != -1) {
        update_rank_list(k, rank_list, cnt);
    } else {
        push_in_rank_list(who, rank_list, cnt);
    }

    rank_list.sort((a, b) => b[1]-a[1]); // 내림차순 정렬

    for(let i=0; i<rank_list.length; i++) {
        convert_num_to_str(i, rank_list);
    }

    db.save_list(db.make_full_path(room+kw.SLASH+kw.RANK+kw.SLASH+rank_name), rank_list);
}

function update_eat_vs_rank_map(room, rank_map, rank_name) {
    let rank_list = load_rank_list(room, rank_map, rank_name);

    while(rank_list.length > 0) {
        rank_list.pop();
    }

    let eat_rank_list = load_rank_list(room, eat_rank_map, kw.EAT);
    let eaten_rank_list = load_rank_list(room, eaten_rank_map, kw.EATEN);

    for(let i of eat_rank_list) {
        rank_list.push([i[0], Number(i[1])]);
    }

    for(let i of eaten_rank_list) {
        let who = i[0], cnt = -Number(i[1]);
        let k = find_who_in_rank_list(who, rank_list);

        if(k != -1) {
            update_rank_list(k, rank_list, cnt);
        } else {
            push_in_rank_list(who, rank_list, cnt);
        }
    }

    rank_list.sort((a, b) => b[1]-a[1]); // 내림차순 정렬

    for(let i=0; i<rank_list.length; i++) {
        convert_num_to_str(i, rank_list);
    }

    db.save_list(db.make_full_path(room+kw.SLASH+kw.RANK+kw.SLASH+rank_name), rank_list);
}

function show_rank(title, rank_list) {
    let s = "< "+title+" >\n\n";

    for(let i=0; i<rank_list.length; i++) {
        s += "("+String(i+1)+") "+String(rank_list[i][0])+": "+String(rank_list[i][1])+'\n';
    }

    return s;
}

function show_talk_rank(room) {
    let rank_list = load_rank_list(room, talk_rank_map, kw.TALK);
    return show_rank(kw.RANK+": 수다쟁이", rank_list);
}

function show_picture_rank(room) {
    let rank_list = load_rank_list(room, picture_rank_map, kw.PICTURE);
    return show_rank(kw.RANK+": 사진을 많이 보낸 사람", rank_list);
}

function show_emoticon_rank(room) {
    let rank_list = load_rank_list(room, emoticon_rank_map, kw.EMOTICON);
    return show_rank(kw.RANK+": 임티를 많이 보낸 사람", rank_list);
}

function show_brown_nyan_rank(room) {
    let rank_list = load_rank_list(room, brown_nyan_rank_map, kw.BROWN_NYAN);
    return show_rank(kw.RANK+": 브라운냥을 많이 부른 사람", rank_list);
}

function show_eat_rank(room) {
    let rank_list = load_rank_list(room, eat_rank_map, kw.EAT);
    return show_rank(kw.RANK+": 먹보", rank_list);
}

function show_vomit_rank(room) {
    let rank_list = load_rank_list(room, vomit_rank_map, kw.VOMIT);
    return show_rank(kw.RANK+": 퉤엣을 많이 한 사람", rank_list);
}

function show_escape_rank(room) {
    let rank_list = load_rank_list(room, escape_rank_map, kw.ESCAPE);
    return show_rank(kw.RANK+": 도망자", rank_list);
}

function show_eaten_rank(room) {
    let rank_list = load_rank_list(room, eaten_rank_map, kw.EATEN);
    return show_rank(kw.RANK+": 꿀꺽당한 희생자", rank_list);
}

function show_vomited_rank(room) {
    let rank_list = load_rank_list(room, vomited_rank_map, kw.VOMITED);
    return show_rank(kw.RANK+": 퉤엣당한 희생자", rank_list);
}

function show_eat_vs_rank(room) {
    update_eat_vs_rank_map(room, eat_vs_rank_map, kw.EAT_VS);

    let rank_list = load_rank_list(room, eat_vs_rank_map, kw.EAT_VS);
    return show_rank(kw.RANK+": 꿀꺽 대결 (먹은 수 - 먹힌 수)", rank_list);
}

const obj = {
    talk_rank_map: talk_rank_map,
    picture_rank_map: picture_rank_map,
    emoticon_rank_map: emoticon_rank_map,
    brown_nyan_rank_map: brown_nyan_rank_map,
    eat_rank_map: eat_rank_map,
    vomit_rank_map: vomit_rank_map,
    escape_rank_map: escape_rank_map,
    eaten_rank_map: eaten_rank_map,
    vomited_rank_map: vomited_rank_map,
    eat_vs_rank_map: eat_vs_rank_map,

    update_rank_map: update_rank_map,
    update_eat_vs_rank_map: update_eat_vs_rank_map,
    show_talk_rank: show_talk_rank,
    show_picture_rank: show_picture_rank,
    show_emoticon_rank: show_emoticon_rank,
    show_brown_nyan_rank: show_brown_nyan_rank,
    show_eat_rank: show_eat_rank,
    show_vomit_rank: show_vomit_rank,
    show_escape_rank: show_escape_rank,
    show_eaten_rank: show_eaten_rank,
    show_vomited_rank: show_vomited_rank,
    show_eat_vs_rank: show_eat_vs_rank
};

module.exports = obj;
