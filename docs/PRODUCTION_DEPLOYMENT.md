# Sui Move Playground 生产环境部署指南

## 🚀 快速部署

### 方法1: 使用启动脚本（推荐）

```bash
# 进入web目录
cd ~/sui-move-playground/web

# 使用root权限运行启动脚本
sudo ./start-production.sh
```

### 方法2: 手动部署

```bash
# 1. 构建生产版本
cd ~/sui-move-playground/web
bun run build

# 2. 启动服务器（需要root权限绑定端口80）
sudo /home/ubuntu/.bun/bin/bun server.js
```

### 方法3: 系统服务部署

```bash
# 1. 复制服务文件到systemd目录
sudo cp ~/sui-move-playground/sui-move-playground.service /etc/systemd/system/

# 2. 重新加载systemd配置
sudo systemctl daemon-reload

# 3. 启用并启动服务
sudo systemctl enable sui-move-playground
sudo systemctl start sui-move-playground

# 4. 查看服务状态
sudo systemctl status sui-move-playground

# 5. 查看日志
sudo journalctl -u sui-move-playground -f
```

## 📋 部署要求

- **操作系统**: Linux (已测试 Ubuntu)
- **运行时**: Bun.js
- **权限**: Root权限（绑定端口80）
- **端口**: 80 (HTTP)
- **内存**: 建议至少512MB
- **存储**: 大约50MB用于应用文件

## 🔧 配置说明

### 服务器配置

应用使用自定义的Bun.js HTTP服务器，配置在 `web/server.js` 文件中：

- **端口**: 80
- **主机**: 0.0.0.0 (允许外部访问)
- **静态文件**: 从 `dist` 目录提供
- **SPA支持**: 对于不存在的路由返回 `index.html`
- **缓存策略**: 
  - HTML文件: `no-cache`
  - 静态资源: `public, max-age=31536000` (1年)

### 网络配置

- **防火墙**: 确保端口80对外开放
- **域名**: 配置域名指向服务器IP
- **SSL**: 建议使用反向代理（如Cloudflare）提供HTTPS

## 🛠 服务管理

### 使用systemctl管理服务

```bash
# 启动服务
sudo systemctl start sui-move-playground

# 停止服务
sudo systemctl stop sui-move-playground

# 重启服务
sudo systemctl restart sui-move-playground

# 查看状态
sudo systemctl status sui-move-playground

# 查看日志
sudo journalctl -u sui-move-playground -f
```

### 手动管理

```bash
# 查找运行中的进程
sudo netstat -tulnp | grep :80

# 停止进程
sudo pkill -f "bun server.js"

# 重新启动
sudo /home/ubuntu/.bun/bin/bun server.js
```

## 📊 监控和日志

### 查看服务状态

```bash
# 检查端口监听
sudo netstat -tulnp | grep :80

# 测试HTTP响应
curl -I http://localhost

# 检查进程
ps aux | grep bun
```

### 日志查看

```bash
# systemd日志
sudo journalctl -u sui-move-playground -f

# 系统日志
tail -f /var/log/syslog | grep sui-move
```

## 🔄 更新部署

### 更新应用代码

```bash
# 1. 停止服务
sudo systemctl stop sui-move-playground

# 2. 拉取最新代码
cd ~/sui-move-playground
git pull

# 3. 重新构建
cd web
bun run build

# 4. 重启服务
sudo systemctl start sui-move-playground
```

### 回滚部署

```bash
# 1. 检出之前的版本
git checkout [previous_commit_hash]

# 2. 重新构建和部署
cd web
bun run build
sudo systemctl restart sui-move-playground
```

## 🚨 故障排除

### 常见问题

1. **端口80被占用**
   ```bash
   # 查找占用端口的进程
   sudo netstat -tulnp | grep :80
   
   # 停止进程
   sudo kill [PID]
   ```

2. **权限问题**
   ```bash
   # 确保使用root权限
   sudo systemctl start sui-move-playground
   ```

3. **Bun命令未找到**
   ```bash
   # 检查Bun安装路径
   which bun
   
   # 使用完整路径
   /home/ubuntu/.bun/bin/bun --version
   ```

4. **构建失败**
   ```bash
   # 清理node_modules并重新安装
   rm -rf node_modules
   bun install
   bun run build
   ```

### 性能优化

1. **启用Gzip压缩** (在反向代理中配置)
2. **CDN加速** (使用Cloudflare等)
3. **监控内存使用** (`htop`, `free -h`)
4. **定期清理日志** (`logrotate`)

## 🔒 安全建议

1. **使用HTTPS**: 通过反向代理或CDN提供SSL
2. **防火墙**: 只开放必要端口
3. **系统更新**: 定期更新系统和依赖
4. **监控**: 设置监控和告警
5. **备份**: 定期备份应用代码和配置

## 📞 支持

如有问题，请检查：
1. 服务状态: `sudo systemctl status sui-move-playground`
2. 日志输出: `sudo journalctl -u sui-move-playground -f`
3. 网络连接: `curl -I http://localhost`
4. 端口监听: `sudo netstat -tulnp | grep :80` 