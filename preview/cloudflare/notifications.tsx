import { createRoot } from 'react-dom/client';
import DeviceSettings from './DeviceSettings';
import { notificationTransport } from './notification-transport';
import './notifications.css';

const root = createRoot(document.getElementById('notifications')!);
const back = <a href="/admin/">Back to CRM</a>;
function session() {
  try {
    const stored = localStorage.getItem('sb-nlqsvzbtbspflyozrvds-auth-token');
    return stored ? JSON.parse(stored) : null;
  } catch { return null; }
}
const current = session();
root.render(<>{back}{current?.user?.id && current?.access_token
  ? <DeviceSettings profile={{id:current.user.id}} hasHandoffs={false}
      transport={notificationTransport(() => session()?.access_token)}/>
  : <p>Sign in to the CRM to manage notifications.</p>}</>);
