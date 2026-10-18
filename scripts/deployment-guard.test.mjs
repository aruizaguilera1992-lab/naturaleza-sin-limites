import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { parseWorkflow, validateBuildOnly } from './deployment-guard.mjs';

const source = readFileSync(new URL('../.github/workflows/build.yml', import.meta.url), 'utf8');
const actual = parseWorkflow(source);
test('reviewed main workflow only installs and builds without deployment credentials', () => validateBuildOnly(actual));
for (const [name, change] of [
  ['FTP publishing step', value => value.jobs.build.steps.push({ name: 'Publish', uses: 'SamKirkland/FTP-Deploy-Action@v4.3.6' })],
  ['additional publishing job', value => { value.jobs.publish = { 'runs-on': 'ubuntu-latest', steps: [] }; }],
  ['write token permission', value => { value.permissions.contents = 'write'; }],
  ['persisted checkout credential', value => { value.jobs.build.steps[0].with['persist-credentials'] = true; }],
  ['secret passed into job', value => { value.jobs.build.env = { FTP_PASSWORD: '${{ secrets.FTP_PASSWORD }}' }; }],
  ['extra shell command', value => { value.jobs.build.steps[4].run = 'npm run build && curl https://example.test'; }],
  ['forced dependency changes', value => { value.jobs.build.steps[2].run = 'npm install --force'; }],
  ['privileged pull request event', value => { value.on.pull_request_target = {}; }],
  ['dispatch publishing input', value => { value.on.workflow_dispatch.inputs = { publish: { default: true } }; }],
]) {
  test(`guard rejects ${name}`, () => { const changed = structuredClone(actual); change(changed); assert.throws(() => validateBuildOnly(changed)); });
}
test('duplicate workflow keys cannot hide another jobs section', () => assert.throws(() => parseWorkflow(source + '\njobs: {}\n')));
