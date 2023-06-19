"use client";
import Select from "react-select";
import { networks } from "@/config";
import { useEffect, useMemo, useState } from "react";
import { ERC20ABI, ERC1155ABI, ERC721ABI, FARMINGABI, UNISWAPV2PAIRABI } from "@/abis";

const options = networks.map((network) => ({
  value: network.name,
  label: network.name,
}));

const customStyles = {
  control: (base) => ({
    ...base,
    backgroundColor: "#2C2C2C",
    borderColor: "#2C2C2C",
    boxShadow: "none",
    "&:hover": {
      borderColor: "#2C2C2C",
    },
  }),
  singleValue: (base) => ({
    ...base,
    color: "#fff",
  }),
  input: (base) => ({
    ...base,
    color: "#fff",
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "#fff",
  }),
  clearIndicator: (base) => ({
    ...base,
    color: "#fff",
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#2C2C2C",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#1E1E1E" : "#2C2C2C",
    color: "#fff",
    "&:active": {
      backgroundColor: "#1E1E1E",
    },
  }),
};

export default function Home() {
  const [network, setNetwork] = useState(null);
  const networkInfo = useMemo(()=>{
    if(!network) return null;
    return networks.find((item)=>item.name === network.value);
  }, [network]);

  const rpcOptions = useMemo(()=>{
    if(!networkInfo) return [];
    return networkInfo.rpc.map((rpc)=>{
      return {
        value: rpc,
        label: rpc,
      }
    });
  }, [networkInfo]);

  const [currentRpc, setCurrentRpc] = useState({value: '', label: ''});
  useEffect(()=>{
    if (rpcOptions.length === 0) return;
    setCurrentRpc(rpcOptions[0]);
  }, [rpcOptions]);

  const [abi, setAbi] = useState('');
  console.log('info', networkInfo);
  const eventOptions = useMemo(()=>{
    if(!abi) return [];
    try {
      const abiJson = JSON.parse(abi);
      return abiJson.filter((item)=>item.type === 'event').map((item)=>{
        return {
          value: item.name,
          label: item.name,
        }
      });
    } catch (error) {
      return [];
    }
  }, [abi]);

  console.log('currentRpc', currentRpc);
  const [currentBlock, setCurrentBlock] = useState(0);
  useEffect(()=>{
    if (!currentRpc || !currentRpc.value) return;
    
    fetch('/api/blockNumber', {
      method: 'POST',
      body: JSON.stringify({
        rpc: currentRpc.value,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((res)=>{
      return res.json();
    }).then((res)=>{
      console.log('res', res);
      if (res.success) {
        setCurrentBlock(res.data);
      }
    }).catch((error)=>{
      console.log('error', error);
    });
  }, [currentRpc]);

  const [fromBlock, setFromBlock] = useState(0);
  const [toBlock, setToBlock] = useState(0);
  const [step, setStep] = useState(1000);
  const [updater, setUpdater] = useState(0);
  const [scAddr, setScAddr] = useState('');
  const [events, setEvents] = useState([]);
  useEffect(()=>{
    if (currentBlock > 0 && updater === 0) {
      setFromBlock(currentBlock - 1000);
      setToBlock(currentBlock);
      setUpdater(Date.now());
    }
  }, [currentBlock, updater])
  const [currentEvent, setCurrentEvent] = useState({value: '', label: ''});
  const [filter, setFilter] = useState('');
  const [filterCode, setFilterCode] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="container">
      <h1 className="title">Smart Contract Event Analyzer</h1>
      <div className="input-group">
        <Select placeholder="Select Network..." className="select" styles={customStyles} options={options} value={network} onChange={(e)=>{
          console.log(e);
          setNetwork(e);
        }} />
      </div>
      <div className="network-info">
        <table className="info-table">
          <tbody>
            <tr>
              <th>Properties</th>
              <th>Value</th>
            </tr>
            {
              networkInfo && Object.keys(networkInfo).map((key)=>{
                if (['chain', 'icon', 'features', 'shortName', 'networkId', 'ens', 'slip44', 'infoURL'].includes(key)) {
                  return null;
                }

                if (!networkInfo[key] || networkInfo[key].length === 0) {
                  return null;
                }

                let value = networkInfo[key].toString();
                if (key === 'nativeCurrency') {
                  value = JSON.stringify(networkInfo[key]);
                }
                if (key === 'rpc') {
                  value = <Select placeholder="Select RPC..." className="select" styles={customStyles} options={rpcOptions} value={currentRpc} onChange={e=>setCurrentRpc(e)} />
                }

                if (key === 'explorers') {
                  value = networkInfo[key].map((explorer)=>{
                    return (<div key={explorer.url}>{explorer.url}</div>)
                  })
                }

                if (key === 'faucets') {
                  value = networkInfo[key].map((url)=>{
                    return (<div key={url}>{url}</div>)
                  })
                }

                return (
                  <tr key={key}>
                    <td>{key}</td>
                    <td>{value}</td>
                  </tr>
                )
              })
            }
            {
              network && <tr>
                <td>Current Block</td>
                <td>{currentBlock}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <div className="input-group">
        <label>Input Contract Address:</label>
        <input className="input" value={scAddr} onChange={e=>setScAddr(e.target.value)} />
      </div>
      <div className="input-group">
        <label>Input ABI string:</label>
        <input className="input" value={abi} onChange={e=>setAbi(e.target.value)} /> &nbsp; <a onClick={()=>setAbi(JSON.stringify(ERC20ABI))}>ERC20</a>&nbsp; <a onClick={()=>setAbi(JSON.stringify(ERC721ABI))}>ERC721</a>&nbsp; <a onClick={()=>setAbi(JSON.stringify(ERC1155ABI))}>ERC1155</a>&nbsp; <a onClick={()=>setAbi(JSON.stringify(FARMINGABI))}>FARMING</a>&nbsp; <a onClick={()=>setAbi(JSON.stringify(UNISWAPV2PAIRABI))}>UniswapV2Pair</a>
      </div>
      <div className="input-group">
        <Select placeholder="Select Event..." className="select" styles={customStyles} options={eventOptions} value={currentEvent} onChange={e=>setCurrentEvent(e)} />
      </div>
      <div className="input-group">
        <label>From Block:</label>
        <input className="input" value={fromBlock} onChange={e=>setFromBlock(e.target.value)} />
        &nbsp;&nbsp;&nbsp;&nbsp;
        <label>To Block:</label>
        <input className="input" value={toBlock} onChange={e=>setToBlock(e.target.value)} />
        &nbsp;&nbsp;&nbsp;&nbsp;
        <label>Step:</label>
        <input className="input" value={step} onChange={e=>setStep(e.target.value)} />
      </div>
      <div className="button-group">
        <button className="button start" disabled={loading} onClick={()=>{
          console.log('start scan');
          if (!currentRpc || !currentRpc.value || !scAddr || !abi || !currentEvent) {
            alert('Please input all fields');
            return;
          }
          setLoading(true);
          setEvents([]);
          fetch('/api/scanEvents', {
            method: 'POST',
            body: JSON.stringify({
              rpc: currentRpc.value,
              scAddr,
              abi,
              fromBlock,
              toBlock,
              eventName: currentEvent.value,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
          }).then((res)=>{
            return res.json();
          }).then((res)=>{
            console.log('res', res);
            setEvents(res.data);
            setLoading(false);
          }).catch((error)=>{
            console.log('error', error);
            setLoading(false);
          });
        }}>Start Scan</button>
        <button className="button stop" disabled={!loading}>Stop Scan</button>
        <input placeholder="Input String to Filter Event..." className="input" value={filter} onChange={e=>setFilter(e.target.value)} />
        <input placeholder="Filter Code, such as: v=>Number(v.value)>100" className="input" value={filterCode} onChange={e=>setFilterCode(e.target.value)} />
      </div>
      <div className="progress">Progress: 0%</div>
      <div className="result">
        <table className="result-table">
          <tbody>
            <tr>
              <th>Block</th>
              <th>Transaction</th>
              <th>Event</th>
              <th>Event Data</th>
            </tr>
            {
              events.filter(event=>{
                if (!filter) {
                  return true;
                }
                return JSON.stringify(event.event).includes(filter) || JSON.stringify(event.transactionHash).includes(filter) || JSON.stringify(event.blockNumber).includes(filter);
              }).filter((event, i)=>{
                if (!filterCode) {
                  return true;
                }

                try {
                  const f = eval(filterCode);
                  console.log('f', f);
                  return f(event.event, i);
                } catch (e) {
                  console.log('error', e.message);
                  return true;
                }
              }).map((event)=>{
                return (
                  <tr key={event.transactionHash + '_' + event.index}>
                    <td>{event.blockNumber}</td>
                    <td>{event.transactionHash}</td>
                    <td>{event.name}</td>
                    <td>{JSON.stringify(event.event)}</td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
