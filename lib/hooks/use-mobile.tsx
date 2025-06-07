"use client"

import { useState, useEffect } from "react"

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setIsMobile(width < 768) // 小于 768px 为移动端
      setIsTablet(width >= 768 && width < 1024) // 768px-1024px 为平板
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return isMobile
}

// 新增：检测是否为小屏幕（包括移动端和平板）
export function useSmallScreen() {
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 1024) // 小于 1024px 为小屏幕
      setIsInitialized(true)
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // 在首次初始化前，使用保守的默认值
  return isInitialized ? isSmallScreen : false
}
