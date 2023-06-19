import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req) {
  try {
    const body = await req.json();
    let { rpc } = body;
    if (rpc.includes('$')) {
      rpc = rpc.replace('${INFURA_API_KEY}', process.env.INFURA_API_KEY);
      rpc = rpc.replace('${ALCHEMY_API_KEY}', process.env.ALCHEMY_API_KEY);
      rpc = rpc.replace('${ANKR_API_KEY}', process.env.ANKR_API_KEY);
    }

    console.log('body', body, rpc);
  
    let ret = await axios.post(rpc, {
      method: 'eth_blockNumber',
      params: [],
      id: '1',
      jsonrpc: '2.0'
    });
    ret = ret.data;
    console.log('ret', ret);
  
    return NextResponse.json({ success: true, data: parseInt(ret.result) });
  } catch (error) {
    console.log('error', error);
    return new Response(error.message, {
      status: 500
    });
  }

}
