const timer = new java.util.Timer();
const ids = new Map();
let cnt = 0;

function set_timeout(f, delay) {
    let id = cnt++;
    ids.set(id, new JavaAdapter(java.util.TimerTask, {run: f}));
    timer.schedule(ids.get(id), delay);
    return id;
}

function clear_timeout(id) {
    ids.get(id).cancel();
    timer.purge();
    ids.delete(id);
}

function set_interval(f, start, delay) {
    let id = cnt++;
    ids.set(id, new JavaAdapter(java.util.TimerTask, {run: f}));
    timer.schedule(ids.get(id), start, delay);
    return id;
}

const clear_interval = clear_timeout;

function clear_all() {
    for(let v of ids.values())
        v.cancel();

    timer.purge();
    ids.clear();
}

const obj = {
    set_timeout: set_timeout,
    clear_timeout: clear_timeout,
    set_interval: set_interval,
    clear_interval: clear_interval,
    clear_all: clear_all
};

module.exports = obj;
