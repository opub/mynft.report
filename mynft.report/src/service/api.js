const { Connection, PublicKey, LAMPORTS_PER_SOL } = require("@solana/web3.js");
const { TOKEN_PROGRAM_ID } = require('@solana/spl-token');
const { getExchange } = require('./marketplace');
const { get } = require('../common/util');
const log = require('../common/logging');

const SOL_PRICE_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=solana';
const TEST_LIMIT = process.env.TEST_LIMIT || -1;

const commitment = process.env.COMMITMENT || 'confirmed';
const clusterURL = 'https://ssc-dao.genesysgo.net/';    // clusterApiUrl(process.env.CLUSTER || 'mainnet-beta');
const connection = new Connection(clusterURL, { commitment });

function getConnection() {
    return connection;
}
exports.getConnection = getConnection;

exports.getSolanaPrice = async function () {
    try {
        const headers = {
            Accepts: 'application/json'
        };
        const { data } = await get(SOL_PRICE_URL, { headers });
        return data[0].current_price;
    }
    catch (e) {
        log.error(e, 'getSolPrice');
    }
}

exports.getSignatures = async function (address) {
    let signatures = [];

    try {
        const publicKey = new PublicKey(address);
        let before;

        while (true) {
            const found = await connection.getSignaturesForAddress(
                publicKey,
                { before }
            );
            if (found.length === 0) {
                break;
            }
            signatures = signatures.concat(found.map((s) => s.signature));
            before = found.at(-1).signature;
        }
        // reverse the array, we want to start with historic transactions not other way around
        signatures = signatures.reverse();

        if (TEST_LIMIT > 0) {
            signatures = signatures.splice(0, TEST_LIMIT);
        }
    }
    catch (e) {
        log.error(e, 'getSignatures');
    }

    log.info('getSignatures found', signatures.length);
    return signatures;
}

exports.getTransactions = async function (address, signatures) {
    const CHUNK = 200;
    const nfts = new Map();

    try {
        while (true) {
            const finding = signatures.splice(0, CHUNK);
            if (finding.length === 0) {
                break;
            }

            const trxns = await connection.getParsedConfirmedTransactions(finding);
            trxns.forEach((tx) => {
                const exchange = getExchange(tx);
                if (exchange) {
                    // log.debug('getTransactions sale', tx);
                    const sale = parseTransactionSale(tx, address, exchange);
                    if (nfts.has(sale.mint)) {
                        const prev = nfts.get(sale.mint);
                        nfts.set(sale.mint, {
                            ...prev,
                            ...sale
                        });
                    } else {
                        nfts.set(sale.mint, sale);
                    }
                }
            });
        }
    }
    catch (e) {
        log.error(e, 'getTransactions');
    }

    log.info('getTransactions filtered', nfts.size);
    return nfts;
}

exports.getHoldings = async function (address) {
    let holdings = [];
    try {
        const tokens = await connection.getParsedTokenAccountsByOwner(
            new PublicKey(address),
            { programId: TOKEN_PROGRAM_ID }
        );

        // NFTs have amount=1 and decimals=0
        holdings = tokens.value.filter((t) => {
            const amount = t.account.data.parsed.info.tokenAmount;
            return amount.uiAmount === 1 && amount.decimals === 0;
        }).map((t) => t.account.data.parsed.info.mint);

        if (TEST_LIMIT > 0) {
            holdings = holdings.splice(0, TEST_LIMIT);
        }
    }
    catch (e) {
        log.error(e, 'getHoldings');
    }

    log.info('getHoldings found', holdings.length);
    return holdings;
}


function parseTransactionSale(tx, owner, exchange) {
    try {
        // identify the token through postTokenBalances
        const tokenMint = tx.meta.preTokenBalances[0].mint;
        // there's only one signer = the buyer, that's the account we need
        const [buyerIdx, buyerAcc] = findSigner(tx.transaction.message.accountKeys);
        const { preBalances } = tx.meta;
        const { postBalances } = tx.meta;
        const buyerSpent = (preBalances[buyerIdx] - postBalances[buyerIdx]) / LAMPORTS_PER_SOL;
        const txDate = new Date(tx.blockTime * 1000);
        if (buyerAcc.toBase58() === owner) {
            log.info(`Bought ${tokenMint} for ${buyerSpent} SOL on ${exchange}`);
            return { mint: tokenMint, buyPrice: buyerSpent, buyTime: txDate };
        } else {
            log.info(`Sold ${tokenMint} for ${buyerSpent} SOL on ${exchange}`);
            return { mint: tokenMint, sellPrice: buyerSpent, sellTime: txDate };
        }
    }
    catch (e) {
        log.error(e, 'parseTransactionSale', tx);
    }
}

function findSigner(keys) {
    for (const [i, el] of keys.entries()) {
        if (el.signer) {
            return [i, el.pubkey];
        }
    }
}