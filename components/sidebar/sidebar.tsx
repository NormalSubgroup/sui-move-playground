"use client"

import { usePlayground } from "@/lib/providers/playground-provider"
import { FileManager } from "./file-manager"
import { ExampleSelector } from "./example-selector"
import { ConfigEditor } from "./config-editor"
import { MoveHelpPanel } from "../editor/move-help-panel"
import { Button } from "@/components/ui/button"
import { Files, BookOpen, Settings, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const { state, dispatch } = usePlayground()

  const navItems = [
    { id: "files", label: "Files", icon: Files },
    { id: "examples", label: "Examples", icon: BookOpen },
    { id: "config", label: "Config", icon: Settings },
    { id: "help", label: "Help", icon: HelpCircle },
  ]

  const renderContent = () => {
    switch (state.activeTab) {
      case "files":
        return <FileManager />
      case "examples":
        return <ExampleSelector />
      case "config":
        return <ConfigEditor />
      case "help":
        return <MoveHelpPanel />
      default:
        return <FileManager />
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* 垂直导航栏 */}
      <div className="p-2 border-b bg-muted/50">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={state.activeTab === item.id ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "w-full justify-start gap-2 text-sm",
                  state.activeTab === item.id 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                )}
                onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: item.id as any })}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Button>
            )
          })}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  )
}
