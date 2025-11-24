'use client'

import { useState, useEffect, useCallback } from "react"

interface SettingsDropdownProps {
  isOpen: boolean
}

export default function SettingsDropdown({ isOpen }: SettingsDropdownProps) {
  const [speed, setSpeed] = useState(1)
  const [delay, setDelay] = useState(1)

  const emitSettingsChange = useCallback(
    (nextSpeed: number, nextDelay: number) => {
      if (typeof window === "undefined") return
      const event = new CustomEvent("typingSettingsChange", {
        detail: {
          speed: Number(nextSpeed.toFixed(2)),
          delay: Number(nextDelay.toFixed(2)),
        },
      })
      window.dispatchEvent(event)
    },
    []
  )

  useEffect(() => {
    const speedDisplay = document.getElementById("speed-display")
    if (speedDisplay) {
      speedDisplay.textContent = `${speed.toFixed(1)}x`
    }
  }, [speed])

  useEffect(() => {
    const delayDisplay = document.getElementById("delay-display")
    if (delayDisplay) {
      delayDisplay.textContent = `${delay.toFixed(1)}x`
    }
  }, [delay])

  useEffect(() => {
    emitSettingsChange(speed, delay)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSpeedChange = (value: number) => {
    setSpeed(value)
    emitSettingsChange(value, delay)
  }

  const handleDelayChange = (value: number) => {
    setDelay(value)
    emitSettingsChange(speed, value)
  }

  return (
    <div
      className={`absolute right-0 mt-2 w-64 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out z-[100] ${
        isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
      }`}
    >
      <div className="p-4">
        <h3 className="font-bold mb-2 text-gray-900 dark:text-gray-100">Settings</h3>
        <div className="mb-4">
          <label htmlFor="language" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Language:
          </label>
          <select
            id="language"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#2c2c2c] text-gray-900 dark:text-white"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="ar">العربية</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="speed" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Typing speed
          </label>
          <input
            type="range"
            id="speed"
            min="0.5"
            max="2"
            step="0.1"
            value={speed}
            onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
            className="w-full accent-purple-500"
          />
          <div id="speed-display" className="mt-1 text-center text-sm text-gray-600 dark:text-gray-400">
            {speed.toFixed(1)}x
          </div>
        </div>
        <div>
          <label htmlFor="delay" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Message break duration
          </label>
          <input
            type="range"
            id="delay"
            min="0.5"
            max="2.5"
            step="0.1"
            value={delay}
            onChange={(e) => handleDelayChange(parseFloat(e.target.value))}
            className="w-full accent-purple-500"
          />
          <div id="delay-display" className="mt-1 text-center text-sm text-gray-600 dark:text-gray-400">
            {delay.toFixed(1)}x
          </div>
        </div>
      </div>
    </div>
  )
}
