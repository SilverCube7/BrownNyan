function make_full_path(small_path) {
    return "./"+small_path+".txt";
}

function load_txt(path) {
    let txt = DataBase.getDataBase(path);

    if(!txt)
        txt = "";

    return txt;
}

function save_txt(path, txt) {
    DataBase.setDataBase(path, txt);
}

/**
 * < DB 토큰 >
 * ENTER_TOKEN = '\n'
 * SPACE_TOKEN = ' '
 */
function load_list(path) {
    let list = load_txt(path);

    if(!list)
        return [];

    list = list.split(kw.ENTER_TOKEN);

    for(let i=0; i<list.length; i++)
        list[i] = list[i].split(kw.SPACE_TOKEN);

    return list;
}

function save_list(path, list) {
    let txt = "";

    for(let i=0; i<list.length; i++) {
        for(let j=0; j<list[i].length; j++) {
            txt += list[i][j];

            if(j < list[i].length-1)
                txt += kw.SPACE_TOKEN;
        }

        if(i < list.length-1)
            txt += kw.ENTER_TOKEN;
    }

    DataBase.setDataBase(path, txt);
}

const obj = {
    make_full_path: make_full_path,
    load_txt: load_txt,
    save_txt: save_txt,
    load_list: load_list,
    save_list: save_list
};

module.exports = obj;
