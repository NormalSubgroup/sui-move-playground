"use client"

import { usePlayground } from "@/lib/providers/playground-provider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Clock, Rocket, TestTube, Code, AlertTriangle, ExternalLink, ChevronLeft, ChevronRight, Info } from "lucide-react"
import { cn } from "@/lib/utils"

function ParsedErrorMessage({ message }: { message: string }) {
  // 解析不同类型的错误信息
  if (message.includes("redefinition of table")) {
    const match = message.match(/redefinition of table `(\w+)`/)
    const tableName = match ? match[1] : "unknown"
    
    return (
      <div className="space-y-2">
        <div className="font-medium">Move.toml 配置错误</div>
        <div>检测到重复的配置节: <code className="bg-red-100 px-1 rounded">[{tableName}]</code></div>
        <div className="border-l-2 border-yellow-400 bg-yellow-50 p-2 text-yellow-800 text-xs">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium">解决方案：</div>
              <ol className="list-decimal list-inside mt-1 space-y-1">
                <li>检查您的 Move.toml 配置</li>
                <li>确保每个节（如 [package]、[dependencies]、[addresses]）只定义一次</li>
                <li>点击"Config"标签页中的"Reset"按钮恢复默认配置</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (message.includes("Unable to parse Move package manifest")) {
    return (
      <div className="space-y-2">
        <div className="font-medium">Move.toml 解析错误</div>
        <div>配置文件格式不正确</div>
        <div className="border-l-2 border-blue-400 bg-blue-50 p-2 text-blue-800 text-xs">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium">建议：</div>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>检查 TOML 语法是否正确</li>
                <li>确保字符串使用正确的引号</li>
                <li>点击"Reset"按钮恢复默认配置</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 对于其他错误，显示原始消息但格式化
  return (
    <div className="space-y-2">
      <div className="font-medium">编译错误</div>
      <pre className="whitespace-pre-wrap font-mono text-xs bg-white p-2 rounded border">
        {message}
      </pre>
    </div>
  )
}

export function ResultPanel() {
  const { state, dispatch } = usePlayground()

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 border-b">
        <h3 className="text-sm font-medium text-muted-foreground">输出结果</h3>
        <div className="hidden lg:block">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch({ type: "TOGGLE_RESULT_PANEL" })}
            className="h-8 w-8 p-0 hover:bg-accent"
            title={state.resultPanelExpanded ? "收起面板" : "展开面板"}
          >
            {state.resultPanelExpanded ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      <Tabs defaultValue="compile" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 m-2">
          <TabsTrigger value="compile" className="flex items-center gap-1">
            <Code className="h-4 w-4" />
            Compile
            {state.compileResult && (
              <div
                className={cn("w-2 h-2 rounded-full", state.compileResult.success ? "bg-green-500" : "bg-red-500")}
              />
            )}
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-1">
            <TestTube className="h-4 w-4" />
            Test
            {state.testResult && (
              <div className={cn("w-2 h-2 rounded-full", state.testResult.success ? "bg-green-500" : "bg-red-500")} />
            )}
          </TabsTrigger>
          <TabsTrigger value="deploy" className="flex items-center gap-1">
            <Rocket className="h-4 w-4" />
            Deploy
            {state.deployResult && (
              <div className={cn("w-2 h-2 rounded-full", state.deployResult.success ? "bg-green-500" : "bg-red-500")} />
            )}
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="compile" className="h-full m-0">
            <CompileResults />
          </TabsContent>
          <TabsContent value="test" className="h-full m-0">
            <TestResults />
          </TabsContent>
          <TabsContent value="deploy" className="h-full m-0">
            <DeployResults />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

function CompileResults() {
  const { state } = usePlayground()

  if (state.isCompiling) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-8 w-8 mx-auto mb-2 animate-spin" />
          <p>Compiling...</p>
        </div>
      </div>
    )
  }

  if (!state.compileResult) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Code className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No compilation results yet</p>
          <p className="text-sm">Click compile to see results</p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          {state.compileResult.success ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          <Badge variant={state.compileResult.success ? "default" : "destructive"}>
            {state.compileResult.success ? "Success" : "Failed"}
          </Badge>
        </div>

        <div className="space-y-3">
          {state.compileResult.success && (
            <>
              <div>
                <h4 className="font-medium mb-1">编译时间</h4>
                <p className="text-sm text-muted-foreground">{state.compileResult.compile_time_ms}ms</p>
              </div>

              {state.compileResult.module_names.length > 0 && (
                <div>
                  <h4 className="font-medium mb-1">模块名称</h4>
                  <div className="space-y-1">
                    {state.compileResult.module_names.map((name, index) => (
                      <div key={index} className="text-sm bg-blue-50 text-blue-800 p-2 rounded">
                        {name} ({state.compileResult!.bytecode_size[index]} bytes)
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {state.compileResult.bytecode_base64.length > 0 && (
                <div>
                  <h4 className="font-medium mb-1">字节码 (Base64)</h4>
                  <div className="space-y-2">
                    {state.compileResult.bytecode_base64.map((bytecode, index) => (
                      <div key={index}>
                        <div className="text-xs text-muted-foreground mb-1">
                          {state.compileResult!.module_names[index]}
                        </div>
                        <code className="text-xs bg-muted p-2 rounded block font-mono break-all">
                          {bytecode}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {!state.compileResult.success && state.compileResult.error_message && (
            <div>
              <h4 className="font-medium mb-1 flex items-center gap-1">
                <XCircle className="h-4 w-4 text-red-500" />
                错误信息
              </h4>
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
                <ParsedErrorMessage message={state.compileResult.error_message} />
              </div>
            </div>
          )}

          {state.compileResult.warnings && state.compileResult.warnings.length > 0 && (
            <div>
              <h4 className="font-medium mb-1 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                警告
              </h4>
              <div className="space-y-1">
                {state.compileResult.warnings.map((warning, index) => (
                  <div key={index} className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                    {warning}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  )
}

function TestResults() {
  const { state } = usePlayground()

  if (state.isTesting) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-8 w-8 mx-auto mb-2 animate-spin" />
          <p>Running tests...</p>
        </div>
      </div>
    )
  }

  if (!state.testResult) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <TestTube className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No test results yet</p>
          <p className="text-sm">Click test to run tests</p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          {state.testResult.success ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          <Badge variant={state.testResult.success ? "default" : "destructive"}>
            {state.testResult.testsPassed}/{state.testResult.testsRun} Passed
          </Badge>
        </div>

        {state.testResult.details && state.testResult.details.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Test Details</h4>
            {state.testResult.details.map((test, index) => (
              <div
                key={index}
                className={cn(
                  "p-2 rounded text-sm",
                  test.status === "passed"
                    ? "bg-green-50 text-green-800"
                    : test.status === "failed"
                      ? "bg-red-50 text-red-800"
                      : "bg-yellow-50 text-yellow-800",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono">{test.name}</span>
                  <span className="text-xs">{test.duration}</span>
                </div>
                {test.error && <div className="mt-1 text-xs opacity-75">{test.error}</div>}
              </div>
            ))}
          </div>
        )}

        {state.testResult.output && (
          <div className="mt-4">
            <h4 className="font-medium mb-1">Output</h4>
            <pre className="text-xs bg-muted p-2 rounded font-mono overflow-auto">{state.testResult.output}</pre>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}

function DeployResults() {
  const { state } = usePlayground()

  if (state.isDeploying) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-8 w-8 mx-auto mb-2 animate-spin" />
          <p>Deploying contract...</p>
        </div>
      </div>
    )
  }

  if (!state.deployResult) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Rocket className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No deployment results yet</p>
          <p className="text-sm">Click deploy to deploy contract</p>
        </div>
      </div>
    )
  }

  // 如果展开了并且有完整输出，使用不同的布局
  if (state.resultPanelExpanded && state.deployResult.success && state.deployResult.output) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 mb-4">
            {state.deployResult.success ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <Badge variant={state.deployResult.success ? "default" : "destructive"}>
              {state.deployResult.success ? "Deployed" : "Failed"}
            </Badge>
          </div>

          <div className="space-y-3">
            {state.deployResult.package_id && (
              <div>
                <h4 className="font-medium mb-1">Package ID</h4>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted p-2 rounded flex-1 font-mono break-all">
                    {state.deployResult.package_id}
                  </code>
                  <a
                    href={`https://suiscan.xyz/testnet/object/${state.deployResult.package_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    浏览器查看
                  </a>
                </div>
              </div>
            )}

            {state.deployResult.transaction_digest && (
              <div>
                <h4 className="font-medium mb-1">Transaction Digest</h4>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted p-2 rounded flex-1 font-mono break-all">
                    {state.deployResult.transaction_digest}
                  </code>
                  <a
                    href={`https://suiscan.xyz/testnet/tx/${state.deployResult.transaction_digest}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    交易详情
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 完整输出区域，占用剩余空间 */}
        <div className="flex-1 flex flex-col p-4">
          <h4 className="font-medium mb-2">完整部署输出</h4>
          <div className="flex-1 border rounded bg-muted/50">
            <ScrollArea className="h-full">
              <pre className="text-xs p-4 font-mono whitespace-pre-wrap leading-relaxed">
                {state.deployResult.output}
              </pre>
            </ScrollArea>
          </div>
        </div>
      </div>
    )
  }

  // 默认布局（非展开状态）
  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          {state.deployResult.success ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          <Badge variant={state.deployResult.success ? "default" : "destructive"}>
            {state.deployResult.success ? "Deployed" : "Failed"}
          </Badge>
        </div>

        <div className="space-y-3">
          {state.deployResult.package_id && (
            <div>
              <h4 className="font-medium mb-1">Package ID</h4>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-muted p-2 rounded flex-1 font-mono break-all">
                  {state.deployResult.package_id}
                </code>
                <a
                  href={`https://suiscan.xyz/testnet/object/${state.deployResult.package_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  浏览器查看
                </a>
              </div>
            </div>
          )}

          {state.deployResult.transaction_digest && (
            <div>
              <h4 className="font-medium mb-1">Transaction Digest</h4>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-muted p-2 rounded flex-1 font-mono break-all">
                  {state.deployResult.transaction_digest}
                </code>
                <a
                  href={`https://suiscan.xyz/testnet/tx/${state.deployResult.transaction_digest}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  交易详情
                </a>
              </div>
            </div>
          )}

          {state.deployResult.gasUsed && (
            <div>
              <h4 className="font-medium mb-1">Gas Used</h4>
              <p className="text-sm text-muted-foreground">{state.deployResult.gasUsed}</p>
            </div>
          )}

          {state.deployResult.error && (
            <div>
              <h4 className="font-medium mb-1">Error</h4>
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{state.deployResult.error}</div>
            </div>
          )}

          {state.deployResult.success && state.deployResult.output && (
            <div>
              <h4 className="font-medium mb-1">完整部署输出</h4>
              <ScrollArea className="max-h-64 border rounded">
                <pre className="text-xs bg-muted p-3 font-mono whitespace-pre-wrap leading-relaxed">
                  {state.deployResult.output}
                </pre>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  )
}
