# Sui Move Playground 后端API文档

## 概述

Sui Move Playground 后端API提供Sui Move智能合约的在线编译、部署和测试服务。API基于Rust和Actix-web框架构建，集成了Sui Move编译器和Sui CLI工具。

**基础信息**
- **基础URL**: `http://localhost:8081` (开发环境) / `https://sui.cauchy.top/api` (生产环境)
- **协议**: HTTP/HTTPS
- **数据格式**: JSON
- **字符编码**: UTF-8

## 快速开始

### 简单示例

编译一个简单的Hello World程序：

```bash
curl -X POST https://sui.cauchy.top/api/compile \
  -H "Content-Type: application/json" \
  -d '{
    "source_code": "module examples::hello { public entry fun main() {} }",
    "file_name": "hello.move"
  }'
```

### 测试服务状态

```bash
# 测试编译服务
curl -X POST https://sui.cauchy.top/api/compile \
  -H "Content-Type: application/json" \
  -d '{"source_code": "module test::dummy {}", "file_name": "test.move"}'
```

## 认证

当前版本的API不需要认证，所有端点都是公开访问的。

## 通用响应格式

所有API响应都使用JSON格式，包含以下通用字段：

```json
{
  "success": boolean,
  "error": string | null,
  // ... 其他特定字段
}
```

## API端点

### 1. 编译Move代码

编译Sui Move源代码并返回字节码和编译信息。

**端点**: `POST /api/compile`

**请求体**:
```json
{
  "source_code": "string",              // 必需：Move源代码
  "file_name": "string",                // 可选：文件名（默认"main.move"）
  "addresses_toml_content": "string"    // 可选：地址配置TOML内容
}
```

**请求示例**:
```json
{
  "source_code": "module examples::hello {\n    use std::string;\n    use sui::object::{Self, UID};\n    use sui::transfer;\n    use sui::tx_context::{Self, TxContext};\n    \n    struct Hello has key, store {\n        id: UID,\n        message: string::String\n    }\n    \n    public entry fun mint(ctx: &mut TxContext) {\n        let hello = Hello {\n            id: object::new(ctx),\n            message: string::utf8(b\"Hello, World!\")\n        };\n        transfer::public_transfer(hello, tx_context::sender(ctx));\n    }\n}",
  "file_name": "hello.move",
  "addresses_toml_content": "[addresses]\nexamples = \"0x0\""
}
```

**响应格式**:
```json
{
  "success": boolean,
  "bytecode_base64": ["string"],        // Base64编码的字节码数组
  "module_names": ["string"],           // 编译生成的模块名称
  "bytecode_size": [number],            // 各模块字节码大小（字节）
  "compile_time_ms": number,            // 编译耗时（毫秒）
  "error_message": "string" | null,     // 编译错误信息
  "warnings": ["string"],               // 编译警告信息
  "bytecode_path": "string" | null      // 字节码保存路径
}
```

**成功响应示例**:
```json
{
  "success": true,
  "bytecode_base64": ["YWdndtGVsdLmphdGYvLi4u..."],
  "module_names": ["examples::hello"],
  "bytecode_size": [256],
  "compile_time_ms": 1500,
  "error_message": null,
  "warnings": [],
  "bytecode_path": "/tmp/move-web-compiler-20241220143022"
}
```

**错误响应示例**:
```json
{
  "success": false,
  "bytecode_base64": [],
  "module_names": [],
  "bytecode_size": [],
  "compile_time_ms": 0,
  "error_message": "编译错误: 未定义的符号 'invalid_function'",
  "warnings": [],
  "bytecode_path": null
}
```

### 2. 部署Move包

执行Sui CLI部署命令，将编译后的Move包发布到区块链。

**端点**: `POST /api/deploy`

**请求体**:
```json
{
  "command": "string"                   // 必需：完整的sui命令
}
```

**请求示例**:
```json
{
  "command": "sui client publish --path /tmp/move-web-compiler-20241220143022 --gas-budget 100000000 --testnet"
}
```

**响应格式**:
```json
{
  "success": boolean,
  "package_id": "string" | null,        // 部署成功时的包ID
  "output": "string" | null,            // 命令执行输出
  "error": "string" | null              // 错误信息
}
```

**成功响应示例**:
```json
{
  "success": true,
  "package_id": "0x1234567890abcdef...",
  "output": "stdout: Successfully published package\nPackage ID: 0x1234567890abcdef...\n\nstderr: ",
  "error": null
}
```

**错误响应示例**:
```json
{
  "success": false,
  "package_id": null,
  "output": "stdout: \n\nstderr: Error: Insufficient gas",
  "error": "Error: Insufficient gas"
}
```

### 3. 测试Move代码

执行Sui CLI测试命令，运行Move包的单元测试或功能测试。

