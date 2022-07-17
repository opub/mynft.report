const { getSignatures, getTransactions, getHoldings } = require('./api
const { getCollectionsStats } = require('./src/marketplace');
const { addMetadata } = require('./src/metadata');
const log = require('../common/logging

const address = 'DyyzHCmZ1bSUrj7RvMfvDxxuuR5z5noyovURQQX3BWVq';

(async function () {
    log.info('starting');

    try {
        // get all sale transactions
        const signatures = await getSignatures(address);
        const transactions = await getTransactions(address, signatures);
        const creators = new Map();

        // get additional holdings that were minted or transferred in
        const holdings = await getHoldings(address);
        holdings.forEach((nft) => {
            if (!transactions.has(nft)) {
                transactions.set(nft, { mint: nft, noBuy: true });
            }
        });

        // add additional metadata or delete, also get set of creators with one mint each
        for (const tx of transactions.values()) {
            const updated = await addMetadata(tx);
            if (updated.creator) {
                transactions.set(tx.mint, updated);
                if (!creators.has(updated.creator)) {
                    creators.set(updated.creator, tx.mint);
                }
            }
            else {
                transactions.delete(tx.mint);
            }
        }

        // get collection stats
        const stats = await getCollectionsStats(creators);
        const nfts = [...transactions.values()];
        nfts.forEach((nft) => nft.collection = stats.get(nft.creator));

        log.info(nfts);
    } catch (e) {
        log.error(e);
    }

    log.info('ending');
})();
