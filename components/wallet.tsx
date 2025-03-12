"use client";
import { PluralitySocialConnect, ReadFromContractDataType, WriteToContractDataType } from '@plurality-network/smart-profile-wallet';
import React, { useState, useEffect } from 'react';
import { chainId, clientId, contractAddress, RPC } from '../client';
import { ABI } from '../ABI';
import { ethers, formatEther } from 'ethers';

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

    const txParams = JSON.stringify(account);

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
        const fee = ethers.parseUnits(subsCriptionFee, 'ether');
        // console.log("hgvghjhhjjhwefwehfewfwefweflwhefhlhl" , fee.toString())
        const data = await getWriteContracts(
            contractAddress,
            JSON.stringify(ABI),
            "subscribe",
            [fee],
            RPC,
            chainId,
            txOptions
        );
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

            return respone?.data;  // Return the response data if available
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

    // When wallet is connected, get the account details and subscription fee
    useEffect(() => {
        if (isLogin) {
            getConnectedAccount();
            getSubscriptionFee();
            getSubscriptionStart();
            getSubscriptionEnd();
        }
    }, [isLogin]);

    // Log the subscription fee whenever it changes
    useEffect(() => {
        if (subsCriptionFee !== null) {
            // console.log("Subscription fee:", subsCriptionFee);
        }
    }, [subsCriptionFee]);

    useEffect(() => {
        if (subsCriptionStart !== null) {
            // console.log("Subscription fee:", subsCriptionFee);
        }
    }, [subsCriptionStart]);// Trigger whenever `subsCriptionFee` changes

    useEffect(() => {
        if (subsCriptionEnd !== null) {
            // console.log("Subscription fee:", subsCriptionFee);
        }
    }, [subsCriptionEnd]);// Trigger whenever `subsCriptionFee` changes

    return (

        <>
            <div style={{
                position: "relative",
                height: "100vh",  // Full viewport height
                width: "100vw",   // Full viewport width
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
            }}>
                {/* This div will hold the connection button at the top-right */}
                <div style={{
                    position: "absolute",
                    top: "20px",  // Adjust this value to move the button up/down
                    right: "20px",  // Adjust this value to move the button left/right
                }}>
                    <PluralitySocialConnect
                        options={options}
                        onDataReturned={handleDataReturned}
                    />
                </div>

                {/* Render user data once logged in */}
                {isLogin && (
                    <div style={{
                        padding: "20px",
                        textAlign: "center",
                    }}>
                        <h1>Wallet Connected</h1>
                        <p>Address: {account || "Loading..."}</p>
                        <p>Subscription Fee: {subsCriptionFee || "Loading..."} ETH</p>
                        <p>Subscription Start: {subsCriptionStart || "Loading..."}</p>
                        <p>Subscription End: {subsCriptionEnd || "Loading..."}</p>
                        <button onClick={subsCription}>Subscribe</button>
                    </div>
                )}
            </div>
        </>
    );
};

export default WalletConnect;
