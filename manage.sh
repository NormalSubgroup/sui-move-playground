#!/bin/bash

# Sui Move Playground 完整管理脚本
# 同时管理前端和后端服务

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

show_help() {
    echo -e "${BLUE}🚀 Sui Move Playground 管理脚本${NC}"
    echo "============================================"
    echo "用法: ./manage.sh [命令]"
    echo
    echo "可用命令:"
    echo -e "  ${GREEN}start${NC}     - 启动所有服务（前端+后端）"
    echo -e "  ${GREEN}stop${NC}      - 停止所有服务"
    echo -e "  ${GREEN}restart${NC}   - 重启所有服务"
    echo -e "  ${GREEN}status${NC}    - 查看服务状态"
    echo -e "  ${GREEN}test${NC}      - 运行完整测试"
    echo -e "  ${GREEN}build${NC}     - 构建项目"
    echo -e "  ${GREEN}logs${NC}      - 查看服务日志"
    echo -e "  ${GREEN}install${NC}   - 安装为系统服务"
    echo -e "  ${GREEN}uninstall${NC} - 卸载系统服务"
    echo -e "  ${GREEN}help${NC}      - 显示此帮助信息"
    echo
    echo "单独管理："
    echo -e "  ${CYAN}frontend [start|stop|restart|status]${NC} - 管理前端服务"
    echo -e "  ${CYAN}backend [start|stop|restart|status]${NC}  - 管理后端服务"
    echo
    echo "示例:"
    echo "  sudo ./manage.sh start"
    echo "  ./manage.sh status"
    echo "  ./manage.sh frontend restart"
    echo "  ./manage.sh backend status"
}

check_systemd_installed() {
    if systemctl is-enabled sui-move-playground &>/dev/null || systemctl is-enabled sui-move-api &>/dev/null; then
        return 0
    else
        return 1
    fi
}

# 获取服务PID
get_frontend_pid() {
    if check_systemd_installed; then
        systemctl show -p MainPID sui-move-playground 2>/dev/null | cut -d= -f2
    else
        netstat -tulnp 2>/dev/null | grep ":80 " | awk '{print $7}' | cut -d'/' -f1 | head -1
    fi
}

get_backend_pid() {
    if check_systemd_installed; then
        systemctl show -p MainPID sui-move-api 2>/dev/null | cut -d= -f2
    else
        netstat -tulnp 2>/dev/null | grep ":8081 " | awk '{print $7}' | cut -d'/' -f1 | head -1
    fi
}

# 前端管理函数
start_frontend() {
    echo -e "${BLUE}🚀 启动前端服务...${NC}"
    
    if check_systemd_installed; then
        sudo systemctl start sui-move-playground
        sleep 2
        if systemctl is-active --quiet sui-move-playground; then
            echo -e "${GREEN}✅ 前端服务启动成功${NC}"
        else
            echo -e "${RED}❌ 前端服务启动失败${NC}"
            return 1
        fi
    else
        # 手动启动模式
        PID=$(get_frontend_pid)
        if [ ! -z "$PID" ] && [ "$PID" != "0" ]; then
            echo -e "${YELLOW}⚠️  前端服务已在运行 (PID: $PID)${NC}"
            return 0
        fi
        
        cd web
        
        # 检查构建文件
        if [ ! -d "dist" ]; then
            echo -e "${YELLOW}📦 构建前端...${NC}"
            if command -v bun &> /dev/null; then
                BUN_CMD="bun"
            elif [ -f "/home/ubuntu/.bun/bin/bun" ]; then
                BUN_CMD="/home/ubuntu/.bun/bin/bun"
            else
                echo -e "${RED}❌ 未找到bun命令${NC}"
                return 1
            fi
            $BUN_CMD install && $BUN_CMD run build
        fi
        
        # 启动前端服务器
        if [[ $EUID -eq 0 ]]; then
            nohup /usr/local/bin/bun server.js > /dev/null 2>&1 &
        else
            echo -e "${RED}❌ 启动前端服务需要root权限（端口80）${NC}"
            return 1
        fi
        
        sleep 2
        PID=$(get_frontend_pid)
        if [ ! -z "$PID" ] && [ "$PID" != "0" ]; then
            echo -e "${GREEN}✅ 前端服务启动成功 (PID: $PID)${NC}"
        else
            echo -e "${RED}❌ 前端服务启动失败${NC}"
            return 1
        fi
        cd ..
    fi
}

