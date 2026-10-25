import test from 'node:test';
import assert from 'node:assert/strict';
import {forwardDistance,advanceSpeed} from '../src/simulator/speedDynamics.js';
test('forward distance uses km/h to meters conversion',()=>assert.equal(forwardDistance(180,.1),5));
test('invalid controls cannot poison speed',()=>{assert.equal(advanceSpeed(0,NaN,.1),0);assert.equal(forwardDistance(NaN,.1),0);});
