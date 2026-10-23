// Read-only staging probe. Credentials supplied by environment, never logged.
const base=process.env.LOAD_TEST_BASE_URL;
const user=process.env.LOAD_TEST_USERNAME;
const password=process.env.LOAD_TEST_PASSWORD;
if(!base||!user||!password)throw Error('Set LOAD_TEST_BASE_URL, LOAD_TEST_USERNAME and LOAD_TEST_PASSWORD');
const target=new URL('/api/operations/readiness',base);
if(target.protocol!=='https:'&&!['localhost','127.0.0.1','[::1]'].includes(target.hostname))throw Error('Use HTTPS for non-local targets');
const auth=`Basic ${Buffer.from(`${user}:${password}`).toString('base64')}`;
const times=[];let failures=0;
for(let batch=0;batch<10;batch++)await Promise.all(Array.from({length:5},async()=>{
 const start=performance.now();try{const response=await fetch(target,{headers:{Authorization:auth},signal:AbortSignal.timeout(35000)});await response.arrayBuffer();if(!response.ok)failures++;}catch{failures++;}times.push(performance.now()-start);
}));
times.sort((a,b)=>a-b);
console.log(JSON.stringify({requests:times.length,concurrency:5,failures,p50Ms:Math.round(times[Math.floor(times.length*.5)]),p95Ms:Math.round(times[Math.floor(times.length*.95)])}));
if(failures)process.exitCode=1;
