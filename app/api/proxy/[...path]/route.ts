import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "https://sui.cauchy.top"

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params
  return proxyRequest(request, resolvedParams.path, "GET")
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params
  return proxyRequest(request, resolvedParams.path, "POST")
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params
  return proxyRequest(request, resolvedParams.path, "PUT")
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params
  return proxyRequest(request, resolvedParams.path, "DELETE")
}

async function proxyRequest(request: NextRequest, pathSegments: string[], method: string) {
  try {
    const path = pathSegments.join("/")
    const url = `${BACKEND_URL}/api/${path}`

    console.log(`Proxying ${method} request to: ${url}`)

    const headers = new Headers()
    
    // Forward relevant headers including Content-Type
    const forwardHeaders = ["content-type", "authorization", "x-api-key"]
    forwardHeaders.forEach((header) => {
      const value = request.headers.get(header)
      if (value) {
        headers.set(header, value)
      }
    })

    // Set default Content-Type if not provided
    if (!headers.has("content-type")) {
      headers.set("Content-Type", "application/json")
    }

    const body = method !== "GET" ? await request.text() : undefined
    
    // 详细的调试日志输出
    console.log(`\n==================== 代理请求详情 ====================`)
    console.log(`🚀 请求方法: ${method}`)
    console.log(`🎯 目标 URL: ${url}`)
    console.log(`📋 请求头:`, Object.fromEntries(headers.entries()))
    
    if (body) {
      console.log(`📦 完整请求体内容:`)
      console.log(body)
      
      // 如果是编译请求，解析并显示 Move.toml 配置
      if (path.includes('compile') && body) {
        try {
          const requestData = JSON.parse(body)
          if (requestData.addresses_toml_content) {
            console.log(`\n🔍 Move.toml 配置内容分析:`)
            console.log(`===== TOML 原始内容 =====`)
            console.log(requestData.addresses_toml_content)
            console.log(`===== TOML 内容结束 =====`)
            
                         // 分析配置结构
             const lines = requestData.addresses_toml_content.split('\n')
             const sections: string[] = []
             const packageSections: number[] = []
             
             lines.forEach((line: string, index: number) => {
              const trimmed = line.trim()
              if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                const section = trimmed.slice(1, -1)
                sections.push(`第${index + 1}行: ${section}`)
                if (section === 'package') {
                  packageSections.push(index + 1)
                }
              }
            })
            
            console.log(`\n📊 配置结构分析:`)
            console.log(`- 总行数: ${lines.length}`)
            console.log(`- 节列表: ${sections.join(', ')}`)
            console.log(`- [package] 节位置: ${packageSections.join(', ')}`)
            console.log(`- [package] 节数量: ${packageSections.length}`)
            console.log(`- 是否有重复 [package]: ${packageSections.length > 1 ? '是 ❌' : '否 ✅'}`)
            
            console.log(`\n🔍 逐行详细分析:`)
            lines.forEach((line: string, index: number) => {
              const lineNum = index + 1
              const trimmed = line.trim()
              const isSection = trimmed.startsWith('[') && trimmed.endsWith(']')
              const isEmpty = trimmed === ''
              const marker = isSection ? '📋' : isEmpty ? '⬜' : '📝'
              console.log(`${marker} 第${lineNum}行: "${line}" ${isEmpty ? '(空行)' : ''} ${isSection ? `→ 节: ${trimmed.slice(1, -1)}` : ''}`)
            })
            
            // 检查是否有隐藏字符
            const rawBytes = Buffer.from(requestData.addresses_toml_content, 'utf8')
            console.log(`\n🔬 字节级分析:`)
            console.log(`- 原始字节长度: ${rawBytes.length}`)
            console.log(`- 字符串长度: ${requestData.addresses_toml_content.length}`)
            console.log(`- 换行符类型: ${requestData.addresses_toml_content.includes('\r\n') ? 'CRLF (\\r\\n)' : requestData.addresses_toml_content.includes('\n') ? 'LF (\\n)' : '其他'}`)
            
            // 十六进制转储（显示前128字节）
            console.log(`\n📱 十六进制转储 (前128字节):`)
            const hexDump = rawBytes.slice(0, 128).toString('hex').match(/.{2}/g)?.join(' ') || ''
            console.log(hexDump)
            
            // ASCII可视化
            console.log(`\n📝 ASCII可视化 (前128字符):`)
            const asciiViz = requestData.addresses_toml_content.slice(0, 128).split('').map((char: string) => {
              const code = char.charCodeAt(0)
              if (code === 10) return '\\n'
              if (code === 13) return '\\r'
              if (code === 9) return '\\t'
              if (code < 32 || code > 126) return `\\x${code.toString(16).padStart(2, '0')}`
              return char
            }).join('')
            console.log(asciiViz)
            
            // 模拟后端TOML解析器的行为
            console.log(`\n🎭 模拟后端TOML解析:`)
            const tomlSections = new Map<string, number[]>()
            lines.forEach((line: string, index: number) => {
              const trimmed = line.trim()
              if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                const sectionName = trimmed.slice(1, -1)
                if (!tomlSections.has(sectionName)) {
                  tomlSections.set(sectionName, [])
                }
                tomlSections.get(sectionName)!.push(index + 1)
              }
            })
            
            tomlSections.forEach((lineNumbers, sectionName) => {
              if (lineNumbers.length > 1) {
                console.log(`❌ 重复节 [${sectionName}] 在行: ${lineNumbers.join(', ')}`)
              } else {
                console.log(`✅ 节 [${sectionName}] 在第${lineNumbers[0]}行`)
              }
            })
            
            if (packageSections.length > 1) {
              console.log(`\n⚠️  警告: 检测到重复的 [package] 节!`)
              console.log(`重复位置: ${packageSections.map(line => `第${line}行`).join(', ')}`)
            }
          }
        } catch (parseError) {
          console.log(`❌ JSON 解析失败:`, parseError)
        }
      }
    }
    console.log(`=====================================================\n`)

    // Add timeout and better error handling
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      const response = await fetch(url, {
        method,
        headers,
        body,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const data = await response.text()
      
      // 详细的响应日志
      console.log(`\n==================== 代理响应详情 ====================`)
      console.log(`📊 响应状态: ${response.status}`)
      console.log(`📋 响应头:`, Object.fromEntries(response.headers.entries()))
      console.log(`📦 完整响应内容:`)
      console.log(data)
      
      // 如果是编译响应，解析错误信息
      if (path.includes('compile') && data) {
        try {
          const responseData = JSON.parse(data)
          if (!responseData.success && responseData.error_message) {
            console.log(`\n❌ 编译错误详情:`)
            console.log(`错误信息: ${responseData.error_message}`)
            
            // 特别分析 TOML 解析错误
            if (responseData.error_message.includes('Unable to parse Move package manifest')) {
              console.log(`\n🔍 TOML 解析错误分析:`)
              console.log(`这是一个 Move.toml 配置文件解析错误`)
              console.log(`常见原因: 重复的节定义、格式错误、编码问题`)
            }
            
            if (responseData.error_message.includes('redefinition of table')) {
              console.log(`\n⚠️  重复表定义错误:`)
              console.log(`错误表明配置中有重复的节定义`)
              console.log(`需要检查 [package]、[dependencies]、[addresses] 等节是否重复`)
            }
          }
        } catch (parseError) {
          console.log(`响应 JSON 解析失败:`, parseError)
        }
      }
      console.log(`=====================================================\n`)

      return new NextResponse(data, {
        status: response.status,
        headers: {
          "Content-Type": response.headers.get("Content-Type") || "application/json",
        },
      })
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      
      if (fetchError.name === 'AbortError') {
        console.error("Request timeout:", url)
        return NextResponse.json(
          { error: "请求超时 - 后端服务器响应时间过长" }, 
          { status: 504 }
        )
      }
      
      if (fetchError.code === 'ECONNRESET' || fetchError.code === 'ENOTFOUND') {
        console.error("Backend server connection failed:", fetchError.message)
        return NextResponse.json(
          { error: "无法连接到后端服务器 - 请检查服务器状态" }, 
          { status: 503 }
        )
      }
      
      throw fetchError // Re-throw other errors
    }
  } catch (error: any) {
    console.error("Proxy error:", error)
    return NextResponse.json(
      { 
        error: "代理服务器内部错误",
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      }, 
      { status: 500 }
    )
  }
}
