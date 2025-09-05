import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { RotateCw, RotateCcw, ZoomIn, ZoomOut, Save, X, Move } from "lucide-react";

interface ProfileImageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newAvatarUrl: string) => void;
  initialImage: string;
}

export const ProfileImageEditor = ({ isOpen, onClose, onSave, initialImage }: ProfileImageEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [uploading, setUploading] = useState(false);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && initialImage) {
      const img = new Image();
      img.onload = () => {
        if (imageRef.current) {
          imageRef.current = img;
          drawCanvas();
        }
      };
      img.src = initialImage;
      imageRef.current = img;
    }
  }, [isOpen, initialImage]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 300;
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);
    ctx.save();

    // Mover para o centro do canvas
    ctx.translate(size / 2, size / 2);
    
    // Aplicar rotação
    ctx.rotate((rotation * Math.PI) / 180);
    
    // Aplicar posição
    ctx.translate(position.x, position.y);
    
    // Calcular dimensões da imagem
    const imgAspect = img.width / img.height;
    let drawWidth = size * scale;
    let drawHeight = size * scale;
    
    if (imgAspect > 1) {
      drawHeight = drawWidth / imgAspect;
    } else {
      drawWidth = drawHeight * imgAspect;
    }

    // Desenhar imagem centralizada
    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    
    ctx.restore();

    // Desenhar overlay circular
    ctx.save();
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }, [scale, rotation, position]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleRotateLeft = () => setRotation(rotation - 90);
  const handleRotateRight = () => setRotation(rotation + 90);
  const handleZoomIn = () => setScale(Math.min(scale + 0.1, 3));
  const handleZoomOut = () => setScale(Math.max(scale - 0.1, 0.1));

  const handleSave = async () => {
    if (!user || !canvasRef.current) return;

    setUploading(true);

    try {
      canvasRef.current.toBlob(async (blob: Blob | null) => {
        if (!blob) {
          throw new Error('Erro ao processar imagem');
        }

        const fileExt = 'jpg';
        const filePath = `${user.id}/avatar.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, blob, {
            upsert: true,
            contentType: 'image/jpeg'
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage.from('media').getPublicUrl(filePath);
        const newAvatarUrl = `${data.publicUrl}?v=${Date.now()}`;

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: newAvatarUrl })
          .eq('user_id', user.id);

        if (updateError) {
          throw updateError;
        }

        onSave(newAvatarUrl);
        onClose();
        toast({ title: "Foto atualizada com sucesso! ✨" });
      }, 'image/jpeg', 0.9);

    } catch (error: any) {
      toast({
        title: "Erro ao salvar foto",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Foto de Perfil">
      <div className="w-full space-y-4">
        <div className="relative flex justify-center">
          <canvas
            ref={canvasRef}
            className="border-2 border-gray-200 rounded-full cursor-move"
            style={{ width: '300px', height: '300px' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
          <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            <Move className="w-3 h-3 inline mr-1" />
            Arraste para mover
          </div>
        </div>

        {/* Controles */}
        <div className="flex justify-center gap-2 flex-wrap">
          <Button onClick={handleRotateLeft} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button onClick={handleRotateRight} variant="outline" size="sm">
            <RotateCw className="w-4 h-4" />
          </Button>
          <Button onClick={handleZoomIn} variant="outline" size="sm">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button onClick={handleZoomOut} variant="outline" size="sm">
            <ZoomOut className="w-4 h-4" />
          </Button>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSave}
            disabled={uploading}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            {uploading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Salvando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Salvar
              </div>
            )}
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
};