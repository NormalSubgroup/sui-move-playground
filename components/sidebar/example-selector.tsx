"use client"

import { usePlayground } from "@/lib/providers/playground-provider"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Download } from "lucide-react"
import type { FileItem } from "@/lib/types"

const EXAMPLES = [
  {
    id: "hello-world",
    title: "Hello World",
    description: "带有对象创建和转移的 Sui Move Hello World",
    files: [
      {
        name: "hello_world.move",
        content: `module examples::hello {
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
    
    /// 获取Hello对象的消息内容
    public fun get_message(hello: &Hello): &string::String {
        &hello.message
    }
    
    /// 更新Hello对象的消息内容
    public entry fun update_message(hello: &mut Hello, new_message: vector<u8>) {
        hello.message = string::utf8(new_message);
    }
    
    #[test]
    fun test_mint() {
        use sui::test_scenario;
        
        let admin = @0xCAFE;
        let mut scenario_val = test_scenario::begin(admin);
        let scenario = &mut scenario_val;
        
        {
            let ctx = test_scenario::ctx(scenario);
            mint(ctx);
        };
        
        test_scenario::next_tx(scenario, admin);
        {
            let hello = test_scenario::take_from_sender<Hello>(scenario);
            let message = get_message(&hello);
            assert!(string::bytes(message) == b"Hello, World!", 0);
            test_scenario::return_to_sender(scenario, hello);
        };
        
        test_scenario::end(scenario_val);
    }
}`,
      },
    ],
  },
  {
    id: "simple-nft",
    title: "Simple NFT",
    description: "简单的 NFT 铸造合约",
    files: [
      {
        name: "simple_nft.move",
        content: `module examples::simple_nft {
    use std::string::{Self, String};
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::url::{Self, Url};
    use sui::event;
    
    /// NFT 对象
    struct SimpleNFT has key, store {
        id: UID,
        name: String,
        description: String,
        image_url: Url,
        creator: address,
    }
    
    /// NFT 铸造事件
    struct NFTMinted has copy, drop {
        nft_id: address,
        creator: address,
        name: String,
    }
    
    /// 铸造新的 NFT
    public entry fun mint_nft(
        name: vector<u8>,
        description: vector<u8>,
        image_url: vector<u8>,
        ctx: &mut TxContext
    ) {
        let creator = tx_context::sender(ctx);
        let nft = SimpleNFT {
            id: object::new(ctx),
            name: string::utf8(name),
            description: string::utf8(description),
            image_url: url::new_unsafe_from_bytes(image_url),
            creator,
        };
        
        let nft_id = object::uid_to_address(&nft.id);
        
        // 发射铸造事件
        event::emit(NFTMinted {
            nft_id,
            creator,
            name: nft.name,
        });
        
        // 转移给铸造者
        transfer::public_transfer(nft, creator);
    }
    
    /// 转移 NFT 给其他用户
    public entry fun transfer_nft(nft: SimpleNFT, recipient: address) {
        transfer::public_transfer(nft, recipient);
    }
    
    /// 获取 NFT 名称
    public fun name(nft: &SimpleNFT): &String {
        &nft.name
    }
    
    /// 获取 NFT 描述
    public fun description(nft: &SimpleNFT): &String {
        &nft.description
    }
    
    /// 获取 NFT 图片 URL
    public fun image_url(nft: &SimpleNFT): &Url {
        &nft.image_url
    }
    
    /// 获取 NFT 创建者
    public fun creator(nft: &SimpleNFT): address {
        nft.creator
    }
}`,
      },
    ],
  },
  {
    id: "counter",
    title: "Counter Contract",
    description: "带共享对象的计数器合约",
    files: [
      {
        name: "counter.move",
        content: `module counter::counter {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    
    struct Counter has key {
        id: UID,
        value: u64,
    }
    
    public fun create(ctx: &mut TxContext) {
        let counter = Counter {
            id: object::new(ctx),
            value: 0,
        };
        transfer::share_object(counter);
    }
    
    public fun increment(counter: &mut Counter) {
        counter.value = counter.value + 1;
    }
    
    public fun decrement(counter: &mut Counter) {
        if (counter.value > 0) {
            counter.value = counter.value - 1;
        };
    }
    
    public fun value(counter: &Counter): u64 {
        counter.value
    }
}`,
      },
    ],
  },
]

export function ExampleSelector() {
  const { dispatch } = usePlayground()

  const loadExample = (example: (typeof EXAMPLES)[0]) => {
    const files: FileItem[] = example.files.map((file, index) => ({
      id: `example-${example.id}-${index}`,
      name: file.name,
      content: file.content,
      type: "move" as const,
      path: file.name,
      lastModified: new Date(),
    }))

    dispatch({ type: "SET_FILES", payload: files })
    if (files.length > 0) {
      dispatch({ type: "SET_ACTIVE_FILE", payload: files[0].id })
    }
  }

  return (
    <div className="h-full">
      <div className="p-3 border-b">
        <h3 className="font-medium flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Example Code
        </h3>
        <p className="text-sm text-muted-foreground mt-1">Load example Move contracts to get started</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {EXAMPLES.map((example) => (
            <Card key={example.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{example.title}</CardTitle>
                <CardDescription className="text-xs">{example.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="outline" size="sm" onClick={() => loadExample(example)} className="w-full">
                  <Download className="h-3 w-3 mr-1" />
                  Load Example
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
