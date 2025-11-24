import { BotMessageSquare } from 'lucide-react';

interface MessageButtonProps {
  onClick: () => void;
}

export default function MessageButton({ onClick }: MessageButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed z-10 left-1/2 bottom-[3%] -translate-x-1/2 w-12 h-12 rounded-full bg-purple-500 text-white flex items-center justify-center cursor-pointer shadow-[0_4px_10px_rgba(124,58,237,0.5)] transition-all duration-300 ease-in-out hover:bg-purple-600 hover:shadow-[0_6px_15px_rgba(124,58,237,0.6)]"
    >
      <BotMessageSquare className="w-6 h-6" />
    </button>
  );
}
