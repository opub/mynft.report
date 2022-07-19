import axios from 'axios';
import axiosThrottle from 'axios-request-throttle';
import bs58 from 'bs58';
import * as log from './logging';

export const requestsPerSecond = 4;
axiosThrottle.use(axios, { requestsPerSecond });

export async function get(url, options) {
    try {
        return await axios.get(url, options);
    }
    catch (e) {
        log.error(e, 'GET', url);
    }
}

export function bs58toHex(bString) {
    const bytes = bs58.decode(bString);
    return bytes.toString('hex');
}

export function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}