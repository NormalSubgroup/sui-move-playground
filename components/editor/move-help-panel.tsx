"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BookOpen, Keyboard, Code, Lightbulb } from "lucide-react"

export function MoveHelpPanel() {
  return (
    <div className="h-full">
      <div className="p-3 border-b">
        <h3 className="font-medium flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Move 语言帮助
        </h3>
        <p className="text-sm text-muted-foreground mt-1">语法提示、快捷键和最佳实践</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* 快捷键 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Keyboard className="h-4 w-4" />
                编辑器快捷键
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <div className="flex justify-between text-xs">
                <span>自动补全</span>
                <Badge variant="outline">Ctrl + Space</Badge>
              </div>
              <div className="flex justify-between text-xs">
                <span>保存文件</span>
                <Badge variant="outline">Ctrl + S</Badge>
              </div>
              <div className="flex justify-between text-xs">
                <span>格式化代码</span>
                <Badge variant="outline">Shift + Alt + F</Badge>
              </div>
              <div className="flex justify-between text-xs">
                <span>查找</span>
                <Badge variant="outline">Ctrl + F</Badge>
              </div>
              <div className="flex justify-between text-xs">
                <span>查找替换</span>
                <Badge variant="outline">Ctrl + H</Badge>
              </div>
            </CardContent>
          </Card>

          {/* 基本语法 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Code className="h-4 w-4" />
                基本语法
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div>
                <h4 className="text-xs font-medium mb-1">模块定义</h4>
                <code className="text-xs bg-muted p-1 rounded block">module package_name::module_name {'{}'}</code>
              </div>
              
              <div>
                <h4 className="text-xs font-medium mb-1">导入模块</h4>
                <code className="text-xs bg-muted p-1 rounded block">use std::string;</code>
                <code className="text-xs bg-muted p-1 rounded block">use sui::object::{'{'}Self, UID{'}'};</code>
              </div>
              
              <div>
                <h4 className="text-xs font-medium mb-1">结构体定义</h4>
                <code className="text-xs bg-muted p-1 rounded block">
                  struct MyStruct has key, store {'{'}
                  <br />
                  &nbsp;&nbsp;id: UID,
                  <br />
                  &nbsp;&nbsp;field: Type,
                  <br />
                  {'}'}
                </code>
              </div>
              
              <div>
                <h4 className="text-xs font-medium mb-1">函数定义</h4>
                <code className="text-xs bg-muted p-1 rounded block">
                  public entry fun name(param: Type) {'{'}
                  <br />
                  &nbsp;&nbsp;// 函数体
                  <br />
                  {'}'}
                </code>
              </div>
            </CardContent>
          </Card>

          {/* Sui 特定概念 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Sui Move 概念
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div>
                <h4 className="text-xs font-medium mb-1">对象能力 (Abilities)</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">key</Badge>
                    <span className="text-xs">可以作为全局存储的键</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">store</Badge>
                    <span className="text-xs">可以存储在其他对象中</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">copy</Badge>
                    <span className="text-xs">可以被复制</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">drop</Badge>
                    <span className="text-xs">可以被丢弃</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-xs font-medium mb-1">常用类型</h4>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <Badge variant="outline">UID</Badge>
                  <Badge variant="outline">address</Badge>
                  <Badge variant="outline">bool</Badge>
                  <Badge variant="outline">u8, u64</Badge>
                  <Badge variant="outline">vector&lt;T&gt;</Badge>
                  <Badge variant="outline">String</Badge>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-xs font-medium mb-1">转移函数</h4>
                <div className="space-y-1 text-xs">
                  <code className="bg-muted p-1 rounded block">transfer::public_transfer(obj, addr)</code>
                  <code className="bg-muted p-1 rounded block">transfer::share_object(obj)</code>
                  <code className="bg-muted p-1 rounded block">transfer::freeze_object(obj)</code>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 代码示例 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Code className="h-4 w-4" />
                常用代码示例
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div>
                <h4 className="text-xs font-medium mb-1">创建对象</h4>
                <code className="text-xs bg-muted p-1 rounded block">
                  let obj = MyStruct {'{'}
                  <br />
                  &nbsp;&nbsp;id: object::new(ctx),
                  <br />
                  &nbsp;&nbsp;field: value,
                  <br />
                  {'}'};
                </code>
              </div>
              
              <div>
                <h4 className="text-xs font-medium mb-1">转移对象</h4>
                <code className="text-xs bg-muted p-1 rounded block">
                  transfer::public_transfer(obj, recipient);
                  <br />
                  transfer::share_object(obj);
                </code>
              </div>
              
              <div>
                <h4 className="text-xs font-medium mb-1">发射事件</h4>
                <code className="text-xs bg-muted p-1 rounded block">
                  event::emit(MyEvent {'{'} data {'}'}); 
                </code>
              </div>
            </CardContent>
          </Card>

          {/* 最佳实践 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                最佳实践
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2 text-xs">
              <div>• 使用描述性的模块和函数名称</div>
              <div>• 为结构体添加适当的能力</div>
              <div>• 使用 entry 函数作为外部接口</div>
              <div>• 在函数前添加文档注释 (///)</div>
              <div>• 使用 assert! 进行输入验证</div>
              <div>• 使用事件记录重要状态变化</div>
              <div>• 编写单元测试验证逻辑</div>
              <div>• 使用常量定义错误码</div>
              <div>• 正确管理对象所有权</div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  )
} 