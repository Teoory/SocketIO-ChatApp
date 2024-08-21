import React, { useState } from 'react';

const PurchasePage = () => {
    const [walletAddress, setWalletAddress] = useState('');
    const [transferFee, setTransferFee] = useState('2.00'); // 2 USDC
    const [statusMessage, setStatusMessage] = useState('');

    const handleTransfer = async () => {
        try {
            const response = await fetch('http://localhost:3030/transfer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ walletAddress })
            });
            const data = await response.json();
            if (data.success) {
                setStatusMessage('Transfer successful!');
            } else {
                setStatusMessage('Transfer failed!');
            }
        } catch (error) {
            console.error('Error during transfer:', error);
            setStatusMessage('Transfer failed!');
        }
    };

    return (
        <div>
            <h1>Purchase Premium</h1>
            <div>
                <label>
                    Wallet Address:
                    <input
                        type="text"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                    />
                </label>
            </div>
            <div>
                <p>Transfer Fee: {transferFee} USDC</p>
            </div>
            <button onClick={handleTransfer}>Initiate Transfer</button>
            {statusMessage && <p>{statusMessage}</p>}
        </div>
    );
};

export default PurchasePage;
