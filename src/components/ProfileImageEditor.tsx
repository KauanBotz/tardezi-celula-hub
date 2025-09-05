import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { RotateCw, RotateCcw, ZoomIn, ZoomOut, Save, X } from "lucide-react";

interface ProfileImageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newAvatarUrl: string) => void;
  initialImage: string;
}

export const ProfileImageEditor = ({ isOpen, onClose, onSave, initialImage }: ProfileImageEditorProps) => {
  const cropperRef = useRef<any>(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleRotateLeft = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.rotate(-90);
    }
  };

  const handleRotateRight = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.rotate(90);
    }
  };

  const handleZoomIn = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.zoom(0.1);
    }
  };

  const handleZoomOut = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.zoom(-0.1);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;

    setUploading(true);

    try {
      // Obter a imagem cortada como blob
      cropper.getCroppedCanvas({
        width: 400,
        height: 400,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
      }).toBlob(async (blob: Blob | null) => {
        if (!blob) {
          throw new Error('Erro ao processar imagem');
        }

        // Criar arquivo da imagem cortada
        const fileExt = 'jpg';
        const filePath = `${user.id}/avatar.${fileExt}`;

        // Fazer upload da imagem editada
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, blob, {
            upsert: true,
            contentType: 'image/jpeg'
          });

        if (uploadError) {
          throw uploadError;
        }

        // Obter URL pública
        const { data } = supabase.storage.from('media').getPublicUrl(filePath);
        const newAvatarUrl = `${data.publicUrl}?v=${Date.now()}`; // Cache bust

        // Atualizar perfil no banco
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
        <div className="relative">
          <Cropper
            ref={cropperRef}
            src={initialImage}
            style={{ height: 400, width: '100%' }}
            aspectRatio={1}
            guides={false}
            viewMode={1}
            dragMode="move"
            scalable={true}
            cropBoxMovable={true}
            cropBoxResizable={true}
            checkOrientation={false}
            responsive={true}
            background={false}
            modal={true}
            autoCropArea={0.8}
          />
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