#!/bin/bash

# 设置错误时退出
set -e

# 定义工作目录
MOVE_COMPILER_DIR="api"
WEB_DIR="web"

echo "==================== Move2Wasm 启动脚本 ===================="

# 启动 Move Web 编译器
echo "正在启动 Move Web 编译器..."
cd "$MOVE_COMPILER_DIR"
echo "当前目录: $(pwd)"
cargo run &
MOVE_COMPILER_PID=$!
echo "Move Web 编译器已在后台启动，PID: $MOVE_COMPILER_PID"

# 等待 move-web-compiler 启动完成
sleep 3
echo "等待编译器服务启动完成..."

echo "正在启动 Web 前端..."
cd "../$WEB_DIR"
echo "当前目录: $(pwd)"
echo "正在安装依赖..."
npm install
echo "正在启动开发服务器..."
npm run dev

# 注意：当前设计中，按 Ctrl+C 只会终止前端服务
# 编译器服务会继续在后台运行，需要手动终止
echo "脚本已完成执行。请注意，后台服务可能仍在运行。"
echo "使用 'kill $MOVE_COMPILER_PID' 停止编译器服务。" 