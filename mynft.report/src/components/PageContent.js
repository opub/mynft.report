import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton, WalletDisconnectButton } from '@solana/wallet-adapter-react-ui';
import Collections from './Collections';
import Grid from '@mui/material/Grid';
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import './PageContent.css';

const withWallet = Component => props => {
    const { publicKey } = useWallet();
    const wallet = publicKey ? publicKey.toBase58() : null;
    return <Component {...props} wallet={wallet} />;
};

class PageContent extends React.Component {

    constructor(props) {
        super(props);
        this.handleCollectionChange = this.handleCollectionChange.bind(this);
        this.state = {
            collection: ""
        };
    }

    handleCollectionChange(event, option) {
        this.setState({ collection: option.id });
    }

    render() {
        if (this.props.wallet) {
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
                                <Collections onCollectionChange={this.handleCollectionChange} />
                            </Grid>
                            <Grid item xs={2} align="right">
                                <WalletDisconnectButton />
                            </Grid>
                        </Toolbar>
                    </AppBar>

                    <div>Collection = {this.state.collection}</div>
                    <div>Wallet = {this.props.wallet}</div>
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
}

export default withWallet(PageContent);