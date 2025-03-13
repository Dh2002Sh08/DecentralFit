"use client";
import { PluralitySocialConnect, ReadFromContractDataType, SendTransactionDataType, WriteToContractDataType } from '@plurality-network/smart-profile-wallet';
import React, { useState, useEffect } from 'react';
import { chainId, clientId, contractAddress, RPC } from '../client';
import { ABI } from '../ABI';
import { ethers, formatEther } from 'ethers';
import { parseUnits } from '@ethersproject/units';

// Define the type for the response structure we expect
interface ConnectedAccountResponse {
    id: string;
    eventName: string;
    data: string;  // The address is stored as a string in the "data" field
}

const WalletConnect = () => {
    const [isLogin, setLogin] = useState(false);
    const [account, setAccount] = useState<string>("");
    const [subsCriptionFee, setsubsCriptionFee] = useState<any>(null);
    const [subsCriptionStart, setsubsCriptionStart] = useState<any>(null);
    const [subsCriptionEnd, setsubsCriptionEnd] = useState<any>(null);

    // Options for the embedded profiles wallet
    const options = {
        clientId: clientId,
        theme: 'light',
        text: 'Connect Wallet'
    };

    const txParams = {
        from: account as string,
        value : subsCriptionFee as string
    };

    const txOptions = JSON.stringify({
        gasLimit: 1000000,
    });

    const getConnectedAccount = async () => {
        try {
            const response = await PluralitySocialConnect.getConnectedAccount() as ConnectedAccountResponse;

            if (response && response.data) {
                const connectedAccountAddress = response.data;
                setAccount(connectedAccountAddress);
            } else {
                setAccount('No account data');
                alert('No account data found');
            }
        } catch (error) {
            console.error("Error fetching connected account:", error);
            alert("Error fetching connected account");
        }
    };

    const sendTransaction = async (
        rawTx: string,
        rpc: string,
        chainId: string
    ) => {
        try {
            const response = await PluralitySocialConnect.sendTransaction(
                rawTx,
                rpc,
                chainId
            ) as SendTransactionDataType;
            if (response) {
                console.log("Send Transaction Response (Inisde dApp): ", response.data)
                const sendTransactionData = response.data;
                return sendTransactionData;
            }
        }
        catch (error) {
            console.error("Error sending transaction:", error);
            alert("Error sending transaction");
        }
    }

    const SendSubscriptionTransaction = async () => {
        const data = await sendTransaction(
            JSON.stringify(txParams), // raw data for sending transaction
            RPC,
            chainId
        );
    } 

    const getWriteContracts = async (
        address: string,
        abiVal: string,
        action: string,
        params: any,
        rpc: string,
        chainId: string,
        txoptions: string
    ) => {
        try {
            const response = await PluralitySocialConnect.writeToContract(
                address,
                abiVal,
                action,
                params,
                rpc,
                chainId,
                txoptions
            ) as WriteToContractDataType;
            console.log("res", response);
        }
        catch (error) {
            console.error("Error writing to contract:", error);
            alert("Error writing to contract");
        }
    }

    const subsCription = async () => {
        const feeInEther = parseFloat(subsCriptionFee);
        const feeInWei = parseUnits(feeInEther.toString(), 'ether');
        
        const data = await getWriteContracts(
            contractAddress,
            JSON.stringify(ABI),
            "subscribe",
            subsCriptionFee,
            RPC,
            chainId,
            txOptions
        );
        // setsubsCriptionStart(new Date());
    }

    const getReadContracts = async (
        address: string,
        abiVal: string,
        action: string,
        params: any,
        rpc: string,
        chainId: string
    ) => {
        try {
            const respone = await PluralitySocialConnect.readFromContract(
                address,
                abiVal,
                action,
                params,
                rpc,
                chainId
            ) as ReadFromContractDataType;

            return respone?.data;
        } catch (error) {
            console.error("Error reading from contract:", error);
            alert("Error reading from contract");
        }
    };

    const getSubscriptionFee = async () => {
        const data = await getReadContracts(
            contractAddress,
            JSON.stringify(ABI),
            "SUBSCRIPTION_FEE",
            [],
            RPC,
            chainId
        );

        const feeInEther = data ? formatEther(data) : '0';

        setsubsCriptionFee(feeInEther);
    };

    const getSubscriptionStart = async () => {
        const data = await getReadContracts(
            contractAddress,
            JSON.stringify(ABI),
            "subscriptionStart",
            txParams,
            RPC,
            chainId
        );
        console.log("start subscription", account);
        setsubsCriptionStart(data);
        console.log("Subscription Start:", data);
    }

    const getSubscriptionEnd = async () => {
        const data = await getReadContracts(
            contractAddress,
            JSON.stringify(ABI),
            "subscriptions",
            txParams,
            RPC,
            chainId
        );
        setsubsCriptionEnd(data);
    };

    const handleDataReturned = (data: any) => {
        setLogin(true);
        getConnectedAccount();
        getSubscriptionFee();
        getSubscriptionStart();
        getSubscriptionEnd();
    };

    useEffect(() => {
        if (isLogin) {
            getConnectedAccount();
            getSubscriptionFee();
            getSubscriptionStart();
            getSubscriptionEnd();
        }
    }, [isLogin]);

    useEffect(() => {
        if (subsCriptionFee !== null) {
            console.log("Subscription fee:", subsCriptionFee);
        }
    }, [subsCriptionFee]);

    useEffect(() => {
        if (subsCriptionStart !== null) {
            // console.log("Subscription fee:", subsCriptionFee);
        }
    }, [subsCriptionStart]);

    useEffect(() => {
        if (subsCriptionEnd !== null) {
            // console.log("Subscription fee:", subsCriptionFee);
        }
    }, [subsCriptionEnd]);

    return (
        <>
            <div className="container">
                {/* This div will hold the connection button at the center of the screen */}
                <div className="button-wrapper">
                    <PluralitySocialConnect
                        options={options}
                        onDataReturned={handleDataReturned}
                    />
                </div>

                {/* Render user data once logged in */}
                {isLogin && (
                    <div className="user-info">
                        <h1>Wallet Connected</h1>
                        <p>Address: {account || "Loading..."}</p>
                        <p>Subscription Fee: {subsCriptionFee} ETH</p>
                        <p>Subscription Start: {subsCriptionStart || "Loading..."}</p>
                        <p>Subscription End: {subsCriptionEnd || "Loading..."}</p>
                        <button onClick={subsCription} className="subscribe-btn">Subscribe</button>
                        {/* <button onClick={SendSubscriptionTransaction} className="subscribe-btn">Send Transaction</button> */}
                    </div>
                )}
            </div>
            <style>{`
                .container {
                    height: 100vh;
                    width: 100vw;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background-color: white;
                    font-family: Arial, sans-serif;
                }
                
                .button-wrapper {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                }

                .user-info {
                    text-align: center;
                    background-color: #ffedd5; /* Light orange */
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }

                .user-info h1 {
                    font-size: 2rem;
                    color: #333;
                }

                .user-info p {
                    font-size: 1rem;
                    color: #333;
                }

                .subscribe-btn {
                    background-color: #ff7f50; /* Light orange */
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    font-size: 1rem;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 10px;
                }

                .subscribe-btn:hover {
                    background-color: #ff5722; /* Slightly darker orange */
                }

                @media (max-width: 768px) {
                    .container {
                        padding: 20px;
                    }

                    .user-info {
                        width: 100%;
                        padding: 15px;
                    }
                }
            `}</style>
        </>
    );
};

export default WalletConnect;
