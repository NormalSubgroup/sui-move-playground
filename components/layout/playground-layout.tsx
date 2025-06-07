"use client"

import { usePlayground } from "@/lib/providers/playground-provider"
import { useMobile, useSmallScreen } from "@/lib/hooks/use-mobile"
import { Sidebar } from "@/components/sidebar/sidebar"
import { CodeEditor } from "@/components/editor/code-editor"
import { ResultPanel } from "@/components/result/result-panel"
import { Header } from "@/components/header/header"
import { cn } from "@/lib/utils"

export function PlaygroundLayout() {
  const { state, dispatch } = usePlayground()
  const isMobile = useMobile()
  const isSmallScreen = useSmallScreen()

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar - 只在大屏幕时作为布局元素，小屏幕时作为覆盖层 */}
        {!isSmallScreen && (
          <div
            className={cn(
              "transition-all duration-300 ease-in-out border-r bg-muted/30 flex-shrink-0",
              state.sidebarOpen ? "w-64" : "w-0"
            )}
          >
            {state.sidebarOpen && <Sidebar />}
          </div>
        )}

        {/* 小屏幕侧边栏覆盖层 */}
        {isSmallScreen && state.sidebarOpen && (
          <div 
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => dispatch({ type: "TOGGLE_SIDEBAR" })}
          >
            <div 
              className="w-80 h-full bg-background border-r"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar />
            </div>
          </div>
        )}

        {/* Main Content - 响应式布局 */}
        <div className={cn(
          "flex-1 flex overflow-hidden min-w-0",
          // 小屏幕：垂直布局，大屏幕：水平布局
          isSmallScreen ? "flex-col" : "flex-row"
        )}>
          {/* Code Editor */}
          <div className="flex-1 min-h-0 min-w-0">
            <CodeEditor />
          </div>

          {/* Result Panel - 响应式面板 */}
          <div className={cn(
            "bg-muted/30 transition-all duration-300 ease-in-out flex-shrink-0",
            // 响应式边框
            isSmallScreen ? "border-t" : "border-l",
            // 响应式尺寸
            isSmallScreen 
              ? "h-1/3 w-full" // 小屏幕：占高度的 33%
              : state.resultPanelExpanded 
                ? "w-1/2 h-full" // 大屏幕展开：占一半宽度
                : "w-80 h-full" // 大屏幕收缩：固定宽度
          )}>
            <ResultPanel />
          </div>
        </div>
      </div>
    </div>
  )
}
