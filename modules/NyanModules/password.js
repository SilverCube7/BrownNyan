let pw = 0;
generate_pw();

function generate_pw() {
    pw = lib.randint(0, 9999);
    db.save_txt(db.make_full_path(kw.NYAN_FILES+kw.SLASH+kw.PW), pw);
}

function load_pw() {
    return pw;
}

const obj = {
    generate_pw: generate_pw,
    load_pw: load_pw
};

module.exports = obj;
