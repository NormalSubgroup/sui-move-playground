// 应用配置

// API基础URL，可以根据环境变量设置不同的URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

// API路径
export const API_PATHS = {
  COMPILE: '/api/compile',
  DEPLOY: '/api/deploy',
  TEST: '/api/test',
};

// 超时设置（毫秒）
export const API_TIMEOUT = 30000;

// 默认示例代码文件名
export const DEFAULT_FILENAME = 'hello.move'; 