import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../app/chatgpt-auth';
import {emptyState} from './learning.mjs';
export class HttpError extends Error {constructor(public status:number,message:string){super(message);}}
export const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
export async function authorized(request:Request,write=false) {
  const user=await getChatGPTUser();
  if(!user)throw new HttpError(401,'Sign in with ChatGPT to use your learning account.');
  if(write && request.headers.get('origin')!==new URL(request.url).origin)throw new HttpError(403,'A same-origin request is required.');
  if(!env.DB)throw new HttpError(503,'Account storage is unavailable. Your browser copy is retained.');
  return {user,db:env.DB};
}
export async function body(request:Request,limit=250000) {
  if(!request.headers.get('content-type')?.startsWith('application/json'))throw new HttpError(415,'JSON is required.');
  const reader=request.body?.getReader();if(!reader)throw new HttpError(400,'Request body required.');
  const parts:Uint8Array[]=[];let size=0;
  while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>limit){await reader.cancel();throw new HttpError(413,'Request is too large.');}parts.push(value);}
  const all=new Uint8Array(size);let offset=0;for(const p of parts){all.set(p,offset);offset+=p.length;}
  try{return JSON.parse(new TextDecoder().decode(all));}catch{throw new HttpError(400,'Invalid JSON.');}
}
export async function loadState(db:D1Database,userId:string){
  const row=await db.prepare('SELECT data,revision FROM learning_state WHERE user_id=?').bind(userId).first<{data:string,revision:number}>();
  return row?{state:JSON.parse(row.data),revision:row.revision}:{state:emptyState(),revision:0};
}
export function failure(error:unknown){return error instanceof HttpError?json({error:error.message},error.status):json({error:'The service is temporarily unavailable. Your work has not been discarded.'},503);}
