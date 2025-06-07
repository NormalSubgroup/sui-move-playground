export interface FileItem {
  id: string
  name: string
  content: string
  type: "move" | "toml" | "md"
  path: string
  lastModified: Date
}

export interface CompileRequest {
  source_code: string
  file_name: string
  addresses_toml_content?: string
}

export interface CompileResponse {
  success: boolean
  bytecode_base64: string[]
  module_names: string[]
  bytecode_size: number[]
  compile_time_ms: number
  error_message: string | null
  warnings: string[]
  bytecode_path: string | null
}

export interface CompileError {
  line: number
  column: number
  message: string
  severity: "error" | "warning"
}

export interface TestRequest {
  command: string
}

export interface TestResponse {
  success: boolean
  testsRun: number
  testsPassed: number
  testsFailed: number
  details: TestResult[]
  output?: string
}

export interface TestResult {
  name: string
  status: "passed" | "failed" | "skipped"
  duration: string
  error?: string
}

export interface DeployRequest {
  command: string
}

export interface DeployResponse {
  success: boolean
  transactionHash?: string
  contractAddress?: string
  gasUsed?: string
  error?: string
}

export interface PlaygroundState {
  files: FileItem[]
  activeFileId: string | null
  isCompiling: boolean
  compileResult: CompileResponse | null
  isDeploying: boolean
  deployResult: DeployResponse | null
  isTesting: boolean
  testResult: TestResponse | null
  sidebarOpen: boolean
  activeTab: "files" | "examples" | "config"
  config: string
}

export type PlaygroundAction =
  | { type: "SET_FILES"; payload: FileItem[] }
  | { type: "ADD_FILE"; payload: FileItem }
  | { type: "UPDATE_FILE"; payload: { id: string; content: string } }
  | { type: "DELETE_FILE"; payload: string }
  | { type: "SET_ACTIVE_FILE"; payload: string | null }
  | { type: "SET_COMPILE_LOADING"; payload: boolean }
  | { type: "SET_COMPILE_RESULT"; payload: CompileResponse }
  | { type: "SET_DEPLOY_LOADING"; payload: boolean }
  | { type: "SET_DEPLOY_RESULT"; payload: DeployResponse }
  | { type: "SET_TEST_LOADING"; payload: boolean }
  | { type: "SET_TEST_RESULT"; payload: TestResponse }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "SET_ACTIVE_TAB"; payload: "files" | "examples" | "config" }
  | { type: "SET_CONFIG"; payload: string }
