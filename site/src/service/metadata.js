import { programs } from '@metaplex/js';
import { getConnection } from './api';
import { get, sleep } from '../common/util';
import * as log from '../common/logging';

const { metadata: { Metadata } } = programs;

export async function addMetadata(nft) {
    try {
        log.info('addMetadata', nft.mint);

        await sleep(50);    // throttle to avoid 429s

        const metadataPDA = await Metadata.getPDA(nft.mint);
        const onchainMetadata = (await Metadata.load(getConnection(), metadataPDA)).data;
        let externalMetadata;
        if (onchainMetadata) {
            nft.name = onchainMetadata.name;
            if (onchainMetadata.data && onchainMetadata.data.creators && onchainMetadata.data.creators.length > 0) {
                nft.creator = onchainMetadata.data.creators[0].address;
            }
            externalMetadata = (await get(onchainMetadata.data.uri)).data;
            if (externalMetadata) {
                if (!nft.name) {
                    nft.name = externalMetadata.name;
                }
                nft.description = externalMetadata.description;
                nft.image = externalMetadata.image;
                nft.attributes = externalMetadata.attributes;
            }
        }

        return nft;
    }
    catch (e) {
        log.error(e, 'addMetadata');
    }
    return nft;
}
