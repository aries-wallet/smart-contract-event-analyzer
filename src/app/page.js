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

function objectToCsv(data) {
  const csvRows = [];

  // get the headers
  const headers = Object.keys(data[0]);
  csvRows.push(headers.join(','));

  // loop over the rows
  for (const row of data) {
      const values = headers.map(header => {
          const escaped = (''+row[header]).replace(/"/g, '\\"');
          return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
  }

  // form escaped CSV string
  return csvRows.join('\n');
}

function downloadCSV(url, filename) {
  const downloadLink = document.createElement("a");

  downloadLink.href = url;
  downloadLink.download = filename;

  // Add the link to the DOM
  document.body.appendChild(downloadLink);

  // Simulate click
  downloadLink.click();

  // Cleanup the DOM
  document.body.removeChild(downloadLink);
}


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
  const [currentEvent, setCurrentEvent] = useState();
  const [filter, setFilter] = useState('');
  const [filterCode, setFilterCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  return (
    <div className="container">
      <h1 className="title"><img style={{marginRight: '14px', marginBottom: '-12px'}} src='/logo.png' width={50} />Smart Contract Event Analyzer<a href="https://github.com/aries-wallet/smart-contract-event-analyzer.git" style={{border: 'none'}}><img src='/github.png' width={32} style={{marginBottom: '-6px'}} /></a></h1>
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
        <button className="button start" disabled={loading} onClick={async ()=>{
          if (!currentRpc || !currentRpc.value || !scAddr || !abi || !currentEvent) {
            alert('Please input all fields');
            return;
          }
          setLoading(true);
          setEvents([]);
          setProgress(0);
          let _events = [];
          window.stopScan = false;
          try {
            let currentFrom = Number(fromBlock);
            let _step = Number(step);
            while (currentFrom < Number(toBlock) && !window.stopScan) {
              let currentTo = Math.min(currentFrom + _step, Number(toBlock)); // make sure not to exceed toBlock
              console.log('currentFrom', currentFrom, 'currentTo', currentTo, 'step', _step);
              let res = await fetch('/api/scanEvents', {
                method: 'POST',
                body: JSON.stringify({
                  rpc: currentRpc.value,
                  scAddr,
                  abi,
                  fromBlock: currentFrom,
                  toBlock: currentTo,
                  eventName: currentEvent.value,
                }),
                headers: {
                  'Content-Type': 'application/json',
                },
              });
      
              res = await res.json();
              _events = _events.concat(res.data); // use spread syntax to merge arrays
              currentFrom += _step;
              setProgress(Math.round((currentFrom - Number(fromBlock)) / (Number(toBlock) - Number(fromBlock)) * 100));
            }
          } catch (error) {
              console.log('error', error);
          }
          console.log('_events', _events);
          setEvents(_events);
          setLoading(false);
          
        }}>Start Scan</button>
        <button className="button stop" disabled={!loading} onClick={()=>{
          window.stopScan = true;
        }}>Stop Scan</button>
        <button className="button stop" disabled={loading} onClick={()=>{
          let outObj = events.filter(event=>{
            if (!filter) {
              return true;
            }
            return JSON.stringify(event.event).toLowerCase().includes(filter.toLowerCase()) || 
              JSON.stringify(event.transactionHash).toLowerCase().includes(filter.toLowerCase()) || 
              JSON.stringify(event.blockNumber).toLowerCase().includes(filter.toLowerCase());
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
          }).map(v=>{
            let o = {...v};
            o.event = JSON.stringify(v.event);
            return o;
          })

          // Convert the object to CSV data
          const csvData = objectToCsv(outObj);
          const blob = new Blob([csvData], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);

          // Initiate download
          downloadCSV(url, "output.csv");
        }}>Save Result to CSV</button>
        <input placeholder="Input String to Filter Event..." className="input" value={filter} onChange={e=>setFilter(e.target.value)} />
        <input placeholder="Filter Code, such as: v=>Number(v.value)>100" className="input" value={filterCode} onChange={e=>setFilterCode(e.target.value)} />
      </div>
      <div style={{display: 'flex', justifyContent: 'start'}}>
      <div className="progress">Progress: {progress}%</div>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <div className="progress">Count: {events.length}</div>
      </div>
      <div className="result">
        <table className="result-table">
          <tbody>
            <tr>
              <th>Block</th>
              <th>Transaction</th>
              <th>Event</th>
              <th>Index</th>
              <th>Event Data</th>
            </tr>
            {
              events.filter(event=>{
                if (!filter) {
                  return true;
                }
                return JSON.stringify(event.event).toLowerCase().includes(filter.toLowerCase()) || 
                  JSON.stringify(event.transactionHash).toLowerCase().includes(filter.toLowerCase()) || 
                  JSON.stringify(event.blockNumber).toLowerCase().includes(filter.toLowerCase());
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
                    <td>{event.index}</td>
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
