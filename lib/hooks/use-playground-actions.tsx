"use client"

import { useCallback } from "react"
import { usePlayground } from "@/lib/providers/playground-provider"
import { apiService } from "@/lib/services/api-service"
import { useToast } from "@/hooks/use-toast"
import type { CompileRequest, TestRequest, DeployRequest } from "@/lib/types"

export function usePlaygroundActions() {
  const { state, dispatch } = usePlayground()
  const { toast } = useToast()

  const compileCode = useCallback(async () => {
    const activeFile = state.files.find((f) => f.id === state.activeFileId)
    if (!activeFile) {
      toast({
        title: "No file selected",
        description: "Please select a Move file to compile",
        variant: "destructive",
      })
      return
    }

    if (activeFile.type !== "move") {
      toast({
        title: "Invalid file type",
        description: "Only Move files can be compiled",
        variant: "destructive",
      })
      return
    }

    dispatch({ type: "SET_COMPILE_LOADING", payload: true })

    try {
      const request: CompileRequest = {
        source_code: activeFile.content,
        file_name: activeFile.name,
        addresses_toml_content: state.config,
      }

      const result = await apiService.compile(request)

      dispatch({ type: "SET_COMPILE_RESULT", payload: result })

      if (result.success) {
        toast({
          title: "Compilation successful",
          description: "Your Move code compiled successfully",
        })
      } else {
        toast({
          title: "Compilation failed",
          description: result.error_message || "Compilation failed",
          variant: "destructive",
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"

      dispatch({
        type: "SET_COMPILE_RESULT",
        payload: {
          success: false,
          bytecode_base64: [],
          module_names: [],
          bytecode_size: [],
          compile_time_ms: 0,
          error_message: errorMessage,
          warnings: [],
          bytecode_path: null,
        },
      })

      toast({
        title: "Compilation error",
        description: "Failed to connect to compiler service",
        variant: "destructive",
      })
    }
  }, [state.files, state.activeFileId, state.config, dispatch, toast])

  const runTests = useCallback(async () => {
    // Debug log to check state
    console.log("Test button clicked, compile result:", state.compileResult)
    
    // First check if we have a successful compilation with bytecode path
    if (!state.compileResult?.success || !state.compileResult.bytecode_path) {
      toast({
        title: "Compilation required",
        description: "Please compile your code successfully before running tests",
        variant: "destructive",
      })
      return
    }

    dispatch({ type: "SET_TEST_LOADING", payload: true })

    try {
      const request: TestRequest = {
        command: `sui move test --path ${state.compileResult.bytecode_path}`,
      }

      const result = await apiService.test(request)

      dispatch({ type: "SET_TEST_RESULT", payload: result })

      toast({
        title: "Tests completed",
        description: `${result.testsPassed}/${result.testsRun} tests passed`,
        variant: result.success ? "default" : "destructive",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"

      dispatch({
        type: "SET_TEST_RESULT",
        payload: {
          success: false,
          testsRun: 0,
          testsPassed: 0,
          testsFailed: 0,
          details: [],
          output: errorMessage,
        },
      })

      toast({
        title: "Test execution failed",
        description: "Failed to connect to test service",
        variant: "destructive",
      })
    }
  }, [state.compileResult, dispatch, toast])

  const deployContract = useCallback(async () => {
    if (!state.compileResult?.success || !state.compileResult.bytecode_path) {
      toast({
        title: "No bytecode available",
        description: "Please compile your code successfully before deploying",
        variant: "destructive",
      })
      return
    }

    dispatch({ type: "SET_DEPLOY_LOADING", payload: true })

    try {
      const request: DeployRequest = {
        command: `sui client publish ${state.compileResult.bytecode_path} --gas-budget 100000000`,
      }

      const result = await apiService.deploy(request)

      // Parse output to extract package_id and transaction digest
      let processedResult = { ...result }
      if (result.success && result.output) {
        // Extract Transaction Digest
        const digestMatch = result.output.match(/Transaction Digest: ([^\s\n]+)/)
        if (digestMatch) {
          processedResult.transaction_digest = digestMatch[1]
        }

        // Extract Package ID from the output
        const packageMatch = result.output.match(/Package ID: ([^\s\n]+)/)
        if (packageMatch) {
          processedResult.package_id = packageMatch[1]
        } else {
          // Try to extract from Created Objects section
          const createdMatch = result.output.match(/Created Objects:[^│]*?│\s*([0-9a-fx]+)\s*│\s*Package\s*│/i)
          if (createdMatch) {
            processedResult.package_id = createdMatch[1]
          }
        }
      }

      dispatch({ type: "SET_DEPLOY_RESULT", payload: processedResult })

      if (result.success) {
        toast({
          title: "部署成功",
          description: processedResult.package_id 
            ? `合约已部署，Package ID: ${processedResult.package_id}`
            : "合约部署成功",
        })
      } else {
        toast({
          title: "部署失败",
          description: result.error || "未知部署错误",
          variant: "destructive",
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"

      dispatch({
        type: "SET_DEPLOY_RESULT",
        payload: {
          success: false,
          package_id: null,
          error: errorMessage,
        },
      })

      toast({
        title: "Deployment error",
        description: "Failed to connect to deployment service",
        variant: "destructive",
      })
    }
  }, [state.compileResult, state.config, dispatch, toast])

  return {
    compileCode,
    runTests,
    deployContract,
    isCompiling: state.isCompiling,
    isTesting: state.isTesting,
    isDeploying: state.isDeploying,
  }
}
