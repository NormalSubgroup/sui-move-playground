"use client"

import { usePlayground } from "@/lib/providers/playground-provider"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Settings, Save, RotateCcw, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"

export function ConfigEditor() {
  const { state, dispatch } = usePlayground()
  const { toast } = useToast()
  const [debugInfo, setDebugInfo] = useState("")

  useEffect(() => {
    // 调试信息：显示当前配置的详细信息
    const lines = state.config.split('\n')
    const packageSections = lines.filter(line => line.trim() === '[package]')
    
    const debug = `
调试信息:
- 配置长度: ${state.config.length} 字符
- 总行数: ${lines.length}
- [package] 节出现次数: ${packageSections.length}
- 是否包含重复节: ${packageSections.length > 1 ? '是' : '否'}
    `.trim()
    
    setDebugInfo(debug)
  }, [state.config])

  const validateConfig = (config: string): { isValid: boolean; error?: string } => {
    try {
      // 基本的 TOML 格式检查
      const lines = config.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'))
      const sections: string[] = []
      
      for (const line of lines) {
        const trimmed = line.trim()
        
        // 检查是否是节标题
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          const section = trimmed.slice(1, -1)
          if (sections.includes(section)) {
            return { isValid: false, error: `重复的节: [${section}]` }
          }
          sections.push(section)
        }
      }
      
      // 检查必需的节
      if (!sections.includes('package')) {
        return { isValid: false, error: '缺少 [package] 节' }
      }
      
      return { isValid: true }
    } catch (error) {
      return { isValid: false, error: '配置格式错误' }
    }
  }

  const saveConfig = () => {
    const validation = validateConfig(state.config)
    
    if (!validation.isValid) {
      toast({
        title: "配置验证失败",
        description: validation.error,
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Configuration saved",
      description: "Move.toml configuration has been updated.",
    })
  }

  const resetConfig = () => {
    const defaultConfig = `[package]
name = "test"
version = "0.0.1"

[addresses]
test = "0x2"`

    dispatch({ type: "SET_CONFIG", payload: defaultConfig })
    toast({
      title: "Configuration reset",
      description: "Move.toml has been reset to default values.",
    })
  }

  const forceReset = () => {
    // 强制重置，清除可能的缓存问题
    const defaultConfig = `[package]
name = "move_counter"
version = "0.0.1"

[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "framework/testnet" }

[addresses]
move_counter = "0x2"`

    // 清除本地存储
    if (typeof window !== 'undefined') {
      localStorage.removeItem('playground-state')
      localStorage.removeItem('playground-config')
    }
    
    dispatch({ type: "SET_CONFIG", payload: defaultConfig })
    
    toast({
      title: "强制重置完成",
      description: "已清除缓存并重置配置，请刷新页面",
    })
    
    // 建议用户刷新页面
    setTimeout(() => {
      if (confirm("建议刷新页面以确保配置完全重置，是否刷新？")) {
        window.location.reload()
      }
    }, 1000)
  }

  const validation = validateConfig(state.config)

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b">
        <h3 className="font-medium flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Move.toml Configuration
        </h3>
        <p className="text-sm text-muted-foreground mt-1">Configure addresses and dependencies</p>
      </div>

      <div className="flex-1 flex flex-col p-3">
        {/* 验证状态 */}
        {!validation.isValid && (
          <div className="mb-3 p-2 bg-destructive/10 border border-destructive/20 rounded flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-destructive">配置错误:</p>
              <p className="text-destructive/80">{validation.error}</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-3">
          <Button variant="outline" size="sm" onClick={saveConfig}>
            <Save className="h-3 w-3 mr-1" />
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={resetConfig}>
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
          {/* Force Reset 按钮已隐藏，使用代理层日志调试 */}
        </div>

        <div className="flex-1">
          <Textarea
            value={state.config}
            onChange={(e) => dispatch({ type: "SET_CONFIG", payload: e.target.value })}
            className="h-full font-mono text-sm resize-none"
            placeholder={`[package]
name = "test"
version = "0.0.1"

[addresses]
test = "0x2"`}
          />
          
          {/* 调试信息 */}
          <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
            <pre className="whitespace-pre-wrap">{debugInfo}</pre>
          </div>
          
          <div className="mt-2 text-xs text-muted-foreground">
            <p>⚠️ 注意：不要重复定义同一个节（如 [package]）</p>
            <p>💡 提示：如果问题持续，请使用 "Force Reset" 按钮清除缓存</p>
            <p>🔧 如果仍有问题，请刷新浏览器页面</p>
          </div>
        </div>
      </div>
    </div>
  )
}
