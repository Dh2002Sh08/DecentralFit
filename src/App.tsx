"use client";
import { PluralitySocialConnect } from '@plurality-network/smart-profile-wallet';
import React, { useState, useEffect } from 'react';
import { chainId, clientId, contractAddress, RPC } from '../client';
import { WalletConnect } from '../components/wallet';

// Define the type for the response structure we expect
interface ConnectedAccountResponse {
    id: string;
    eventName: string;
    data: string;  // The address is stored as a string in the "data" field
}

const App = () => {
   
    return (
        <div>
            <WalletConnect />
        </div>
    );
};

export default App;
