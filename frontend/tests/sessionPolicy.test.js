import test from 'node:test';
import assert from 'node:assert/strict';
import {shouldExpireSession} from '../src/services/sessionPolicy.js';
test('expires matching unauthorized credentials',()=>assert.equal(shouldExpireSession(401,'Basic old','Basic old'),true));
test('late response cannot expire a newer login',()=>assert.equal(shouldExpireSession(401,'Basic old','Basic new'),false));
test('forbidden access does not sign a user out',()=>assert.equal(shouldExpireSession(403,'Basic current','Basic current'),false));
test('anonymous failure does not expire session',()=>assert.equal(shouldExpireSession(401,'',''),false));
