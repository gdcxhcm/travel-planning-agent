import type { Metadata } from 'next';
import './globals.css';
import { Nav } from '@/components/Nav';

export const metadata: Metadata = {
  title: 'Trip Agent - 智能旅游规划平台',
  description: '输入结构化旅行需求，生成可保存、可重用的每日行程。'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <Nav />
        {children}
      </body>
    </html>
  );
}
