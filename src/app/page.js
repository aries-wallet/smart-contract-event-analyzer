"use client";
import Select from "react-select";
import { networks } from "@/config";
import { useMemo, useState } from "react";
import { ERC20ABI, ERC1155ABI, ERC721ABI, FARMINGABI } from "@/abis";

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
                if (['chain', 'icon', 'features', 'shortName', 'networkId', 'ens', 'slip44'].includes(key)) {
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
                  value = networkInfo[key].map((rpc)=>{
                    return (<div key={rpc}>{rpc}</div>)
                  })
                }

                if (key === 'explorers') {
                  value = networkInfo[key].map((explorer)=>{
                    return (<div key={explorer.url}>{explorer.url}</div>)
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
          </tbody>
        </table>
      </div>
      <div className="input-group">
        <label>Input Contract Address:</label>
        <input className="input" />
      </div>
      <div className="input-group">
        <label>Input ABI string:</label>
        <input className="input" value={abi} onChange={e=>setAbi(e.target.value)} /> &nbsp;&nbsp; <a onClick={()=>setAbi(JSON.stringify(ERC20ABI))}>ERC20</a>&nbsp;&nbsp; <a onClick={()=>setAbi(JSON.stringify(ERC721ABI))}>ERC721</a>&nbsp;&nbsp; <a onClick={()=>setAbi(JSON.stringify(ERC1155ABI))}>ERC1155</a>&nbsp;&nbsp; <a onClick={()=>setAbi(JSON.stringify(FARMINGABI))}>FARMING</a>
      </div>
      <div className="input-group">
        <Select placeholder="Select Event..." className="select" styles={customStyles} options={eventOptions} />
      </div>
      <div className="input-group">
        <label>From Block:</label>
        <input className="input" />
        &nbsp;&nbsp;&nbsp;&nbsp;
        <label>To Block:</label>
        <input className="input" />
      </div>
      <div className="button-group">
        <button className="button start">Start Scan</button>
        <button className="button stop">Stop Scan</button>
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
