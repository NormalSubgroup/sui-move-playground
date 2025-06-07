"use client"

import { usePlayground } from "@/lib/providers/playground-provider"
import { MonacoEditor } from "./monaco-editor"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Save, Code, FileText, Clock, Palette } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { useState } from "react"

export function CodeEditor() {
  const { state, dispatch } = usePlayground()
  const { toast } = useToast()
  const [editorTheme, setEditorTheme] = useState<'move-dark' | 'vs-light'>('move-dark')

  const activeFile = state.files.find((f) => f.id === state.activeFileId)

  const handleContentChange = (content: string) => {
    if (!activeFile) return

    dispatch({
      type: "UPDATE_FILE",
      payload: { id: activeFile.id, content },
    })
  }

  const saveFile = () => {
    if (!activeFile) return

    toast({
      title: "文件已保存",
      description: `${activeFile.name} 已保存`,
    })
  }

  const toggleTheme = () => {
    setEditorTheme(prev => prev === 'move-dark' ? 'vs-light' : 'move-dark')
  }

  const getLanguageFromFileType = (type: string) => {
    switch (type) {
      case 'move':
        return 'move'
      case 'toml':
        return 'toml'
      default:
        return 'plaintext'
    }
  }

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case "move":
        return "bg-blue-100 text-blue-800"
      case "toml":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!activeFile) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/10">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium mb-2">未选择文件</h3>
          <p className="text-muted-foreground">从侧边栏选择一个文件或创建新文件开始编码</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="h-12 border-b bg-muted/30 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4" />
          <span className="font-medium">{activeFile.name}</span>
          <Badge className={cn("text-xs", getFileTypeColor(activeFile.type))}>{activeFile.type.toUpperCase()}</Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {activeFile.lastModified.toLocaleTimeString()}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={toggleTheme}>
            <Palette className="h-4 w-4 mr-1" />
            {editorTheme === 'move-dark' ? '浅色' : '深色'}
          </Button>
          <Button variant="outline" size="sm" onClick={saveFile}>
            <Save className="h-4 w-4 mr-1" />
            保存
          </Button>
        </div>
      </div>

      <div className="flex-1 relative">
        <MonacoEditor
          value={activeFile.content}
          onChange={handleContentChange}
          language={getLanguageFromFileType(activeFile.type)}
          theme={editorTheme}
        />
      </div>

      <div className="h-8 border-t bg-muted/30 flex items-center justify-between px-4 text-xs text-muted-foreground">
        <div>
          Lines: {activeFile.content.split("\n").length} | Characters: {activeFile.content.length}
        </div>
        <div>{activeFile.type === "move" ? "Sui Move" : activeFile.type.toUpperCase()}</div>
      </div>
    </div>
  )
}
