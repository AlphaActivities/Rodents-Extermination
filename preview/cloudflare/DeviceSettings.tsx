import { useEffect,useState } from 'react';
interface Device {accepted?:boolean;id:string;label:string;last_seen_at:string;receipt_confirmed_at:string|null}
export interface Preferences {admin_id:string;website_inquiries:boolean;chatbot_handoffs:boolean;follow_ups:boolean}
export interface NotificationTransport {
  settings: () => Promise<{devices:Device[];preferences:Omit<Preferences,'admin_id'>;publicKey:string|null;owner:boolean;team?:{registered:number;confirmed:number}}>;
  change: (action:string, body:object) => Promise<unknown>;
}
export default function DeviceSettings({profile, transport, hasHandoffs=true}: {profile:{id:string};transport:NotificationTransport;hasHandoffs?:boolean}) {
  const [devices,setDevices]=useState<Device[]>([]);const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);
  const [label,setLabel]=useState('My device');const [prefs,setPrefs]=useState<Preferences>({admin_id:profile.id,website_inquiries:true,chatbot_handoffs:true,follow_ups:true});
  const [publicKey,setPublicKey]=useState<string|null>(null);
  const [team,setTeam]=useState<{registered:number;confirmed:number}>();
  const [ready,setReady]=useState(!transport);
  const refresh=async()=>{
    const data=await transport.settings();
    setDevices(data.devices);setPrefs({admin_id:profile.id,...data.preferences});setPublicKey(data.publicKey);setTeam(data.team);setReady(true);
  };
  useEffect(()=>{void refresh().catch(()=>setMessage('Device settings are unavailable. Please retry.'));},[]);
  async function action(fn:()=>Promise<unknown>){setBusy(true);setMessage('');try{await fn();await refresh();}catch(e){setMessage((e as Error).message);}finally{setBusy(false);}}
  async function enable(){
    if(!('serviceWorker' in navigator)||!('PushManager' in window)||!('Notification' in window))throw new Error('Notifications are not supported in this browser. On iPhone, install from Safari and open the Home Screen app.');
    const key=publicKey;
    if(!key)throw new Error('Push enrollment is awaiting server configuration.');
    // Permission stays inside the original user gesture.
    const permission=await Notification.requestPermission();
    if(permission!=='granted')throw new Error('Notifications were not enabled. You can change permission in your browser or device settings.');
    const registration=await navigator.serviceWorker.ready;
    const bytes=Uint8Array.from(atob(key.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
    let subscription = await registration.pushManager.getSubscription();
    const enrolledKey = subscription?.options.applicationServerKey;
    if (subscription && (!enrolledKey || new Uint8Array(enrolledKey).length !== bytes.length ||
        new Uint8Array(enrolledKey).some((byte, index) => byte !== bytes[index]))) {
      if (!await subscription.unsubscribe()) throw new Error('Could not replace this device subscription.');
      subscription = null;
    }
    subscription ??= await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:bytes});
    const json=subscription.toJSON();
    await transport.change('register',{label,subscription:json});
    setMessage('Device registered. Send a test and confirm that you saw it.');
  }
  async function remove(id:string){
    await transport.change('remove',{id});setMessage('Device removed from this account.');
  }
  async function sendTest(id:string){
    await transport.change('test',{id});setMessage('Provider accepted the test. Confirm when you see the alert.');
  }
  async function preference(key:keyof Omit<Preferences,'admin_id'>,value:boolean){
    const next={...prefs,[key]:value};await transport.change('preferences',next);setPrefs(next);
  }
  return <section className="pod-panel"><h1>My Settings</h1><p>Install this dashboard from Safari on iPhone, or Chrome on Android and desktop. Notifications are optional and belong to each device and account.</p>
    <label>Device name<input maxLength={80} value={label} onChange={e=>setLabel(e.target.value)}/></label>
    <button disabled={busy || !ready} onClick={()=>void action(enable)}>Enable Notifications</button><button disabled={busy} onClick={()=>void action(refresh)}>Refresh My Devices</button>
    {message&&<p role="status">{message}</p>}
    <h2>Notification Preferences</h2>{(['website_inquiries','chatbot_handoffs','follow_ups'] as const).filter(key=>hasHandoffs || key!=='chatbot_handoffs').map(key=><label key={key}><input type="checkbox" checked={prefs[key]} disabled={busy} onChange={e=>void action(()=>preference(key,e.target.checked))}/>{key.replace(/_/g,' ')}</label>)}
    <h2>My Devices</h2>{devices.length===0&&<p>No registered devices.</p>}{devices.map(device=><article className="pod-card" key={device.id}><h3>{device.label}</h3>{device.last_seen_at&&<p>Last registered: {new Date(device.last_seen_at).toLocaleString()}</p>}<p>{device.receipt_confirmed_at?'Receipt confirmed '+new Date(device.receipt_confirmed_at).toLocaleString():'Receipt not confirmed'}</p>
      <button disabled={busy} onClick={()=>void action(()=>sendTest(device.id))}>Send Test</button><button disabled={busy || Boolean(transport && !device.accepted)} onClick={()=>void action(()=>transport.change('confirm',{id:device.id}))}>I saw the alert on this device</button><button disabled={busy} onClick={()=>void action(()=>remove(device.id))}>Remove</button></article>)}
    {team&&<section aria-label="Owner notification administration"><h2>Owner overview</h2><p>{team.registered} registered devices. {team.confirmed} confirmed.</p></section>}
    </section>;
}
