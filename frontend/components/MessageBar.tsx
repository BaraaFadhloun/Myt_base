"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import MessageCount from "./MessageCount"
import { PauseCircle } from "lucide-react"

interface MessageBarProps {
  isVisible: boolean
  setIsVisible: (isVisible: boolean) => void
  remainingMessages: number
  onMessageSent?: (message: string) => void
  disabled?: boolean // Added disabled prop to prevent new messages during typing animation
  refocusSignal?: number
}

export default function MessageBar({
  isVisible,
  setIsVisible,
  remainingMessages,
  onMessageSent,
  disabled = false,
  refocusSignal = 0,
}: MessageBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputDisabled, setInputDisabled] = useState(!isVisible)
  const [isLoading, setIsLoading] = useState(false)

  const handleStopTyping = useCallback(() => {
    if (typeof window === "undefined") return
    window.dispatchEvent(new CustomEvent("typingStop"))
  }, [])

  const sendMessage = async (message: string) => {
    if (!onMessageSent || disabled) return

    setIsLoading(true)

    try {
      await Promise.resolve(onMessageSent(message))
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setIsLoading(false)

      requestAnimationFrame(() => {
        if (!inputDisabled) {
          inputRef.current?.focus()
        }
      })
    }
  }

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      if (event.code === "Enter" && document.activeElement === inputRef.current && !isLoading && !disabled) {
        // Added disabled check
        const message = inputRef.current?.value.trim()
        if (message) {
          console.log("Message sent:", message)
          if (inputRef.current) inputRef.current.value = ""

          await sendMessage(message)
        }
      }

      if (event.code === "Space" && document.activeElement === inputRef.current && inputRef.current.value === "") {
        event.preventDefault()
        setIsVisible(false)
        inputRef.current.blur()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isVisible, setIsVisible, isLoading, disabled]) // Added disabled to dependency array

  useEffect(() => {
    if (isVisible && inputRef.current && !inputDisabled) {
      inputRef.current.focus()
    }
  }, [isVisible, inputDisabled])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (!isVisible) {
      timer = setTimeout(() => {
        setInputDisabled(true)
      }, 1000)
    } else {
      setInputDisabled(false)
    }
    return () => clearTimeout(timer)
  }, [isVisible])

  useEffect(() => {
    if (!inputDisabled && inputRef.current) {
      inputRef.current.focus()
    }
  }, [inputDisabled])

  useEffect(() => {
    if (!inputDisabled && inputRef.current) {
      inputRef.current.focus()
    }
  }, [refocusSignal, inputDisabled])

  return (
    <div className="msg-bar-container">
      <div className={`msg-bar bg-[#B29EF1] dark:bg-[#9271FF] ${isVisible ? "up" : ""}`}>
        <div className="flex items-center bg-white justify-between rounded-full w-full h-full px-2 sm:px-4 gap-2">
          {(isVisible || !inputDisabled) && (
            <input
              ref={inputRef}
              type="text"
              id="msg-input"
              className="flex-grow placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-800 text-gray-900 rounded-full py-1 sm:py-2 px-2 sm:px-4 focus:outline-none text-sm sm:text-base"
              placeholder={
                disabled
                  ? "Please wait for response to finish..."
                  : isLoading
                    ? "Processing..."
                    : "Unsure about something? Ask away"
              } // Updated placeholder for disabled state
              disabled={inputDisabled || isLoading || disabled} // Added disabled prop to input disabled state
              tabIndex={inputDisabled ? -1 : 0}
            />
          )}
          {disabled && (
            <button
              type="button"
              onClick={handleStopTyping}
              aria-label="Stop reply"
              className="ml-2 flex h-8 w-8 items-center justify-center rounded-full border border-purple-200 bg-white text-purple-600 shadow-sm transition hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:ring-offset-1 focus:ring-offset-white dark:border-purple-400/40 dark:bg-slate-900 dark:text-purple-200 dark:hover:bg-slate-800 sm:h-9 sm:w-9"
            >
              <PauseCircle className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.4} />
            </button>
          )}
          <MessageCount count={remainingMessages} />
        </div>
      </div>
    </div>
  )
}
