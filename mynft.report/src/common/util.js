const log = require('./logging');
const axios = require('axios');
const axiosThrottle = require('axios-request-throttle');
const bs58 = require('bs58');

axiosThrottle.use(axios, { requestsPerSecond: process.env.RPS || 4 });

exports.get = async function(url, options) {
    try {
        return await axios.get(url, options);
    }
    catch(e) {
        log.warn(e);
    }
}

exports.bs58toHex = function (bString) {
    const bytes = bs58.decode(bString);
    return bytes.toString('hex');
}

exports.sleep = function (milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}