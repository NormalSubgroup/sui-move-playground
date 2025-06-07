// Move 语言代码片段和模板
export const moveSnippets = [
  {
    label: 'entry function',
    kind: 15, // Snippet
    insertText: `public entry fun \${1:function_name}(\${2:params}, ctx: &mut TxContext) {
    \${3:// 函数体}
}`,
    insertTextRules: 4,
    documentation: '创建一个入口函数模板'
  },
  {
    label: 'view function',
    kind: 15,
    insertText: `public fun \${1:function_name}(\${2:params}): \${3:ReturnType} {
    \${4:// 函数体}
}`,
    insertTextRules: 4,
    documentation: '创建一个只读函数模板'
  },
  {
    label: 'init function',
    kind: 15,
    insertText: `fun init(ctx: &mut TxContext) {
    \${1:// 模块初始化逻辑}
}`,
    insertTextRules: 4,
    documentation: '创建模块初始化函数'
  },
  {
    label: 'event struct',
    kind: 15,
    insertText: `struct \${1:EventName} has copy, drop {
    \${2:field}: \${3:Type},
    \${4:// 更多字段}
}`,
    insertTextRules: 4,
    documentation: '创建事件结构体模板'
  },
  {
    label: 'capability struct',
    kind: 15,
    insertText: `struct \${1:CapabilityName} has key {
    id: UID,
}`,
    insertTextRules: 4,
    documentation: '创建权限控制结构体模板'
  },
  {
    label: 'error constants',
    kind: 15,
    insertText: `/// Error codes
const E\${1:INVALID_OPERATION}: u64 = 0;
const E\${2:INSUFFICIENT_BALANCE}: u64 = 1;
const E\${3:UNAUTHORIZED}: u64 = 2;`,
    insertTextRules: 4,
    documentation: '创建错误常量模板'
  },
  {
    label: 'create shared object',
    kind: 15,
    insertText: `let \${1:object_name} = \${2:StructName} {
    id: object::new(ctx),
    \${3:// 其他字段}
};
transfer::share_object(\${1:object_name});`,
    insertTextRules: 4,
    documentation: '创建并共享对象模板'
  },
  {
    label: 'assert with error',
    kind: 15,
    insertText: `assert!(\${1:condition}, E\${2:ERROR_CODE});`,
    insertTextRules: 4,
    documentation: '断言检查模板'
  },
  {
    label: 'coin handling',
    kind: 15,
    insertText: `use sui::coin::{Self, Coin};
use sui::sui::SUI;

// 在函数参数中
payment: Coin<SUI>,

// 检查金额
let payment_value = coin::value(&payment);
assert!(payment_value >= \${1:required_amount}, E\${2:INSUFFICIENT_PAYMENT});

// 转移给接收者
transfer::public_transfer(payment, \${3:recipient});`,
    insertTextRules: 4,
    documentation: 'SUI 代币处理模板'
  },
  {
    label: 'vector operations',
    kind: 15,
    insertText: `use std::vector;

let mut \${1:vec_name} = vector::empty<\${2:Type}>();
vector::push_back(&mut \${1:vec_name}, \${3:value});

// 遍历向量
let i = 0;
let len = vector::length(&\${1:vec_name});
while (i < len) {
    let item = vector::borrow(&\${1:vec_name}, i);
    \${4:// 处理 item}
    i = i + 1;
};`,
    insertTextRules: 4,
    documentation: '向量操作模板'
  },
  {
    label: 'option handling',
    kind: 15,
    insertText: `use std::option::{Self, Option};

let \${1:opt_value}: Option<\${2:Type}> = \${3:some_function()};

if (option::is_some(&\${1:opt_value})) {
    let value = option::extract(&mut \${1:opt_value});
    \${4:// 使用 value}
};`,
    insertTextRules: 4,
    documentation: 'Option 类型处理模板'
  },
  {
    label: 'table operations',
    kind: 15,
    insertText: `use sui::table::{Self, Table};

// 在结构体中
\${1:table_name}: Table<\${2:KeyType}, \${3:ValueType}>,

// 初始化
\${1:table_name}: table::new(ctx),

// 添加条目
table::add(&mut object.\${1:table_name}, \${4:key}, \${5:value});

// 检查是否存在
if (table::contains(&object.\${1:table_name}, \${4:key})) {
    let value = table::borrow(&object.\${1:table_name}, \${4:key});
    \${6:// 使用 value}
};`,
    insertTextRules: 4,
    documentation: 'Table 数据结构操作模板'
  }
]

// 常用的 Sui 模块导入
export const suiImports = [
  {
    label: 'use sui core',
    insertText: `use sui::object::{Self, UID};
use sui::transfer;
use sui::tx_context::{Self, TxContext};`,
    documentation: '导入 Sui 核心模块'
  },
  {
    label: 'use std essentials',
    insertText: `use std::string::{Self, String};
use std::vector;
use std::option::{Self, Option};`,
    documentation: '导入标准库基础模块'
  },
  {
    label: 'use sui advanced',
    insertText: `use sui::coin::{Self, Coin};
use sui::balance::{Self, Balance};
use sui::table::{Self, Table};
use sui::event;
use sui::clock::{Self, Clock};`,
    documentation: '导入 Sui 高级功能模块'
  },
  {
    label: 'use test modules',
    insertText: `use sui::test_scenario::{Self, Scenario};
use sui::test_utils;`,
    documentation: '导入测试相关模块'
  }
] 