"use client"

import { Button } from "@/components/ui/button"
import { usePlayground } from "@/lib/providers/playground-provider"
import { usePlaygroundActions } from "@/lib/hooks/use-playground-actions"
import { useMobile } from "@/lib/hooks/use-mobile"
import { Menu, Play, TestTube, Rocket, Github, Settings } from "lucide-react"

export function Header() {
  const { state, dispatch } = usePlayground()
  const { compileCode, runTests, deployContract, isCompiling, isTesting, isDeploying } = usePlaygroundActions()
  const isMobile = useMobile()

  const activeFile = state.files.find((f) => f.id === state.activeFileId)

  return (
    <header className="h-14 border-b bg-background flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => dispatch({ type: "TOGGLE_SIDEBAR" })}>
          <Menu className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          <div className="text-lg font-semibold">Sui Move Playground</div>
          {activeFile && <div className="text-sm text-muted-foreground">{activeFile.name}</div>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!isMobile && (
          <>
            <Button variant="outline" size="sm" onClick={compileCode} disabled={isCompiling || !activeFile}>
              <Play className="h-4 w-4 mr-1" />
              {isCompiling ? "Compiling..." : "Compile"}
            </Button>

            <Button variant="outline" size="sm" onClick={runTests} disabled={isTesting || !activeFile}>
              <TestTube className="h-4 w-4 mr-1" />
              {isTesting ? "Testing..." : "Test"}
            </Button>

            <Button variant="outline" size="sm" onClick={deployContract} disabled={isDeploying || !activeFile}>
              <Rocket className="h-4 w-4 mr-1" />
              {isDeploying ? "Deploying..." : "Deploy"}
            </Button>
          </>
        )}

        <Button variant="ghost" size="sm">
          <Github className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
