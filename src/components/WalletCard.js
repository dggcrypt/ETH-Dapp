import React, { useState } from 'react';
import { ethers } from 'ethers';

const WalletCard = () => {
    const [errorMessage, setErrorMessage] = useState(null);
    const [defaultAccount, setDefaultAccount] = useState(null);
    const [userBalance, setUserBalance] = useState(null);
    const [connButtonText, setConnButtonText] = useState('Connect Wallet');

    const connectWalletHandler = () => {
        if (window.ethereum && window.ethereum.isMetaMask) {
            window.ethereum.request({ method: 'eth_requestAccounts'})
            .then(result => {
                accountChangedHandler(result[0]);
                setConnButtonText('Wallet Connected');
                getAccountBalance(result[0]);
            })
            .catch(error => {
                setErrorMessage(error.message);
            });
        } else {
            setErrorMessage('Please install MetaMask');
        }
    };

    const accountChangedHandler = (newAccount) => {
        setDefaultAccount(newAccount);
        getAccountBalance(newAccount);
    };

    const getAccountBalance = (account) => {
        window.ethereum.request({method: 'eth_getBalance', params: [account, 'latest']})
        .then(balance => {
            setUserBalance(ethers.formatEther(balance));
        })
        .catch(error => {
            setErrorMessage(error.message);
        });
    };

    const chainChangedHandler = () => {
        window.location.reload();
    };

    window.ethereum.on('accountsChanged', accountChangedHandler);
    window.ethereum.on('chainChanged', chainChangedHandler);

    return (
        <div className='walletCard'>
            <h4>Connection to MetaMask</h4>
            <button onClick={connectWalletHandler}>{connButtonText}</button>
            <div className='accountDisplay'>
                <h3>Address: {defaultAccount}</h3>
            </div>
            <div className='balanceDisplay'>
                <h3>Balance: {userBalance}</h3>
            </div>
            {errorMessage && <div className='error'>{errorMessage}</div>}
        </div>
    );
};

export default WalletCard;
