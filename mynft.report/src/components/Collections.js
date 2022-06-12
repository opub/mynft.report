import React, { Fragment } from "react";
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import axios from 'axios';
import axiosThrottle from 'axios-request-throttle';
axiosThrottle.use(axios, { requestsPerSecond: 2 });

const API = 'https://api-mainnet.magiceden.dev/v2';
let fetching = false;
let collections = [];

async function getCollections() {
    if(!fetching && collections.length === 0) {
        fetching = true;
        console.log('getting collections');
        const limit = 500;
        let loading = true;
        let offset = 0;
        do {
            try {
                let url = `${API}/collections?offset=${offset}&limit=${limit}`;
                let { data } = await axios.get(url);
                loading = (data && data.length === limit);
                offset += limit;
                collections.push(...data);
            }
            catch (e) {
                loading = await requestError(e);
            }
        }
        while (loading)
        console.log('loaded', collections.length, 'collections');    
    } else {
        console.log('collections cached');
    }
    return collections.map((i) => ({
        id: i.symbol,
        name: i.name,
        image: i.image,
    }));
}

async function requestError(err) {
    const resp = err.response;
    if (resp && resp.status === 429 && resp.config) {
        // hitting the QPM limit so snooze a bit
        await new Promise(res => setTimeout(res, 5000));
        console.warn('WARN', resp.statusText, resp.config.url);
        return true;
    } else {
        console.error('ERROR', err);
        return false;
    }
}

class Collections extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            options: []
        };
    }

    componentDidMount() {
        getCollections().then((options) => {
            this.setState({ options: options });
            this.setState({ isLoading: false });
        });
    }

    onSearch() {
        console.log('onSearch', arguments);
    }

    render() {
        return <AsyncTypeahead
            onSearch={this.onSearch}
            id="collection"
            filterBy={['name', 'id']}
            labelKey="name"
            isLoading={this.state.isLoading}
            options={this.state.options}
            minLength={3}
            paginate={true}
            placeholder="Select NFT collection"
            renderMenuItemChildren={(option, props) => (
                <Fragment>
                    <img
                        alt={option.name}
                        src={option.image}
                        style={{
                            height: '24px',
                            marginRight: '10px',
                            width: '24px',
                        }}
                    />
                    <span>{option.name}</span>
                </Fragment>
            )}
        />
    }
}

export default Collections;