"use client"

import { PlaygroundProvider } from "@/lib/providers/playground-provider"
import { PlaygroundLayout } from "@/components/layout/playground-layout"
import { ErrorBoundary } from "@/components/common/error-boundary"

export default function HomePage() {
  return (
    <ErrorBoundary>
      <PlaygroundProvider>
        <PlaygroundLayout />
      </PlaygroundProvider>
    </ErrorBoundary>
  )
}
