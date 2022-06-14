import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton, WalletDisconnectButton } from '@solana/wallet-adapter-react-ui';
import Collections from './Collections';
import { Grid } from '@mui/material';
import './PageContent.css';

function PageContent() {
    const { publicKey } = useWallet();

    if (publicKey) {
        return (

            <div>
                <span id="wallet"><WalletDisconnectButton /></span>
                <h1>You are now connected to {publicKey.toBase58()}</h1>
                <Collections />
            </div>
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