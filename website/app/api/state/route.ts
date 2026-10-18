import {authorized,body,failure,json,loadState,HttpError} from '../../../lib/server';
import {mergeChanges,validateChanges} from '../../../lib/learning.mjs';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{const {user,db}=await authorized(request);return json({...await loadState(db,user.userId),user:{id:user.userId,name:user.displayName}});}catch(e){return failure(e);}}
export async function PATCH(request:Request){try{
 const {user,db}=await authorized(request,true);const input=await body(request);
 try{validateChanges(input.changes);}catch{throw new HttpError(400,'Invalid learning changes.');}
 for(let attempt=0;attempt<4;attempt++){
  const current=await loadState(db,user.userId);const merged=mergeChanges(current.state,input.changes);
  if(merged.conflicts.length)return json({...current,conflicts:merged.conflicts,error:'This field changed on another device. Choose which version to keep.'},409);
  const data=JSON.stringify(merged.state);if(data.length>1000000)throw new HttpError(413,'Learning state exceeds the account limit. Export and shorten older notes.');
  const result=await db.prepare('INSERT INTO learning_state(user_id,data,revision,updated_at) VALUES(?,?,1,?) ON CONFLICT(user_id) DO UPDATE SET data=excluded.data,revision=learning_state.revision+1,updated_at=excluded.updated_at WHERE learning_state.revision=?').bind(user.userId,data,new Date().toISOString(),current.revision).run();
  if(result.meta.changes)return json({state:merged.state,revision:current.revision+1});
 }
 throw new HttpError(409,'Account changed repeatedly. Sync again to retry safely.');
 }catch(e){return failure(e);}}
