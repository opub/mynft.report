import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { get, sleep, bs58toHex, requestsPerSecond } from '../common/util';
import * as log from '../common/logging';

const ME_API = 'https://proxy.mynft.report/api';

export function getExchange(tx) {
    const progId = tx.transaction.message.instructions.at(-1).programId.toBase58();
    const sig = tx.transaction.signatures[0];
    let exchange;

    switch (progId) {
        case 'MEisE1HzehtrDpAAT8PnLHjpSSkRYakotTuJRPjTpo8':
            if (isMagicEdenPurchaseTx(tx)) {
                exchange = 'MagicEden';
            }
            break;
        case 'M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K':
            if (isMagicEdenV2PurchaseTx(tx)) {
                exchange = 'MagicEden V2';
            }
            break;
        case 'CJsLwbP1iu5DuUikHEJnLfANgKy6stB2uFgvBBHoyxwz':
            if (isSolanartPurchaseTx(tx)) {
                exchange = 'Solanart';
            }
            break;
        case 'A7p8451ktDCHq5yYaHczeLMYsjRsAkzc3hCXcSrwYHU7':
            if (isDigitalEyezPurchaseTx(tx)) {
                exchange = 'DigitalEyez';
            }
            break;
        case 'HZaWndaNWHFDd9Dhk5pqUUtsmoBCqzb1MLu3NAh1VX6B':
            if (isAlphaArtPurchaseTx(tx)) {
                exchange = 'AlphaArt';
            }
            break;
        case 'AmK5g2XcyptVLCFESBCJqoSfwV3znGoVYQnqEnaAZKWn':
            if (isExchangeArtPurchaseTx(tx)) {
                exchange = 'ExchangeArt';
            }
            break;
        case '617jbWo616ggkDxvW1Le8pV38XLbVSyWY8ae6QUmGBAU':
            if (isSolSeaPurchaseTx(tx)) {
                exchange = 'SolSea';
            }
            break;
        case 'GvQVaDNLV7zAPNx35FqWmgwuxa4B2h5tuuL73heqSf1C': // SMB v1 (pre offers)
            // NOTE: this is NOT a mistake. The SMB market uses the same codebase as DE!
            if (isDigitalEyezPurchaseTx(tx)) {
                exchange = 'SMB marketplace';
            }
            break;
        case 'J7RagMKwSD5zJSbRQZU56ypHUtux8LRDkUpAPSKH4WPp': // SMB v2 (post offers)
            if (isSMBV2PurchaseTx(tx)) {
                exchange = 'SMB v2 marketplace';
            }
            break;
    }
    if (exchange) {
        log.debug(`tx ${sig} is ${exchange}`);
        return exchange;
    }
}

export async function getCollectionsStats(creators) {
    const collections = new Map();
    for (const [creator, mint] of creators) {
        try {
            const { data: token } = await get(`${ME_API}/tokens/${mint}`);
            sleep(1000 / requestsPerSecond);
            if (token && token.collection) {
                const { data: stats } = await get(`${ME_API}/collections/${token.collection}/stats`);
                sleep(1000 / requestsPerSecond);
                collections.set(creator, lamportsToSol(stats));
            }
        }
        catch (e) {
            log.error(e, getCollectionsStats);
        }
    }
    return collections;
}

function extractIxData(tx) {
    return bs58toHex(tx.transaction.message.instructions.at(-1).data);
}

function isSMBV2PurchaseTx(tx) {
    const ixData = extractIxData(tx);
    // check is calling the buy instruction
    const ixNr = parseInt(ixData.substr(0, 2), 10);
    console.log(ixNr);
    return ixNr === 95;
}

function isSolSeaPurchaseTx(tx) {
    const ixData = extractIxData(tx);
    // check is calling the buy instruction
    const ixNr = parseInt(ixData.substr(0, 2), 10);
    return ixNr === 2;
}

function isExchangeArtPurchaseTx(tx) {
    const ixData = extractIxData(tx);
    // check is calling the buy instruction
    const ixNr = parseInt(ixData.substr(0, 2), 10);
    return ixNr === 1;
}

function isAlphaArtPurchaseTx(tx) {
    const ixData = extractIxData(tx);
    // check is calling the buy instruction
    const ixNr = parseInt(ixData.substr(0, 2), 10);
    return ixNr === 2;
}

function isDigitalEyezPurchaseTx(tx) {
    const ixData = extractIxData(tx);
    // check is calling the buy instruction
    const ixNr = parseInt(ixData.substr(0, 2), 10);
    const isPurchase = ixNr === 1;
    // check is not using the buy instruction to cancel
    // todo not great to rely on logs (especially with a typo) but I can't think of a better way
    // both their purchase and cancel txs have the exact same data signatures
    const isNotCancellation = tx.meta.logMessages.indexOf('Program log: Transfering sales tax') > -1;
    return isPurchase && isNotCancellation;
}

function isMagicEdenPurchaseTx(tx) {
    const ixData = extractIxData(tx);
    // check is calling the buy instruction
    const ixNr = parseInt(ixData.substr(0, 3), 10);
    return ixNr === 438;
}

function isMagicEdenV2PurchaseTx(tx) {
    const ixData = extractIxData(tx);
    // check is calling the buy instruction
    const ixNr = parseInt(ixData.substr(0, 3), 10);
    return ixNr === 254;
}

function isSolanartPurchaseTx(tx) {
    const ixData = extractIxData(tx);
    // check is calling the buy instruction
    const ixNr = parseInt(ixData.substr(0, 2), 10);
    const isPurchase = ixNr === 5; // the right way
    // check is not using the buy instruction to cancel
    const ixStruct = ixData.substr(2, ixData.length);
    const isNotCancellation = ixStruct !== '0000000000000000';
    return isPurchase && isNotCancellation;
}

function lamportsToSol(stats) {
    const metrics = ['floorPrice', 'avgPrice24hr', 'volumeAll'];
    for (const name of metrics) {
        if (stats[name]) {
            stats[name] = stats[name] / LAMPORTS_PER_SOL
        }
    }
    return stats;
}
