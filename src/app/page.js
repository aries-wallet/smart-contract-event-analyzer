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
        <h2>Network Information</h2>
        <table className="info-table">
          <tr>
            <th>Properties</th>
            <th>Value</th>
          </tr>
          <tr>
            <td>Network</td>
            <td>mainnet</td>
          </tr>
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
        <select className="select"/>
      </div>
      <div className="input-group">
        <label>From Block:</label>
        <input className="input" />
        <label>To Block:</label>
        <input className="input" />
      </div>
      <div className="button-group">
        <button className="button start">Start Scan</button>
        <button className="button stop">Stop Scan</button>
      </div>
      <div className="progress">
        Progress: 0%
      </div>
      <div className="result">
        <h2>Result:</h2>
        <table className="result-table">
          <tr>
            <th>Block</th>
            <th>Transaction</th>
            <th>Event</th>
            <th>Event Data</th>
          </tr>
        </table>
      </div>
    </div>
  )
}
