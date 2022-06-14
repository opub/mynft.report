const axios = require('axios');
const API = 'https://api-mainnet.magiceden.dev/v2';

async function getCollections() {
    const limit = 500;
    let collections = [];
    let loading = true;
    let offset = 0;
    do {
        try {
            await new Promise(res => setTimeout(res, 500));
            let url = `${API}/collections?offset=${offset}&limit=${limit}`;
            let { data } = await axios.get(url);
            loading = (data && data.length === limit);
            offset += limit;
            const filtered = data.filter(c => (c.symbol && c.name && !c.isFlagged)).map((i) => ({
                id: i.symbol.trim(),
                name: i.name.trim(),
                image: i.image,
            }));
            collections.push(...filtered);
        }
        catch (e) {
            console.error(e);
        }
    }
    while (loading)

    collections.sort(function (a, b) {
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'accent' })
    });

    return collections;
}

(async function () {
    const collections = await getCollections();
    console.log(JSON.stringify(collections, null, 2));
})();
