"""Exercise the release CSS in iOS Safari against loopback-only review records."""
import functools
import http.server
import json
import pathlib
import subprocess
import threading
import time
import urllib.request
import urllib.error

out = pathlib.Path('ios-results')
out.mkdir(exist_ok=True)
origin = 'http://127.0.0.1:4173'
user = {'id': '10000000-0000-4000-8000-000000000001', 'email': 'review@example.invalid'}
leads = [dict(id=i, name=f'Review inquiry {i}', phone='', status='new',
              created_at='2026-11-21T09:00:00Z', service_name='Inspection') for i in range(1, 31)]

class Review(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; worker-src 'none'")
        super().end_headers()

    def do_GET(self):
        route = self.path.split('?')[0]
        if route.startswith(('/rest/', '/auth/')):
            result = leads if route.endswith('/leads') else [user] if route.endswith('/admins') else user
            body = json.dumps(result).encode()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if route.startswith('/admin'):
            self.path = '/index.html'
        super().do_GET()

def command(*cmd):
    return subprocess.check_output(cmd, text=True)

ios = json.loads(command('xcrun', 'simctl', 'list', 'devices', 'available', '-j'))['devices']
phones = [device for runtime, entries in sorted(ios.items(), reverse=True) if '.iOS-' in runtime
          for device in entries if device['name'].startswith('iPhone')]
phone = next((d for d in phones if d['name'] in ('iPhone 16', 'iPhone 17')), phones[0])
udid = phone['udid']
print('Simulator:', phone['name'], flush=True)
if phone['state'] != 'Booted':
    command('xcrun', 'simctl', 'boot', udid)
command('xcrun', 'simctl', 'bootstatus', udid, '-b')
server = http.server.ThreadingHTTPServer(('127.0.0.1', 4173), functools.partial(Review, directory='dist'))
threading.Thread(target=server.serve_forever, daemon=True).start()
command('sudo', 'safaridriver', '--enable')
driver = subprocess.Popen(['safaridriver', '-p', '4444'])
base = 'http://127.0.0.1:4444'
def rpc(route, body=None):
    req = urllib.request.Request(base + route, data=None if body is None else json.dumps(body).encode(),
                                 headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=100) as resp:
            return json.load(resp)['value']
    except urllib.error.HTTPError as exc:
        raise RuntimeError(exc.read().decode()) from exc

def shot(name):
    command('xcrun', 'simctl', 'io', udid, 'screenshot', str(out / (name + '.png')))

try:
    for _ in range(30):
        try:
            rpc('/status')
            break
        except OSError:
            time.sleep(1)
    session = rpc('/session', {'capabilities': {'alwaysMatch': {'browserName': 'Safari', 'platformName': 'iOS',
                  'safari:useSimulator': True, 'safari:deviceUDID': udid}}})
    base += '/session/' + session['sessionId']
    def js(source, *args):
        return rpc('/execute/sync', {'script': source, 'args': args})
    rpc('/url', {'url': origin + '/admin/leads'})
    js("localStorage.setItem('sb-127-auth-token', JSON.stringify(arguments[0]))", {
        'user': user, 'access_token': 'offline.fixture.only', 'refresh_token': 'offline',
        'expires_at': int(time.time()) + 3600, 'token_type': 'bearer'})
    rpc('/refresh', {})
    for _ in range(40):
        if js("return !!document.querySelector('main') && document.body.textContent.includes('Review inquiry 30')"):
            break
        time.sleep(.5)
    else:
        raise RuntimeError(js("return document.body.innerText.slice(0,900)"))
    def measure():
        data = js("""const main=document.querySelector('main'), shell=document.querySelector('[data-app="admin"]');
          return {colors:[document.documentElement,document.body,document.querySelector('#root'),shell].map(el=>getComputedStyle(el).backgroundColor),
            viewport:visualViewport.height,bottom:shell.getBoundingClientRect().bottom,scroll:main.scrollTop}""")
        print(json.dumps(data), flush=True)
        assert data['colors'] == ['rgb(11, 13, 19)'] * 4
        assert data['bottom'] + 1 >= data['viewport']
        return data
    measure()
    shot('dashboard-at-rest')
    def swipe(y1,y2):
        rpc('/actions', {'actions':[{'type':'pointer','id':'finger','parameters':{'pointerType':'touch'},'actions':[
            {'type':'pointerMove','duration':0,'x':185,'y':y1},{'type':'pointerDown','button':0},
            {'type':'pointerMove','duration':400,'x':185,'y':y2},{'type':'pointerUp','button':0}]}]})
        time.sleep(1)
    swipe(600,210)
    assert measure()['scroll'] > 0
    shot('dashboard-after-swipe')
    swipe(230,580)
    measure()
    shot('dashboard-reverse-swipe')
finally:
    driver.terminate()
    server.shutdown()
