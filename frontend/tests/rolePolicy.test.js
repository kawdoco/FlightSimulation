import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveRole,permissions,navigation,routeAllowed} from '../src/access/rolePolicy.js';
test('roles resolve from existing authorities with admin precedence',()=>{assert.equal(resolveRole(['ROLE_VIEWER','ROLE_ADMIN']),'ADMIN');assert.equal(resolveRole(['ROLE_OPERATOR']),'OPERATOR');assert.equal(resolveRole([]),null);});
test('viewer has no mutation or simulator access',()=>{assert.equal(permissions('VIEWER').canOperate,false);assert.equal(routeAllowed('VIEWER','/simulator'),false);assert.equal(routeAllowed('VIEWER','/users'),false);assert.equal(routeAllowed('VIEWER','/operations'),false);assert.equal(routeAllowed('VIEWER','/history'),true);});
test('operator retains flight controls but cannot administer or delete',()=>{assert.equal(permissions('OPERATOR').canOperate,true);assert.equal(permissions('OPERATOR').canDelete,false);assert.equal(routeAllowed('OPERATOR','/simulator'),true);assert.equal(routeAllowed('OPERATOR','/operations'),false);});
test('navigation exposes role-specific priorities',()=>{assert.equal(navigation('ADMIN')[0][1],'System overview');assert.equal(navigation('OPERATOR')[1][0],'/simulator');assert.ok(!navigation('VIEWER').some(([path])=>['/simulator','/users','/operations'].includes(path)));assert.deepEqual(navigation(null),[]);});
