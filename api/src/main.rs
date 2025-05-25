// Copyright (c) Move Web Compiler
// SPDX-License-Identifier: Apache-2.0

use std::path::PathBuf;
use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use actix_cors::Cors;
use actix_files as fs;
use serde::{Deserialize, Serialize};
use anyhow::{Result, anyhow};
use chrono::Local;
use std::fs as std_fs;
use tokio::fs::File;
use tokio::io::AsyncReadExt;
use std::process::Command;

// 导入Sui相关的编译依赖
use sui_move_build;
// 添加base64依赖
use base64;

// 编译请求的数据结构
#[derive(Debug, Deserialize)]
struct CompileRequest {
    source_code: String,
    file_name: Option<String>,
    addresses_toml_content: Option<String>, // 新增字段，用于接收前端的地址配置
}

// 部署请求的数据结构
#[derive(Debug, Deserialize)]
struct DeployRequest {
    command: String,
}

// 部署响应的数据结构
#[derive(Debug, Serialize)]
struct DeployResponse {
    success: bool,
    package_id: Option<String>,
    output: Option<String>,
    error: Option<String>,
}

// 编译结果的数据结构
#[derive(Debug, Serialize)]
struct CompileResponse {
    success: bool,
    bytecode_base64: Vec<String>,
    module_names: Vec<String>,
    bytecode_size: Vec<usize>,
    compile_time_ms: u64,
    error_message: Option<String>,
    warnings: Vec<String>,
    bytecode_path: Option<String>, // 新增字段：字节码保存路径
}

// 测试请求的数据结构
#[derive(Debug, Deserialize)]
struct TestRequest {
    command: String,
}

// 测试响应的数据结构
#[derive(Debug, Serialize)]
struct TestResponse {
    success: bool,
    output: Option<String>,
    error: Option<String>,
}

// 日志记录函数
fn log(message: &str) {
    let now = Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    println!("[{}] {}", now, message);
}

