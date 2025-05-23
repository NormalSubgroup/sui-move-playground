import type { 
  CompileRequest, 
  CompileResponse, 
  DeployRequest, 
  DeployResponse, 
  TestRequest, 
  TestResponse 
} from '../types/api';
import { API_BASE_URL, API_PATHS, API_TIMEOUT } from './config';

// 通用的API请求处理函数
async function fetchAPI<T, R>(endpoint: string, data: T): Promise<R> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API调用失败：${response.status} ${response.statusText}`);
    }

    return await response.json() as R;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('请求超时，请稍后重试');
    }
    
    console.error('API调用错误:', error);
    throw error;
  }
}

// 编译Move代码
export async function compileCode(request: CompileRequest): Promise<CompileResponse> {
  return fetchAPI<CompileRequest, CompileResponse>(API_PATHS.COMPILE, request);
}

// 部署Move代码
export async function deployCode(request: DeployRequest): Promise<DeployResponse> {
  return fetchAPI<DeployRequest, DeployResponse>(API_PATHS.DEPLOY, request);
}

// 测试Move代码
export async function testCode(request: TestRequest): Promise<TestResponse> {
  return fetchAPI<TestRequest, TestResponse>(API_PATHS.TEST, request);
}

// 示例代码列表
export const codeExamples = [
  {
    name: 'HelloWorld',
    description: '简单的Hello World示例',
    code: `module examples::hello {
    use std::string;
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    
    /// Hello对象，包含一个字符串
    struct Hello has key, store {
        id: UID,
        message: string::String
    }
    
    /// 铸造一个包含"Hello, World!"消息的对象并转移给发送者
    public entry fun mint(ctx: &mut TxContext) {
        let hello = Hello {
            id: object::new(ctx),
            message: string::utf8(b"Hello, World!")
        };
        transfer::public_transfer(hello, tx_context::sender(ctx));
    }
}`
  },
  {
    name: 'Counter',
    description: '简单的计数器示例',
    code: `module examples::counter {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    
    struct Counter has key, store {
        id: UID,
        value: u64
    }
    
    public entry fun create(ctx: &mut TxContext) {
        let counter = Counter {
            id: object::new(ctx),
            value: 0
        };
        transfer::public_transfer(counter, tx_context::sender(ctx));
    }
    
    public entry fun increment(counter: &mut Counter) {
        counter.value = counter.value + 1;
    }
}`
  },
  {
    name: 'BasicTypes',
    description: 'Move语言基本类型和操作演示',
    code: `module examples::basic_types {
    // 基本类型示例
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    
    // 一个包含各种基本类型的结构体
    struct TypeShowcase has key, store {
        id: UID,
        // 整数类型
        u8_value: u8,
        u16_value: u16,
        u32_value: u32,
        u64_value: u64,
        u128_value: u128,
        u256_value: u256,
        // 布尔类型
        bool_value: bool,
        // 地址类型
        address_value: address
    }
    
    // 创建一个包含示例值的TypeShowcase对象
    public entry fun create_showcase(ctx: &mut TxContext) {
        let showcase = TypeShowcase {
            id: object::new(ctx),
            u8_value: 255, // u8最大值
            u16_value: 65535, // u16最大值
            u32_value: 4294967295, // u32最大值
            u64_value: 18446744073709551615, // u64最大值
            u128_value: 340282366920938463463374607431768211455, // u128最大值
            u256_value: 115792089237316195423570985008687907853269984665640564039457584007913129639935, // u256最大值
            bool_value: true,
            address_value: tx_context::sender(ctx)
        };
        transfer::public_transfer(showcase, tx_context::sender(ctx));
    }
    
    // 演示算术运算
    public fun perform_arithmetic(a: u64, b: u64): (u64, u64, u64, u64) {
        let sum = a + b;
        let difference = if (a > b) { a - b } else { b - a };
        let product = a * b;
        let quotient = if (b != 0) { a / b } else { 0 };
        
        (sum, difference, product, quotient)
    }
    
    // 演示位运算
    public fun perform_bitwise(a: u64, b: u64): (u64, u64, u64, u64) {
        let bitwise_and = a & b;
        let bitwise_or = a | b;
        let bitwise_xor = a ^ b;
        let left_shift = a << 1;
        
        (bitwise_and, bitwise_or, bitwise_xor, left_shift)
    }
}`
  },
  {
    name: 'Vector操作',
    description: 'Move中Vector(动态数组)的基本操作',
    code: `module examples::vector_operations {
    use std::vector;
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    
    // 存储一个整数向量的对象
    struct VectorContainer has key, store {
        id: UID,
        values: vector<u64>
    }
    
    // 创建一个空的向量容器
    public entry fun create_empty(ctx: &mut TxContext) {
        let container = VectorContainer {
            id: object::new(ctx),
            values: vector::empty<u64>()
        };
        transfer::public_transfer(container, tx_context::sender(ctx));
    }
    
    // 创建一个带有初始值的向量容器
    public entry fun create_with_values(ctx: &mut TxContext) {
        let values = vector::empty<u64>();
        
        // 添加一些值
        vector::push_back(&mut values, 10);
        vector::push_back(&mut values, 20);
        vector::push_back(&mut values, 30);
        
        let container = VectorContainer {
            id: object::new(ctx),
            values
        };
        transfer::public_transfer(container, tx_context::sender(ctx));
    }
    
    // 向容器中添加值
    public entry fun add_value(container: &mut VectorContainer, value: u64) {
        vector::push_back(&mut container.values, value);
    }
    
    // 移除最后一个值
    public entry fun remove_last(container: &mut VectorContainer) {
        if (!vector::is_empty(&container.values)) {
            vector::pop_back(&mut container.values);
        }
    }
    
    // 获取向量长度
    public fun get_length(container: &VectorContainer): u64 {
        vector::length(&container.values)
    }
    
    // 检查向量是否包含特定值
    public fun contains(container: &VectorContainer, value: u64): bool {
        let i = 0;
        let len = vector::length(&container.values);
        
        while (i < len) {
            if (*vector::borrow(&container.values, i) == value) {
                return true
            };
            i = i + 1;
        };
        
        false
    }
}`
  }
]; 