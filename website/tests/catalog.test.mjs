import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SESSION_COUNT,MAX_CHANGES} from '../lib/course-config.mjs';
const course=JSON.parse(readFileSync(new URL('../public/course.json',import.meta.url),'utf8'));
test('catalog, sync limits and metadata agree',()=>{
 assert.equal(SESSION_COUNT,22);assert.equal(MAX_CHANGES,111);assert.equal(course.sessions.length,SESSION_COUNT);
 assert.deepEqual(course.sessions.map(s=>s.id),Array.from({length:SESSION_COUNT},(_,i)=>i+1));
 assert.equal(course.meta.totalHours,course.sessions.reduce((n,s)=>n+s.hours,0));assert.equal(course.meta.totalHours,196);
 assert.equal(course.meta.phases.at(-1).ids.length,10);
});
test('advanced lectures have labs, sources, three checkpoints and valid prerequisites',()=>{
 for(const s of course.sessions){assert.ok(s.html.length>500);assert.ok(s.lab.length>300);assert.equal(s.checkpoints.length,3);for(const id of s.prerequisites)assert.ok(id<s.id&&id>=1);}
 for(const s of course.sessions.slice(12)){assert.equal(s.track,'Advanced');assert.equal(s.hours,10);assert.match(s.html,/Sources/);assert.match(s.lab,/Lab [G-P]/);}
});
