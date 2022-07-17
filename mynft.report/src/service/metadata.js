const { programs } = require('@metaplex/js');
const { getConnection } = require('./api');
const { get, sleep } = require('../../mynft.report/src/common/util');
const log = require('../../mynft.report/src/common/logging');

const { metadata: { Metadata } } = programs;

exports.addMetadata = async function (nft) {
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
