function in_list(s, list) {
    for(let i of list) {
        if(s == i) {
            return true;
        }
    }

    return false;
}

function randint(a, b) {
    return Math.floor(Math.random()*(b-a+1)+a);
}

function choose(list) {
    const r = randint(0, list.length-1);
    return list[r];
}

function strip(s) {
    let l = 0, r = s.length-1;

    while(l < s.length && in_list(s[l], spaces)) {
        l++;
    }
    while(r >= 0 && in_list(s[r], spaces)) {
        r--;
    }

    let new_s = "";
    for(let i=l; i<=r; i++) {
        new_s += s[i];
    }

    return new_s;
}

function is_end_of_vowel(s) {
    if(s == "") {
        return true;
    }

    if(/\d/.test(s[s.length-1])) {
        return /[2459]/.test(s[s.length-1]);
    }

    return (s.charCodeAt(s.length-1)-0xAC00+1)%(21*28)%28 == 1;
}

const obj = {
    in_list: in_list,
    randint: randint,
    choose: choose,
    strip: strip,
    is_end_of_vowel: is_end_of_vowel
};

module.exports = obj;