stop_frontend() {
    echo -e "${YELLOW}🛑 停止前端服务...${NC}"
    
    if check_systemd_installed; then
        sudo systemctl stop sui-move-playground
        echo -e "${GREEN}✅ 前端服务已停止${NC}"
    else
        PID=$(get_frontend_pid)
        if [ -z "$PID" ] || [ "$PID" == "0" ]; then
            echo -e "${YELLOW}⚠️  前端服务未运行${NC}"
            return 0
        fi
        
        kill -TERM "$PID" 2>/dev/null || true
        sleep 2
        
        if kill -0 "$PID" 2>/dev/null; then
            kill -KILL "$PID" 2>/dev/null || true
        fi
        echo -e "${GREEN}✅ 前端服务已停止${NC}"
    fi
}

# 后端管理函数
start_backend() {
    echo -e "${BLUE}🚀 启动后端服务...${NC}"
    
    if check_systemd_installed; then
        sudo systemctl start sui-move-api
        sleep 3
        if systemctl is-active --quiet sui-move-api; then
            echo -e "${GREEN}✅ 后端服务启动成功${NC}"
        else
            echo -e "${RED}❌ 后端服务启动失败${NC}"
            return 1
        fi
    else
        PID=$(get_backend_pid)
        if [ ! -z "$PID" ] && [ "$PID" != "0" ]; then
            echo -e "${YELLOW}⚠️  后端服务已在运行 (PID: $PID)${NC}"
            return 0
        fi
        
        # 构建后端
        echo -e "${YELLOW}📦 构建后端...${NC}"
        cd api
        if ! cargo build --release; then
            echo -e "${RED}❌ 后端构建失败${NC}"
            return 1
        fi
        
        # 启动后端服务器
        nohup cargo run --release > /dev/null 2>&1 &
        
        sleep 3
        PID=$(get_backend_pid)
        if [ ! -z "$PID" ] && [ "$PID" != "0" ]; then
            echo -e "${GREEN}✅ 后端服务启动成功 (PID: $PID)${NC}"
        else
            echo -e "${RED}❌ 后端服务启动失败${NC}"
            return 1
        fi
        cd ..
    fi
}

stop_backend() {
    echo -e "${YELLOW}🛑 停止后端服务...${NC}"
    
    if check_systemd_installed; then
        sudo systemctl stop sui-move-api
        echo -e "${GREEN}✅ 后端服务已停止${NC}"
    else
        PID=$(get_backend_pid)
        if [ -z "$PID" ] || [ "$PID" == "0" ]; then
            echo -e "${YELLOW}⚠️  后端服务未运行${NC}"
            return 0
        fi
        
        kill -TERM "$PID" 2>/dev/null || true
        sleep 2
        
        if kill -0 "$PID" 2>/dev/null; then
            kill -KILL "$PID" 2>/dev/null || true
        fi
        echo -e "${GREEN}✅ 后端服务已停止${NC}"
    fi
}

# 综合服务管理
start_all() {
    echo -e "${CYAN}🚀 启动所有服务...${NC}"
    start_backend
    start_frontend
}

stop_all() {
    echo -e "${CYAN}🛑 停止所有服务...${NC}"
    stop_frontend
    stop_backend
}

restart_all() {
    echo -e "${CYAN}🔄 重启所有服务...${NC}"
    stop_all
    sleep 2
    start_all
}

