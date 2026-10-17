import assert from 'node:assert/strict';
import { parse } from 'yaml';

export const parseWorkflow = source => parse(source, { maxAliasCount: 0, uniqueKeys: true });

// This deliberately validates the reviewed build.yml, not arbitrary CI or hosting.
export function validateBuildOnly(workflow) {
  assert.deepEqual(Object.keys(workflow).sort(), ['jobs', 'name', 'on', 'permissions']);
  assert.deepEqual(workflow.permissions, { contents: 'read' });
  assert.deepEqual(Object.keys(workflow.on).sort(), ['pull_request', 'push', 'workflow_dispatch']);
  assert.deepEqual(workflow.on.push, { branches: ['main'] });
  assert.deepEqual(workflow.on.workflow_dispatch, {});
  assert.deepEqual(workflow.on.pull_request, { branches: ['main'] });
  assert.deepEqual(Object.keys(workflow.jobs), ['build']);
  const job = workflow.jobs.build;
  assert.deepEqual(Object.keys(job).sort(), ['runs-on', 'steps']);
  assert.equal(job['runs-on'], 'ubuntu-latest');
  assert.deepEqual(job.steps.map(step => step.uses ?? step.run), [
    'actions/checkout@v4', 'actions/setup-node@v4',
    'npm ci', 'node --test scripts/deployment-guard.test.mjs', 'npm run build',
  ]);
  for (const [index, step] of job.steps.entries()) {
    assert.equal(typeof step.name, 'string');
    const keys = index < 2 ? ['name', 'uses', 'with'] : ['name', 'run'];
    assert.deepEqual(Object.keys(step).sort(), keys.sort());
    if (index === 0) assert.deepEqual(step.with, { 'persist-credentials': false });
    if (index === 1) assert.deepEqual(step.with, { 'node-version': '22' });
  }
}
