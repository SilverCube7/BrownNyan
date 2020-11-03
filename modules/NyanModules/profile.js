function update_profile(room, sender, imageDB) {
    db.save_txt(db.make_full_path(room+kw.SLASH+kw.PROFILE+kw.SLASH+sender), imageDB.getProfileImage());
}

function get_profile(room, sender) {
    return db.load_txt(db.make_full_path(room+kw.SLASH+kw.PROFILE+kw.SLASH+sender));
}

const obj = {
    update_profile: update_profile,
    get_profile: get_profile
};

module.exports = obj;