show_status() {
    echo -e "${BLUE}📊 服务状态${NC}"
    echo "============================================"
    
    # 前端状态
    echo -e "${CYAN}前端服务 (端口80):${NC}"
    if check_systemd_installed; then
        if systemctl is-active --quiet sui-move-playground; then
            echo -e "${GREEN}✅ 运行中 (SystemD)${NC}"
            PID=$(systemctl show -p MainPID sui-move-playground | cut -d= -f2)
            echo -e "   进程ID: $PID"
        else
            echo -e "${RED}❌ 未运行${NC}"
        fi
    else
        PID=$(get_frontend_pid)
        if [ ! -z "$PID" ] && [ "$PID" != "0" ]; then
            echo -e "${GREEN}✅ 运行中 (手动模式)${NC}"
            echo -e "   进程ID: $PID"
        else
            echo -e "${RED}❌ 未运行${NC}"
        fi
    fi
    
    # 后端状态
    echo -e "${CYAN}后端服务 (端口8081):${NC}"
    if check_systemd_installed; then
        if systemctl is-active --quiet sui-move-api; then
            echo -e "${GREEN}✅ 运行中 (SystemD)${NC}"
            PID=$(systemctl show -p MainPID sui-move-api | cut -d= -f2)
            echo -e "   进程ID: $PID"
        else
            echo -e "${RED}❌ 未运行${NC}"
        fi
    else
        PID=$(get_backend_pid)
        if [ ! -z "$PID" ] && [ "$PID" != "0" ]; then
            echo -e "${GREEN}✅ 运行中 (手动模式)${NC}"
            echo -e "   进程ID: $PID"
        else
            echo -e "${RED}❌ 未运行${NC}"
        fi
    fi
    
    echo
    echo -e "${YELLOW}访问地址:${NC}"
    echo -e "🌐 前端: http://localhost"
    echo -e "🔧 API:  http://localhost:8081"
    
    # 测试连接
    echo
    echo -e "${YELLOW}连接测试:${NC}"
    if curl -s http://localhost >/dev/null 2>&1; then
        echo -e "${GREEN}✅ 前端服务正常${NC}"
    else
        echo -e "${RED}❌ 前端服务异常${NC}"
    fi
    
    if curl -s http://localhost:8081 >/dev/null 2>&1; then
        echo -e "${GREEN}✅ 后端服务正常${NC}"
    else
        echo -e "${RED}❌ 后端服务异常${NC}"
    fi
}

run_test() {
    echo -e "${CYAN}🧪 运行完整测试...${NC}"
    echo "============================================"
    
    local passed=0
    local total=10
    
    run_single_test() {
        local test_name="$1"
        local test_cmd="$2"
        echo -e "测试 $test_count: ${test_name}"
        if eval "$test_cmd" &>/dev/null; then
            echo -e "${GREEN}✅ 通过${NC}"
            ((passed++))
        else
            echo -e "${RED}❌ 失败${NC}"
        fi
        echo
        ((test_count++))
    }
    
    local test_count=1
    
    # 前端测试
    echo -e "${CYAN}前端测试:${NC}"
    run_single_test "端口80监听检查" "netstat -tulnp | grep -q ':80.*LISTEN'"
    run_single_test "前端HTTP响应" "curl -s http://localhost | grep -q '<title>Playground</title>'"
    run_single_test "前端状态码检查" "curl -s -o /dev/null -w '%{http_code}' http://localhost | grep -q '200'"
    run_single_test "静态资源访问" "curl -s -I http://localhost/assets/ | grep -q '200'"
    run_single_test "SPA路由支持" "curl -s http://localhost/some-path | grep -q '<title>Playground</title>'"
    
    # 后端测试
    echo -e "${CYAN}后端测试:${NC}"
    run_single_test "端口8081监听检查" "netstat -tulnp | grep -q ':8081.*LISTEN'"
    run_single_test "API服务响应" "curl -s http://localhost:8081 >/dev/null"
    run_single_test "编译API端点" "curl -s -X POST http://localhost:8081/api/compile -H 'Content-Type: application/json' -d '{\"source_code\":\"module hello::world{}\"}' | grep -q 'success'"
    run_single_test "部署API端点" "curl -s -X POST http://localhost:8081/api/deploy -H 'Content-Type: application/json' -d '{\"command\":\"sui --version\"}' >/dev/null"
    run_single_test "测试API端点" "curl -s -X POST http://localhost:8081/api/test -H 'Content-Type: application/json' -d '{\"command\":\"sui --version\"}' >/dev/null"
    
    echo "============================================"
    echo -e "测试完成！"
    echo -e "通过: ${GREEN}$passed/$total${NC}"
    
    if [ $passed -eq $total ]; then
        echo -e "${GREEN}🎉 所有测试通过！${NC}"
        return 0
    else
        echo -e "${RED}❌ 部分测试失败，请检查配置${NC}"
        return 1
    fi
}

