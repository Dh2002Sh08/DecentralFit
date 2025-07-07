import { ABI } from '../ABI';
import { clientId, RPC, chainId, contractAddress } from '../client';
import { PluralitySocialConnect } from '@plurality-network/smart-profile-wallet';
import React, { useState, useEffect } from 'react';
import { ethers, formatEther } from 'ethers';

const formatDate = (timestamp: number) => {
    if (!timestamp || isNaN(Number(timestamp)) || Number(timestamp) === 0) return '-';
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
};

const SubsPage = () => {
    const [account, setAccount] = useState<string | null>(null);
    const [walletConnected, setWalletConnected] = useState<boolean>(false);
    const [subscriptionFee, setSubscriptionFee] = useState<string | null>(null);
    const [subStatus, setSubStatus] = useState<boolean | null>(null);
    const [subStart, setSubStart] = useState<string>('');
    const [subExpiry, setSubExpiry] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const options = { clientId, theme: 'light', text: 'Login to Subscribe' };

    // Fetch connected account and all details
    const getConnectedAccount = async () => {
        setLoading(true);
        try {
            const response: any = await PluralitySocialConnect.getConnectedAccount();
            if (response?.data && ethers.isAddress(response.data)) {
                setAccount(response.data);
                setWalletConnected(true);
            } else if (response?.data?.address) {
                setAccount(response.data.address);
                setWalletConnected(true);
            } else {
                setAccount(null);
                setWalletConnected(false);
            }
        } catch (e) {
            setAccount(null);
            setWalletConnected(false);
        }
        setLoading(false);
    };

    // Fetch subscription fee from contract
    const getSubscriptionFee = async () => {
        try {
            const response: any = await PluralitySocialConnect.readFromContract(
                contractAddress,
                JSON.stringify(ABI),
                'SUBSCRIPTION_FEE',
                JSON.stringify([]),
                RPC,
                chainId
            );
            if (response?.data) {
                setSubscriptionFee(ethers.formatEther(response.data.toString())); // show in ETH
            } else {
                setSubscriptionFee('Error retrieving fee');
            }
        } catch (error) {
            setSubscriptionFee('Error retrieving fee');
        }
    };

    // Fetch subscription status, start, expiry
    const fetchSubscriptionDetails = async (userAddress: string | { address?: string }) => {
        setLoading(true);
        setError(null);
        try {
            // Ensure userAddress is a string
            const address = typeof userAddress === 'string' ? userAddress : userAddress?.address || '';
            console.log('userAddress for getSubscriptionDetails:', address, typeof address);
            // isSubscribed
            const isSubRes: any = await PluralitySocialConnect.readFromContract(
                contractAddress,
                JSON.stringify(ABI),
                'isSubscribed',
                JSON.stringify([address]),
                RPC,
                chainId
            );
            setSubStatus(!!isSubRes?.data);

            // getSubscriptionDetails
            const detailsRes: any = await PluralitySocialConnect.readFromContract(
                contractAddress,
                JSON.stringify(ABI),
                'getSubscriptionDetails',
                JSON.stringify([address]),
                RPC,
                chainId
            );
            let startNum = 0, expiryNum = 0;
            if (detailsRes && detailsRes.data) {
                if (Array.isArray(detailsRes.data)) {
                    // Array form: [start, expiry]
                    const [start, expiry] = detailsRes.data;
                    startNum = start ? Number(start.toString()) : 0;
                    expiryNum = expiry ? Number(expiry.toString()) : 0;
                } else if (typeof detailsRes.data === 'object') {
                    // Object form: { startTime, expiryTime }
                    startNum = detailsRes.data.startTime ? Number(detailsRes.data.startTime.toString()) : 0;
                    expiryNum = detailsRes.data.expiryTime ? Number(detailsRes.data.expiryTime.toString()) : 0;
                }
            }
            setSubStart(startNum > 0 ? startNum.toString() : '');
            setSubExpiry(expiryNum > 0 ? expiryNum.toString() : '');
        } catch (e) {
            setError('Failed to fetch subscription details');
        }
        setLoading(false);
    };

    // Fetch all details on login/account change
    useEffect(() => {
        if (walletConnected && account) {
            getSubscriptionFee();
            fetchSubscriptionDetails(account);
        }
    }, [walletConnected, account]);

    // On mount, try to get account
    useEffect(() => {
        getConnectedAccount();
    }, []);

    // Subscribe/renew
    const buySubscription = async () => {
        setLoading(true);
        setError(null);
        setTxHash(null);
        try {
            // Get fee in wei
            let feeInWei = subscriptionFee ? ethers.parseUnits(subscriptionFee, 'ether').toString() : '0';
            // If already in wei, use as is
            if (subscriptionFee && Number(subscriptionFee) > 100000000000) feeInWei = subscriptionFee;
            const rawTx = JSON.stringify({
                contractAddress: contractAddress,
                abi: ABI,
                action: 'subscribe',
                params: [],
                value: feeInWei,
            });
            const response: any = await PluralitySocialConnect.sendTransaction(
                rawTx,
                RPC,
                chainId
            );
            if (response && response.data && response.data.hash) {
                setTxHash(response.data.hash);
                setTimeout(() => {
                    if (account) fetchSubscriptionDetails(account);
                }, 5000);
            }
        } catch (e: any) {
            setError('Transaction failed');
        }
        setLoading(false);
    };

    // Callback for wallet connect
    const handleDataReturned = () => {
        getConnectedAccount();
    };

    // Responsive styles
    const containerStyle: React.CSSProperties = {
        minHeight: '100vh',
        minWidth: '100vw', // Ensure full width
        background: 'linear-gradient(135deg, #ffe5b4 0%, #fff3e0 100%)',
        color: '#111',
        display: 'flex',
        flexDirection: 'row', // Center horizontally
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, Arial, sans-serif',
        padding: '0',
    };
    const cardStyle: React.CSSProperties = {
        background: '#fff8ee',
        borderRadius: '18px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        padding: '32px 20px',
        minWidth: 280,
        maxWidth: 400,
        width: '90vw',
        margin: '16px',
        color: '#111',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
    };
    const labelStyle: React.CSSProperties = { fontWeight: 500, color: '#222', marginRight: 8 };
    const valueStyle: React.CSSProperties = { fontFamily: 'monospace', color: '#111' };
    const statusStyle: React.CSSProperties = { fontWeight: 600 };
    const buttonStyle: React.CSSProperties = {
        background: '#ff9800',
        color: '#111',
        border: 'none',
        borderRadius: 8,
        padding: '12px 28px',
        fontSize: 16,
        fontWeight: 600,
        cursor: loading || !account ? 'not-allowed' : 'pointer',
        boxShadow: '0 2px 8px rgba(255,152,0,0.08)',
        transition: 'background 0.2s',
        marginTop: 16,
    };
    const txStyle: React.CSSProperties = { color: '#0ea5e9', fontSize: 14, marginBottom: 8, wordBreak: 'break-all' };
    const errorStyle: React.CSSProperties = { color: '#ef4444', fontSize: 14, marginBottom: 8 };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <PluralitySocialConnect
                        options={options}
                        onDataReturned={handleDataReturned}
                    />
                </div>
                <h2 style={{ textAlign: 'center', margin: '24px 0 12px', color: '#111' }}>
                    Subscription Portal
                </h2>
                {!walletConnected && (
                    <div style={{ textAlign: 'center', color: '#b26a00', marginBottom: 16 }}>
                        Please login to continue
                    </div>
                )}
                {walletConnected && (
                    <>
                        <div style={{ marginBottom: 8 }}>
                            <span style={labelStyle}>Account:</span>
                            <span style={valueStyle}>{account || '-'}</span>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                            <span style={labelStyle}>Subscription Fee:</span>
                            <span style={valueStyle}>{subscriptionFee ? `${subscriptionFee} ETH` : 'Fetching...'}</span>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                            <span style={labelStyle}>Status:</span>
                            {loading ? (
                                <span style={statusStyle}>Loading...</span>
                            ) : subStatus === null ? (
                                <span style={statusStyle}>-</span>
                            ) : subStatus ? (
                                <span style={{ ...statusStyle, color: '#22c55e' }}>Active</span>
                            ) : (
                                <span style={{ ...statusStyle, color: '#ef4444' }}>Inactive</span>
                            )}
                        </div>
                        <div style={{ marginBottom: 8 }}>
                            <span style={labelStyle}>Start:</span>
                            <span style={valueStyle}>{subStart && Number(subStart) > 0 ? formatDate(Number(subStart)) : '-'}</span>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                            <span style={labelStyle}>Expiry:</span>
                            <span style={valueStyle}>{subExpiry && Number(subExpiry) > 0 ? formatDate(Number(subExpiry)) : '-'}</span>
                        </div>
                        <button
                            onClick={buySubscription}
                            disabled={loading || !account}
                            style={buttonStyle}
                        >
                            {subStatus ? 'Renew Subscription' : 'Buy Subscription'}
                            {subscriptionFee ? ` (${subscriptionFee} ETH)` : ''}
                        </button>
                        {txHash && (
                            <div style={txStyle}>
                                Tx Hash: <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer">{txHash.slice(0, 16)}...</a>
                            </div>
                        )}
                        {error && (
                            <div style={errorStyle}>{error}</div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SubsPage;