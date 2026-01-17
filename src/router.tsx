import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

// 创建路由实例
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

// 类型声明
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