build_project() {
    echo -e "${BLUE}🔨 构建项目...${NC}"
    
    # 构建前端
    echo -e "${CYAN}构建前端...${NC}"
    cd web
    if command -v bun &> /dev/null; then
        BUN_CMD="bun"
    elif [ -f "/home/ubuntu/.bun/bin/bun" ]; then
        BUN_CMD="/home/ubuntu/.bun/bin/bun"
    else
        echo -e "${RED}❌ 未找到bun命令${NC}"
        exit 1
    fi
    
    $BUN_CMD install && $BUN_CMD run build
    echo -e "${GREEN}✅ 前端构建完成${NC}"
    cd ..
    
    # 构建后端
    echo -e "${CYAN}构建后端...${NC}"
    cd api
    cargo build --release
    echo -e "${GREEN}✅ 后端构建完成${NC}"
    cd ..
}

show_logs() {
    echo -e "${BLUE}📋 服务日志${NC}"
    echo "============================================"
    
    if check_systemd_installed; then
        echo -e "${CYAN}前端日志:${NC}"
        journalctl -u sui-move-playground --no-pager -n 10
        echo
        echo -e "${CYAN}后端日志:${NC}"
        journalctl -u sui-move-api --no-pager -n 10
    else
        echo -e "${YELLOW}手动模式下的日志查看:${NC}"
        echo -e "前端PID: $(get_frontend_pid)"
        echo -e "后端PID: $(get_backend_pid)"
        echo -e "使用 ps aux | grep <PID> 查看进程详情"
    fi
}

install_services() {
    echo -e "${BLUE}📦 安装系统服务...${NC}"
    echo "============================================"
    
    if [[ $EUID -ne 0 ]]; then
        echo -e "${RED}❌ 安装系统服务需要root权限${NC}"
        echo -e "${YELLOW}请使用: sudo ./manage.sh install${NC}"
        exit 1
    fi
    
    # 停止现有服务
    stop_all
    
    # 安装前端服务
    echo -e "${CYAN}安装前端服务...${NC}"
    if [ -f "sui-move-playground.service" ]; then
        cp sui-move-playground.service /etc/systemd/system/
        echo -e "${GREEN}✅ 前端服务文件已安装${NC}"
    else
        echo -e "${RED}❌ 未找到前端服务文件${NC}"
        exit 1
    fi
    
    # 安装后端服务
    echo -e "${CYAN}安装后端服务...${NC}"
    if [ -f "sui-move-api.service" ]; then
        cp sui-move-api.service /etc/systemd/system/
        echo -e "${GREEN}✅ 后端服务文件已安装${NC}"
    else
        echo -e "${RED}❌ 未找到后端服务文件${NC}"
        exit 1
    fi
    
    # 重新加载并启用服务
    systemctl daemon-reload
    systemctl enable sui-move-playground sui-move-api
    
    # 构建项目
    build_project
    
    # 启动服务
    systemctl start sui-move-api
    sleep 3
    systemctl start sui-move-playground
    
    sleep 3
    
    # 检查状态
    if systemctl is-active --quiet sui-move-playground && systemctl is-active --quiet sui-move-api; then
        echo -e "${GREEN}🎉 所有服务安装并启动成功！${NC}"
        echo
        echo -e "${GREEN}管理命令:${NC}"
        echo -e "  systemctl status sui-move-playground"
        echo -e "  systemctl status sui-move-api"
        echo -e "  ./manage.sh status"
    else
        echo -e "${RED}❌ 服务启动失败${NC}"
        echo -e "${YELLOW}检查状态: ./manage.sh status${NC}"
        exit 1
    fi
}

