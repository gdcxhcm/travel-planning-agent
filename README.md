# Travel Planning Agent

一个面向作品集展示的智能旅行规划 MVP。用户填写出发地、目的地、日期、预算和偏好后，系统会调用阿里云百炼生成结构化每日行程，并把结果持久化保存到 Supabase。

## 项目定位

这不是聊天窗口，而是一个“行程产品”：用表单收集旅行需求，用时间轴和卡片展示可执行路线，用历史、详情、重生成和后台统计形成完整产品闭环。

## 核心功能

- 首页：展示产品定位和示例行程。
- 规划页：结构化输入旅行需求，生成 3-7 天单目的地行程。
- 详情页：按天展示时间、地点、费用、注意事项和出发建议。
- 历史页：查看已保存的旅行计划，刷新或重启服务后仍可读取。
- 重生成：基于原计划条件重新调用 Agent，生成一份新计划。
- 导出：支持复制 Markdown，PDF 导出作为后续占位。
- 后台页：查看任务总数、成功率、失败日志、平均耗时和热门目的地。

## 技术栈

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- Supabase
- 阿里云百炼 OpenAI 兼容 Chat Completions
- Netlify

## 数据库结构

`scripts/init.sql` 会创建 4 张核心表：

- `trip_plans`：旅行计划主记录
- `itinerary_days`：每日行程
- `itinerary_items`：每天的具体地点和活动
- `planner_runs`：生成任务日志

第一版为了学习和演示，SQL 脚本关闭了 RLS。公开长期使用前，应改为 Supabase Auth + RLS 用户隔离。

## 环境变量

复制示例文件：

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

安全提醒：

- `SUPABASE_SERVICE_ROLE_KEY` 和 `DASHSCOPE_API_KEY` 只能放在 `.env.local` 或 Netlify 环境变量中。
- 不要把 `.env.local` 提交到 GitHub。
- 如果 secret key 曾经公开发送过，应在 Supabase 重新生成并删除旧 key。

## 本地运行

```bash
npm install
npm run dev -- -p 3003
```

打开：

```text
http://localhost:3003
```

## 初始化 Supabase

1. 打开 Supabase 项目。
2. 进入 SQL Editor。
3. 复制 `scripts/init.sql` 的完整内容。
4. 粘贴并执行。
5. 在 Table Editor 确认 4 张表已经创建。

## 验证流程

```bash
npm test
npm run build
```

手动验证：

1. 打开 `/planner`，生成一条 3 天游。
2. 在 Supabase 确认写入 1 条 `trip_plans`、3 条 `itinerary_days`、至少 9 条 `itinerary_items`。
3. 打开 `/history`，确认能看到历史记录。
4. 点击历史卡片，进入 `/trips/[id]` 查看详情。
5. 在详情页点击重生成，确认会保存一条新计划。
6. 打开 `/admin`，确认任务统计和热门目的地有数据。
7. 输入 1 天游触发失败，确认 `planner_runs` 写入 failed 日志。

## 部署到 Netlify

项目已包含 `netlify.toml`：

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

部署前需要在 Netlify 环境变量中配置：

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `DASHSCOPE_API_KEY`
- `DASHSCOPE_BASE_URL`
- `DASHSCOPE_MODEL`

建议先运行 preview deploy，确认线上生成、历史、详情和后台都能访问后，再发布 production deploy。

## 演示路径

推荐 60 秒演示顺序：

1. 首页说明产品定位。
2. 进入规划页填写旅行需求。
3. 展示生成后的每日时间轴。
4. 打开详情页，演示复制 Markdown 和重生成。
5. 进入历史页说明持久化保存。
6. 打开后台页展示成功率、失败日志和热门目的地。
