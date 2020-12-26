const adj = new Map();
const stack = [];
const visited = new Set();

function connect(v1, v2) {
    if(!adj.has(v1)) {
        adj.set(v1, new Set());
    }

    const v1_adj = adj.get(v1);

    if(!v1_adj.has(v2)) {
        v1_adj.add(v2);
    }
}

function disconnect(v1, v2) {
    if(!adj.has(v1)) {
        return false;
    }

    const v1_adj = adj.get(v1);

    if(!v1_adj.has(v2)) {
        return false;
    }

    v1_adj.delete(v2);

    if(!v1_adj.length) {
        adj.delete(v1);
    }

    return true;
}

function clear() {
    adj.clear();
}

function dfs_init() {
    while(stack.length) {
        stack.pop();
    }

    visited.clear();
}

function dfs(start_v, end_v) {
    dfs_init();

    visited.add(start_v);
    stack.push(start_v);

    while(stack.length) {
        let v1 = stack.pop();

        if(v1 == end_v) {
            return true;
        }

        if(adj.has(v1)) {
            for(let v2 of adj.get(v1).keys()) {
                if(!visited.has(v2)) {
                    visited.add(v2);
                    stack.push(v2);
                }
            }
        }
    }

    return false;
}

const obj = {
    connect: connect,
    disconnect: disconnect,
    clear: clear,
    dfs: dfs
};

module.exports = obj;
