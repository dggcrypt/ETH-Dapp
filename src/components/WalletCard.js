import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wallet, Link, AlertCircle, Check, Loader2 } from "lucide-react";

const SUPPORTED_NETWORKS = {
  1: "Ethereum Mainnet",
  5: "Goerli Testnet",
  11155111: "Sepolia Testnet"
};

const formatBalance = (balance) => {
  return (parseInt(balance, 16) / 1e18).toFixed(4);
};

const WalletCard = () => {
  const [wallet, setWallet] = useState({
    address: null,
    balance: null,
    network: null,
    isConnecting: false,
    error: null
  });

  const resetWallet = () => {
    setWallet({
      address: null,
      balance: null,
      network: null,
      isConnecting: false,
      error: null
    });
  };

  const getNetwork = async () => {
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      return {
        id: parseInt(chainId, 16),
        name: SUPPORTED_NETWORKS[parseInt(chainId, 16)] || 'Unknown Network'
      };
    } catch (error) {
      console.error('Error getting network:', error);
      return null;
    }
  };

  const getBalance = async (address) => {
    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });
      return formatBalance(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      return null;
    }
  };

  const updateWalletInfo = useCallback(async (address) => {
    const [balance, network] = await Promise.all([
      getBalance(address),
      getNetwork()
    ]);

    setWallet(prev => ({
      ...prev,
      address,
      balance,
      network,
      isConnecting: false,
      error: null
    }));
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum?.isMetaMask) {
      setWallet(prev => ({
        ...prev,
        error: 'Please install MetaMask to connect your wallet'
      }));
      return;
    }

    setWallet(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      await updateWalletInfo(accounts[0]);
    } catch (error) {
      setWallet(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message
      }));
    }
  };

  const switchNetwork = async (chainId) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error) {
      console.error('Error switching network:', error);
      setWallet(prev => ({
        ...prev,
        error: 'Error switching network. Please try again.'
      }));
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          resetWallet();
        } else {
          updateWalletInfo(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', () => {
        if (wallet.address) {
          updateWalletInfo(wallet.address);
        }
      });

      
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.length > 0) {
            updateWalletInfo(accounts[0]);
          }
        });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, [updateWalletInfo, wallet.address]);

  return (
    <div className="min-h-screen bg-black p-6">
      <Card className="w-full max-w-xl mx-auto bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-100">
            <Wallet className="w-6 h-6" />
            Ethereum Wallet
          </CardTitle>
        </CardHeader>
        <CardContent>
          {wallet.error && (
            <Alert variant="destructive" className="mb-4 bg-red-900/20 border-red-900">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{wallet.error}</AlertDescription>
            </Alert>
          )}

          {!wallet.address ? (
            <Button
              onClick={connectWallet}
              disabled={wallet.isConnecting}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {wallet.isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Link className="mr-2 h-4 w-4" />
                  Connect Wallet
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-zinc-200">Connected Address</p>
                  <p className="text-xs text-zinc-400 break-all">
                    {wallet.address}
                  </p>
                </div>
                <Check className="h-4 w-4 text-green-400" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-zinc-800">
                  <p className="text-sm font-medium text-zinc-200">Balance</p>
                  <p className="text-lg font-bold text-zinc-100">
                    {wallet.balance ? `${wallet.balance} ETH` : '...'}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-zinc-800">
                  <p className="text-sm font-medium text-zinc-200">Network</p>
                  <p className="text-lg font-bold text-zinc-100">
                    {wallet.network?.name || '...'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-zinc-200">Switch Network</p>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(SUPPORTED_NETWORKS).map(([chainId, name]) => (
                    <Button
                      key={chainId}
                      variant="outline"
                      size="sm"
                      onClick={() => switchNetwork(parseInt(chainId))}
                      disabled={wallet.network?.id === parseInt(chainId)}
                      className="border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-zinc-100"
                    >
                      {name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletCard;
