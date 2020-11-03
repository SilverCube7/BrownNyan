const eat_pocket = new Map();

function load_user_info(room, who, user_info_map, info_name) {
    if(!user_info_map.has(room))
        user_info_map.set(room, new Map());

    if(!user_info_map.get(room).has(who))
        user_info_map.get(room).set(who, db.load_list(db.make_full_path(room+kw.SLASH+kw.USER+kw.SLASH+who+kw.SLASH+info_name)));

    return user_info_map.get(room).get(who);
}

function save_eat_pocket_in_db(room, sender, user_info_list) {
    db.save_list(db.make_full_path(room+kw.SLASH+kw.USER+kw.SLASH+sender+kw.SLASH+kw.EAT_POCKET), user_info_list);
}

function push_in_eat_pocket(room, sender, target) {
    let user_info_list = load_user_info(room, sender, eat_pocket, kw.EAT_POCKET);

    user_info_list.push([target]);

    while(user_info_list.length > eat_pocket_limit+1)
        user_info_list.shift();
    
    save_eat_pocket_in_db(room, sender, user_info_list);
}

function pop_in_eat_pocket(room, sender) {
    let user_info_list = load_user_info(room, sender, eat_pocket, kw.EAT_POCKET);

    let top = user_info_list.pop();
    save_eat_pocket_in_db(room, sender, user_info_list);

    if(!top)
        return undefined;

    return top[0];
}

function clear_eat_pocket(room, sender) {
    let user_info_list = load_user_info(room, sender, eat_pocket, kw.EAT_POCKET);
    while(user_info_list.pop());

    save_eat_pocket_in_db(room, sender, user_info_list);
}

const obj = {
    eat_pocket: eat_pocket,

    load_user_info: load_user_info,
    push_in_eat_pocket: push_in_eat_pocket,
    pop_in_eat_pocket: pop_in_eat_pocket,
    clear_eat_pocket: clear_eat_pocket
};

module.exports = obj;