**端点**: `POST /api/test`

**请求体**:
```json
{
  "command": "string"                   // 必需：完整的sui测试命令
}
```

**请求示例**:
```json
{
  "command": "sui move test --path /tmp/move-web-compiler-20241220143022"
}
```

**响应格式**:
```json
{
  "success": boolean,
  "output": "string" | null,            // 测试执行输出
  "error": "string" | null              // 错误信息
}
```

**成功响应示例**:
```json
{
  "success": true,
  "output": "# 输出结果：\nRunning Move unit tests\n[ PASS    ] 0x0::hello::test_mint\nTest result: OK. Total tests: 1; passed: 1; failed: 0\n\n# 错误/警告：\n",
  "error": null
}
```

**错误响应示例**:
```json
{
  "success": false,
  "output": "# 输出结果：\n\n\n# 错误/警告：\nError: Test failed",
  "error": "Error: Test failed"
}
```

## 错误处理

### HTTP状态码

- `200 OK`: 请求成功（包括业务逻辑失败但HTTP请求成功的情况）
- `400 Bad Request`: 请求格式错误或参数无效
- `500 Internal Server Error`: 服务器内部错误

### 错误类型

#### 1. 编译错误
- **原因**: Move源代码语法错误、类型错误、依赖缺失等
- **处理**: 检查`error_message`字段获取详细错误信息

#### 2. 命令格式错误
- **原因**: 部署或测试请求中的命令格式不正确
- **错误信息**: "无效的命令格式，必须是sui开头的命令"

#### 3. 系统错误
- **原因**: 文件系统错误、编译器崩溃、命令执行失败等
- **处理**: 检查服务器日志，重试请求

## 使用示例

### JavaScript/TypeScript

```typescript
// 编译代码
const compileCode = async (sourceCode: string, fileName?: string, addressesToml?: string) => {
  const response = await fetch('/api/compile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source_code: sourceCode,
      file_name: fileName,
      addresses_toml_content: addressesToml,
    }),
  });
  
  return await response.json();
};

// 部署包
const deployPackage = async (command: string) => {
  const response = await fetch('/api/deploy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      command: command,
    }),
  });
  
  return await response.json();
};

// 运行测试
const runTest = async (command: string) => {
  const response = await fetch('/api/test', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      command: command,
    }),
  });
  
  return await response.json();
};
```

### cURL

```bash
# 编译代码
curl -X POST http://localhost:8081/api/compile \
  -H "Content-Type: application/json" \
  -d '{
    "source_code": "module examples::hello { public entry fun main() {} }",
    "file_name": "hello.move"
  }'

# 部署包
curl -X POST http://localhost:8081/api/deploy \
  -H "Content-Type: application/json" \
  -d '{
    "command": "sui client publish --path /tmp/move-web-compiler-20241220143022 --gas-budget 100000000"
  }'

# 运行测试
curl -X POST http://localhost:8081/api/test \
  -H "Content-Type: application/json" \
  -d '{
    "command": "sui move test --path /tmp/move-web-compiler-20241220143022"
  }'
```

## 地址配置说明

### TOML格式

地址配置使用TOML格式，需要包含`[addresses]`段：

```toml
[addresses]
examples = "0x0"
hello_world = "0x0"
std = "0x1"
sui = "0x2"
```

### 默认配置

如果没有提供`addresses_toml_content`，系统将使用默认配置：

```toml
[addresses]
std = "0x1"
sui = "0x2"
examples = "0x0"
hello_world = "0x0"
```

## 性能考虑

- **编译时间**: 通常在1-5秒之间，复杂项目可能需要更长时间
- **并发限制**: 服务器支持并发编译，但受系统资源限制
- **临时文件**: 每次编译都会创建临时目录，系统会自动清理旧文件
- **内存使用**: 大型项目编译时内存使用量较高

## 日志和监控

### 服务器日志格式

```
[2024-12-20 14:30:22] 收到编译请求: Some("hello.move"), 地址配置: true
[2024-12-20 14:30:22] 编译成功
[2024-12-20 14:30:25] 收到部署请求: sui client publish --path /tmp/move-web-compiler-20241220143022 --gas-budget 100000000
[2024-12-20 14:30:30] 部署命令执行结果: 成功
```

### 健康检查

服务器在端口8081上运行，可以通过访问任何端点来检查服务状态。

## 版本信息

- **API版本**: 1.0
- **Sui框架版本**: 基于GitHub最新testnet分支
- **支持的Move版本**: 兼容Sui Move语法规范

## 更新日志

### v1.0 (2024-12-20)
- 初始版本发布
- 支持Move代码编译、部署和测试
- 集成Sui Move编译器和CLI工具
- 提供完整的错误处理和日志记录

---

*最后更新: 2024年12月20日* 