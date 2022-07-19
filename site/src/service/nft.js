import { getSignatures, getTransactions, getHoldings } from './api';
import { getCollectionsStats } from './marketplace';
import { addMetadata } from './metadata';
import * as log from '../common/logging';

let loading = false;

export async function getNFTs(address) {
    if (!loading) {
        loading = true;
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
            return nfts;
        } catch (e) {
            log.error(e);
        }
        loading = false;
    }
}
