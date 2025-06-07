export const moveLanguageDefinition = {
  // 设置语言的基本属性
  defaultToken: '',
  tokenPostfix: '.move',

  // 关键字定义
  keywords: [
    // 模块和导入
    'module', 'use', 'as', 'public', 'friend',
    
    // 函数相关
    'fun', 'entry', 'native', 'inline',
    
    // 结构和类型
    'struct', 'has',
    
    // 控制流
    'if', 'else', 'while', 'loop', 'break', 'continue', 'return',
    
    // 变量和常量
    'let', 'mut', 'const',
    
    // 能力和修饰符
    'acquires', 'moves', 'copyable',
    
    // 泛型
    'phantom',
    
    // 测试相关
    'test', 'test_only',
    
    // Sui Move 特有关键字
    'Self', 'new', 'init', 
    
    // 其他
    'abort', 'assert', 'spec', 'pragma', 'invariant', 'ensures', 'requires',
    'global', 'exists', 'borrow_global', 'borrow_global_mut', 'move_from', 'move_to'
  ],

  // 能力关键字（单独分类）
  abilityKeywords: [
    'key', 'store', 'copy', 'drop'
  ],

  // 类型关键字
  typeKeywords: [
    'address', 'signer', 'bool', 'u8', 'u16', 'u32', 'u64', 'u128', 'u256', 'vector'
  ],

  // Sui 特有类型
  suiTypes: [
    'UID', 'ID', 'TxContext', 'String', 'Option', 'VecMap', 'VecSet', 'Table', 'Bag', 'ObjectBag'
  ],

  // Sui 常用模块
  suiModules: [
    'object', 'transfer', 'tx_context', 'string', 'event', 'clock', 'coin', 'balance', 'url', 'package'
  ],

  // 操作符
  operators: [
    '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=',
    '&&', '||', '++', '--', '+', '-', '*', '/', '&', '|', '^', '%',
    '<<', '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=', '^=',
    '%=', '<<=', '>>=', '>>>='
  ],

  // 符号
  symbols: /[=><!~?:&|+\-*\/\^%]+/,



  // 词法分析器规则
  tokenizer: {
    root: [
      // 模块声明识别
      [/\bmodule\s+([a-zA-Z_][a-zA-Z0-9_]*::)?[a-zA-Z_][a-zA-Z0-9_]*/, 'keyword', '@module_context'],
      
      // 函数声明识别
      [/\b(public\s+)?(entry\s+)?fun\s+/, 'keyword', '@function_context'],
      
      // 结构体声明识别
      [/\bstruct\s+/, 'keyword', '@struct_context'],
      
      // 能力关键字特殊处理
      [/\b(key|store|copy|drop)\b/, 'keyword.ability'],
      
      // 常量声明
      [/\bconst\s+[A-Z_][A-Z0-9_]*/, 'constant'],
      
      // 函数调用识别 (identifier followed by ::)
      [/[a-z_][a-zA-Z0-9_]*(?=::)/, {
        cases: {
          '@suiModules': 'identifier.module.sui',
          '@default': 'identifier.module'
        }
      }],
      
      // 函数调用识别 (identifier followed by ()  )
      [/[a-z_][a-zA-Z0-9_]*(?=\s*\()/, 'identifier.function'],
      
      // 宏调用识别 (identifier followed by !)
      [/[a-z_][a-zA-Z0-9_]*!/, 'identifier.macro'],
      
      // 字段访问识别 (identifier preceded by .)
      [/(?<=\.)[a-z_][a-zA-Z0-9_]*/, 'identifier.field'],
      
      // 地址字面量 - 特殊处理
      [/0x[0-9a-fA-F]{1,64}\b/, 'number.address'],
      
      // 标识符和关键字
      [/[a-z_$][\w$]*/, {
        cases: {
          '@typeKeywords': 'keyword.type',
          '@keywords': 'keyword',
          '@abilityKeywords': 'keyword.ability',
          '@default': 'identifier'
        }
      }],
      
      // 大写标识符（类型名和特殊标识符）
      [/[A-Z][\w\$]*/, {
        cases: {
          '@suiTypes': 'type.identifier',
          '@default': 'type.identifier'
        }
      }],

      // 空白字符
      { include: '@whitespace' },

      // 分隔符和操作符
      [/[{}()\[\]]/, 'delimiter.bracket'],
      [/[;]/, 'delimiter.semicolon'],
      [/[,]/, 'delimiter.comma'],
      [/[<>](?!@symbols)/, 'delimiter.bracket'],
      [/@symbols/, {
        cases: {
          '@operators': 'operator',
          '@default': 'delimiter'
        }
      }],

      // 数字
      [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
      [/0[xX][0-9a-fA-F]+/, 'number.hex'],
      [/\d+/, 'number'],

      // 字节字符串
      [/b"([^"\\]|\\.)*"/, 'string'],
      [/b"([^"\\]|\\.)*$/, 'string.invalid'],
      [/b"/, { token: 'string.quote', bracket: '@open', next: '@bytestring' }],

      // 字符串
      [/"([^"\\]|\\.)*$/, 'string.invalid'],  // 未闭合的字符串
      [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],

      // 字符
      [/'[^\\']'/, 'string'],
      [/'\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4})'/, 'string'],
      [/'/, 'string.invalid'],

      // 命名地址
      [/@[a-zA-Z][a-zA-Z0-9_]*/, 'number.address']
    ],

    // 模块上下文
    module_context: [
      [/[a-zA-Z_][a-zA-Z0-9_]*/, 'identifier.module'],
      [/::/, 'delimiter'],
      [/\s/, '', '@pop'],
      [/./, '', '@pop']
    ],

    // 函数上下文
    function_context: [
      [/[a-zA-Z_][a-zA-Z0-9_]*/, 'identifier.function'],
      [/\s/, ''],
      [/\(/, 'delimiter.bracket', '@pop'],
      [/./, '', '@pop']
    ],

    // 结构体上下文
    struct_context: [
      [/[A-Z][a-zA-Z0-9_]*/, 'identifier.struct'],
      [/\s/, ''],
      [/\{|has/, '', '@pop'],
      [/./, '', '@pop']
    ],

    comment: [
      [/@[a-zA-Z][a-zA-Z0-9_]*/, 'comment.annotation'],
      [/[^\/*@]+/, 'comment'],
      [/\/\*/, 'comment', '@push'],
      ["\\*/", 'comment', '@pop'],
      [/[\/*]/, 'comment']
    ],

    string: [
      [/[^\\"]+/, 'string'],
      [/\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
    ],

    bytestring: [
      [/[^\\"]+/, 'string'],
      [/\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,2})/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
    ],

    whitespace: [
      [/[ \t\r\n]+/, 'white'],
      [/\/\*/, 'comment', '@comment'],
      [/\/\/.*$/, 'comment'],
    ],
  },
}

// 自动补全提供器
export const moveCompletionProvider = {
  provideCompletionItems: (model: any, position: any) => {
    const suggestions = [
      // 基本关键字
      {
        label: 'module',
        kind: 14, // Keyword
        insertText: 'module ${1:package_name}::${2:module_name} {\n\t$0\n}',
        insertTextRules: 4, // InsertAsSnippet
        documentation: '定义一个新的 Move 模块'
      },
      {
        label: 'use',
        kind: 14,
        insertText: 'use ${1:package}::${2:module};',
        insertTextRules: 4,
        documentation: '导入其他模块'
      },
      {
        label: 'public fun',
        kind: 14,
        insertText: 'public fun ${1:function_name}(${2:parameters}) {\n\t$0\n}',
        insertTextRules: 4,
        documentation: '定义一个公共函数'
      },
      {
        label: 'public entry fun',
        kind: 14,
        insertText: 'public entry fun ${1:function_name}(${2:parameters}) {\n\t$0\n}',
        insertTextRules: 4,
        documentation: '定义一个公共入口函数'
      },
      {
        label: 'struct',
        kind: 14,
        insertText: 'struct ${1:StructName} has ${2:key, store} {\n\t${3:field}: ${4:Type},\n}',
        insertTextRules: 4,
        documentation: '定义一个结构体'
      },

      // Sui 特定的导入
      {
        label: 'use sui::object',
        kind: 9, // Module
        insertText: 'use sui::object::{Self, UID};',
        documentation: '导入 Sui 对象模块'
      },
      {
        label: 'use sui::transfer',
        kind: 9,
        insertText: 'use sui::transfer;',
        documentation: '导入 Sui 转移模块'
      },
      {
        label: 'use sui::tx_context',
        kind: 9,
        insertText: 'use sui::tx_context::{Self, TxContext};',
        documentation: '导入 Sui 交易上下文模块'
      },
      {
        label: 'use std::string',
        kind: 9,
        insertText: 'use std::string::{Self, String};',
        documentation: '导入标准字符串模块'
      },

      // 常用类型
      {
        label: 'UID',
        kind: 7, // Class
        insertText: 'UID',
        documentation: 'Sui 唯一标识符类型'
      },
      {
        label: 'TxContext',
        kind: 7,
        insertText: 'TxContext',
        documentation: 'Sui 交易上下文类型'
      },
      {
        label: 'String',
        kind: 7,
        insertText: 'String',
        documentation: '字符串类型'
      },

      // 常用函数
      {
        label: 'object::new',
        kind: 2, // Method
        insertText: 'object::new(${1:ctx})',
        insertTextRules: 4,
        documentation: '创建新的 UID'
      },
      {
        label: 'transfer::public_transfer',
        kind: 2,
        insertText: 'transfer::public_transfer(${1:object}, ${2:recipient});',
        insertTextRules: 4,
        documentation: '公开转移对象'
      },
      {
        label: 'tx_context::sender',
        kind: 2,
        insertText: 'tx_context::sender(${1:ctx})',
        insertTextRules: 4,
        documentation: '获取交易发送者地址'
      },
      {
        label: 'string::utf8',
        kind: 2,
        insertText: 'string::utf8(b"${1:text}")',
        insertTextRules: 4,
        documentation: '创建 UTF-8 字符串'
      },

      // 更多常用函数
      {
        label: 'string::utf8',
        kind: 2,
        insertText: 'string::utf8(b"${1:text}")',
        insertTextRules: 4,
        documentation: '创建 UTF-8 字符串'
      },
      {
        label: 'object::uid_to_address',
        kind: 2,
        insertText: 'object::uid_to_address(&${1:uid})',
        insertTextRules: 4,
        documentation: '将 UID 转换为地址'
      },
      {
        label: 'transfer::share_object',
        kind: 2,
        insertText: 'transfer::share_object(${1:object});',
        insertTextRules: 4,
        documentation: '共享对象，使其可被任何人访问'
      },
      {
        label: 'event::emit',
        kind: 2,
        insertText: 'event::emit(${1:event});',
        insertTextRules: 4,
        documentation: '发射事件'
      },
      {
        label: 'assert!',
        kind: 2,
        insertText: 'assert!(${1:condition}, ${2:error_code});',
        insertTextRules: 4,
        documentation: '断言条件为真，否则中止执行'
      },

      // 更多类型
      {
        label: 'vector<u8>',
        kind: 7,
        insertText: 'vector<u8>',
        documentation: '字节向量类型'
      },
      {
        label: 'Option<T>',
        kind: 7,
        insertText: 'option::Option<${1:T}>',
        insertTextRules: 4,
        documentation: '可选类型'
      },

      // 代码模板
      {
        label: 'hello world module',
        kind: 15, // Snippet
        insertText: `module \${1:examples}::hello {
    use std::string;
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    
    /// Hello对象，包含一个字符串
    struct Hello has key, store {
        id: UID,
        message: string::String
    }
    
    /// 铸造一个包含"Hello, World!"消息的对象并发给发送者
    public entry fun mint(ctx: &mut TxContext) {
        let hello = Hello {
            id: object::new(ctx),
            message: string::utf8(b"Hello, World!")
        };
        transfer::public_transfer(hello, tx_context::sender(ctx));
    }
}`,
        insertTextRules: 4,
        documentation: '创建一个 Hello World 模块模板'
      },
      {
        label: 'nft module template',
        kind: 15,
        insertText: `module \${1:examples}::nft {
    use std::string::{Self, String};
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::url::{Self, Url};
    use sui::event;
    
    struct NFT has key, store {
        id: UID,
        name: String,
        description: String,
        image_url: Url,
        creator: address,
    }
    
    struct NFTMinted has copy, drop {
        nft_id: address,
        creator: address,
        name: String,
    }
    
    public entry fun mint_nft(
        name: vector<u8>,
        description: vector<u8>,
        image_url: vector<u8>,
        ctx: &mut TxContext
    ) {
        let creator = tx_context::sender(ctx);
        let nft = NFT {
            id: object::new(ctx),
            name: string::utf8(name),
            description: string::utf8(description),
            image_url: url::new_unsafe_from_bytes(image_url),
            creator,
        };
        
        event::emit(NFTMinted {
            nft_id: object::uid_to_address(&nft.id),
            creator,
            name: nft.name,
        });
        
        transfer::public_transfer(nft, creator);
    }
}`,
        insertTextRules: 4,
        documentation: '创建一个 NFT 模块模板'
      },
      {
        label: 'test function',
        kind: 15,
        insertText: `#[test]
fun test_\${1:function_name}() {
    use sui::test_scenario;
    
    let admin = @0xCAFE;
    let mut scenario_val = test_scenario::begin(admin);
    let scenario = &mut scenario_val;
    
    {
        \${2:// 测试逻辑}
    };
    
    test_scenario::end(scenario_val);
}`,
        insertTextRules: 4,
        documentation: '创建测试函数模板'
      }
    ]

    return { suggestions }
  }
}

// 主题配置
export const moveTheme = {
  base: 'vs-dark' as const,
  inherit: true,
  rules: [
    // 关键字 - 紫色，加粗
    { token: 'keyword', foreground: 'C586C0', fontStyle: 'bold' },
    // 类型关键字 - 青绿色，加粗
    { token: 'keyword.type', foreground: '4EC9B0', fontStyle: 'bold' },
    // 普通标识符 - 浅蓝色
    { token: 'identifier', foreground: '9CDCFE' },
    // 类型标识符 - 青绿色，加粗
    { token: 'type.identifier', foreground: '4EC9B0', fontStyle: 'bold' },
    // 函数名 - 明亮黄色，加粗
    { token: 'identifier.function', foreground: 'DCDCAA', fontStyle: 'bold' },
    // 模块名 - 橙色，加粗
    { token: 'identifier.module', foreground: 'D19A66', fontStyle: 'bold' },
    // Sui 模块名 - 特殊青色，加粗
    { token: 'identifier.module.sui', foreground: '56B6C2', fontStyle: 'bold' },
    // 宏名 - 明亮紫色，加粗
    { token: 'identifier.macro', foreground: 'C678DD', fontStyle: 'bold' },
    // 结构体名 - 青绿色，加粗
    { token: 'identifier.struct', foreground: '4EC9B0', fontStyle: 'bold' },
    // 变量名 - 浅蓝色
    { token: 'identifier.variable', foreground: '9CDCFE' },
    // 字段名 - 浅蓝色
    { token: 'identifier.field', foreground: '87CEEB' },
    // 常量 - 紫色，加粗
    { token: 'constant', foreground: 'C586C0', fontStyle: 'bold' },
    // 数字 - 浅绿色
    { token: 'number', foreground: 'B5CEA8' },
    { token: 'number.hex', foreground: 'B5CEA8' },
    // 字符串 - 橙色
    { token: 'string', foreground: 'CE9178' },
    { token: 'string.escape', foreground: 'D7BA7D' },
    // 注释 - 绿色，斜体
    { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
    // 注释中的注解 - 亮绿色，加粗
    { token: 'comment.annotation', foreground: '98C379', fontStyle: 'bold' },
    // 操作符 - 白色
    { token: 'operator', foreground: 'D4D4D4' },
    // 分隔符 - 灰色
    { token: 'delimiter', foreground: 'D4D4D4' },
    // 括号 - 黄色
    { token: 'delimiter.bracket', foreground: 'FFD700' },
    // 分号和逗号 - 白色
    { token: 'delimiter.semicolon', foreground: 'D4D4D4' },
    { token: 'delimiter.comma', foreground: 'D4D4D4' },
    // 地址字面量 - 亮绿色，加粗
    { token: 'number.address', foreground: '98C379', fontStyle: 'bold' },
    // 能力关键字 - 特殊紫色，加粗
    { token: 'keyword.ability', foreground: 'E06C75', fontStyle: 'bold' },
  ],
  colors: {
    'editor.background': '#1E1E1E',
    'editor.foreground': '#D4D4D4',
    'editor.lineHighlightBackground': '#2D2D30',
    'editor.selectionBackground': '#264F78',
    'editorCursor.foreground': '#AEAFAD',
    'editorWhitespace.foreground': '#404040',
  }
} 