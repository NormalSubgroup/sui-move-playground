# Sui Move Playground

一个现代化的在线 Sui Move 智能合约开发环境，具有完整的 Monaco Editor 集成和专业的 Move 语言支持。

## ✨ 主要功能

### 🎯 Monaco Editor 集成
- **完整的 Move 语言支持**：语法高亮、自动补全、错误检测
- **智能代码提示**：Sui 特定的函数、类型和模块自动补全
- **代码模板**：内置 Hello World、NFT、计数器等常用模板
- **主题切换**：支持深色和浅色主题
- **键盘快捷键**：保存 (Ctrl+S)、格式化 (Shift+Alt+F)、查找 (Ctrl+F)

### 📝 Move 语言特性
- **语法高亮**：关键字、类型、注释、字符串等完整语法着色
- **自动补全**：
  - Sui 核心模块 (`sui::object`, `sui::transfer`, `sui::tx_context`)
  - 标准库模块 (`std::string`, `std::vector`, `std::option`)
  - 高级功能模块 (`sui::coin`, `sui::table`, `sui::event`)
  - 代码片段和模板
- **代码片段**：
  - 入口函数模板
  - 事件结构体
  - 错误常量定义
  - 币种处理逻辑
  - 向量和表操作

### 🛠️ 开发工具
- **文件管理**：创建、编辑、删除 Move 和 TOML 文件
- **示例代码**：Hello World、Simple NFT、Counter 等完整示例
- **编译器集成**：实时编译和错误检查
- **测试支持**：内置测试框架集成
- **部署功能**：一键部署到 Sui 网络

### 📚 帮助系统
- **快捷键参考**：完整的编辑器快捷键说明
- **语法指南**：Move 基本语法和 Sui 特定概念
- **最佳实践**：Move 开发建议和代码规范
- **代码示例**：常用代码模式和用法

## 🚀 技术实现

### Monaco Editor 语言定义
```typescript
// lib/monaco/move-language.ts
export const moveLanguageDefinition = {
  // 完整的 Move 关键字定义
  keywords: ['module', 'use', 'public', 'fun', 'struct', 'has', 'key', 'store', ...],
  
  // 类型关键字
  typeKeywords: ['address', 'signer', 'bool', 'u8', 'u64', 'u128', 'u256', 'vector'],
  
  // 词法分析器规则
  tokenizer: {
    // 语法高亮规则
    // 自动补全规则
    // 错误检测规则
  }
}
```

### 自动补全提供器
```typescript
// components/editor/monaco-editor.tsx
monacoInstance.languages.registerCompletionItemProvider('move', {
  provideCompletionItems: (model, position) => {
    // 智能代码提示
    // Sui 特定补全
    // 代码模板
  }
})
```

### 代码片段系统
```typescript
// lib/constants/move-snippets.ts
export const moveSnippets = [
  {
    label: 'entry function',
    insertText: 'public entry fun ${1:function_name}(${2:params}, ctx: &mut TxContext) { ... }',
    documentation: '创建一个入口函数模板'
  },
  // 更多代码片段...
]
```

## 📁 项目结构

```
sui-move-playground/
├── components/
│   ├── editor/
│   │   ├── monaco-editor.tsx          # Monaco Editor 集成
│   │   ├── code-editor.tsx            # 代码编辑器组件
│   │   └── move-help-panel.tsx        # Move 帮助面板
│   └── sidebar/
│       ├── example-selector.tsx       # 示例代码选择器
│       ├── file-manager.tsx           # 文件管理器
│       └── sidebar.tsx                # 侧边栏主组件
├── lib/
│   ├── monaco/
│   │   └── move-language.ts           # Move 语言定义
│   ├── constants/
│   │   └── move-snippets.ts           # 代码片段定义
│   └── providers/
│       └── playground-provider.tsx    # 状态管理
└── app/
    └── page.tsx                       # 主页面
```

## 🎨 UI 组件

- **Monaco Editor**：专业代码编辑器
- **侧边栏**：文件管理、示例代码、配置、帮助
- **结果面板**：编译结果、测试输出、部署状态
- **响应式设计**：适配桌面和移动设备

