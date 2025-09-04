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
    <div className="fixed inset-0 z-50 top-0 left-0 right-0 bottom-0">
      {/* Modal container - tela toda no mobile */}
      <div className={cn(
        "w-full h-full bg-white flex flex-col sm:w-auto sm:h-auto sm:max-w-2xl sm:max-h-[90vh] sm:m-auto sm:rounded-2xl sm:shadow-2xl sm:border sm:border-gray-200",
        className
      )}>
        {/* Header do modal - altura fixa */}
        {title && (
          <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        
        {/* Conteúdo do modal com scroll - ocupa o espaço restante */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-8">
          {children}
        </div>
      </div>
    </div>
  )
}

export { Modal }
