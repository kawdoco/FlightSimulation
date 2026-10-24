import test from 'node:test';
import assert from 'node:assert/strict';
import {advanceBankHeading as advance} from '../src/simulator/bankDynamics.js';
test('parked and taxiing aircraft cannot spin from bank',()=>{assert.equal(advance(10,0,30,.1),10);assert.equal(advance(10,120,30,.1),10);});
test('level plane flies straight at speed',()=>assert.equal(advance(10,200,0,.1),10));
test('left and right bank produce opposite turns',()=>{assert.ok(advance(180,200,20,.1)>180);assert.ok(advance(180,200,-20,.1)<180);});
test('turn rate remains bounded',()=>assert.ok(advance(0,121,40,.1)<=2));
test('connection gaps do not produce a heading jump',()=>assert.equal(advance(10,200,30,5),10));
