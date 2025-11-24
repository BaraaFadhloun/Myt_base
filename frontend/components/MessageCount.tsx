import { Zap } from 'lucide-react'

interface MessageCountProps {
  count: number
}

export default function MessageCount({ count }: MessageCountProps) {
  return (
    <div className="flex items-center space-x-2 opacity-30 text-gray-800 px-3 py-1 rounded-full text-sm">
      <Zap className="w-4 h-4" />
      <span className="font-semibold">10&nbsp;/30</span>
    </div>
  )

}
