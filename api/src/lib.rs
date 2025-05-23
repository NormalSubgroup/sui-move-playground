// Copyright (c) Move Web Compiler
// SPDX-License-Identifier: Apache-2.0

use std::path::{Path, PathBuf};
use anyhow::{Result, anyhow};
use serde::{Deserialize, Serialize};

// 重新导出Sui编译相关的关键类型
pub use sui_move_build;
pub use sui_types::move_package;
pub use fastcrypto::encoding::Base64;

/// 编译配置结构体
#[derive(Clone, Debug)]
pub struct CompileOptions {
    /// 是否包含未发布的依赖项
    pub with_unpublished_dependencies: bool,
    /// 是否以base64格式输出字节码
    pub dump_bytecode_as_base64: bool,
    /// 是否忽略链ID
    pub ignore_chain: bool,
    /// 是否生成结构布局
    pub generate_struct_layouts: bool,
    /// 链ID，用于解析依赖项
    pub chain_id: Option<String>,
}

impl Default for CompileOptions {
    fn default() -> Self {
        Self {
            with_unpublished_dependencies: false,
            dump_bytecode_as_base64: true,
            ignore_chain: true,
            generate_struct_layouts: false,
            chain_id: None,
        }
    }
}

/// 编译结果结构体
#[derive(Debug, Serialize, Deserialize)]
pub struct CompileResult {
    /// 编译是否成功
    pub success: bool,
    /// 生成的字节码（以Base64编码）
    pub bytecode_base64: Vec<String>,
    /// 错误信息（如果编译失败）
    pub error_message: Option<String>,
}

/// 编译Move源代码到字节码
pub async fn compile_move_source(
    source_code: &str,
    file_name: &str,
    options: &CompileOptions,
) -> Result<CompileResult> {
    // 创建临时目录和源文件
    let package_path = create_temp_package(source_code, file_name).await?;
    
    // 编译并返回结果
    match compile_move_package(&package_path, options).await {
        Ok(bytecode) => Ok(CompileResult {
            success: true,
            bytecode_base64: bytecode,
            error_message: None,
        }),
        Err(e) => Ok(CompileResult {
            success: false,
            bytecode_base64: vec![],
            error_message: Some(format!("编译错误: {}", e)),
        }),
    }
}

/// 创建临时包目录和文件
pub async fn create_temp_package(source_code: &str, file_name: &str) -> Result<PathBuf> {
    let temp_dir = std::env::temp_dir().join("move-web-compiler");
    if !temp_dir.exists() {
        std::fs::create_dir_all(&temp_dir)?;
    }

    // 写入源文件
    let source_path = temp_dir.join(file_name);
    std::fs::write(&source_path, source_code)?;

    // 创建Move.toml配置文件
    let move_toml_content = r#"[package]
name = "MoveWebCompile"
version = "0.0.1"

[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "main" }

[addresses]
std = "0x1"
sui = "0x2"
"#;
    let move_toml_path = temp_dir.join("Move.toml");
    std::fs::write(&move_toml_path, move_toml_content)?;

    Ok(temp_dir)
}

/// 编译Move包
pub async fn compile_move_package(
    package_path: &Path,
    options: &CompileOptions,
) -> Result<Vec<String>> {
    // 创建Sui编译配置 - 直接使用测试配置
    let sui_build_config = sui_move_build::BuildConfig::new_for_testing();

    // 编译包
    let compiled_package = sui_build_config.build(package_path)
        .map_err(|e| anyhow!("编译失败: {:?}", e))?;

    // 获取字节码（根据选项决定是否包含未发布的依赖）
    let bytecode_base64 = compiled_package
        .get_package_base64(options.with_unpublished_dependencies)
        .iter()
        .map(|b| b.encoded().to_string())
        .collect();

    Ok(bytecode_base64)
}

/// 检查源文件是否存在
pub fn check_source_file_exists(file_path: &Path) -> bool {
    file_path.exists() && file_path.is_file()
}

/// 读取源文件内容
pub async fn read_source_file(file_path: &Path) -> Result<String> {
    use tokio::fs::File;
    use tokio::io::AsyncReadExt;

    let mut file = File::open(file_path).await?;
    let mut content = String::new();
    file.read_to_string(&mut content).await?;
    Ok(content)
}

/// 工具函数：获取文件名
pub fn get_file_name(file_path: &Path) -> Result<String> {
    let file_name = file_path.file_name()
        .ok_or_else(|| anyhow!("无效的文件路径"))?
        .to_string_lossy()
        .to_string();
    Ok(file_name)
}