import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton, WalletDisconnectButton } from '@solana/wallet-adapter-react-ui';
import Collections from './Collections';
import Grid from '@mui/material/Grid';
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import './PageContent.css';

function PageContent(props) {

    const { publicKey } = useWallet();
    let collection = "";
    let wallet = publicKey ? publicKey.toBase58() : "";

    function handleCollectionChange(options, state) {
        console.log('handleCollectionChange', options, state);
        collection = state.id;
    }

    if (publicKey) {
        return (
            <Grid
                className="wrapper"
                container
                spacing={1}
                justify="center"
                direction="column"
            >
                <AppBar position="absolute" color="inherit">
                    <Toolbar>
                        <Grid item xs={4}>
                            <h1>My NFT Report</h1>
                        </Grid>
                        <Grid item xs={6} align="right">
                            <Collections onCollectionChange={handleCollectionChange} />
                        </Grid>
                        <Grid item xs={2} align="right">
                            <WalletDisconnectButton />
                        </Grid>
                    </Toolbar>

                    <div>Collection = {collection}</div>
                    <div>Wallet = {wallet}</div>

                </AppBar>
            </Grid>
        );
    } else {
        return (
            <Grid
                className="wrapper"
                container
                spacing={0}
                align="center"
                justify="center"
                direction="column"
            >
                <Grid item className="instructions">
                    <h1>My NFT Report</h1>
                </Grid>
                <Grid item className="instructions">
                    <p>This site will display the history of your Solana NFT purchases.</p>
                    <p>Connect your Solana wallet to begin.</p>
                </Grid>
                <Grid item>
                    <WalletMultiButton />
                </Grid>
            </Grid>
        );
    }
}

export default PageContent;