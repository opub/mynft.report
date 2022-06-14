import React, { Fragment } from "react";
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import collections from '../../data/collections';

class Collections extends React.Component {

    onSearch() {
        console.log('onSearch', arguments);
    }

    render() {
        return <AsyncTypeahead
            onSearch={this.onSearch}
            id="collection"
            filterBy={['name', 'id']}
            labelKey="name"
            options={collections}
            isLoading={false}
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