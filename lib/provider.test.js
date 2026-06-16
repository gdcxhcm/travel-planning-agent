const assert = require('node:assert/strict');
const test = require('node:test');
const { getFailureProvider } = require('./provider');

test('uses dashscope model name for failed runs when DashScope is configured', () => {
  const provider = getFailureProvider({
    DASHSCOPE_API_KEY: 'test-key',
    DASHSCOPE_MODEL: 'qwen-plus-latest'
  });

  assert.equal(provider, 'dashscope:qwen-plus-latest');
});

test('falls back to mock-agent for failed runs when DashScope is not configured', () => {
  const provider = getFailureProvider({});

  assert.equal(provider, 'mock-agent');
});
