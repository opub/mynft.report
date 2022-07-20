import React, { useEffect, useState } from 'react';
import { RingLoader } from 'react-spinners';
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useConnection } from '@solana/wallet-adapter-react';
import ResultsTable from './ResultsTable';
import { getNFTs } from '../service/nft';

export default function Results(props) {

    const { connection } = useConnection();
    const [balance, setBalance] = useState(0);
    const [nfts, setNFTs] = useState([]);

    const getUserSOLBalance = async (publicKey, connection) => {
        let balance = await connection.getBalance(publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
    }

    const getUserNFTs = async (address) => {
        const nfts = await getNFTs(address);
        setNFTs(nfts);
    }

    useEffect(() => {
        if (props.wallet) {
            getUserSOLBalance(new PublicKey(props.wallet), connection);
            getUserNFTs(props.wallet);
        }
    }, [props.wallet, connection])

    return <div>
        <div>wallet = {props.wallet}</div>
        <div>balance = {balance} SOL</div>
        {nfts ? <ResultsTable results={nfts} /> : <RingLoader color="#ffffff" />}
    </div>
}
