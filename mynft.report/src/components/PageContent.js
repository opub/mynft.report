import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton, WalletDisconnectButton } from '@solana/wallet-adapter-react-ui';

function PageContent() {
    const { publicKey } = useWallet();

    if (publicKey) {
        return (
            <div>
                <span id="wallet"><WalletDisconnectButton /></span>
                <h1>You are now connected!</h1>
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