uninstall_services() {
    echo -e "${YELLOW}🗑️  卸载系统服务...${NC}"
    echo "============================================"
    
    if [[ $EUID -ne 0 ]]; then
        echo -e "${RED}❌ 卸载系统服务需要root权限${NC}"
        echo -e "${YELLOW}请使用: sudo ./manage.sh uninstall${NC}"
        exit 1
    fi
    
    # 停止并禁用服务
    systemctl stop sui-move-playground sui-move-api 2>/dev/null || true
    systemctl disable sui-move-playground sui-move-api 2>/dev/null || true
    
    # 删除服务文件
    rm -f /etc/systemd/system/sui-move-playground.service
    rm -f /etc/systemd/system/sui-move-api.service
    
    # 重新加载systemd
    systemctl daemon-reload
    
    echo -e "${GREEN}✅ 系统服务已完全卸载${NC}"
    echo -e "${YELLOW}💡 您仍可以使用 ./manage.sh start 手动启动服务${NC}"
}

# 主逻辑
case "$1" in
    start)
        if [[ "$2" == "frontend" ]] || [[ "$2" == "web" ]]; then
            [[ $EUID -ne 0 ]] && echo -e "${RED}❌ 需要root权限${NC}" && exit 1
            start_frontend
        elif [[ "$2" == "backend" ]] || [[ "$2" == "api" ]]; then
            start_backend
        else
            [[ $EUID -ne 0 ]] && echo -e "${RED}❌ 需要root权限${NC}" && exit 1
            start_all
        fi
        ;;
    stop)
        if [[ "$2" == "frontend" ]] || [[ "$2" == "web" ]]; then
            [[ $EUID -ne 0 ]] && echo -e "${RED}❌ 需要root权限${NC}" && exit 1
            stop_frontend
        elif [[ "$2" == "backend" ]] || [[ "$2" == "api" ]]; then
            stop_backend
        else
            [[ $EUID -ne 0 ]] && echo -e "${RED}❌ 需要root权限${NC}" && exit 1
            stop_all
        fi
        ;;
    restart)
        if [[ "$2" == "frontend" ]] || [[ "$2" == "web" ]]; then
            [[ $EUID -ne 0 ]] && echo -e "${RED}❌ 需要root权限${NC}" && exit 1
            stop_frontend && start_frontend
        elif [[ "$2" == "backend" ]] || [[ "$2" == "api" ]]; then
            stop_backend && start_backend
        else
            [[ $EUID -ne 0 ]] && echo -e "${RED}❌ 需要root权限${NC}" && exit 1
            restart_all
        fi
        ;;
    status)
        show_status
        ;;
    frontend|web)
        case "$2" in
            start) [[ $EUID -ne 0 ]] && echo -e "${RED}❌ 需要root权限${NC}" && exit 1; start_frontend ;;
            stop) [[ $EUID -ne 0 ]] && echo -e "${RED}❌ 需要root权限${NC}" && exit 1; stop_frontend ;;
            restart) [[ $EUID -ne 0 ]] && echo -e "${RED}❌ 需要root权限${NC}" && exit 1; stop_frontend && start_frontend ;;
            status) show_status ;;
            *) echo -e "${RED}❌ 未知子命令: $2${NC}"; show_help; exit 1 ;;
        esac
        ;;
    backend|api)
        case "$2" in
            start) start_backend ;;
            stop) stop_backend ;;
            restart) stop_backend && start_backend ;;
            status) show_status ;;
            *) echo -e "${RED}❌ 未知子命令: $2${NC}"; show_help; exit 1 ;;
        esac
        ;;
    test)
        run_test
        ;;
    build)
        build_project
        ;;
    logs)
        show_logs
        ;;
    install)
        install_services
        ;;
    uninstall)
        uninstall_services
        ;;
    help|--help|-h)
        show_help
        ;;
    "")
        show_help
        ;;
    *)
        echo -e "${RED}❌ 未知命令: $1${NC}"
        echo
        show_help
        exit 1
        ;;
esac 