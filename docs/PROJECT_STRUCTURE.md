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
│   └── manage.sh               # 生产环境管理脚本
├── deploy/                      # 部署配置
│   ├── sui-move-playground.service # SystemD前端服务配置
│   └── sui-move-api.service     # SystemD后端服务配置
├── config/                      # 配置文件
│   └── logrotate.conf          # 日志轮转配置
├── assets/                      # 静态资源
│   ├── logo.png                # 项目Logo
│   └── screenshot_demo.png     # 演示截图
├── .vscode/                     # VSCode配置
├── run.sh                       # 开发环境启动脚本
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
- **manage.sh**: 生产环境一键管理脚本
  - 服务启动/停止/重启
  - 状态检查和测试
  - SystemD服务安装

#### `deploy/`
部署配置文件：
- **SystemD服务配置**: 系统服务定义
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

## 使用说明

### 开发环境
```bash
# 快速启动
./run.sh

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
```

### 文档查看
- 在线查看: 访问 [GitHub仓库](https://github.com/NormalSubgroup/sui-move-playground)
- 本地查看: 直接打开 `docs/` 目录下的Markdown文件

## 设计原则

1. **分离关注点**: 前后端分离，文档与代码分离
2. **环境隔离**: 开发和生产环境配置分离
3. **自动化优先**: 脚本自动化部署和管理
4. **文档驱动**: 完整的文档覆盖和说明
5. **标准化目录**: 遵循开源项目最佳实践

---

*最后更新: 2024年12月20日* 