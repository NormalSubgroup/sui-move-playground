"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"
import type { PlaygroundState, PlaygroundAction } from "@/lib/types"

// 默认的 Hello World 文件
const defaultHelloFile = {
  id: "hello-move-default",
  name: "hello.move",
  content: `module move_counter::hello {
    use std::string;
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    
    struct Hello has key, store {
        id: UID,
        message: string::String
    }
    
    public entry fun mint(ctx: &mut TxContext) {
        let hello = Hello {
            id: object::new(ctx),
            message: string::utf8(b"Hello, World!")
        };
        transfer::public_transfer(hello, tx_context::sender(ctx));
    }
}`,
  type: "move" as const,
  path: "hello.move",
  lastModified: new Date(),
}

const defaultConfig = `[package]
name = "test"
version = "0.0.1"

[addresses]
test = "0x2"`

// 验证配置格式
const validateConfig = (config: string): boolean => {
  try {
    const lines = config.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'))
    const sections: string[] = []
    
    for (const line of lines) {
      const trimmed = line.trim()
      
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        const section = trimmed.slice(1, -1)
        if (sections.includes(section)) {
          return false // 重复节
        }
        sections.push(section)
      }
    }
    
    return sections.includes('package') // 必须包含package节
  } catch {
    return false
  }
}

const initialState: PlaygroundState = {
  files: [defaultHelloFile],
  activeFileId: defaultHelloFile.id,
  isCompiling: false,
  compileResult: null,
  isDeploying: false,
  deployResult: null,
  isTesting: false,
  testResult: null,
  sidebarOpen: true,
  activeTab: "files",
  config: defaultConfig,
  resultPanelExpanded: false,
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
          file.id === action.payload.id ? { ...file, content: action.payload.content, lastModified: new Date() } : file,
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
    case "SET_CONFIG":
      // 验证配置，如果无效则使用默认配置
      const configToUse = validateConfig(action.payload) ? action.payload : defaultConfig
      return { ...state, config: configToUse }
    case "TOGGLE_RESULT_PANEL":
      return { ...state, resultPanelExpanded: !state.resultPanelExpanded }
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

  // 在组件挂载时检查并修复配置
  useEffect(() => {
    if (!validateConfig(state.config)) {
      console.warn('检测到无效配置，重置为默认配置')
      dispatch({ type: "SET_CONFIG", payload: defaultConfig })
    }
  }, [])

  return <PlaygroundContext.Provider value={{ state, dispatch }}>{children}</PlaygroundContext.Provider>
}

export function usePlayground() {
  const context = useContext(PlaygroundContext)
  if (!context) {
    throw new Error("usePlayground must be used within PlaygroundProvider")
  }
  return context
}
