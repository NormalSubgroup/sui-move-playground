/**
 * Move语言支持
 * 基于Monaco Editor的Move语言插件
 */
import * as monaco from 'monaco-editor';

// 注册Move语言
export function registerMoveLanguage() {
  console.log("开始注册 Move 语言...");

  // 1. 注册语言
  monaco.languages.register({ id: 'move' });
  console.log("Move语言注册完成，ID:'move'");

  // 2. 定义语法高亮规则
  monaco.languages.setMonarchTokensProvider('move', {
    defaultToken: 'invalid',

    // 定义关键字
    keywords: [
      'module', 'struct', 'script', 'public', 'friend', 'native', 'fun', 'const',
      'use', 'as', 'mut', 'copy', 'move', 'return', 'abort', 'break', 'continue',
      'if', 'else', 'while', 'loop', 'let', 'has', 'resource', 'acquires',
      'phantom', 'spec', 'schema', 'assume', 'ensures', 'requires',
    ],

    // 定义类型
    typeKeywords: [
      'u8', 'u16', 'u32', 'u64', 'u128', 'u256', 'bool', 'address', 'signer', 'vector'
    ],

    // 常量
    constants: [
      'true', 'false'
    ],

    // 操作符
    operators: [
      '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=',
      '&&', '||', '++', '--', '+', '-', '*', '/', '&', '|', '^', '%',
      '<<', '>>', '+=', '-=', '*=', '/=', '&=', '|=', '^=',
      '%=', '<<=', '>>='
    ],

    // 符号
    symbols: /[=><!~?:&|+\-*\/\^%]+/,
    
    // 标识符和变量正则
    tokenizer: {
      root: [
        // 标识符和关键字
        [/[a-zA-Z_][\w$]*/, {
          cases: {
            '@keywords': 'keyword',
            '@typeKeywords': 'type',
            '@constants': 'constant',
            '@default': 'identifier'
          }
        }],
        
        // 空格和注释
        { include: '@whitespace' },
        
        // 分隔符和括号
        [/[{}()\[\]]/, '@brackets'],
        [/[;,.]/, 'delimiter'],
        
        // 数字
        [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
        [/0[xX][0-9a-fA-F]+/, 'number.hex'],
        [/\d+/, 'number'],
        
        // 操作符
        [/@symbols/, {
          cases: {
            '@operators': 'operator',
            '@default': ''
          }
        }],
        
        // 字符串
        [/"([^"\\]|\\.)*$/, 'string.invalid'], // 非终止字符串
        [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
        
        // 地址字面量，如0x1
        [/0x[0-9a-fA-F]+/, 'number.address'],
      ],
      
      // 字符串状态机
      string: [
        [/[^\\"]+/, 'string'],
        [/\\./, 'string.escape'],
        [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
      ],
      
      // 注释
      whitespace: [
        [/[ \t\r\n]+/, 'white'],
        [/\/\/.*$/, 'comment'],
        [/\/\*/, 'comment', '@comment'],
      ],
      
      comment: [
        [/[^\/*]+/, 'comment'],
        [/\/\*/, 'comment', '@push'],    // 嵌套注释开始
        [/\*\//, 'comment', '@pop'],     // 嵌套注释结束
        [/[\/*]/, 'comment'],
      ],
    }
  });
  console.log("Move语法高亮规则设置完成");

  // 3. 配置语言功能
  monaco.languages.setLanguageConfiguration('move', {
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
      { open: '"', close: '"' },
      { open: '/*', close: '*/' },
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
    ],
    folding: {
      markers: {
        start: new RegExp('^\\s*//\\s*#?region\\b'),
        end: new RegExp('^\\s*//\\s*#?endregion\\b')
      }
    },
    indentationRules: {
      increaseIndentPattern: /^.*\{[^}]*$/,
      decreaseIndentPattern: /^.*\}.*$/
    },
    wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
  });

  // 4. 配置自动完成
  monaco.languages.registerCompletionItemProvider('move', {
    provideCompletionItems: (model, position) => {
      // 获取当前行的内容，用于上下文感知的自动完成
      const textUntilPosition = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column
      });

      const suggestions = [
        ...['module', 'struct', 'script', 'public', 'friend', 'native', 'fun', 'const'].map(keyword => ({
          label: keyword,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: keyword,
          detail: `Move关键字: ${keyword}`,
          range: {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: position.column,
            endColumn: position.column
          }
        })),
        ...['use', 'as', 'mut', 'copy', 'move', 'return', 'abort', 'break', 'continue'].map(keyword => ({
          label: keyword,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: keyword,
          detail: `Move关键字: ${keyword}`,
          range: {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: position.column,
            endColumn: position.column
          }
        })),
        ...['if', 'else', 'while', 'loop', 'let', 'has', 'acquires', 'phantom'].map(keyword => ({
          label: keyword,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: keyword,
          detail: `Move关键字: ${keyword}`,
          range: {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: position.column,
            endColumn: position.column
          }
        })),
        ...['u8', 'u16', 'u32', 'u64', 'u128', 'u256', 'bool', 'address', 'signer', 'vector'].map(type => ({
          label: type,
          kind: monaco.languages.CompletionItemKind.TypeParameter,
          insertText: type,
          detail: `Move类型: ${type}`,
          range: {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: position.column,
            endColumn: position.column
          }
        })),
        {
          label: 'module',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: [
            'module ${1:examples}::${2:hello} {',
            '\t$0',
            '}'
          ].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Move模块定义',
          range: {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: position.column,
            endColumn: position.column
          }
        },
        {
          label: 'fun',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: [
            'fun ${1:function_name}(${2:params}): ${3:return_type} {',
            '\t$0',
            '}'
          ].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Move函数定义',
          range: {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: position.column,
            endColumn: position.column
          }
        },
        {
          label: 'struct',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: [
            'struct ${1:StructName} {',
            '\t${2:field_name}: ${3:field_type},',
            '\t$0',
            '}'
          ].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Move结构体定义',
          range: {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: position.column,
            endColumn: position.column
          }
        },
        {
          label: 'if',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: [
            'if (${1:condition}) {',
            '\t$0',
            '}'
          ].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Move条件语句',
          range: {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: position.column,
            endColumn: position.column
          }
        },
      ];
      return { suggestions };
    }
  });
  
  // 5. 定义Move语言的自定义主题
  monaco.editor.defineTheme('move-theme', {
    base: 'vs-dark', // 基于暗色主题
    inherit: true,   // 继承基础主题样式
    rules: [
      // 根据类型设置不同颜色 - 增强对比度和可见度
      { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },              // 关键字：蓝色加粗
      { token: 'keyword.move', foreground: '569CD6', fontStyle: 'bold' },         // 确保匹配 .move 后缀
      
      { token: 'type', foreground: '4EC9B0', fontStyle: 'bold' },                 // 类型：青绿色加粗
      { token: 'type.move', foreground: '4EC9B0', fontStyle: 'bold' },            // 确保匹配 .move 后缀
      
      { token: 'string', foreground: 'CE9178' },                                  // 字符串：橙红色
      { token: 'string.move', foreground: 'CE9178' },                             // 确保匹配 .move 后缀
      { token: 'string.quote', foreground: 'CE9178' },                            // 字符串引号
      { token: 'string.quote.move', foreground: 'CE9178' },                       // 确保匹配 .move 后缀
      { token: 'string.escape', foreground: 'D7BA7D' },                           // 字符串转义：金色
      { token: 'string.escape.move', foreground: 'D7BA7D' },                      // 确保匹配 .move 后缀
      
      { token: 'number', foreground: 'B5CEA8' },                                  // 数字：浅绿色
      { token: 'number.move', foreground: 'B5CEA8' },                             // 确保匹配 .move 后缀
      { token: 'number.hex', foreground: 'B5CEA8' },                              // 十六进制数字
      { token: 'number.hex.move', foreground: 'B5CEA8' },                         // 确保匹配 .move 后缀
      { token: 'number.float', foreground: 'B5CEA8' },                            // 浮点数
      { token: 'number.float.move', foreground: 'B5CEA8' },                       // 确保匹配 .move 后缀
      { token: 'number.address', foreground: 'DCDCAA', fontStyle: 'bold' },       // 地址：黄色加粗
      { token: 'number.address.move', foreground: 'DCDCAA', fontStyle: 'bold' },  // 确保匹配 .move 后缀
      
      { token: 'constant', foreground: '569CD6', fontStyle: 'italic' },           // 常量：蓝色斜体
      { token: 'constant.move', foreground: '569CD6', fontStyle: 'italic' },      // 确保匹配 .move 后缀
      
      { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },            // 注释：绿色斜体
      { token: 'comment.move', foreground: '6A9955', fontStyle: 'italic' },       // 确保匹配 .move 后缀
      
      { token: 'operator', foreground: 'D4D4D4' },                                // 运算符：浅灰色
      { token: 'operator.move', foreground: 'D4D4D4' },                           // 确保匹配 .move 后缀
      
      { token: 'delimiter', foreground: 'D4D4D4' },                               // 分隔符
      { token: 'delimiter.move', foreground: 'D4D4D4' },                          // 确保匹配 .move 后缀
      
      { token: 'identifier', foreground: '9CDCFE' },                              // 标识符：浅蓝色
      { token: 'identifier.move', foreground: '9CDCFE' },                         // 确保匹配 .move 后缀
      
      { token: 'invalid', foreground: 'F44747' },                                 // 无效内容：红色
      { token: 'invalid.move', foreground: 'F44747' },                            // 确保匹配 .move 后缀
      
      // 括号和括号中的内容
      { token: '@brackets', foreground: 'FFD700' },                               // 括号：金色
      { token: '@brackets.move', foreground: 'FFD700' },                          // 确保匹配 .move 后缀
      { token: 'delimiter.bracket', foreground: 'FFD700' },                       // 另一种可能的括号token名称
      { token: 'delimiter.bracket.move', foreground: 'FFD700' },                  // 确保匹配 .move 后缀
      { token: 'delimiter.curly', foreground: 'FFD700' },                         // 花括号
      { token: 'delimiter.curly.move', foreground: 'FFD700' },                    // 确保匹配 .move 后缀
      { token: 'delimiter.square', foreground: 'FFD700' },                        // 方括号
      { token: 'delimiter.square.move', foreground: 'FFD700' },                   // 确保匹配 .move 后缀
      { token: 'delimiter.parenthesis', foreground: 'FFD700' },                   // 圆括号
      { token: 'delimiter.parenthesis.move', foreground: 'FFD700' },              // 确保匹配 .move 后缀
      
      // 通配符 - 为任何 .move 后缀的token设置基本风格
      { token: '', foreground: 'D4D4D4' },                                        // 默认文本颜色
    ],
    colors: {
      // UI 颜色设置 - 保持不变
      'editor.foreground': '#D4D4D4',
      'editor.background': '#1E1E1E',
      'editor.selectionBackground': '#264F78',
      'editor.lineHighlightBackground': '#2A2D2E',
      'editorCursor.foreground': '#AEAFAD',
      'editorWhitespace.foreground': '#3B4048'
    }
  });
  console.log("Move主题定义完成: 'move-theme'");
  
  // 尝试立即设置主题
  monaco.editor.setTheme('move-theme');
  console.log("已尝试设置主题为'move-theme'");
} 