"use client"

import type React from "react"

import { createContext, useContext, useReducer, type ReactNode } from "react"

// 状态类型定义
interface FileItem {
  id: string
  name: string
  content: string
  type: "move" | "toml" | "md"
  path: string
}

interface CompileResult {
  success: boolean
  message: string
  bytecode?: string
  errors?: string[]
}

interface PlaygroundState {
  // 文件管理
  files: FileItem[]
  activeFileId: string | null

  // 编译状态
  isCompiling: boolean
  compileResult: CompileResult | null

  // 部署状态
  isDeploying: boolean
  deployResult: any | null

  // 测试状态
  isTesting: boolean
  testResult: any | null

  // UI状态
  sidebarOpen: boolean
  activeTab: "files" | "examples" | "config"
}

type PlaygroundAction =
  | { type: "SET_FILES"; payload: FileItem[] }
  | { type: "ADD_FILE"; payload: FileItem }
  | { type: "UPDATE_FILE"; payload: { id: string; content: string } }
  | { type: "DELETE_FILE"; payload: string }
  | { type: "SET_ACTIVE_FILE"; payload: string | null }
  | { type: "SET_COMPILE_LOADING"; payload: boolean }
  | { type: "SET_COMPILE_RESULT"; payload: CompileResult }
  | { type: "SET_DEPLOY_LOADING"; payload: boolean }
  | { type: "SET_DEPLOY_RESULT"; payload: any }
  | { type: "SET_TEST_LOADING"; payload: boolean }
  | { type: "SET_TEST_RESULT"; payload: any }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "SET_ACTIVE_TAB"; payload: "files" | "examples" | "config" }

const initialState: PlaygroundState = {
  files: [],
  activeFileId: null,
  isCompiling: false,
  compileResult: null,
  isDeploying: false,
  deployResult: null,
  isTesting: false,
  testResult: null,
  sidebarOpen: true,
  activeTab: "files",
}

function playgroundReducer(state: PlaygroundState, action: PlaygroundAction): PlaygroundState {
  switch (action.type) {
    case "SET_FILES":
      return { ...state, files: action.payload }
    case "ADD_FILE":
      return { ...state, files: [...state.files, action.payload] }
    case "UPDATE_FILE":
      return {
        ...state,
        files: state.files.map((file) =>
          file.id === action.payload.id ? { ...file, content: action.payload.content } : file,
        ),
      }
    case "DELETE_FILE":
      return {
        ...state,
        files: state.files.filter((file) => file.id !== action.payload),
        activeFileId: state.activeFileId === action.payload ? null : state.activeFileId,
      }
    case "SET_ACTIVE_FILE":
      return { ...state, activeFileId: action.payload }
    case "SET_COMPILE_LOADING":
      return { ...state, isCompiling: action.payload }
    case "SET_COMPILE_RESULT":
      return { ...state, compileResult: action.payload, isCompiling: false }
    case "SET_DEPLOY_LOADING":
      return { ...state, isDeploying: action.payload }
    case "SET_DEPLOY_RESULT":
      return { ...state, deployResult: action.payload, isDeploying: false }
    case "SET_TEST_LOADING":
      return { ...state, isTesting: action.payload }
    case "SET_TEST_RESULT":
      return { ...state, testResult: action.payload, isTesting: false }
    case "TOGGLE_SIDEBAR":
      return { ...state, sidebarOpen: !state.sidebarOpen }
    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.payload }
    default:
      return state
  }
}

const PlaygroundContext = createContext<{
  state: PlaygroundState
  dispatch: React.Dispatch<PlaygroundAction>
} | null>(null)

export function PlaygroundProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(playgroundReducer, initialState)

  return <PlaygroundContext.Provider value={{ state, dispatch }}>{children}</PlaygroundContext.Provider>
}

export function usePlayground() {
  const context = useContext(PlaygroundContext)
  if (!context) {
    throw new Error("usePlayground must be used within PlaygroundProvider")
  }
  return context
}