// 创建临时源文件
async fn create_temp_source_file(source_code: &str, file_name: &str, addresses_toml_content: Option<&str>) -> Result<PathBuf> {
    // 创建唯一的临时目录，添加时间戳避免冲突
    let timestamp = Local::now().format("%Y%m%d%H%M%S").to_string();
    let temp_dir = std::env::temp_dir().join(format!("move-web-compiler-{}", timestamp));
    
    if !temp_dir.exists() {
        std_fs::create_dir_all(&temp_dir)?;
    }

    println!("创建临时编译目录: {:?}", temp_dir);
    
    // 创建源文件目录结构
    let sources_dir = temp_dir.join("sources");
    if !sources_dir.exists() {
        std_fs::create_dir_all(&sources_dir)?;
    }
    
    // 保存源文件到sources目录
    let source_path = sources_dir.join(file_name);
    std_fs::write(&source_path, source_code)?;
    println!("创建源文件: {:?}", source_path);

    // 创建Move.toml文件
    let mut move_toml_content = String::from(r#"[package]
name = "MoveWebCompile"
version = "0.0.1"
edition = "2024.beta"

[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "framework/testnet" }
"#);

    // 使用前端传递的地址内容，或者使用默认内容
    if let Some(addresses_content) = addresses_toml_content {
        if !addresses_content.trim().is_empty() {
            move_toml_content.push_str(addresses_content);
            println!("使用前端提供的地址配置:
{}", addresses_content);
        } else {
            // 如果前端提供的是空字符串，表示用户希望不包含任何由前端配置的地址
             println!("前端提供的地址配置为空字符串，Move.toml中将不包含由用户配置的地址段。");
        }
    } else {
        // 如果前端没有提供地址内容（None），则使用旧的默认地址
        move_toml_content.push_str(r#"[addresses]
std = "0x1"
sui = "0x2"
examples = "0x0"
hello_world = "0x0"
"#);
        println!("使用默认地址配置（前端未提供）");
    }

    let move_toml_path = temp_dir.join("Move.toml");
    std_fs::write(&move_toml_path, &move_toml_content)?;
    println!("创建Move.toml: {:?}, 内容:
{}", move_toml_path, move_toml_content);

    Ok(temp_dir)
}

// 编译Move源代码
async fn compile_move_code(package_path: &PathBuf) -> Result<(Vec<String>, Vec<String>, Vec<usize>, u64, Vec<String>, String)> {
    let start_time = std::time::Instant::now();
    
    println!("开始编译包: {:?}", package_path);
    
    // 创建Sui编译配置
    let sui_build_config = sui_move_build::BuildConfig::new_for_testing();

    // 编译包
    let compiled_package = sui_build_config.build(package_path)
        .map_err(|e| anyhow!("编译失败: {:?}", e))?;
        
    println!("编译成功，保存字节码...");

    // 收集编译结果信息
    let mut module_names = Vec::new();
    let mut bytecode_size = Vec::new();
    let mut warnings = Vec::new();
    let mut bytecode_base64 = Vec::new();
    
    // 获取完整的模块列表
    let mut all_modules = Vec::new();

    // 确保编译后的字节码保存在一个独立目录，同时原始源码保持不变
    let bytecode_dir = package_path.join("bytecode");
    if !bytecode_dir.exists() {
        std_fs::create_dir_all(&bytecode_dir)?;
    }
    
    // 获取编译后的模块信息
    for unit in compiled_package.package.all_compiled_units() {
        // 获取模块名称
        let module_name = unit.name.to_string();
        all_modules.push(module_name.clone());
        
        // 获取字节码大小 - 由于无法直接调用serialize，使用估算方法
        let module = &unit.module;
        // 简单估算字节码大小 - 这不是精确的，但足够展示
        // 一个简单估计是根据模块结构的复杂度
        let estimated_size = 
            module.function_defs().len() * 8 + 
            module.struct_defs().len() * 16 +
            module.signatures().len() * 4 +
            module.identifiers().len() * 12;
        
        // 筛选用户自定义模块 - 检查源码中特殊标识，如用户提供的hello模块
        if module_name.contains("hello") || module_name.starts_with("examples::") {
            println!("找到用户模块: {}", module_name);
            module_names.push(module_name.clone());
            bytecode_size.push(estimated_size);
        }
    }

    // 打印所有模块名称以便调试
    println!("所有模块: {:?}", all_modules);
    
    // 尝试获取用户模块字节码
    let all_bytecode = compiled_package.get_package_base64(true);
    println!("初始字节码数量: {}", all_bytecode.len());
    
    // 将Base64字节码保存到磁盘
    for (idx, bytecode) in all_bytecode.iter().enumerate() {
        // 收集Base64编码的字节码
        bytecode_base64.push(bytecode.encoded().to_string());
        
        // 模块名称，如果在module_names中有对应的，则使用它，否则用索引
        let module_name = if idx < module_names.len() {
            module_names[idx].clone()
        } else {
            let default_name = format!("Module_{}", idx + 1);
            // 如果模块名未添加过，添加到列表中
            if !module_names.contains(&default_name) {
                module_names.push(default_name.clone());
                bytecode_size.push(1024); // 默认大小
            }
            default_name
        };
        
        // 从Base64解码字节码
        match base64::decode(bytecode.encoded()) {
            Ok(decoded) => {
                let bytecode_path = bytecode_dir.join(format!("{}.mv", module_name));
                match std_fs::write(&bytecode_path, &decoded) {
                    Ok(_) => println!("成功保存字节码到: {:?}", bytecode_path),
                    Err(e) => println!("保存字节码文件失败: {:?}", e)
                }
            },
            Err(e) => println!("无法解码字节码 {}: {:?}", module_name, e)
        }
    }

    let compile_time_ms = start_time.elapsed().as_millis() as u64;

    // 打印调试信息
    println!("生成了 {} 个字节码模块", bytecode_base64.len());
    if !module_names.is_empty() {
        println!("用户模块名称: {:?}", module_names);
    } else {
        println!("警告：没有找到任何用户模块");
    }
    
    // 字节码存储位置
    println!("字节码存储目录: {:?}", bytecode_dir);
    
    // 添加Sui CLI使用指导
    println!("=== Sui CLI使用指南 ===");
    println!("本地测试命令: sui move test --path {}", package_path.display());
    println!("发布到测试网: sui client publish --path {} --gas-budget 100000000 --testnet", package_path.display());
    println!("===================");

    Ok((bytecode_base64, module_names, bytecode_size, compile_time_ms, warnings, package_path.display().to_string()))
}

// 处理编译请求的API端点
async fn compile_handler(req: web::Json<CompileRequest>) -> impl Responder {
    log(&format!("收到编译请求: {:?}, 地址配置: {:?}", req.file_name, req.addresses_toml_content.is_some()));
    
    let file_name = req.file_name.clone().unwrap_or_else(|| "main.move".to_string());
    
    // 创建临时文件，传递地址配置
    let package_path = match create_temp_source_file(&req.source_code, &file_name, req.addresses_toml_content.as_deref()).await {
        Ok(path) => path,
        Err(e) => {
            return HttpResponse::InternalServerError().json(CompileResponse {
                success: false,
                bytecode_base64: vec![],
                module_names: vec![],
                bytecode_size: vec![],
                compile_time_ms: 0,
                error_message: Some(format!("创建临时文件失败: {}", e)),
                warnings: vec![],
                bytecode_path: None,
            });
        }
    };
    
    // 编译代码
    match compile_move_code(&package_path).await {
        Ok((bytecode, module_names, bytecode_size, compile_time_ms, warnings, package_path_str)) => {
            log("编译成功");
            HttpResponse::Ok().json(CompileResponse {
                success: true,
                bytecode_base64: bytecode,
                module_names,
                bytecode_size,
                compile_time_ms,
                error_message: None,
                warnings,
                bytecode_path: Some(package_path_str),
            })
        },
        Err(e) => {
            log(&format!("编译失败: {}", e));
            HttpResponse::Ok().json(CompileResponse {
                success: false,
                bytecode_base64: vec![],
                module_names: vec![],
                bytecode_size: vec![],
                compile_time_ms: 0,
                error_message: Some(format!("编译错误: {}", e)),
                warnings: vec![],
                bytecode_path: None,
            })
        }
    }
}

// 处理部署请求的API端点
async fn deploy_handler(req: web::Json<DeployRequest>) -> impl Responder {
    log(&format!("收到部署请求: {}", req.command));
    
    // 解析命令
    let parts: Vec<&str> = req.command.split_whitespace().collect();
    if parts.len() < 2 || parts[0] != "sui" {
        return HttpResponse::BadRequest().json(DeployResponse {
            success: false,
            package_id: None,
            output: None,
            error: Some("无效的命令格式，必须是sui开头的命令".to_string()),
        });
    }
    
    // 执行命令
    let output = Command::new("sui")
        .args(&parts[1..])
        .output();
    
    match output {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout).to_string();
            let stderr = String::from_utf8_lossy(&output.stderr).to_string();
            
            log(&format!("部署命令执行结果: {}", if output.status.success() { "成功" } else { "失败" }));
            
            // 尝试从输出中解析包ID
            let mut package_id = None;
            for line in stdout.lines() {
                if line.contains("包ID") || line.contains("Package ID") {
                    // 从行中提取16进制字符串
                    if let Some(id) = line.split_whitespace().find(|s| s.starts_with("0x")) {
                        package_id = Some(id.to_string());
                        break;
                    }
                }
            }
            
            HttpResponse::Ok().json(DeployResponse {
                success: output.status.success(),
                package_id,
                output: Some(format!("stdout: {}\nstderr: {}", stdout, stderr)),
                error: if output.status.success() { None } else { Some(stderr) },
            })
        },
        Err(e) => {
            log(&format!("执行部署命令失败: {}", e));
            HttpResponse::InternalServerError().json(DeployResponse {
                success: false,
                package_id: None,
                output: None,
                error: Some(format!("执行部署命令失败: {}", e)),
            })
        }
    }
}

// 处理单文件编译的命令行功能
async fn compile_single_file(source_path: PathBuf, verbose: bool) -> Result<()> {
    if !source_path.exists() {
        return Err(anyhow!("源文件不存在"));
    }

    if verbose {
        println!("读取源文件: {:?}", source_path);
    }

    // 读取源文件内容
    let mut file = File::open(&source_path).await?;
    let mut source_code = String::new();
    file.read_to_string(&mut source_code).await?;

    let file_name = source_path.file_name()
        .ok_or_else(|| anyhow!("无效的文件路径"))?
        .to_string_lossy()
        .to_string();

    // 创建临时目录并写入源文件
    let package_path = create_temp_source_file(&source_code, &file_name, None).await?;

    if verbose {
        println!("创建临时包目录: {:?}", package_path);
    }

    // 编译代码
    let (bytecode, module_names, bytecode_size, compile_time_ms, warnings, _) = compile_move_code(&package_path).await?;

    if verbose {
        println!("编译成功，生成 {} 个模块", bytecode.len());
        println!("编译耗时: {}ms", compile_time_ms);
        
        if !warnings.is_empty() {
            println!("\n警告:");
            for warning in &warnings {
                println!("- {}", warning);
            }
        }
    }

    // 输出结果
    for (i, ((code, name), size)) in bytecode.iter().zip(module_names.iter()).zip(bytecode_size.iter()).enumerate() {
        println!("模块 #{}: {} ({}字节)", i + 1, name, size);
        if verbose {
            println!("{}", code);
        }
    }
    
    // 打印源码与编译后的代码包的存储路径
    let sources_dir = package_path.join("sources");
    let bytecode_dir = package_path.join("bytecode");
    
    println!("\n=== Sui CLI使用指南 ===");
    println!("源代码目录: {}", sources_dir.display());
    println!("字节码目录: {}", bytecode_dir.display());
    println!("\n本地测试命令:");
    println!("1. 单元测试: sui move test --path {}", package_path.display());
    println!("2. 功能测试: sui move run --path {} --function mint --module examples::hello", package_path.display());
    println!("\n发布到区块链:");
    println!("1. 测试网: sui client publish --path {} --gas-budget 100000000 --testnet", package_path.display());
    println!("2. 主网: sui client publish --path {} --gas-budget 100000000 --mainnet", package_path.display());
    println!("\n链上交互:");
    println!("1. 调用mint函数: sui client call --package <已发布包ID> --module hello --function mint --gas-budget 10000000");
    println!("2. 查看对象: sui client objects");
    println!("=====================");

    Ok(())
}

// 处理测试请求的API端点
async fn test_handler(req: web::Json<TestRequest>) -> impl Responder {
    log(&format!("收到测试请求: {}", req.command));
    
    // 解析命令
    let parts: Vec<&str> = req.command.split_whitespace().collect();
    if parts.len() < 2 || parts[0] != "sui" {
        return HttpResponse::BadRequest().json(TestResponse {
            success: false,
            output: None,
            error: Some("无效的命令格式，必须是sui开头的命令".to_string()),
        });
    }
    
    // 执行命令
    let output = Command::new("sui")
        .args(&parts[1..])
        .output();
    
    match output {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout).to_string();
            let stderr = String::from_utf8_lossy(&output.stderr).to_string();
            
            log(&format!("测试命令执行结果: {}", if output.status.success() { "成功" } else { "失败" }));
            
            HttpResponse::Ok().json(TestResponse {
                success: output.status.success(),
                output: Some(format!("# 输出结果：\n{}\n\n# 错误/警告：\n{}", stdout, stderr)),
                error: if output.status.success() { None } else { Some(stderr) },
            })
        },
        Err(e) => {
            log(&format!("执行测试命令失败: {}", e));
            HttpResponse::InternalServerError().json(TestResponse {
                success: false,
                output: None,
                error: Some(format!("执行测试命令失败: {}", e)),
            })
        }
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let args: Vec<String> = std::env::args().collect();
    
    if args.len() > 1 {
        // 命令行模式
        match args[1].as_str() {
            "compile" => {
                let mut source_path = None;
                let mut verbose = false;
                
                let mut i = 2;
                while i < args.len() {
                    match args[i].as_str() {
                        "-s" | "--source" => {
                            if i + 1 < args.len() {
                                source_path = Some(PathBuf::from(&args[i + 1]));
                                i += 2;
                            } else {
                                eprintln!("错误: -s/--source 参数需要指定源文件路径");
                                std::process::exit(1);
                            }
                        },
                        "-v" | "--verbose" => {
                            verbose = true;
                            i += 1;
                        },
                        _ => {
                            eprintln!("未知参数: {}", args[i]);
                            i += 1;
                        }
                    }
                }
                
                if let Some(path) = source_path {
                    match compile_single_file(path, verbose).await {
                        Ok(_) => std::process::exit(0),
                        Err(e) => {
                            eprintln!("Error: {}", e);
                            std::process::exit(1);
                        }
                    }
                } else {
                    eprintln!("错误: 缺少源文件路径。使用 -s/--source 指定源文件");
                    std::process::exit(1);
                }
            },
            _ => {
                println!("未知命令: {}", args[1]);
                println!("可用命令: compile");
                std::process::exit(1);
            }
        }
    }
    
    // Web服务器模式
    println!("启动Move Web编译器服务器，监听端口8081...");
    
    HttpServer::new(|| {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header();
            
        App::new()
            .wrap(cors)
            .route("/api/compile", web::post().to(compile_handler))
            .route("/api/deploy", web::post().to(deploy_handler))
            .route("/api/test", web::post().to(test_handler))
            .service(fs::Files::new("/", "./static").index_file("index.html"))
    })
    .bind("0.0.0.0:8081")?
    .run()
    .await
}