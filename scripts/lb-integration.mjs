// Companion to verify-load-balanced-isolated.ps1; never targets a configured live DB.
import assert from 'node:assert/strict';
const base='http://localhost:18090', password=process.env.LB_TEST_PASSWORD;
assert(password,'Run the isolated PowerShell harness');
const basic=user=>'Basic '+Buffer.from(`${user}:${password}`).toString('base64');
async function request(path,{user='admin',method='GET',body,status=200}={}){
 const r=await fetch(base+path,{method,headers:{Authorization:basic(user),'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(15000)});
 assert.equal(r.status,status,`${method} ${path}`);return r;
}
const phase=process.argv[2];
const instances=[];
for(let i=0;i<10;i++)instances.push((await request('/api/aircraft')).headers.get('x-backend-instance'));
if(phase==='failover')assert(instances.every(x=>x==='backend-a'));
else {assert.equal(instances.filter(x=>x==='backend-a').length,5);assert.equal(instances.filter(x=>x==='backend-b').length,5);for(let i=1;i<10;i++)assert.notEqual(instances[i],instances[i-1]);}
console.log(`${phase}: sequential instances ${instances.join(', ')}`);
if(phase==='baseline'){
 const html=await(await fetch(base+'/flights')).text();assert(html.includes('<div id="root">'),'SPA fallback serves frontend');
 const asset=html.match(/src="([^"]+\.js)"/)[1];const bundle=await(await fetch(base+asset)).text();
 assert(bundle.includes('http://localhost:18090'),'Frontend build uses gateway origin');
 const results=[];for(let batch=0;batch<3;batch++)results.push(...await Promise.all(Array.from({length:4},async()=>{const t=performance.now();const r=await request('/api/aircraft');return {instance:r.headers.get('x-backend-instance'),ms:Math.round(performance.now()-t)};})));
 console.log('Bounded concurrent reads (4 at a time):',JSON.stringify(results));
 for(const [username,role] of [['testviewer','VIEWER'],['testoperator','OPERATOR']]){
  const r=await request('/api/users',{method:'POST',status:201,body:{username,password,role}});assert.equal(r.headers.get('x-backend-instance'),'backend-a');
 }
 for(let i=0;i<4;i++){
  await request('/api/aircraft',{user:'testviewer',method:'POST',body:{},status:403});
  await request('/api/users',{user:'testoperator',status:403});
  await request('/api/operations/readiness',{user:'testoperator',status:403});
 }
 await request('/api/operations/readiness');
 await request('/internal/available',{status:404});
 const a=await(await request('/api/aircraft',{method:'POST',status:201,body:{registrationNumber:'LB-TEST',model:'Test',manufacturer:'Test',status:'AVAILABLE',fuelCapacity:100,maxSpeed:300,maxAltitude:10000}})).json();
 const f=await(await request(`/api/flights?aircraftId=${a.id}`,{method:'POST',status:201,body:{flightNumber:'LB-001',departure:'A',destination:'B'}})).json();
 const ws=new WebSocket('ws://localhost:18090/ws',['v12.stomp']);
 let connected,received;
 const ready=new Promise((resolve,reject)=>{connected=resolve;ws.onerror=reject;});
 const message=new Promise(resolve=>{received=resolve;});
 ws.onopen=()=>ws.send(`CONNECT\naccept-version:1.2\nAuthorization:${basic('testviewer')}\n\n\0`);
 ws.onmessage=event=>{const frame=String(event.data);if(frame.startsWith('CONNECTED')){ws.send(`SUBSCRIBE\nid:lb-test\ndestination:/topic/telemetry/${f.id}\n\n\0`);connected();}if(frame.startsWith('ERROR'))throw Error('STOMP authentication/subscription rejected');if(frame.startsWith('MESSAGE'))received(JSON.parse(frame.split('\n\n')[1].replace(/\0$/,'')));};
 const bounded=p=>Promise.race([p,new Promise((_,reject)=>setTimeout(()=>reject(Error('STOMP timeout')),5000).unref())]);
 await bounded(ready);
 // Spring's simple broker does not support STOMP receipts. Allow its inbound
 // subscription task to finish before publishing one (non-retried) REST write.
 await new Promise(resolve=>setTimeout(resolve,500));
 const sample={altitude:12,speed:130,pitch:3,roll:2,heading:20,throttle:50,fuel:99};
 const post=await request(`/api/telemetry/${f.id}`,{method:'POST',body:sample});assert.equal(post.headers.get('x-backend-instance'),'backend-a');
 assert.equal((await bounded(message)).speed,130);
 const revoked=new Promise(resolve=>{ws.onclose=resolve;});
 const patch=await request('/api/users/testviewer',{method:'PATCH',body:{role:'VIEWER',enabled:false}});
 assert.equal(patch.headers.get('x-backend-instance'),'backend-a');
 assert.equal((await bounded(revoked)).code,1008);
 const reports=[];for(let i=0;i<2;i++){const r=await request(`/api/telemetry/${f.id}`);reports.push({instance:r.headers.get('x-backend-instance'),rows:await r.json()});}
 assert.notEqual(reports[0].instance,reports[1].instance);assert.equal(reports[0].rows.length,1);assert.deepEqual(reports[0].rows,reports[1].rows);
 const csv=[];for(let i=0;i<2;i++){const r=await request(`/api/telemetry/${f.id}/export`);csv.push({instance:r.headers.get('x-backend-instance'),text:await r.text()});}
 assert.notEqual(csv[0].instance,csv[1].instance);assert.equal(csv[0].text,csv[1].text);
 console.log('PASS: gateway role enforcement; owner-only account/telemetry writes; STOMP broadcast and revocation; identical single-row telemetry and CSV on both instances.');
}
