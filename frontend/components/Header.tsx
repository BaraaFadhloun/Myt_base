"use client"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Settings, Moon, Sun, ChevronLeft, Blocks } from "lucide-react"
import { useTheme } from "./ThemeProvider"
import SettingsDropdown from "./SettingsDropdown"
import DropdownInfo from "./DropdownInfo" // Import DropdownInfo component

export default function Header() {
  const [isMobile, setIsMobile] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isThinking, setIsThinking] = useState(false) // Added thinking state for profile picture effect
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 640)
    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  useEffect(() => {
    const handleThinkingStateChange = (event: CustomEvent) => {
      setIsThinking(event.detail.isThinking)
    }

    window.addEventListener("thinkingStateChange", handleThinkingStateChange as EventListener)
    return () => window.removeEventListener("thinkingStateChange", handleThinkingStateChange as EventListener)
  }, [])

  const PointsBadge = () => {
    const [showDropdown, setShowDropdown] = useState(false)

    const handleMouseEnter = () => {
      if (!isMobile) {
        setShowDropdown(true)
      }
    }

    const handleMouseLeave = () => {
      if (!isMobile) {
        setShowDropdown(false)
      }
    }

    const handleClick = () => {
      if (isMobile) {
        setShowDropdown(!showDropdown)
      }
    }

    return (
      <div
        className={`relative flex items-center ml-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white ${
          isMobile ? "px-3" : "px-3 ml-4"
        } py-1.5 rounded-full font-bold text-sm shadow-[0_0_15px_rgba(124,58,237,0.2),0_0_15px_rgba(59,130,246,0.2)] transition-all duration-300 hover:shadow-lg cursor-pointer points-badge`}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Blocks className={isMobile ? "w-5 h-5" : "w-4 h-4"} />

        {!isMobile && <span className="ml-1.5">500 pts</span>}
        <DropdownInfo
          title="500 pts"
          subtitle="Keep learning to earn more points!"
          isVisible={showDropdown}
          position="bottom"
          className="z-50"
          triggerMethod={isMobile ? "click" : "hover"}
          onClose={() => setShowDropdown(false)}
        />
      </div>
    )
  }

  return (
    <header className="bg-white dark:bg-[#121212] border-b border-gray-200 dark:border-[#2c2c2c] fixed top-0 left-0 right-0 z-40 py-2">
      <div className="container mx-auto px-5 flex justify-between items-center h-16 max-w-full relative">
        <div className="flex items-center">
          <button
            className="p-1 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          {isMobile ? (
            <div className="relative">
              <PointsBadge />
            </div>
          ) : (
            <h1 className="text-base md:text-lg lg:text-2xl font-bold text-gray-900 dark:text-gray-100 ml-4">
              Introduction to Python
            </h1>
          )}
        </div>

        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className={`relative ${isThinking ? "thinking-effect" : ""}`}>
            <Image
              src="https://i.postimg.cc/1tT3JMX7/profile.png"
              alt="Profile"
              width={60}
              height={60}
              className={`rounded-full bg-gray-300 dark:bg-gray-700 object-cover cursor-pointer shadow-md transition-all duration-300 ease-in-out opacity-90 hover:scale-110 hover:opacity-100 ${
                isThinking ? "thinking-scale" : ""
              }`}
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {!isMobile && <PointsBadge />}

          <button
            onClick={toggleTheme}
            className="p-1 text-gray-700 dark:text-gray-300 transition-colors "
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
          </button>

          <div className="relative">
            <button
              className="p-1 text-gray-700 dark:text-gray-300 transition-colors"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              aria-label="Settings"
            >
              <Settings className="w-6 h-6" />
            </button>
            <SettingsDropdown isOpen={isSettingsOpen} />
          </div>
        </div>
      </div>
    </header>
  )
}
