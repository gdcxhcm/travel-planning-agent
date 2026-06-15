import { GeneratedTrip, TripInput } from './types';
import { generateMockTrip } from './mock-generator';
import { generatedTripSchema, tripDays } from './validation';

export async function generateTripWithAgent(input: TripInput): Promise<{ trip: GeneratedTrip; provider: string }> {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    return { trip: generateMockTrip(input), provider: 'mock-agent' };
  }

  const baseURL = process.env.DASHSCOPE_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
  const model = process.env.DASHSCOPE_MODEL || 'qwen-plus-latest';
  const days = tripDays(input.startDate, input.endDate);

  const response = await callDashScopeWithRetry(`${baseURL.replace(/\/$/, '')}/chat/completions`, {
    model,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: '你是一个旅行规划 Agent。只返回合法 JSON，不要 Markdown，不要解释。行程必须具体、可执行、按天组织。'
      },
      {
        role: 'user',
        content: buildPrompt(input, days)
      }
    ]
  }, apiKey);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`模型调用失败：${response.status} ${errorText.slice(0, 500)}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('模型没有返回可解析内容');
  }

  const parsed = generatedTripSchema.parse(JSON.parse(content));
  return { trip: parsed, provider: `dashscope:${model}` };
}

async function callDashScopeWithRetry(url: string, body: unknown, apiKey: string): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      return await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
    } catch (error) {
      lastError = error;
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }
    }
  }

  const message = lastError instanceof Error ? lastError.message : '网络请求失败';
  throw new Error(`调用阿里云百炼失败：网络连接不稳定，请稍后重试。原始错误：${message}`);
}

function buildPrompt(input: TripInput, days: number): string {
  return `
请为以下旅行需求生成结构化 JSON。

旅行需求：
- 出发地：${input.origin}
- 目的地：${input.destination}
- 日期：${input.startDate} 到 ${input.endDate}，共 ${days} 天
- 总预算：${input.budget} 元
- 旅行节奏：${input.pace}
- 偏好：${input.preferences.join('、')}
- 特殊要求：${input.specialRequests || '无'}

必须遵守：
1. 第一版只做单目的地，不安排跨城市复杂路线。
2. 返回 JSON 对象，字段必须是 title、summary、totalBudget、days、tips。
3. days 数量必须等于 ${days}。
4. 每天必须有 dayIndex、title、summary、dayBudget、items。
5. 每天 items 至少 3 个，每个 item 包含 startTime、endTime、placeName、category、notes、estimatedCost。
6. 预算必须合理，所有 dayBudget 总和不要明显超过总预算。
7. tips 是字符串数组，给出 3 到 5 条实用建议。
`;
}
