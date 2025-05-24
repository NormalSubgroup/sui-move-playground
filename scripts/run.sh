#!/bin/bash

# 设置错误时退出
set -e

# 获取脚本所在目录的父目录（项目根目录）
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# 定义工作目录
MOVE_COMPILER_DIR="api"
WEB_DIR="web"

echo "==================== Sui Move Playground 开发环境启动脚本 ===================="
echo "项目根目录: $PROJECT_ROOT"

# 启动后端 API 服务
echo "正在启动后端 API 服务..."
cd "$MOVE_COMPILER_DIR"
echo "当前目录: $(pwd)"
cargo run &
API_PID=$!
echo "后端 API 服务已在后台启动，PID: $API_PID"

# 等待后端服务启动完成
sleep 5
echo "等待后端服务启动完成..."

# 启动前端开发服务器
echo "正在启动前端开发服务器..."
cd "../$WEB_DIR"
echo "当前目录: $(pwd)"

# 检查是否安装了 bun
if command -v bun &> /dev/null; then
    echo "使用 Bun 作为包管理器..."
    echo "正在安装依赖..."
    bun install
    echo "正在启动开发服务器..."
    bun run dev
elif command -v npm &> /dev/null; then
    echo "使用 npm 作为包管理器..."
    echo "正在安装依赖..."
    npm install
    echo "正在启动开发服务器..."
    npm run dev
else
    echo "错误: 未找到 bun 或 npm，请先安装其中一个"
    kill $API_PID 2>/dev/null || true
    exit 1
fi

# 清理后台进程
cleanup() {
    echo "正在清理后台进程..."
    kill $API_PID 2>/dev/null || true
    echo "开发环境已停止"
}

# 设置信号处理
trap cleanup EXIT INT TERM

echo "开发环境启动完成！"
echo "前端访问地址: http://localhost:5173"
echo "后端API地址: http://localhost:8081"
echo "按 Ctrl+C 停止所有服务" 