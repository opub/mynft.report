import React, { useEffect, useState } from 'react';

import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useConnection } from '@solana/wallet-adapter-react';

const TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

export default function Results(props) {

    const { connection } = useConnection();
    const [balance, setBalance] = useState(0);

    const getUserSOLBalance = async (publicKey, connection) => {
        let balance = await connection.getBalance(publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
    }

    const getUserNfts = async (publicKey, connection) => {
        const { value: splAccounts } = await connection.getParsedTokenAccountsByOwner(
            publicKey,
            {
                programId: new PublicKey(TOKEN_PROGRAM),
            }
        );
        console.log('accounts', splAccounts);
    }

    useEffect(() => {
        if (props.wallet) {
            const publicKey = new PublicKey(props.wallet);
            getUserSOLBalance(publicKey, connection);
            getUserNfts(publicKey, connection);
        }
    }, [props.wallet, connection, getUserSOLBalance])

    return <div>
        <div>collection = {props.collection}</div>
        <div>wallet = {props.wallet}</div>
        <div>balance = {balance} SOL</div>
    </div>
}
