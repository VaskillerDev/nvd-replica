'use strict'
const qsParser = require('querystring');

function trimParams(url) {
    if (!url) return null;
    try {
        return url.split('?')[0];
    } catch {
        return null;
    }
}

function trimPath(url) {
    if (!url) return null;
    try {
        return url.split('?')[1];
    } catch {
        return null;
    }
}

function eqStr(str0, str1) {
    return str0.toLowerCase() === str1.toLowerCase()
}

function extractParams(url) {
    url = trimPath(url);
    return qsParser.parse(url);
}

module.exports = {
    trimParams,
    trimPath,
    eqStr,
    extractParams
}