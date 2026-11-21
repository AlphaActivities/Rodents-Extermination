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
        if self.path.startswith('/capture/'):
            name = self.path.split('/')[-1]
            if name in ('before-swipe', 'after-swipe', 'reverse-swipe'):
                command('xcrun', 'simctl', 'io', udid, 'screenshot', str(out / (name + '.png')))
            self.send_response(204)
            self.end_headers()
            return
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
fixture = {'user': user, 'access_token': 'offline.fixture.only', 'refresh_token': 'offline',
           'expires_at': int(time.time()) + 3600, 'token_type': 'bearer'}
html = pathlib.Path('dist/index.html')
html.write_text(html.read_text().replace('<head>', '<head><script>localStorage.setItem("sb-127-auth-token",'
    + json.dumps(json.dumps(fixture)) + ')</script>', 1))
command('xcrun', 'simctl', 'openurl', udid, origin + '/admin/leads')
time.sleep(12)
command('xcrun', 'simctl', 'io', udid, 'screenshot', str(out / 'safari-at-rest.png'))
subprocess.run(['xcodegen', 'generate', '--spec', 'scripts/qa/simulator/project.yml'], check=True)
subprocess.run(['xcodebuild', 'test', '-project', 'scripts/qa/simulator/Canvas.xcodeproj',
                '-scheme', 'Review', '-destination', 'platform=iOS Simulator,id=' + udid,
                '-parallel-testing-enabled', 'NO', 'CODE_SIGNING_ALLOWED=NO'], check=True)
