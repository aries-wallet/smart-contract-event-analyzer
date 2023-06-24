import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

export async function POST(req) {
  try {
    const body = await req.json();
    let { rpc, eventName, fromBlock, toBlock, scAddr, abi } = body;
    if (rpc.includes('$')) {
      rpc = rpc.replace('${INFURA_API_KEY}', process.env.INFURA_API_KEY);
      rpc = rpc.replace('${ALCHEMY_API_KEY}', process.env.ALCHEMY_API_KEY);
      rpc = rpc.replace('${ANKR_API_KEY}', process.env.ANKR_API_KEY);
    }

    console.log('body',  {rpc, eventName, fromBlock, toBlock, scAddr, abi: abi.length});

    const provider = new ethers.JsonRpcProvider(rpc);
    const contract = new ethers.Contract(scAddr, abi, provider);
    let ret = await contract.queryFilter(eventName, Number(fromBlock), Number(toBlock));
    ret = ret.map((item)=>{
      let v;
      try {
        v = {
          ...item,
          event: item.args.toObject(),
        };
      } catch (err) {
        console.log('err', err);
        v = {
          ...item,
          event: item.args,
        };
      }
      
      delete v.interface;
      delete v.provider;
      delete v.fragment;
      v.name = eventName;
      return JSON.parse(JSON.stringify(v, (key, value) =>
        typeof value === 'bigint'
          ? value.toString()
          : value // return everything else unchanged
      ));
    });
    console.log('ret', ret.length, ret[0]);
    return NextResponse.json({ success: true, data: ret });
  } catch (error) {
    console.log('error', error);
    return new Response(error.message, {
      status: 500
    });
  }
}