## 🔧 开发环境

### 技术栈
- **Next.js 15**：React 框架
- **TypeScript**：类型安全
- **Monaco Editor**：代码编辑器
- **Tailwind CSS**：样式框架
- **Shadcn/ui**：UI 组件库

### 安装和运行
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

## 📖 使用说明

### 1. 创建新文件
- 点击侧边栏 "Files" 标签页
- 点击 "New File" 按钮
- 输入文件名（支持 .move、.toml 扩展名）

### 2. 加载示例代码
- 点击侧边栏 "Examples" 标签页
- 选择 Hello World、Simple NFT 或 Counter 示例
- 点击 "Load Example" 加载到编辑器

### 3. 编写代码
- 使用 Monaco Editor 编写 Move 代码
- 享受语法高亮和自动补全
- 使用 Ctrl+Space 触发代码提示

### 4. 查看帮助
- 点击侧边栏 "Help" 标签页
- 查看快捷键、语法指南和最佳实践

### 5. 编译和部署
- 点击顶部 "Compile" 按钮编译代码
- 点击 "Test" 运行测试
- 点击 "Deploy" 部署到 Sui 网络

## 🎯 Move 语言支持特性

### 语法高亮
- 关键字：`module`, `use`, `public`, `fun`, `struct`, `entry`
- 类型：`address`, `signer`, `bool`, `u8`-`u256`, `vector`
- 能力：`key`, `store`, `copy`, `drop`
- 注释：行注释 `//` 和块注释 `/* */`

### 自动补全
- **模块导入**：
  ```move
  use sui::object::{Self, UID};
  use sui::transfer;
  use sui::tx_context::{Self, TxContext};
  ```

- **函数模板**：
  ```move
  public entry fun function_name(params, ctx: &mut TxContext) {
      // 函数体
  }
  ```

- **结构体定义**：
  ```move
  struct StructName has key, store {
      id: UID,
      field: Type,
  }
  ```

### 代码片段
- 入口函数、只读函数、初始化函数
- 事件结构体、权限控制结构体
- 错误常量定义
- 共享对象创建
- 币种处理逻辑
- 向量和表操作

## 🌟 特色功能

### 1. 智能代码提示
基于 Sui Move 文档和最佳实践，提供上下文相关的代码建议。

### 2. 实时语法检查
在编码过程中实时检测语法错误和类型不匹配。

### 3. 代码格式化
自动格式化 Move 代码，保持一致的代码风格。

### 4. 主题定制
支持深色和浅色主题，适应不同的开发环境。

### 5. 键盘快捷键
完整的键盘快捷键支持，提高开发效率。

## 🐛 已解决的问题

### v1.1.0 - Monaco Editor 修复版本
- ✅ **修复了 Hydration Mismatch 错误**：
  - 添加了 `suppressHydrationWarning` 到 body 元素
  - 实现了客户端渲染检查，避免 SSR 不匹配问题
- ✅ **修复了 Monaco Editor 语言定义错误**：
  - 解决了 `@0x` 正则表达式在 Monarch 语法中的引用问题
  - 移除了有问题的地址字面量匹配规则
  - 改进了转义序列处理
- ✅ **增强了错误处理**：
  - 为 Monaco Editor 初始化添加了 try-catch 错误处理
  - 改进了加载状态显示

### 技术改进
- 🔧 **客户端渲染优化**：确保 Monaco Editor 只在客户端加载
- 🔧 **语法高亮稳定性**：简化了正则表达式以避免解析错误
- 🔧 **错误日志**：添加了详细的错误记录机制

## 🔮 未来计划

- [ ] 更多代码模板和示例
- [ ] 实时协作编辑
- [ ] Git 集成
- [ ] 调试器支持
- [ ] 性能分析工具
- [ ] 更多主题选项
- [ ] LSP (Language Server Protocol) 集成
- [ ] 代码格式化器改进

## 📄 许可证

MIT License

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

---

**Sui Move Playground** - 让 Move 智能合约开发更加简单和高效！ 