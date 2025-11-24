import { CheckCircle, Book, FileText, Video, Globe, Code } from 'lucide-react'

interface ContentSectionProps {
  id: string
  title: string
  subtitle?: string
  type: 'video' | 'quiz' | 'resource'
  isSelected: boolean
  isCompleted?: boolean
  onClick: () => void
  resourceType?: 'Website' | 'Book' | 'Video' | 'PDF' | 'Interactive'
}

export default function ContentSection({
  id,
  title,
  subtitle,
  type,
  isSelected,
  isCompleted,
  onClick,
  resourceType
}: ContentSectionProps) {
  const getIcon = () => {
    if (type === 'video' || type === 'quiz') {
      return isCompleted ? <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" /> : null
    }
    
    switch (resourceType) {
      case 'Website':
        return <Globe className="w-5 h-5 text-blue-500 dark:text-blue-400" />
      case 'Book':
        return <Book className="w-5 h-5 text-purple-500 dark:text-purple-400" />
      case 'Video':
        return <Video className="w-5 h-5 text-red-500 dark:text-red-400" />
      case 'PDF':
        return <FileText className="w-5 h-5 text-orange-500 dark:text-orange-400" />
      case 'Interactive':
        return <Code className="w-5 h-5 text-green-500 dark:text-green-400" />
      default:
        return null
    }
  }

  return (
    <div 
      className={`flex flex-col bg-gray-100 dark:bg-[#1e1e1e] p-4 rounded-lg cursor-pointer transition-all duration-200 ${
        isSelected ? 'bg-purple-100 dark:bg-[#3a3a3a] border-l-4 border-purple-600' : 'hover:bg-gray-200 dark:hover:bg-[#2c2c2c]'
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className={`font-semibold ${isSelected ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'}`}>
          {title}
        </h3>
        <div className="flex-shrink-0 ml-2">
          {getIcon()}
        </div>
      </div>
      {subtitle && (
        <div className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</div>
      )}
    </div>
  )
}
