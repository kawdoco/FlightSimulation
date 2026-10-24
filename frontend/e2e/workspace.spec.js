import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{
 await page.route('**/api/aircraft',route=>route.fulfill({json:[]}));
 await page.route('**/api/maintenance**',route=>route.fulfill({json:{content:[],last:true}}));
});
test('admin signs in, sees audit panel, and signs out',async({page})=>{
 await page.route('**/api/auth/me',route=>route.fulfill({json:{username:'admin',roles:['ROLE_ADMIN']}}));
 await page.route('**/api/operations/readiness',route=>route.fulfill({json:{status:'UP',database:'UP'}}));
 await page.route('**/api/operations/audit*',route=>route.fulfill({json:{content:[{id:1,actor:'admin',action:'USER_CREATED',target:'pilot',createdAt:'2026-01-01T00:00:00Z'}],last:true}}));
 await page.goto('/maintenance');await page.getByLabel('Password',{exact:true}).fill('TestOnlyPassword2026!');await page.getByRole('button',{name:'Sign in to workspace'}).click();
 await expect(page.getByRole('button',{name:'Manage users',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Operations',exact:true}).click();await expect(page.getByText('Database: UP',{exact:true})).toBeVisible();await expect(page.getByRole('cell',{name:'pilot',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Sign out',exact:true}).click();await expect(page.getByRole('heading',{name:'Welcome back'})).toBeVisible();
});
test('viewer does not receive admin controls',async({page})=>{
 await page.route('**/api/auth/me',route=>route.fulfill({json:{username:'reader',roles:['ROLE_VIEWER']}}));
 await page.goto('/maintenance');await page.getByLabel('Password',{exact:true}).fill('TestOnlyPassword2026!');await page.getByRole('button',{name:'Sign in to workspace'}).click();
 await expect(page.getByRole('button',{name:'Sign out',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Manage users',exact:true})).toHaveCount(0);
});
test('admin creates a viewer and changes own password',async({page})=>{
 let accounts=[{username:'admin',role:'ADMIN',enabled:true}];
 await page.route('**/api/auth/me',route=>route.fulfill({json:{username:'admin',roles:['ROLE_ADMIN']}}));
 await page.route('**/api/users*',async route=>{
  if(route.request().method()==='POST'){const body=route.request().postDataJSON();expect(body.password).toBe('ViewerPassword2026!');accounts.push({username:body.username,role:body.role,enabled:true});return route.fulfill({status:201,json:accounts.at(-1)});}
  return route.fulfill({json:{content:accounts,last:true}});
 });
 await page.route('**/api/auth/password',route=>{const body=route.request().postDataJSON();expect(body.currentPassword).toBe('TestOnlyPassword2026!');expect(body.newPassword).toBe('ReplacementPassword2026!');return route.fulfill({json:{message:'Password changed'}});});
 await page.goto('/maintenance');await page.getByLabel('Password',{exact:true}).fill('TestOnlyPassword2026!');await page.getByRole('button',{name:'Sign in to workspace'}).click();
 await page.getByRole('button',{name:'Manage users',exact:true}).click();
 await page.getByLabel('Username',{exact:true}).fill('pilot');await page.getByLabel('Initial password').fill('ViewerPassword2026!');await page.getByRole('button',{name:'Create user',exact:true}).click();await expect(page.getByRole('cell',{name:'pilot',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Change password',exact:true}).click();await page.getByLabel('Current password',{exact:true}).fill('TestOnlyPassword2026!');await page.getByLabel('New password',{exact:true}).fill('ReplacementPassword2026!');await page.getByRole('button',{name:'Save password and sign out'}).click();await expect(page.getByRole('heading',{name:'Welcome back'})).toBeVisible();
});
test('maintenance creates and completes a work order',async({page})=>{
 let records=[];
 await page.route('**/api/auth/me',route=>route.fulfill({json:{username:'operator',roles:['ROLE_OPERATOR']}}));
 await page.route('**/api/aircraft',route=>route.fulfill({json:[{id:1,registrationNumber:'TEST-001'}]}));
 await page.route('**/api/maintenance**',route=>{
  const method=route.request().method();
  if(method==='POST'){records=[{id:1,aircraftId:1,description:route.request().postDataJSON().description,status:'OPEN',createdAt:'2026-01-01T00:00:00'}];return route.fulfill({status:201,json:records[0]});}
  if(method==='PATCH'){records[0].status=route.request().postDataJSON().status;return route.fulfill({json:records[0]});}
  return route.fulfill({json:{content:records,last:true}});
 });
 await page.goto('/maintenance');await page.getByLabel('Password',{exact:true}).fill('TestOnlyPassword2026!');await page.getByRole('button',{name:'Sign in to workspace'}).click();
 const aircraftSelect=page.getByRole('combobox',{name:'Aircraft',exact:true});
 await expect(aircraftSelect).toBeEnabled();
 await expect(aircraftSelect.locator('option[value="1"]')).toHaveText('TEST-001');
 await aircraftSelect.selectOption('1');await page.getByLabel('Work description').fill('Inspect controls');await page.getByRole('button',{name:'Create record'}).click();
 await page.getByRole('button',{name:'Start work'}).click();await page.getByRole('button',{name:'Complete work'}).click();await expect(page.getByRole('cell',{name:'COMPLETED',exact:true})).toBeVisible();
});



test('user administration has readable roles and responsive account panels',async({page})=>{
 await page.route('**/api/auth/me',r=>r.fulfill({json:{username:'admin',roles:['ROLE_ADMIN']}}));
 await page.route('**/api/users*',r=>r.fulfill({json:{content:[{username:'admin',role:'ADMIN',enabled:true},{username:'pilot',role:'OPERATOR',enabled:false}],last:true}}));
 await page.goto('/users');await page.getByLabel('Password',{exact:true}).fill('TestOnlyPassword2026!');await page.getByRole('button',{name:'Sign in to workspace'}).click();
 await expect(page.getByRole('heading',{name:'User administration'})).toBeVisible();await expect(page.getByLabel('Role for pilot')).toHaveValue('OPERATOR');await expect(page.getByText('Disabled',{exact:true})).toBeVisible();
 await page.screenshot({path:'test-results/users-desktop.png',fullPage:true});
 await page.setViewportSize({width:375,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await expect(page.getByRole('button',{name:'Create user',exact:true})).toBeVisible();await page.screenshot({path:'test-results/users-mobile.png',fullPage:true});
});
