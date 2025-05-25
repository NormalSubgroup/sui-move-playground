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
    // use sui::object::{Self, UID};
    // use sui::transfer;
    // use sui::tx_context::{Self, TxContext};
    
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
    
    public struct Counter has key, store {
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
    name: 'CounterCar',
    description: '对象创建与转移（Ownership & Abilities）',
    code: `module examples::counter_car {
    /// 一个带有 has key 能力的计数器对象
    public struct Counter has key {
        id: UID,
        value: u64,
    }

    /// 一个带有 has key 能力的汽车对象
    public struct Car has key {
        id: UID,
        brand: vector<u8>,
    }

    /// 创建一个 Counter 对象并存储到调用者账户
    public entry fun create_counter(ctx: &mut TxContext) {
        let counter = Counter {
            id: object::new(ctx),
            value: 0,
        };
        // 将 Counter 对象传递给调用者（存入账户）
        transfer::transfer(counter, tx_context::sender(ctx));
    }

    /// 创建一个 Car 对象并转移给指定地址
    public entry fun create_and_transfer_car(recipient: address, brand: vector<u8>, ctx: &mut TxContext) {
        let car = Car {
            id: object::new(ctx),
            brand,
        };
        transfer::transfer(car, recipient);
    }
}`
  },
  {
    name: 'AdminCapability',
    description: '能力（Capability）设计模式',
    code: `module examples::admin_capability {

    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};

    /// 管理员能力对象，只能由模块发布者持有
    public struct AdminCap has key {
        id: UID,
    }

    /// 初始化函数，只能由模块发布者调用，创建 AdminCap
    fun init(ctx: &mut TxContext) {
        // 只允许模块发布者调用
        let cap = AdminCap { id: object::new(ctx) };
        transfer::transfer(cap, tx_context::sender(ctx));
    }

    /// 只有持有 AdminCap 的账户才能调用的受保护操作
    public entry fun admin_only_action(cap: AdminCap, ctx: &mut TxContext) {
        // 这里可以执行只有管理员能做的操作
        // 使用完毕后，cap 需要归还给调用者
        transfer::transfer(cap, tx_context::sender(ctx));
    }
}`
  }
]; 