import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyState,mergeChanges,validateChanges,readField,validField} from '../lib/learning.mjs';

test('independent device edits preserve unrelated notes',()=>{
 const a=emptyState();a.notes[1]='device A';
 const r=mergeChanges(a,[{key:'notes.2',base:'',value:'device B'}]);
 assert.deepEqual(r.conflicts,[]);assert.equal(r.state.notes[1],'device A');assert.equal(r.state.notes[2],'device B');
});
test('same-field conflict retains both versions without changing server state',()=>{
 const a=emptyState();a.notes[1]='new cloud note';
 const r=mergeChanges(a,[{key:'notes.1',base:'old note',value:'offline draft'}]);
 assert.deepEqual(r.conflicts,['notes.1']);assert.equal(r.state.notes[1],'new cloud note');
});
test('replayed writes are idempotent',()=>{
 const change=[{key:'completed.2',base:false,value:true}];
 const first=mergeChanges(emptyState(),change).state;const second=mergeChanges(first,change);
 assert.deepEqual(second.conflicts,[]);assert.deepEqual(second.state.completed,[2]);
});
test('completion can be undone and last session tracks navigation',()=>{
 const a=emptyState();a.completed=[1];a.lastSession=9;
 const r=mergeChanges(a,[{key:'completed.1',base:true,value:false},{key:'lastSession',base:1,value:3}]);
 assert.deepEqual(r.state.completed,[]);assert.equal(r.state.lastSession,3);
});
test('rejects prototype keys, invalid values, excessive text and duplicate fields',()=>{
 for(const changes of [[{key:'notes.__proto__',value:'x',base:''}],[{key:'completed.1',value:'true',base:false}],[{key:'notes.1',value:'x'.repeat(40001),base:''}],[{key:'lastSession',base:1,value:99}],[{key:'notes.1',value:'a',base:''},{key:'notes.1',value:'b',base:''}]])assert.throws(()=>validateChanges(changes));
});
test('absent notes have an explicit empty-string baseline',()=>{assert.equal(readField(emptyState(),'notes.1'),'');});

test('advanced progress can be added without replacing core progress',()=>{
 const original=emptyState();original.completed=[1,12];original.notes[1]='existing core note';original.answers['12-0']='core answer';
 const r=mergeChanges(original,[{key:'completed.22',base:false,value:true},{key:'notes.22',base:'',value:'optimizer experiment'},{key:'answers.22-2',base:'',value:'stable candidate seeds'},{key:'lastSession',base:1,value:22}]);
 assert.deepEqual(r.conflicts,[]);assert.deepEqual(r.state.completed,[1,12,22]);assert.equal(r.state.notes[1],'existing core note');assert.equal(r.state.answers['12-0'],'core answer');assert.equal(r.state.lastSession,22);
});
test('catalog boundaries include new sessions but reject malformed keys',()=>{
 assert.equal(validField('notes.13','profile'),true);assert.equal(validField('completed.22',true),true);assert.equal(validField('answers.22-2','x'),true);
 for(const [key,value]of [['notes.23','x'],['answers.22-3','x'],['notes.01','x'],['notes.1-0','x'],['answers.22','x'],['completed.22-0',true],['lastSession',23]])assert.equal(validField(key,value),false);
});
