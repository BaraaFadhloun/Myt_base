import { useEffect, useRef, useState } from "react"
import { History, X } from "lucide-react"

interface HistoryItem {
  role: "user" | "assistant"
  content: string
}

interface HistoryWindowProps {
  history: HistoryItem[]
}

export default function HistoryWindow({ history }: HistoryWindowProps) {
  const [isOpen, setIsOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [isOpen, history])

  const toggleHistory = () => setIsOpen(!isOpen)

  return (
    <>
      <button
        onClick={toggleHistory}
        className="fixed z-10 left-0 bottom-[3%] w-12 h-12 rounded-r-full bg-purple-600 text-white flex items-center justify-center cursor-pointer shadow-[-2px_2px_10px_rgba(0,0,0,0.1)] transition-all duration-300 ease-in-out hover:opacity-80"
      >
        <History className="w-6 h-6" />
      </button>
      <div 
        className={`fixed bottom-[9%] z-40 left-5 w-[350px] max-h-[70vh] bg-white dark:bg-[#121212] shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] ${
          isOpen 
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
            : 'opacity-0 translate-y-5 scale-95 pointer-events-none'
        } rounded-xl overflow-hidden  transition-all duration-300 ease-[cubic-bezier(0.68,-0.55,0.27,1.55)]`}
      >
        <div className="bg-purple-600 text-white p-3 flex justify-between items-center">
          <h3 className="font-semibold">Conversation History</h3>
          <button
            onClick={toggleHistory}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div ref={scrollRef} className="p-4 overflow-y-auto max-h-[calc(70vh-48px)] space-y-4">
          {history.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              No conversation yet. Ask a question to get started!
            </p>
          )}

          {history.map((item, index) => (
            <div
              key={`${item.role}-${index}-${item.content.slice(0, 10)}`}
              className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  item.role === "user"
                    ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{item.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
