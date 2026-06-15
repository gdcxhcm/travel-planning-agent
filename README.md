# 智能旅游规划 Agent 平台 MVP

一个基于 Next.js、Supabase 和阿里云百炼的旅行规划 Agent demo。

用户填写出发地、目的地、日期、预算和偏好后，系统会生成结构化每日行程，并支持保存、历史查看、重生成和后台任务统计。

## 功能

- 首页：产品介绍和 Demo 行程
- 规划页：结构化旅行需求表单 + 生成结果预览
- 行程详情页：按天展示时间、地点、费用和注意事项
- 历史页：查看保存过的旅行计划
- 后台页：查看生成任务、成功率、失败日志和热门目的地
- AI 生成：优先调用阿里云百炼；未配置 Key 时自动使用 mock Agent
- 数据库：优先写入 Supabase；未配置 Supabase 时自动使用内存演示数据

## 本地运行

```bash
npm install
npm run dev
```

打开：

```text
http://localhost:3000
```

## 环境变量

复制环境变量示例：

```bash
copy .env.example .env.local
```

填写：

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

DASHSCOPE_API_KEY=your-dashscope-api-key
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
DASHSCOPE_MODEL=qwen-plus-latest
```

说明：

- `DASHSCOPE_API_KEY` 只在服务端 API Route 使用，不要提交到 GitHub。
- 如果不填阿里云 Key，项目会自动使用 mock Agent。
- 如果不填 Supabase，项目会自动使用内存数据，刷新服务后数据会丢失。

## 初始化 Supabase

1. 打开 Supabase 项目。
2. 进入 SQL Editor。
3. 复制 `scripts/init.sql`。
4. 粘贴并执行。
5. 确认出现 4 张表：
   - `trip_plans`
   - `itinerary_days`
   - `itinerary_items`
   - `planner_runs`

## 重要提醒

第一版是学习和演示项目。`scripts/init.sql` 为了方便演示关闭了 RLS。

如果要长期公开使用，下一版应加入：

- Supabase Auth 登录
- 用户数据隔离
- RLS 权限策略
- 生成次数限制
- 后台管理员权限

## 构建

```bash
npm run build
```

## 部署

项目包含 `netlify.toml`，可以部署到 Netlify。

需要在 Netlify 环境变量中配置：

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` 或 `SUPABASE_ANON_KEY`
- `DASHSCOPE_API_KEY`
- `DASHSCOPE_BASE_URL`
- `DASHSCOPE_MODEL`
