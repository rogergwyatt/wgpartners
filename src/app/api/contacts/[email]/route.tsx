import { NextRequest, NextResponse } from "next/server";
import { ReadableStream } from "stream/web";

import {SWRConfig, useSWRConfig} from 'swr';
import useSWR from 'swr';
import { QueryResultRow, sql } from "@vercel/postgres";
import {headers} from "next/headers"

export async function GET(req: NextRequest,
    { params }: { params: {email: string } })  {

    const headersList = headers();
    const referer = headersList.get('referer');
    const apikey = headersList.get('Authorization');

    var result = {};
    if(apikey == 'Bearer '+process.env.HPC_API){
         const {rows} = await sql`select * from contacts where email = ${params.email}`;
        result = {success:true, rows};
    } else {
        result = {success:false, rows:[]}
    }
  return NextResponse.json(result);
};


export async function PUT(req: NextRequest,
    { params }: { params: {email: string }})
{
    const headersList = headers();
    const referer = headersList.get('referer');
    const apikey = headersList.get('Authorization');
    const upParms:{name: string, phone: string} = await req.json();

    var result = {};
    if(apikey == 'Bearer '+process.env.HPC_API){
        const { rows } = await sql`update contacts set name=${upParms.name}, phone=${upParms.phone} where email = ${params.email}`;
        result = {success:true, rows}
    } else {
        result = {success:false, rows:[]}
    }


     return NextResponse.json(result);
};


export async function DELETE(req: NextRequest,
    { params }: { params: {email: string } })
{
    const headersList = headers();
    const referer = headersList.get('referer');
    const apikey = headersList.get('Authorization');

    var result = {};
    if(apikey == 'Bearer '+process.env.HPC_API){
        const { rows } = await sql`delete from contacts where email = ${params.email}`;
        result = {success: true, rows};
    } else {
        result = {success: false, rows:[]}
    }
  return NextResponse.json(result);
};
