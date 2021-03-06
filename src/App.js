import * as React from "react";
import LoadingBar from 'react-top-loading-bar'
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json"
import logo from "./assets/ayaya-yeah.gif"

export default function App() {
  const [blockMessage, setBlockMessage] = React.useState("...*cricket noise*");
  const [progress, setProgress] = React.useState(0);
  const [waveState,setWaveState] = React.useState("Not waved =(");
  const [currAccount, setCurrentAccount] = React.useState("");
  const [allWaves, setAllWaves] = React.useState([])
  const contractAddress = "0xa511674242742650880fF8a638aFF5DE66cd54d7";
  const contractABI = abi.abi;
  const checkIfWalletIsConnected = () =>
  {
    const {ethereum} = window;
    if(!ethereum){
      console.log("Get metamask bruh")
      return;
    }
    else {
      console.log("The ethereum object", ethereum)
    }

    ethereum.request({ method: 'eth_accounts'})
    .then(accounts => {
      console.log(accounts)
      if(accounts.length !== 0){
        const account = accounts[0];
        console.log("Found one!", account)
        setCurrentAccount(account);
        getAllWaves()
      } else {
        console.log("No account found")
      }
    })
  }

  const connectWallet = () => {
    const {ethereum} = window;
    if(!ethereum){
      alert("Get metamask!")
    }
    ethereum.request({method: 'eth_requestAccounts'})
    .then(accounts => {
      console.log("Connected", accounts[0])
      setCurrentAccount(accounts[0])
    })
    .catch(err => console.log(err));
  }
  
  React.useEffect(() => {
    checkIfWalletIsConnected()
  }, [])

  const wave = async() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

    let count = await wavePortalContract.getTotalWaves();
    console.log("Total wave count...", count.toNumber());

    const waveTxn = await wavePortalContract.wave(blockMessage);
    setWaveState("Waving.....");
    setProgress(0);
    console.log("Mining...", waveTxn.hash);
    await waveTxn.wait();
    console.log("Mined!", waveTxn.hash);
    setProgress(100);

    count = await wavePortalContract.getTotalWaves();
    console.log("Total count...",count.toNumber());
  }

  async function getAllWaves()
  {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

    let waves = await wavePortalContract.getAllWaves();

    let wavesCleaned = []
    waves.forEach(wave => {
      wavesCleaned.push({
        address: wave.waver,
        timestamp: new Date(wave.timestamp* 1000),
        message: wave.message,
        color: wave.waver == 0xc309c5b0916bc44A0B12113ada3CdC79Db5f4215 ? 1 : 0
      })
    })
    wavesCleaned.sort(function(a,b){return a.timestamp < b.timestamp});
    setAllWaves(wavesCleaned)

    wavePortalContract.on("NewWave", (from, time, msg) => {
      console.log("NewWave", from, time, msg)
      setAllWaves(oldArray => [{
        address: from,
        timestamp: new Date(time * 1000),
        message: msg,
        color: 2
      },...oldArray])
    })
  }
  
  return (
    
    <div className="mainContainer">
    
      <div className="dataContainer">
        <div className="header">
        ???? Hey there!
        </div>
        <img src={logo} alt="loading..." />
        <div className="bio">
        Wave at me with your Ethereum wallet! (I won't take your money, i swear. Also use fake money plz)
        </div>
        
        {currAccount ?  
        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button> 
        : null
        }

        <input
          type="text"
          value={blockMessage}
          onChange={(event) => {
            setBlockMessage(event.target.value);
          }}
        />

        {currAccount ? null : (
        <button className="waveButton" onClick={connectWallet}>
          Connect Wallet
        </button>
        )}
        <LoadingBar 
          color='#f11946' 
          progress={progress}
          onLoaderFinished={()=>setWaveState("Waved!")}
        />

        <div className="waveStatus">
          {waveState}
        </div>

        {allWaves.map((wave,index) =>
        {
          return (
            <div style={{backgroundColor: wave.color == 0 ? "Aquamarine" : wave.color == 1 ? "AliceBlue" : "Salmon", 
            marginTop: "16px", padding: "8px"}}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>
          )
        })}

      </div>
    </div>
  );
}
