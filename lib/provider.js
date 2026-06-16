function getFailureProvider(env) {
  if (!env.DASHSCOPE_API_KEY) return 'mock-agent';
  return `dashscope:${env.DASHSCOPE_MODEL || 'qwen-plus-latest'}`;
}

module.exports = { getFailureProvider };
