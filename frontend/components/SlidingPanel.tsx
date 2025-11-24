'use client'

import { useState, useEffect } from 'react'
import { Book, FileText } from 'lucide-react'
import ContentSection from './ContentSection'
import { useRouter, usePathname } from 'next/navigation'


interface Section {
  id: string
  title: string
  type: 'video' | 'quiz'
  subtitle?: string
  isCompleted?: boolean
}

export default function SlidingPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeView, setActiveView] = useState<'course' | 'resources'>('course')
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [currentSectionTitle, setCurrentSectionTitle] = useState("Introduction to Python"); // Added state for current section title
  const router = useRouter()
  const pathname = usePathname()

  const sections: Section[] = [
    { id: "intro", title: "1. Introduction to Python", type: "video", subtitle: "Duration: 15:30", isCompleted: true },
    { id: "intro-quiz", title: "Progress Test : Quiz", type: "quiz", subtitle: "Score: 4/5", isCompleted: true },
    { id: "variables", title: "2. Variables and Data Types", type: "video", subtitle: "Duration: 20:45", isCompleted: false },
    { id: "variables-quiz", title: "Progress Test : Quiz", type: "quiz", subtitle: "Score: 3/5", isCompleted: false },
    { id: "control", title: "3. Control Flow", type: "video", subtitle: "Duration: 25:15", isCompleted: true },
    { id: "control-quiz", title: "Progress Test : Quiz", type: "quiz", subtitle: "Score: 5/5", isCompleted: true },
    { id: "functions", title: "4. Functions", type: "video", subtitle: "Duration: 30:00", isCompleted: false },
    { id: "functions-quiz", title: "Progress Test : Quiz", type: "quiz", subtitle: "Score: 4/5", isCompleted: false },
  ]

  useEffect(() => {
    const currentSection = sections.find(section => 
      pathname === `/course/${section.id}` || pathname === `/quiz/${section.id}`
    )
    if (currentSection) {
      setSelectedSection(currentSection.id);
      setCurrentSectionTitle(currentSection.title); // Update currentSectionTitle
    }
  }, [pathname])


  const handleSectionClick = (section: Section) => {
    setSelectedSection(section.id);
    setCurrentSectionTitle(section.title); // Update currentSectionTitle
    if (section.type === 'video') {
      router.push(`/course/${section.id}`)
    } else {
      router.push(`/quiz/${section.id}`)
    }
    setTimeout(() => {
      setIsOpen(false);
    }, 700)
  }

  const togglePanel = () => setIsOpen(!isOpen)

  return (
    <>
      <button
        onClick={togglePanel}
        className={`z-40 fixed bottom-[3%] ${
          isOpen ? 'right-96' : 'right-0 opacity-30'
        } bg-purple-600 text-white w-12 h-12 rounded-l-full flex items-center justify-center shadow-lg transition-all duration-300 hover:opacity-100 z-60`}
      >
        <Book className="w-6 h-6" />
      </button>      
      <div
        className={`fixed top-0 z-80 right-0 w-96 h-full bg-white dark:bg-[#121212] border-l border-gray-200 dark:border-[#2c2c2c] shadow-lg dark:shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } overflow-y-auto z-50`}
      >
        <div className="flex h-10 border-b border-gray-200 dark:border-gray-700">
          <button
            className={`flex-1 flex items-center justify-center text-sm ${
              activeView === 'course'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-[#1e1e1e] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2c2c2c]'
            } transition-colors duration-200`}
            onClick={() => setActiveView('course')}
          >
            <Book className="w-4 h-4 mr-2" />
            Course Content
          </button>
          <button
            className={`flex-1 flex items-center justify-center text-sm ${
              activeView === 'resources'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-[#1e1e1e] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2c2c2c]'
            } transition-colors duration-200`}
            onClick={() => setActiveView('resources')}
          >
            <FileText className="w-4 h-4 mr-2" />
            Resources
          </button>
        </div>

        <div className="p-6">
          {activeView === 'course' && (
            <div className="space-y-4">
              {sections.map((section) => (
                <div key={section.id} className={section.type === 'quiz' ? 'ml-4 border-l-2 border-gray-300 dark:border-gray-700 pl-4' : ''}>
                  <ContentSection
                    id={section.id}
                    title={section.title}
                    subtitle={section.subtitle}
                    type={section.type}
                    isSelected={selectedSection === section.id}
                    isCompleted={section.isCompleted}
                    onClick={() => handleSectionClick(section)}
                  />
                </div>
              ))}
            </div>
          )}

          {activeView === 'resources' && (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
              Resources coming soon...
            </div>
          )}
        </div>
      </div>
    </>
  )
}
