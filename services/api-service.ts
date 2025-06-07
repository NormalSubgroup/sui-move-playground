import type { CompileRequest, CompileResponse, TestRequest, TestResponse, DeployRequest, DeployResponse } from "@/types"

class ApiService {
  private baseUrl = "/api/proxy"

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API Error: ${response.status} - ${errorText}`)
    }

    return response.json()
  }

  async compile(request: CompileRequest): Promise<CompileResponse> {
    return this.request<CompileResponse>("/compile", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  async test(request: TestRequest): Promise<TestResponse> {
    return this.request<TestResponse>("/test", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  async deploy(request: DeployRequest): Promise<DeployResponse> {
    return this.request<DeployResponse>("/deploy", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  async getStatus(): Promise<{ status: string }> {
    return this.request<{ status: string }>("/status")
  }
}

export const apiService = new ApiService()
