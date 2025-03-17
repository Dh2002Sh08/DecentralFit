"use client";

import PluralitySocialConnect, { ReadFromContractDataType, SendTransactionDataType } from "@plurality-network/smart-profile-wallet";
import { ethers, formatEther } from "ethers";
import React, { useEffect, useState } from "react";
import { chainId, clientId, contractAddress, RPC } from "../client";
import { ABI } from "../ABI";

interface ConnectedAccount {
    id: string;
    eventName: string;
    data: string;
}

export const WalletConnect = () => {

    const [account, setAccount] = useState<string | null>(null);
    const [subscriptionFee, setSubscriptionFee] = useState<string | null>(null);
    const [walletConnected, setWalletConnected] = useState<boolean>(false);
    const [subsCriptionStart , setSubsCriptionStart] = useState("");

    const options = {
        clientId: clientId,
        theme: "light",
        text: "Connect Wallet"
    };

    // Function to fetch connected account
    const getConnectedAccount = async () => {
        console.log("Fetching account...");

        try {
            const response = await PluralitySocialConnect.getConnectedAccount() as ConnectedAccount;
            console.log("getConnectedAccount Response:", response);

            if (response?.data && ethers.isAddress(response.data)) {
                setAccount(response.data);
                setWalletConnected(true);  // ✅ Mark wallet as connected
                console.log("Connected Account:", response.data);
                getSubscriptionFee();  // ✅ Fetch fees only after wallet is connected
                getSubscriptionStartTime();
            } else {
                setAccount(null);
                setWalletConnected(false);
                console.log("No connected account found.");
            }
        } catch (error) {
            console.log("Error reading wallet address:", error);
            setAccount(null);
            setWalletConnected(false);
        }
    };

    // Function to read from contract to fetch subscription fee
    const getSubscriptionFee = async () => {
        console.log("Fetching subscription fee...");
        try {
            const response = await PluralitySocialConnect.readFromContract(
                contractAddress,
                JSON.stringify(ABI),
                "SUBSCRIPTION_FEE",
                JSON.stringify([]),
                RPC,
                chainId
            ) as ReadFromContractDataType;

            console.log("Subscription Fee Response:", response);

            if (response?.data) {
                // const etherfee = formatEther(response.data.toString());
                setSubscriptionFee(response.data.toString());
                console.log("Updated Subscription Fee:", response.data.toString());
            } else {
                setSubscriptionFee("Error retrieving fee");
                console.log("Error retrieving fee");
            }
        } catch (error) {
            console.log("Error reading contract data:", error);
            setSubscriptionFee("Error retrieving fee");
        }
    };

    // get subscription start time
    const getSubscriptionStartTime = async () => {
        console.log("Fetching subscription start time...");
        if (!account) {
            console.error("❌ Account is not set. Skipping fetch.");
            return;
        }

        if (!ethers.isAddress(account)) {
            console.error("❌ Invalid account address:", account);
            return;
        }

        if (!ethers.isAddress(contractAddress)) {
            console.error("❌ Invalid contract address:", contractAddress);
            return;
        }

        console.log("✅ Account Address:", account);
        console.log("✅ Contract Address:", contractAddress);
        console.log("✅ ABI:", ABI);
        console.log("✅ RPC:", RPC);
        console.log("✅ Chain ID:", chainId);

        const params = JSON.stringify([account]);
    console.log("📌 Params being sent:", params);


        try {
            const response = await PluralitySocialConnect.readFromContract(
                contractAddress,
                JSON.stringify(ABI),
                "subscriptionStart",
                JSON.stringify([account]),
                RPC,
                chainId
            ) as ReadFromContractDataType;
            console.log("Adress for start time :- " , account)

            console.log("Subscription Start Time Response:", response);
            if (response?.data) {
                setSubsCriptionStart(response.data.toString());
                console.log("Updated Subscription Start Time:", response.data.toString());
            } else {
                setSubsCriptionStart("not fetching subscription start time");
                console.log("Error retrieving subscription start time");
            }
            } catch (error) {
            console.log("Error reading contract data:", error);
        }
    }

    // Function to send transaction
    const sendTransactionData = async () => {
        if (!account || !subscriptionFee || isNaN(Number(subscriptionFee))) return;
        // const subscriptionFeeInWei = ethers.parseUnits(subscriptionFee, "wei").toString();

        const rawTx = JSON.stringify({
            contractAddress: contractAddress,
            abi: ABI,
            action: "subscribe",
            params: [],
            value: subscriptionFee,
        });
        console.log("Final Raw Transaction Data:", rawTx);
        console.log("Account:", account);
        console.log("Subscription Fee:", subscriptionFee);

        try {
            const response = await PluralitySocialConnect.sendTransaction(rawTx, RPC, chainId) as SendTransactionDataType;
            console.log("Transaction Response:", response);
            // alert("Transaction sent successfully");
        } catch (error) {
            console.log("Error sending transaction:", error);
            // alert("Error sending transaction");
        }
    };

    // Callback function when data is returned from wallet connection
    const handleDataReturned = () => {
        console.log("Account data returned, fetching again...");
        getConnectedAccount();
    };

    // useEffect to check account when component mounts
    useEffect(() => {
        getConnectedAccount();
    }, []);

    return (
        <div>
            <PluralitySocialConnect
                options={options}
                onDataReturned={handleDataReturned}
            />

            {walletConnected ? (
                <>
                    <h1>Connected Account: {account}</h1>
                    <p>Subscription Fee: {subscriptionFee ?? "Fetching..."}</p>
                    <p>SubsCription Start :- {subsCriptionStart}</p>
                    <button onClick={sendTransactionData}>Subscribe</button>
                </>
            ) : (

                <>
                    {/* <PluralitySocialConnect
                        options={options}
                        onDataReturned={handleDataReturned} /> */}
                    <h1>No Wallet Connected</h1>
                </>
            )}
        </div>
    );
};
