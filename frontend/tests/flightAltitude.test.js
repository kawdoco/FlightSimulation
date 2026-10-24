import test from 'node:test';
import assert from 'node:assert/strict';
import {advanceAltitude} from '../src/simulator/speedDynamics.js';
test('cannot take off below rotation speed',()=>assert.equal(advanceAltitude(0,120,25,.1),0));
test('nose up climbs with speed',()=>assert.ok(advanceAltitude(0,180,25,.1)>0));
test('nose down descends without going underground',()=>{assert.ok(advanceAltitude(100,180,-20,.1)<100);assert.equal(advanceAltitude(.1,180,-20,.1),0);});
test('level pitch maintains altitude',()=>assert.equal(advanceAltitude(100,180,0,.1),100));
test('parked aircraft cannot climb even when airborne',()=>assert.equal(advanceAltitude(100,0,25,.1),100));
test('invalid speed and time never produce NaN',()=>{assert.equal(advanceAltitude(0,NaN,25,.1),0);assert.equal(advanceAltitude(100,200,25,NaN),100);});
