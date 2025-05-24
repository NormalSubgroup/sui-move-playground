const path = require('path');
const fs = require('fs');

const PORT = 80;
const DIST_DIR = path.join(__dirname, 'dist');
const API_BACKEND_URL = 'http://localhost:8081';

// 检查dist目录是否存在
if (!fs.existsSync(DIST_DIR)) {
  console.error('错误：找不到dist目录。请先运行 "bun run build"');
  process.exit(1);
}

// API代理函数
async function proxyApiRequest(req, url) {
  try {
    // 构建后端API URL
    const backendUrl = new URL(url.pathname + url.search, API_BACKEND_URL);
    
    // 转发请求到后端
    const response = await fetch(backendUrl.toString(), {
      method: req.method,
      headers: {
        'Content-Type': req.headers.get('content-type') || 'application/json',
        'User-Agent': req.headers.get('user-agent') || 'Bun-Proxy/1.0',
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined,
    });

    // 返回后端响应
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('API代理错误:', error);
    return new Response(JSON.stringify({ 
      error: 'Backend API unavailable',
      message: error.message 
    }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// 简单的MIME类型映射
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

const server = Bun.serve({
  port: PORT,
  hostname: '0.0.0.0',
  
  async fetch(req) {
    // 修复URL解析错误 - 为相对URL添加base URL
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    
    // API代理：如果请求路径以/api开头，转发到后端
    if (url.pathname.startsWith('/api')) {
      return proxyApiRequest(req, url);
    }
    
    let filePath = path.join(DIST_DIR, url.pathname);
    
    // 如果是根路径或者目录，提供index.html
    if (url.pathname === '/' || url.pathname.endsWith('/')) {
      filePath = path.join(DIST_DIR, 'index.html');
    }
    
    // 检查文件是否存在
    try {
      const file = Bun.file(filePath);
      const exists = await file.exists();
      
      if (!exists) {
        // 对于SPA，如果文件不存在，返回index.html
        const indexFile = Bun.file(path.join(DIST_DIR, 'index.html'));
        return new Response(indexFile, {
          headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache',
          },
        });
      }
      
      // 获取文件扩展名并设置适当的Content-Type
      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      
      // 设置缓存控制
      const cacheControl = ext === '.html' ? 'no-cache' : 'public, max-age=31536000';
      
      return new Response(file, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': cacheControl,
        },
      });
      
    } catch (error) {
      console.error('服务文件时出错:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
});

console.log(`🚀 服务器已启动!`);
console.log(`📦 提供服务的目录: ${DIST_DIR}`);
console.log(`🔗 API代理目标: ${API_BACKEND_URL}`);
console.log(`🌐 本地访问: http://localhost:${PORT}`);
console.log(`🌍 网络访问: http://0.0.0.0:${PORT}`);
console.log(`⚠️  注意：运行在端口 ${PORT} 需要管理员权限`);
console.log(`\n按 Ctrl+C 停止服务器`); 