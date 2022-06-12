import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton, WalletDisconnectButton } from '@solana/wallet-adapter-react-ui';
import Collections from './Collections';

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
            <div>
                <span id="wallet"><WalletMultiButton /></span>
                <h1>Connect your Solana wallet to begin.</h1>
            </div>
        );
    }
}

export default PageContent;