"use client";

import { networks } from "@/config";
export default function Home() {
  return (
    <div className="container">
      <h1 className="title">Smart Contract Event Analyzer</h1>
      <div className="input-group">
        <label>Select Network:</label>
        <select className="select">
          <option value="mainnet">Mainnet</option>
        </select>
      </div>
      <div className="network-info">
        <table className="info-table">
          <tbody>
            <tr>
              <th>Properties</th>
              <th>Value</th>
            </tr>
            <tr>
              <td>Network</td>
              <td>mainnet</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="input-group">
        <label>Input Contract Address:</label>
        <input className="input" />
      </div>
      <div className="input-group">
        <label>Input ABI string:</label>
        <input className="input" />
      </div>
      <div className="input-group">
        <label>Select Event:</label>
        <select className="select" />
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
