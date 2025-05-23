// 编译请求的数据结构
export interface CompileRequest {
  source_code: string;
  file_name?: string;
  addresses_toml_content?: string;
}

// 编译结果的数据结构
export interface CompileResponse {
  success: boolean;
  bytecode_base64: string[];
  module_names: string[];
  bytecode_size: number[];
  compile_time_ms: number;
  error_message?: string;
  warnings: string[];
  bytecode_path?: string;
}

// 部署请求的数据结构
export interface DeployRequest {
  command: string;
}

// 部署响应的数据结构
export interface DeployResponse {
  success: boolean;
  package_id?: string;
  output?: string;
  error?: string;
}

// 测试请求的数据结构
export interface TestRequest {
  command: string;
}

// 测试响应的数据结构
export interface TestResponse {
  success: boolean;
  output?: string;
  error?: string;
}

// 示例代码结构
export interface CodeExample {
  name: string;
  code: string;
  description: string;
} 