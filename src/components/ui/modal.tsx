import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  className?: string
}

const Modal = ({ isOpen, onClose, children, title, className }: ModalProps) => {
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Modal container */}
      <div 
        className={cn(
          "w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do modal */}
        {title && (
          <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        
        {/* Conteúdo do modal com scroll */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

export { Modal }
