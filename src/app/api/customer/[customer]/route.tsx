import { NextRequest, NextResponse } from "next/server";
import { ReadableStream } from "stream/web";

import {SWRConfig, useSWRConfig} from 'swr';
import useSWR from 'swr';
var apikey:any = "zbk_V2015xuPCsk2BdSZeNhxNYud-WCYHfTthmBQT1jDptvcTRxdaPvy9gCpg";



export async function GET(req: NextRequest,
  { params }: { params: { customer: string } }) {

  const response:any = await fetch('https://api.zenbooker.com/v1/customers/'+params.customer,
    {
      headers: {
        'Authorization': 'Bearer ' + apikey, // Replace with your actual API key
        'Content-Type': 'application/json',
      }
    })
    .then(async (res:any)=>{
      const body = await res.json();
      return body;
    })
  return NextResponse.json(response);
};