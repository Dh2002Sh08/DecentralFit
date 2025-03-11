import { PluralitySocialConnect } from '@plurality-network/smart-profile-wallet'
import {
    ReadFromContractDataType,
    SendTransactionDataType,
    WriteToContractDataType
} from '@plurality-network/smart-profile-wallet';
import React from 'react';

import { useState } from 'react';
import { chainId, clientId, contractAddress, RPC } from '../client';
import { ABI } from '../ABI';
import { formatEther } from 'ethers';


const App = () => {

    const [isLogin, setLogin] = useState(false);
    const [durationData, setdurationData] = useState<any>(null);
    const [subscriptionFee, setsubscriptionFee] = useState<any>(null);
    const abi = ABI;

    // console.log("ABI", abi);
    // console.log(chainId);
    // console.log(contractAddress);
    // console.log(RPC);


    // options for the embedded profiles wallet
    const options = {
        clientId: clientId,
        theme: 'light',
        text: 'Connect Wallet'
    };

    console.log(clientId);

    

    const txParams = JSON.stringify([1000000000000000]);
    const txOptions = JSON.stringify({ gasLimit: 2000000 })
    console.log("txParams", txParams);
    console.log("txOptions", txOptions);





    // const readFromContractData = async (
    //     address: string,
    //     abiVal: string,
    //     action: string,
    //     params: any,
    //     rpc: string,
    //     chainId: string
    // ) => {
    //     try {
    //         const response = (await PluralitySocialConnect.readFromContract(
    //             address,
    //             abiVal,
    //             action,
    //             params,
    //             rpc,
    //             chainId
    //         )) as ReadFromContractDataType;

    //         if (response && response.data) {
    //             return response.data; // Return the actual response data
    //         } else {
    //             console.warn("No valid data received from contract.");
    //             return null;
    //         }
    //         // console.log("res", response);
    //     }
    //     catch (error) {
    //         console.log("Error reading contract", error);
    //         alert(`error: ${error}`);
    //     }
    // }

    // const handleDurationData = async () => {
    //     const data = await readFromContractData(
    //         contractAddress,
    //         JSON.stringify(abi),
    //         "DURATION",
    //         "",
    //         RPC,
    //         chainId
    //     );
    //     if (data) {
    //         setdurationData(data);
    //     }
    // };

    // const handleSubscriptionFee = async () => {
    //     const data = await readFromContractData(
    //         contractAddress,
    //         JSON.stringify(abi),
    //         "SUBSCRIPTION_FEE",
    //         "",
    //         RPC,
    //         chainId
    //     );

    //     if (data) {
    //         setsubscriptionFee(data);
    //     }
    // }

    // const writeToContractData = async (
    //     address: string,
    //     abiVal: string,
    //     action: string,
    //     params: any,
    //     rpc: string,
    //     chainId: string,
    //     options: string) => {

    //    try{
    //     const response = (await PluralitySocialConnect.writeToContract(
    //         address,
    //         abiVal,
    //         action,
    //         params,
    //         rpc,
    //         chainId,
    //         options
    //     )) as WriteToContractDataType;
        
    //     console.log("Transaction Response:", response);

    //    }
    //    catch(error){
    //     console.log("Error writing contract", error);
    //     alert(`error: ${error}`);
    //    }
    // }

    // const handleWriteContract = async () => {
    //     const data = await writeToContractData(
    //         contractAddress,
    //         JSON.stringify(abi),
    //         "subscribe",
    //         [],
    //         RPC,
    //         chainId,
    //         txOptions,
    //     );
    // }

    // const handleSubscriptionStart = async () => {
    //     const data = await writeToContractData(
    //         contractAddress,
    //         JSON.stringify(abi),
    //         "startSubscription",
    //         [],
    //         RPC,
    //         chainId,
    //         txOptions,
    //     );
    // }


    const handleDataReturned = (data: any) => {
        const receivedData = JSON.parse(JSON.stringify(data));
        console.log("Login info callback data (Inisde dApp)::", receivedData);
        setLogin(true);

    };


    return (

        <div style={{
            height: "100vh", /* Full viewport height */
            width: "100vw" /* Full viewport width */
        }}>
            <div style={{
                display: "flex",
                justifyContent: "right", /* Centers horizontally */
                padding: "20px",
            }}>

                <PluralitySocialConnect
                    options={options}
                    onDataReturned={handleDataReturned}
                />
            </div>
            <div style={{
                padding: "20px",
                gap: "8px",
            }}>
                {isLogin && (
                    <div>

                        <h1> Wallet SDK Functions </h1>
                        <br />
                        {/* <button onClick={handleDurationData}>Check Duration</button>
                        {durationData && (
                            <div>
                                <h2>Duration: {durationData}</h2>
                            </div>
                        )} */}
                        &nbsp;

                        {/* <button onClick={handleSubscriptionFee}>Check Subscription Fee</button>
                        {subscriptionFee && (
                            <div>
                                <h2>Subscription Fee: {formatEther(subscriptionFee)} ETH</h2>
                            </div>
                        )} */}
                        {/* <button onClick={handleWriteContract}>Write Contract</button> */}
                        <br />
                        <h1>Profile SDK Functions</h1>
                        <br />
                       
                    </div>
                )}
            </div>
        </div>
    )
}
// }
export default App;