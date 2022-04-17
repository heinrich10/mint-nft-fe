import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import MyEpicNFT from './utils/MyEpicNFT.json';

// Constants
const RINKEBY_CHAINID = "0x4";
const TWITTER_HANDLE = 'heinrichchan';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_URL = 'https://testnets.opensea.io/assets/';
const RARIBLE_URL = 'https://rinkeby.rarible.com/token/'
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = '0xb9A44Bd44Cbc226867081910a1af169a433CEBF8';
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/squarenftxyz-aa4kwr1p2g';
const RARIBLE_LINK = `https://rinkeby.rarible.com/collection/${CONTRACT_ADDRESS}/items`;

const App = () => {

    const [currentAccount, setCurrentAccount] = useState('');
    const [limit, setLimit] = useState(0);
    const [minted, setMinted] = useState(0);
    const [tokenId, setTokenId] = useState(0);
    const [notify, setNotify] = useState(false);
    const [loading, setLoading] = useState(false);

    const checkIfRinkeby = async (ethereum) => {
      const chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log('conntected to chain:', chainId);

      if (chainId !== RINKEBY_CHAINID) {
        alert('Not connected to Rinkeby testnet');
        throw new Error('not in Rinkeby');
      }
    }
  
    const checkIfWalletIsConnected = async () => {
      const { ethereum } = window;
  
      if (!ethereum) {
        console.log('Metamask not found');
        return;
      } else {
        console.log('Eth wallet is', ethereum);
      }
  
      const accounts = await ethereum.request({ method: 'eth_accounts' });
  
      if (accounts.length >= 0) {
        const account = accounts[0];
        console.log('account linked:', account);
        setCurrentAccount(account);
      } else {
        console.log('accounts not found');
      }
    }

    const connectWallet = async () => {
      try {
        const { ethereum } = window;

        if (!ethereum) {
          alert('Please install Metamask');
          throw new Error('Metamask not found');
        }

        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

        if (accounts.length >= 0) {
          await checkIfRinkeby(ethereum);
          const account = accounts[0];
          console.log('account linked:', account);
          setCurrentAccount(account);
          window.location.reload(false);
        } else {
          console.log('accounts not found');
        }
      } catch (err) {
        console.log(err);
      }
    }

  const mintNFT = async () => {
    setNotify(false);
    try {
      const { ethereum } = window;

      if (minted >= limit) {
        alert('max amount of NFT minted');
        throw new Error('NFT limit')
      }
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, MyEpicNFT.abi, signer);

        let nftTxn = await connectedContract.makeAnEpicNFT();

        console.log('Mining...')
        setLoading(true);
        await nftTxn.wait();

        console.log('Mined', nftTxn.hash);
      }
    } catch (err) {
      setLoading(false);
      console.log(err)
    }
  }

  const getMintStatus = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, MyEpicNFT.abi, signer);

        const thisLimit = await connectedContract.getMintLimit();
        const thisMinted = await connectedContract.getMintedNFTs();
        setLimit(thisLimit.toNumber());
        setMinted(thisMinted.toNumber());
      }
    } catch (err) {
      console.log(err)
    }
  }

  const mintListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, MyEpicNFT.abi, signer);

        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          const tokenNumber = tokenId.toNumber();
          console.log(from, tokenNumber);
          setTokenId(tokenNumber);
          setMinted(tokenNumber + 1);
          setNotify(true);
          setLoading(false);
        });

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (err) {
      console.log(err);
    }
  }
  
  // Render Methods
  const renderNotConnectedContainer = () => {
    return (
      <div>
      <button className="cta-button connect-wallet-button" onClick={connectWallet}>
        Connect to Wallet
      </button>
      <p className="notif-text">
        (This only works on Rinkeby testnet)
      </p>
      </div>
    );
  }

  const renderMintNFT = () => (
    <button className="cta-button connect-wallet-button" onClick={mintNFT}>
      Mint NFT
    </button>
  )

  const renderNFTDetails = () => {
    const openSea = `${OPENSEA_URL}${CONTRACT_ADDRESS}/${tokenId}`;
    const rarible = `${RARIBLE_URL}${CONTRACT_ADDRESS}/${tokenId}`;
    return (
      <p className="notif-text border">
        NFT Minted, there may be a delay of around 10 mins.<br></br><br></br>Here are the links:
        <br></br>
        <br></br>
        <a
          className="notif-text"
          href={openSea}
          target="_blank"
          rel="noreferrer"
        >{openSea}</a>
        <br></br>
        <br></br>
        <a
          className="notif-text"
          href={rarible}
          target="_blank"
          rel="noreferrer"
        >{rarible}</a>
      </p>
    )
  }

  

  useEffect(() => {
    setNotify(false);
    setLoading(false);
    checkIfWalletIsConnected();
    getMintStatus();
    mintListener();
  }, []);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          <p className="sub-text">
            Total of {minted}/{limit} minted!
          </p>
          {loading && (
            <div>
              <p className="notif-text">
                Processing transaction, may take up to 20 mins
              </p>
              <div className="loader"></div>
            </div>
          )}
          {!currentAccount && (renderNotConnectedContainer())}
          {currentAccount && (renderMintNFT())}
          {notify && (renderNFTDetails())}
          <p className="sub-text">
            <a
            className="footer-text"
            href={OPENSEA_LINK}
            target="_blank"
            rel="noreferrer"
          >{`View my collection on OpenSea`}</a>
          </p>
          <a
            className="footer-text"
            href={RARIBLE_LINK}
            target="_blank"
            rel="noreferrer"
          >{`View my collection on Rarible`}</a>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;