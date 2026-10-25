import {test,expect} from '@playwright/test';
const aircraft=[{id:1,registrationNumber:'TEST-001',model:'Demo',manufacturer:'Demo',status:'AVAILABLE'}];
const flights=[{id:1,flightNumber:'FS-001',aircraft:aircraft[0],departure:'A',destination:'B',status:'SCHEDULED'}];
async function signIn(page,role,path='/'){
 await page.route('**/api/auth/me',r=>r.fulfill({json:{username:role.toLowerCase(),roles:[`ROLE_${role}`]}}));
 await page.route('**/api/aircraft',r=>r.fulfill({json:aircraft}));await page.route('**/api/flights',r=>r.fulfill({json:flights}));
 await page.route('**/api/maintenance**',r=>r.fulfill({json:{content:[{id:1,aircraftId:1,description:'Inspection',status:'OPEN',createdAt:'2026-01-01T00:00:00'}],last:true}}));
 await page.goto(path);await page.getByLabel('Password',{exact:true}).fill('TestOnlyPassword2026!');await page.getByRole('button',{name:'Sign in to workspace'}).click();
}
test('admin landing uses real API-backed cards and admin navigation',async({page})=>{
 await signIn(page,'ADMIN');await expect(page.getByRole('heading',{name:'Administration overview'})).toBeVisible();await expect(page.getByRole('link',{name:'Users',exact:true})).toBeVisible();await expect(page.getByRole('link',{name:'Aircraft',exact:true}).first()).toBeVisible();await expect(page.locator('.role-metric').first()).toContainText('1');
});
test('operator landing prioritizes simulator, hides administration',async({page})=>{
 await signIn(page,'OPERATOR');await expect(page.getByRole('heading',{name:'Flight operations',exact:true})).toBeVisible();await expect(page.getByRole('link',{name:/Open simulator/})).toBeVisible();await expect(page.getByRole('link',{name:'Users',exact:true})).toHaveCount(0);
 await page.getByRole('link',{name:'Flights',exact:true}).first().click();await expect(page.getByRole('button',{name:'Start',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Delete',exact:true})).toHaveCount(0);
});
test('viewer reads management pages without mutation controls',async({page})=>{
 await signIn(page,'VIEWER');await expect(page.getByRole('heading',{name:'Monitoring overview'})).toBeVisible();
 await page.getByRole('link',{name:'Aircraft',exact:true}).first().click();await expect(page.getByRole('cell',{name:'TEST-001',exact:true})).toBeVisible();await expect(page.locator('form')).toHaveCount(0);await expect(page.getByRole('button',{name:'Edit',exact:true})).toHaveCount(0);
 await page.getByRole('link',{name:'Flights',exact:true}).first().click();await expect(page.getByRole('cell',{name:/^FS-001/})).toBeVisible();await expect(page.locator('form')).toHaveCount(0);await expect(page.getByRole('button',{name:/^(Start|Complete|Delete|Edit)$/})).toHaveCount(0);
 await page.getByRole('link',{name:'Maintenance status',exact:true}).click();await expect(page.getByText('Read-only maintenance status.',{exact:false})).toBeVisible();await expect(page.getByRole('button',{name:'Start work'})).toHaveCount(0);
});
test('viewer direct simulator route redirects to safe monitoring',async({page})=>{
 await signIn(page,'VIEWER','/simulator');await expect(page).toHaveURL(/\/telemetry$/);await expect(page.getByRole('heading',{name:'Live Telemetry Monitoring'})).toBeVisible();await expect(page.locator('canvas')).toHaveCount(0);await expect(page.getByRole('button',{name:'Keyboard',exact:true})).toHaveCount(0);
});
test('operator direct admin route is blocked',async({page})=>{
 await signIn(page,'OPERATOR','/users');await expect(page.getByRole('heading',{name:'Access restricted'})).toBeVisible();await expect(page.getByRole('button',{name:'Create user'})).toHaveCount(0);
});
test('viewer landing fits a smaller viewport and logout removes role state',async({page})=>{
 await page.setViewportSize({width:375,height:900});await signIn(page,'VIEWER');await expect(page.getByRole('heading',{name:'Monitoring overview'})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();await page.getByRole('button',{name:'Sign out',exact:true}).click();await expect(page.getByRole('heading',{name:'Welcome back'})).toBeVisible();await expect(page.getByRole('link',{name:'Monitoring overview'})).toHaveCount(0);
});
