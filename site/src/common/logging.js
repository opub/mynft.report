let logLevel = 'info';

const levels = {
    none: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4
};

export function setLevel(level) {
    logLevel = level;
}

export function willLog(level) {
    return levels[level] <= levels[logLevel];
}

export function debug(...params) {
    if (willLog('debug')) {
        writeLog('debug', params);
    }
}

export function info(...params) {
    if (willLog('info')) {
        writeLog('info', params);
    }
}

export function warn(...params) {
    if (willLog('warn')) {
        writeLog('warn', params);
    }
}

export function error(...params) {
    if (willLog('error')) {
        if (params && params.length > 0 && params[0] && params[0].stack && params[0].message) {
            let e = params[0];
            params = params.slice(1);
            params.push(e.message, e.stack);
        }
        writeLog('error', params);
    }
}

function writeLog(level, params) {
    if (level === 'error') {
        console.error(formatDate(), level.toUpperCase(), ...params);
    } else {
        console.log(formatDate(), level.toUpperCase(), ...params);
    }
}

// make time local instead of UTC and remove T and Z from ISO format
function formatDate() {
    let now = new Date();
    now = new Date(now.getTime() - (now.getTimezoneOffset() * 60 * 1000));
    return now.toISOString().replace('T', ' ').substring(0, 23);
}
