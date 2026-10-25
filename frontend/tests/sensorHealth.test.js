import test from 'node:test';
import assert from 'node:assert/strict';
import { sensorWarnings } from '../src/services/sensorHealth.js';
test('legacy firmware reports unknown health instead of claiming healthy sensors', () => {
 assert.match(sensorWarnings({}).join(' '), /unknown/);
});
test('sensor failures and command loss remain visible while packets arrive', () => {
 const warnings = sensorWarnings({altitudeValid:false, imuValid:false, commandFresh:false});
 assert.equal(warnings.length, 3);
 assert.match(warnings.join(' '), /last valid reading/);
});
test('healthy sensor packet clears warnings', () => {
 assert.deepEqual(sensorWarnings({altitudeValid:true, imuValid:true, commandFresh:true}), []);
});
