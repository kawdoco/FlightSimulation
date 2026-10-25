import { test, expect } from '@playwright/test';

async function hardwareWorkspace(page, role = 'OPERATOR', path = '/telemetry') {
 let selected = 1;
 const status = () => ({flightId:selected, serialEnabled:true, port:'COM7', lastPacketAt:new Date().toISOString(), recording:{pending:2,error:null}});
 await page.route('**/api/auth/me', r => r.fulfill({json:{username:'pilot',roles:[`ROLE_${role}`]}}));
 await page.route('**/api/flights', r => r.fulfill({json:[{id:1,flightNumber:'FS-001'},{id:2,flightNumber:'FS-002'}]}));
 await page.route('**/api/hardware', r => r.fulfill({json:status()}));
 await page.route('**/api/hardware/flight', r => {
  selected = r.request().postDataJSON().flightId;
  return r.fulfill({json:status()});
 });
 await page.routeWebSocket('**/ws', ws => {
  ws.onMessage(frame => {
   const text = String(frame);
   if (text.startsWith('CONNECT')) ws.send('CONNECTED\nversion:1.2\nheart-beat:0,0\n\n\0');
   if (text.startsWith('SUBSCRIBE')) {
    const destination = text.match(/destination:([^\n]+)/)[1];
    const id = text.match(/\nid:([^\n]+)/)[1];
    const body = JSON.stringify({altitude:50,speed:150,pitch:3,roll:0,heading:0,throttle:50,fuel:100,altitudeValid:false,imuValid:false,commandFresh:true});
    ws.send(`MESSAGE\ndestination:${destination}\nsubscription:${id}\nmessage-id:sample\n\n${body}\0`);
   }
  });
 });
 await page.goto(path);
 await page.getByLabel('Password',{exact:true}).fill('TestOnlyPassword2026!');
 await page.getByRole('button',{name:'Sign in to workspace'}).click();
}

test('hardware flight selection shares backend destination and shows sensor faults', async ({page}) => {
 await hardwareWorkspace(page);
 await expect(page.getByLabel('Hardware flight')).toHaveValue('1');
 await expect(page.getByText('Ultrasonic altitude unavailable.',{exact:false})).toBeVisible();
 await expect(page.getByText('MPU6050 unavailable.',{exact:false})).toBeVisible();
 await page.getByLabel('Hardware flight').selectOption('2');
 await expect(page.getByLabel('Hardware flight')).toHaveValue('2');
 await expect(page.getByText('Recording: 2 samples awaiting storage.')).toBeVisible();
 await expect(page.getByText('Unavailable',{exact:true})).toBeVisible();
});

test('viewer can monitor but cannot reassign controller', async ({page}) => {
 await hardwareWorkspace(page, 'VIEWER');
 await expect(page.getByLabel('Hardware flight')).toBeDisabled();
});

test('simulator renders with split Three.js modules and labels virtual altitude', async ({page}) => {
 const errors=[];page.on('pageerror', error => errors.push(error.message));
 await hardwareWorkspace(page, 'OPERATOR', '/simulator');
 await expect(page.locator('canvas')).toBeVisible({timeout:30000});
 await expect(page.getByText('Simulated altitude',{exact:true}).first()).toBeVisible();
 expect(errors).toEqual([]);
});
