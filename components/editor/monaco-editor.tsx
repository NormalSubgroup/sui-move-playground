"use client"

import { useRef, useEffect, useState } from 'react'
import Editor from '@monaco-editor/react'
import { moveLanguageDefinition, moveCompletionProvider, moveTheme } from '@/lib/monaco/move-language'
import { moveSnippets, suiImports } from '@/lib/constants/move-snippets'

interface MonacoEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
  theme?: string
  options?: any
}

export function MonacoEditor({ 
  value, 
  onChange, 
  language = 'move',
  theme = 'move-dark',
  options = {}
}: MonacoEditorProps) {
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleEditorDidMount = (editor: any, monacoInstance: any) => {
    editorRef.current = editor
    monacoRef.current = monacoInstance

    try {
      // 注册 Move 语言
      if (!monacoInstance.languages.getLanguages().some((lang: any) => lang.id === 'move')) {
        monacoInstance.languages.register({ id: 'move' })
        
        // 设置语言配置
        monacoInstance.languages.setMonarchTokensProvider('move', moveLanguageDefinition)
      
      // 设置语言特性
      monacoInstance.languages.setLanguageConfiguration('move', {
        comments: {
          lineComment: '//',
          blockComment: ['/*', '*/']
        },
        brackets: [
          ['{', '}'],
          ['[', ']'],
          ['(', ')']
        ],
        autoClosingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"', notIn: ['string'] },
          { open: "'", close: "'", notIn: ['string', 'comment'] }
        ],
        surroundingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"' },
          { open: "'", close: "'" }
        ],
        indentationRules: {
          increaseIndentPattern: /^(.*\{[^}]*|\s*\))$/,
          decreaseIndentPattern: /^(.*\}.*|\s*\))$/
        },
        wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
      })

      // 注册自动补全提供器
      monacoInstance.languages.registerCompletionItemProvider('move', {
        provideCompletionItems: (model: any, position: any) => {
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: position.column,
            endColumn: position.column
          }

          const suggestions = [
            // 基本关键字
            {
              label: 'module',
              kind: 14, // Keyword
              insertText: 'module ${1:package_name}::${2:module_name} {\n\t$0\n}',
              insertTextRules: 4, // InsertAsSnippet
              range: range,
              documentation: '定义一个新的 Move 模块'
            },
            {
              label: 'use',
              kind: 14,
              insertText: 'use ${1:package}::${2:module};',
              insertTextRules: 4,
              range: range,
              documentation: '导入其他模块'
            },
            {
              label: 'public fun',
              kind: 14,
              insertText: 'public fun ${1:function_name}(${2:parameters}) {\n\t$0\n}',
              insertTextRules: 4,
              range: range,
              documentation: '定义一个公共函数'
            },
            {
              label: 'public entry fun',
              kind: 14,
              insertText: 'public entry fun ${1:function_name}(${2:parameters}) {\n\t$0\n}',
              insertTextRules: 4,
              range: range,
              documentation: '定义一个公共入口函数'
            },
            {
              label: 'struct',
              kind: 14,
              insertText: 'struct ${1:StructName} has ${2:key, store} {\n\t${3:field}: ${4:Type},\n}',
              insertTextRules: 4,
              range: range,
              documentation: '定义一个结构体'
            },
            // Sui 特定的导入
            {
              label: 'use sui::object',
              kind: 9, // Module
              insertText: 'use sui::object::{Self, UID};',
              range: range,
              documentation: '导入 Sui 对象模块'
            },
            {
              label: 'use sui::transfer',
              kind: 9,
              insertText: 'use sui::transfer;',
              range: range,
              documentation: '导入 Sui 转移模块'
            },
            {
              label: 'use sui::tx_context',
              kind: 9,
              insertText: 'use sui::tx_context::{Self, TxContext};',
              range: range,
              documentation: '导入 Sui 交易上下文模块'
            },
            {
              label: 'use std::string',
              kind: 9,
              insertText: 'use std::string::{Self, String};',
              range: range,
              documentation: '导入标准字符串模块'
            },
            // 添加导入模板
            ...suiImports.map(item => ({
              ...item,
              kind: 9,
              range: range
            })),
            // 添加代码片段
            ...moveSnippets.map(item => ({
              ...item,
              range: range
            }))
          ]

          return { suggestions }
        }
      })
    }

    // 注册 TOML 语言支持
    if (!monacoInstance.languages.getLanguages().some((lang: any) => lang.id === 'toml')) {
      monacoInstance.languages.register({ id: 'toml' })
      
      // 简单的 TOML 语法支持
      monacoInstance.languages.setMonarchTokensProvider('toml', {
        tokenizer: {
          root: [
            [/\[.*\]/, 'keyword'], // 节 (sections)
            [/[a-zA-Z_][\w_]*(?=\s*=)/, 'variable.name'], // 键
            [/".*?"/, 'string'], // 字符串
            [/'.*?'/, 'string'], // 单引号字符串
            [/\d+/, 'number'], // 数字
            [/true|false/, 'constant.language'], // 布尔值
            [/#.*$/, 'comment'], // 注释
          ]
        }
      })

      monacoInstance.languages.setLanguageConfiguration('toml', {
        comments: {
          lineComment: '#'
        },
        brackets: [
          ['[', ']']
        ],
        autoClosingPairs: [
          { open: '[', close: ']' },
          { open: '"', close: '"' },
          { open: "'", close: "'" }
        ]
      })
    }

    // 定义并应用主题
    try {
      monacoInstance.editor.defineTheme('move-dark', moveTheme)
    } catch (e) {
      // 主题可能已经存在
    }

    // 设置编辑器选项
    editor.updateOptions({
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
      lineNumbers: 'on',
      minimap: { enabled: false },
      wordWrap: 'on',
      automaticLayout: true,
      tabSize: 4,
      insertSpaces: true,
      detectIndentation: false,
      scrollBeyondLastLine: false,
      renderWhitespace: 'selection',
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: 'on',
      quickSuggestions: {
        other: true,
        comments: false,
        strings: false
      },
      ...options
    })

    // 设置键盘快捷键
    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS, () => {
      console.log('Save triggered')
    })

    // 添加代码格式化快捷键
    editor.addCommand(monacoInstance.KeyMod.Shift | monacoInstance.KeyMod.Alt | monacoInstance.KeyCode.KeyF, () => {
      const action = editor.getAction('editor.action.formatDocument')
      if (action) {
        action.run()
      }
    })
    } catch (error) {
      console.error('Failed to initialize Monaco Editor with Move language support:', error)
    }
  }

  const handleChange = (value: string | undefined) => {
    onChange(value || '')
  }

  const defaultOptions: any = {
    selectOnLineNumbers: true,
    mouseWheelZoom: true,
    cursorSmoothCaretAnimation: 'on',
    cursorBlinking: 'smooth',
    renderLineHighlight: 'all',
    smoothScrolling: true,
    contextmenu: true,
    copyWithSyntaxHighlighting: true,
    ...options
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">加载 Move 编辑器...</p>
        </div>
      </div>
    )
  }

  return (
    <Editor
      height="100%"
      language={language}
      theme={theme}
      value={value}
      onChange={handleChange}
      onMount={handleEditorDidMount}
      options={defaultOptions}
      loading={
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">加载 Move 编辑器...</p>
          </div>
        </div>
      }
    />
  )
} 