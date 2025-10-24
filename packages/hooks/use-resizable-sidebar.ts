"use client"

import { useCallback, useEffect, useRef, useState } from "react"

const SIDEBAR_WIDTH_KEY = "sidebar-width"
const MIN_WIDTH = 200
const MAX_WIDTH = 400

export function useResizableSidebar() {
  const [width, setWidth] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY)
      return saved ? parseInt(saved, 10) : 256 // 16rem = 256px
    }
    return 256
  })

  const isResizing = useRef(false)
  const startX = useRef(0)
  const startWidth = useRef(0)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isResizing.current = true
    startX.current = e.clientX
    startWidth.current = width
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
  }, [width])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return

    const deltaX = e.clientX - startX.current
    const newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startWidth.current + deltaX))
    
    setWidth(newWidth)
    
    // Update CSS variable
    document.documentElement.style.setProperty("--sidebar-width", `${newWidth}px`)
  }, [])

  const handleMouseUp = useCallback(() => {
    if (!isResizing.current) return

    isResizing.current = false
    document.body.style.cursor = ""
    document.body.style.userSelect = ""
    
    // Save to localStorage
    localStorage.setItem(SIDEBAR_WIDTH_KEY, width.toString())
  }, [width])

  useEffect(() => {
    // Set initial width
    document.documentElement.style.setProperty("--sidebar-width", `${width}px`)

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp, width])

  return {
    width,
    handleMouseDown,
  }
}