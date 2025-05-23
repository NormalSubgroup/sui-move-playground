const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
const port = 3000;

// 启用 CORS 和 JSON 解析
app.use(cors());
app.use(express.json());

// 确保 sources 目录存在
const sourcesDir = path.join(__dirname, 'sources');
if (!fs.existsSync(sourcesDir)) {
    fs.mkdirSync(sourcesDir);
}

// 确保build目录存在
const buildDir = path.join(__dirname, 'build');
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir);
}

// 保存文件的接口
app.post('/api/save-file', (req, res) => {
    const { content, filename } = req.body;
    
    if (!content || !filename) {
        return res.status(400).json({ error: '内容和文件名都是必需的', success: false });
    }

    // 移除.move扩展名如果存在
    const cleanFilename = filename.endsWith('.move') ? filename.slice(0, -5) : filename;
    const filePath = path.join(sourcesDir, `${cleanFilename}.move`);
    
    try {
        fs.writeFileSync(filePath, content);
        res.json({ success: true, message: '文件保存成功' });
    } catch (error) {
        console.error('保存文件失败:', error);
        res.status(500).json({ error: '保存文件失败', success: false });
    }
});

// 列出文件的接口
app.get('/api/list-files', (req, res) => {
    try {
        const files = fs.readdirSync(sourcesDir)
            .filter(file => file.endsWith('.move'))
            .map(file => file.replace('.move', ''));
        
        res.json({ success: true, message: JSON.stringify(files) });
    } catch (error) {
        console.error('列出文件失败:', error);
        res.status(500).json({ error: '列出文件失败', success: false });
    }
});

// 读取文件的接口
app.get('/api/read-file/:filename', (req, res) => {
    const { filename } = req.params;
    
    if (!filename) {
        return res.status(400).json({ error: '文件名是必需的', success: false });
    }
    
    const filePath = path.join(sourcesDir, `${filename}.move`);
    
    try {
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: '文件不存在', success: false });
        }
        
        const content = fs.readFileSync(filePath, 'utf-8');
        res.json({ success: true, message: content });
    } catch (error) {
        console.error('读取文件失败:', error);
        res.status(500).json({ error: '读取文件失败', success: false });
    }
});

// 编译接口 - 运行src/main.rs
app.post('/api/compile', (req, res) => {
    const { content, filename } = req.body;
    
    if (!content) {
        return res.status(400).json({ success: false, error: '代码内容是必需的' });
    }
    
    // 确保有文件名
    const sourceFilename = filename || 'temp.move';
    const cleanFilename = sourceFilename.endsWith('.move') ? sourceFilename.slice(0, -5) : sourceFilename;
    const filePath = path.join(sourcesDir, `${cleanFilename}.move`);
    
    try {
        // 保存代码到文件
        fs.writeFileSync(filePath, content);
        console.log(`保存代码到: ${filePath}`);
        
        // 构建命令 - 使用绝对路径
        const homeDir = '/home/cx'; // 使用绝对路径
        const command = `cd ${homeDir}/move2wasm/move-web-compiler && cargo run -- --source sources/${cleanFilename}.move`;
        console.log(`执行命令: ${command}`);
        
        // 先将文件复制到~/move-web-compiler/sources目录
        const targetPath = path.join(homeDir, 'move2wasm', 'move-web-compiler', 'sources', `${cleanFilename}.move`);
        fs.copyFileSync(filePath, targetPath);
        console.log(`文件已复制到: ${targetPath}`);
        
        // 执行编译命令
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`编译错误: ${error}`);
                return res.json({ 
                    success: false, 
                    error: error.message,
                    stderr: stderr
                });
            }
            
            // 如果有标准错误输出但没有报错，也记录出来
            if (stderr) {
                console.warn(`编译警告: ${stderr}`);
            }
            
            // 读取输出文件
            const outputPath = `${targetPath}.output`;
            let output = stdout;
            
            // 尝试读取输出文件
            try {
                if (fs.existsSync(outputPath)) {
                    output = fs.readFileSync(outputPath, 'utf-8');
                    console.log(`读取输出文件: ${outputPath}`);
                }
            } catch (readError) {
                console.warn(`读取输出文件失败: ${readError.message}`);
            }
            
            res.json({ 
                success: true, 
                output: output,
                message: '编译成功'
            });
        });
    } catch (error) {
        console.error('编译请求处理失败:', error);
        res.status(500).json({ 
            success: false, 
            error: `编译处理失败: ${error.message}` 
        });
    }
});

