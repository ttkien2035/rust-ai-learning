import { SESSION_COUNT, MAX_CHANGES } from './course-config.mjs';
export const emptyState = () => ({version:1,completed:[],notes:{},answers:{},lastSession:1});
export function validField(key,value) {
  if(key==='lastSession') return Number.isInteger(value)&&value>=1&&value<=SESSION_COUNT;
  if(typeof key!=='string')return false;
  const match=/^(completed|notes|answers)\.([1-9]\d*)(?:-([0-2]))?$/.exec(key);
  if(!match||Number(match[2])>SESSION_COUNT)return false;
  if(match[1]==='completed'&&match[3]===undefined)return typeof value==='boolean';
  if(match[1]==='notes'&&match[3]===undefined)return typeof value==='string'&&value.length<=40000;
  if(match[1]==='answers'&&match[3]!==undefined)return typeof value==='string'&&value.length<=15000;
  return false;
}
export function readField(state,key) {
  const [kind,id]=key.split('.');
  if(kind==='lastSession') return state.lastSession;
  if(kind==='completed') return state.completed.includes(Number(id));
  return state[kind][id]||'';
}
export function setField(state,key,value) {
  const [kind,id]=key.split('.');
  if(kind==='lastSession')state.lastSession=value;
  else if(kind==='completed')state.completed=[...new Set([...state.completed.filter(n=>n!==Number(id)),...(value?[Number(id)]:[])])].sort((a,b)=>a-b);
  else state[kind][id]=value;
}
export function validateChanges(changes) {
  if(!Array.isArray(changes)||!changes.length||changes.length>MAX_CHANGES) throw new Error('Invalid change set.');
  const keys=new Set();
  for(const c of changes){if(!c||!validField(c.key,c.value)||!validField(c.key,c.base)||keys.has(c.key))throw new Error('Invalid or duplicate learning field.');keys.add(c.key);}
}
export function mergeChanges(state,changes) {
  validateChanges(changes);
  const conflicts=changes.filter(c=>c.key!=='lastSession'&&readField(state,c.key)!==c.base&&readField(state,c.key)!==c.value).map(c=>c.key);
  const next=structuredClone(state);
  if(!conflicts.length)for(const c of changes)setField(next,c.key,c.value);
  return {state:next,conflicts};
}
