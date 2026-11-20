import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const origin = 'https://rodentsextermandinsulationllc.com';
const source = await readFile(process.env.C3_INTAKE_TEST_SOURCE ?? new URL('../supabase/functions/submit-lead/index.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});
const requestData = {
  name: 'Fixture Customer',
  phone: '2145550101',
  email: 'fixture@example.invalid',
  service_name: 'Rodent Control',
  message: 'Please inspect the attic for signs of rodent activity.',
  property_zip: '75001',
  recaptcha_token: 'fixture',
};

function setup({ captchaHost = new URL(origin).hostname, insertFailed = false, recent = [] } = {}) {
  const leads = [];
  const mirrored = [];
  const attempts = [];
  let handler;
  const supabase = {
    from(table) {
      return {
        select() { return this; },
        async single() { return { data: { id: String(attempts.length) } }; },
        update(data) {
          return { eq: async (_, id) => { Object.assign(attempts[Number(id) - 1], data); return {}; } };
        },
        eq() { return this; },
        async gte() {
          return table === 'leads' ? { data: recent } : { count: 0 };
        },
        insert(data) {
          if (table === 'lead_submission_attempts') {
            attempts.push(data);
            return this;
          }
          if (table === 'leads') {
            if (insertFailed) return { error: { code: 'fixture_error' } };
            leads.push(data);
          }
          return {};
        },
      };
    },
  };
  runInNewContext(outputText, {
    exports: {},
    require: (specifier) => {
      assert.equal(specifier, 'npm:@supabase/supabase-js@2');
      return { createClient: () => supabase };
    },
    Deno: { serve: (callback) => { handler = callback; }, env: { get: () => 'fixture' } },
    Request, Response, URL, URLSearchParams, TextEncoder, crypto,
    console: { log() {}, error() {} },
    fetch: async (url) => {
      if (url === 'https://www.google.com/recaptcha/api/siteverify') {
        return Response.json({ success: true, hostname: captchaHost });
      }
      assert.equal(new URL(url).origin, origin);
      assert.equal(leads.length, 1, 'Mirror must follow the successful CRM insert');
      mirrored.push(url);
      return new Response(null, { status: 200 });
    },
  });
  const submit = () => handler(new Request('https://fixture.example.invalid/submit-lead', {
    method: 'POST',
    headers: { Origin: origin },
    body: JSON.stringify(requestData),
  }));
  return { handler, submit, leads, mirrored };
}

test('Netlify primary site passes preflight and valid CAPTCHA, saving before mirroring', async () => {
  const { handler, submit, leads, mirrored } = setup();
  const preflight = await handler(new Request(origin, { method: 'OPTIONS', headers: { Origin: origin } }));
  assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), origin);
  const response = await submit();
  assert.equal(response.status, 201);
  assert.equal((await response.json()).success, true);
  assert.equal(leads.length, 1);
  assert.equal(mirrored.length, 1);
});

test('a matched lead is linked and classified as a duplicate under current intake rules', async () => {
  const { submit, leads } = setup({ recent: [{ id: 17, normalized_phone: requestData.phone, email: requestData.email }] });
  assert.equal((await submit()).status, 201);
  assert.equal(leads[0].quality, 'duplicate');
  assert.equal(leads[0].duplicate_of, 17);
});

test('an unrelated CAPTCHA hostname and a failed insert cannot report submission success', async () => {
  for (const [config, status] of [
    [{ captchaHost: 'unrelated.example.invalid' }, 403],
    [{ insertFailed: true }, 500],
  ]) {
    const { submit, leads, mirrored } = setup(config);
    const response = await submit();
    assert.equal(response.status, status);
    assert.ok((await response.json()).error);
    assert.equal(leads.length, 0);
    assert.equal(mirrored.length, 0);
  }
});