// 连接Sui钱包API
app.post('/api/connect-sui', (req, res) => {
    const { network } = req.body;
    
    // 使用提供的网络或默认为devnet
    const networkType = network || 'devnet';
    console.log(`正在连接到Sui ${networkType}网络...`);
    
    // 构建命令使用新的sui-tools程序
    const homeDir = '/home/cx'; // 使用绝对路径
    const command = `cd ${homeDir}/move2wasm/sui-tools && cargo run -- --connect --network ${networkType}`;
    
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`连接Sui错误: ${error}`);
            return res.json({ 
                success: false, 
                error: error.message,
                stderr: stderr
            });
        }
        
        // 处理输出
        let message = stdout;
        if (stderr) {
            console.warn(`连接Sui警告: ${stderr}`);
            message += `\n${stderr}`;
        }
        
        res.json({ 
            success: true, 
            message: message
        });
    });
});

// 部署模块到Sui
app.post('/api/deploy-sui', (req, res) => {
    const { content, address, moduleName, network } = req.body;
    
    if (!content) {
        return res.status(400).json({ success: false, error: '代码内容是必需的' });
    }
    
    if (!moduleName) {
        return res.status(400).json({ success: false, error: '模块名是必需的' });
    }
    
    // 确保有文件名
    const cleanModuleName = moduleName.endsWith('.move') ? moduleName.slice(0, -5) : moduleName;
    const filePath = path.join(sourcesDir, `${cleanModuleName}.move`);
    
    try {
        // 保存代码到文件
        fs.writeFileSync(filePath, content);
        console.log(`保存代码到: ${filePath}`);
        
        // 先编译以确保代码有效
        const compileCommand = `cd ${homeDir}/move2wasm/move-web-compiler && cargo run -- --source sources/${cleanModuleName}.move`;
        console.log(`执行编译命令: ${compileCommand}`);
        
        exec(compileCommand, (compileError, compileStdout, compileStderr) => {
            if (compileError) {
                console.error(`编译错误: ${compileError}`);
                return res.json({ 
                    success: false, 
                    error: compileError.message,
                    stderr: compileStderr
                });
            }
            
            // 编译成功后，使用sui-tools部署
            const deployCommand = `cd ${homeDir}/move2wasm/sui-tools && cargo run -- --deploy --module ${filePath}${address ? (' --address ' + address) : ''}${network ? (' --network ' + network) : ''}`;
            console.log(`执行部署命令: ${deployCommand}`);
            
            exec(deployCommand, (deployError, deployStdout, deployStderr) => {
                if (deployError) {
                    console.error(`部署错误: ${deployError}`);
                    return res.json({ 
                        success: false, 
                        error: deployError.message,
                        stderr: deployStderr
                    });
                }
                
                // 处理部署输出
                let message = deployStdout;
                if (deployStderr) {
                    console.warn(`部署警告: ${deployStderr}`);
                    message += `\n${deployStderr}`;
                }
                
                res.json({ 
                    success: true, 
                    message: message
                });
            });
        });
    } catch (error) {
        console.error('部署处理失败:', error);
        res.status(500).json({ 
            success: false, 
            error: `部署处理失败: ${error.message}` 
        });
    }
});

app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
    console.log(`当前工作目录: ${__dirname}`);
}); 