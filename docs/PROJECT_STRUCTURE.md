# 项目结构说明

## 目录结构

```
sui-move-playground/
├── api/                          # 后端API服务
│   ├── src/                      # Rust源代码
│   │   ├── main.rs              # 主程序入口
│   │   └── lib.rs               # 库文件
│   ├── Cargo.toml               # Rust依赖配置
│   └── target/                  # 编译输出目录
├── web/                         # 前端Web应用
│   ├── src/                     # React/TypeScript源代码
│   │   ├── components/          # React组件
│   │   ├── hooks/               # 自定义Hook
│   │   ├── services/            # API服务
│   │   └── main.tsx             # 应用入口
│   ├── dist/                    # 构建输出目录
│   ├── package.json             # Node.js依赖配置
│   ├── vite.config.ts           # Vite构建配置
│   └── server.js                # 生产环境服务器
├── docs/                        # 项目文档
│   ├── api_documentation.md     # API接口文档
│   ├── DEPLOYMENT_SUMMARY.md    # 快速部署指南
│   ├── PRODUCTION_DEPLOYMENT.md # 详细生产部署指南
│   ├── FINAL_DEPLOYMENT_STATUS.md # 最终部署状态
│   └── PROJECT_STRUCTURE.md     # 项目结构说明（本文档）
├── scripts/                     # 脚本文件
│   ├── manage.sh               # 生产环境管理脚本 (统一版)
│   └── run.sh                  # 开发环境启动脚本
├── deploy/                      # 部署配置
│   ├── templates/              # 服务模板文件
│   │   ├── sui-move-playground.service.template
│   │   └── sui-move-api.service.template
│   ├── sui-move-playground.service # 前端服务配置
│   └── sui-move-api.service     # 后端服务配置
├── config/                      # 配置文件
│   └── logrotate.conf          # 日志轮转配置
├── assets/                      # 静态资源
│   ├── logo.png                # 项目Logo
│   └── screenshot_demo.png     # 演示截图
├── .vscode/                     # VSCode配置
├── README.md                    # 项目主文档
├── LICENSE                      # 开源协议
└── .gitignore                   # Git忽略规则
```

## 目录说明

### 核心应用目录

#### `api/`
后端API服务，基于Rust和Actix-web构建：
- **功能**: Sui Move代码编译、部署、测试
- **端口**: 8081
- **技术栈**: Rust, Actix-web, Sui Move SDK

#### `web/`
前端Web应用，基于React和TypeScript：
- **功能**: 代码编辑器、界面交互、API调用
- **端口**: 80 (生产环境)
- **技术栈**: React, TypeScript, Vite, Monaco Editor

### 文档目录

#### `docs/`
包含所有项目文档：
- **API文档**: 完整的后端接口说明
- **部署指南**: 从开发到生产的部署流程
- **项目说明**: 架构设计和使用说明

### 运维目录

#### `scripts/`
自动化脚本：
- **manage.sh**: 生产环境管理脚本 ⭐
  - 服务启动/停止/重启（支持单独管理前后端）
  - 状态检查和连接测试
  - SystemD服务安装
  - 完整测试套件
  - 日志查看功能
  - 动态路径检测和工具发现
- **run.sh**: 开发环境启动脚本
  - 自动启动前后端服务
  - 支持Bun和npm包管理器
  - 信号处理和清理功能

#### `deploy/`
部署配置文件：
- **templates/**: 服务模板文件目录
  - 包含动态路径占位符的模板
  - 支持不同环境的配置生成
- **服务配置文件**: 当前环境的SystemD服务定义
- **服务依赖关系**: 启动顺序和依赖

#### `config/`
应用配置文件：
- **日志配置**: 日志轮转和清理规则
- **环境配置**: 生产环境特定设置

### 资源目录

#### `assets/`
静态资源文件：
- **图片资源**: Logo、截图等
- **文档附件**: 说明图片和演示材料

## 功能特性 🚀

### 管理脚本功能
`scripts/manage.sh` 提供完整的项目管理功能：

#### 基础服务管理
```bash
sudo ./scripts/manage.sh start        # 启动所有服务
sudo ./scripts/manage.sh stop         # 停止所有服务
sudo ./scripts/manage.sh restart      # 重启所有服务
./scripts/manage.sh status            # 查看服务状态
```

#### 单独服务管理
```bash
sudo ./scripts/manage.sh start frontend    # 只启动前端
sudo ./scripts/manage.sh start backend     # 只启动后端
./scripts/manage.sh frontend restart       # 重启前端
./scripts/manage.sh backend status         # 后端状态
```

#### 开发工具
```bash
./scripts/manage.sh build            # 构建项目
./scripts/manage.sh test             # 运行完整测试
./scripts/manage.sh logs             # 查看服务日志
```

#### SystemD集成
```bash
sudo ./scripts/manage.sh install     # 安装为系统服务
sudo ./scripts/manage.sh uninstall   # 卸载系统服务
```

### 路径适配性
- **动态路径检测**: 自动识别项目根目录
- **工具发现**: 自动查找bun、cargo等工具
- **模板生成**: 支持不同环境的配置生成
- **错误处理**: 清晰的错误提示和建议

## 使用说明

### 开发环境
```bash
# 快速启动
./scripts/run.sh

# 分别启动
cd api && cargo run          # 启动后端
cd web && bun run dev        # 启动前端
```

### 生产环境
```bash
# 一键部署
sudo ./scripts/manage.sh install

# 服务管理
sudo ./scripts/manage.sh start|stop|restart|status

# 检查服务状态和连接
./scripts/manage.sh status
```

### 文档查看
- 在线查看: 访问 [GitHub仓库](https://github.com/NormalSubgroup/sui-move-playground)
- 本地查看: 直接打开 `docs/` 目录下的Markdown文件

## 设计原则

1. **统一管理**: 单一脚本管理所有功能，避免重复
2. **模块化设计**: 支持前后端独立管理
3. **环境适配**: 自动检测和适配不同环境
4. **完整测试**: 内置完整的功能测试套件
5. **清晰结构**: 分离模板和实际配置
6. **标准化目录**: 遵循开源项目最佳实践

## 清理说明

### 已清理的文件
- ❌ `scripts/manage_fixed.sh` - 功能已合并到main manage.sh
- ❌ `scripts/manage_improved.sh` - 空文件，已删除
- ❌ `scripts/manage_backup.sh` - 备份文件，已删除

### 整理的目录
- 📁 `deploy/templates/` - 模板文件统一存放
- 📄 `deploy/*.service` - 当前环境的实际配置文件

---

*最后更新: 2024年12月20日 - 完成脚本清理和功能整合* 