"use client"

import type React from "react"
import { useState } from "react"
import { usePlayground } from "@/lib/providers/playground-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Upload, File, FileText, Settings, Trash2, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { FileItem } from "@/lib/types"

export function FileManager() {
  const { state, dispatch } = usePlayground()
  const [newFileName, setNewFileName] = useState("")
  const [showNewFile, setShowNewFile] = useState(false)

  const getFileIcon = (type: string) => {
    switch (type) {
      case "move":
        return <File className="h-4 w-4 text-blue-500" />
      case "toml":
        return <Settings className="h-4 w-4 text-orange-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const createNewFile = () => {
    if (!newFileName.trim()) return

    const fileType = newFileName.endsWith(".move") ? "move" : newFileName.endsWith(".toml") ? "toml" : "md"

    const newFile: FileItem = {
      id: Date.now().toString(),
      name: newFileName,
      content: fileType === "move" ? "// New Move file\nmodule hello_world {\n    // Your code here\n}" : "",
      type: fileType as any,
      path: newFileName,
      lastModified: new Date(),
    }

    dispatch({ type: "ADD_FILE", payload: newFile })
    dispatch({ type: "SET_ACTIVE_FILE", payload: newFile.id })
    setNewFileName("")
    setShowNewFile(false)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const fileType = file.name.endsWith(".move") ? "move" : file.name.endsWith(".toml") ? "toml" : "md"

      const newFile: FileItem = {
        id: Date.now().toString(),
        name: file.name,
        content,
        type: fileType as any,
        path: file.name,
        lastModified: new Date(),
      }

      dispatch({ type: "ADD_FILE", payload: newFile })
      dispatch({ type: "SET_ACTIVE_FILE", payload: newFile.id })
    }
    reader.readAsText(file)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b">
        <div className="flex gap-2 mb-3">
          <Button variant="outline" size="sm" onClick={() => setShowNewFile(true)} className="flex-1">
            <Plus className="h-4 w-4 mr-1" />
            New File
          </Button>

          <Button variant="outline" size="sm" onClick={() => document.getElementById("file-upload")?.click()}>
            <Upload className="h-4 w-4" />
          </Button>

          <input
            id="file-upload"
            type="file"
            accept=".move,.toml,.md,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {showNewFile && (
          <div className="flex gap-2">
            <Input
              placeholder="filename.move"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") createNewFile()
                if (e.key === "Escape") setShowNewFile(false)
              }}
              autoFocus
            />
            <Button size="sm" onClick={createNewFile}>
              Create
            </Button>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {state.files.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <File className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No files yet</p>
              <p className="text-sm">Create a new file or upload one</p>
            </div>
          ) : (
            <div className="space-y-1">
              {state.files.map((file) => (
                <div
                  key={file.id}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-muted/50 group",
                    state.activeFileId === file.id && "bg-muted",
                  )}
                  onClick={() => dispatch({ type: "SET_ACTIVE_FILE", payload: file.id })}
                >
                  {getFileIcon(file.type)}
                  <span className="flex-1 text-sm truncate">{file.name}</span>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          dispatch({ type: "DELETE_FILE", payload: file.id })
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
