import React from 'react';

export default function ResultsTable(props) {
    const nfts = props.results;
    if(nfts) {
        return (
            <table>
                <thead>
                    <tr>
                    <th>Image</th>
                        <th>Name</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    {nfts.map(nft => (
                        <tr key={nft.mint}>
                            <td><img src={nft.image} height="50px" width="50px" loading="lazy"/></td>
                            <td>{nft.name}</td>
                            <td>{nft.description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }
}
