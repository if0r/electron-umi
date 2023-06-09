import { defineConfig } from '@umijs/max';

export default defineConfig({
  history: { type: 'hash' },
  // publicPath: './',  
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: '@umijs/max',
  },
  define: {
    _APP_VERSION_: JSON.stringify(process.env.npm_package_version),
  },
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      name: '首页',
      path: '/home',
      component: './Home',
    },
    {
      name: '权限演示',
      path: '/access',
      component: './Access',
    },
    {
      name: ' CRUD 示例',
      path: '/table',
      component: './Table',
    },
  ],
  npmClient: 'yarn',
});

