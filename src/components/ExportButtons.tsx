import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";

export const ExportButtons = () => {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const exportToPDF = async () => {
    setExporting(true);
    try {
      // Buscar dados dos usuários
      const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name');

      if (error) throw error;

      // Criar PDF
      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(20);
      doc.text('Lista de Usuários - Tardezinha', 20, 20);
      
      // Data de geração
      doc.setFontSize(10);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30);
      
      let yPosition = 50;
      
      users?.forEach((user, index) => {
        // Verificar se precisa de nova página
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${user.name}`, 20, yPosition);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        yPosition += 7;
        if (user.email) {
          doc.text(`Email: ${user.email}`, 25, yPosition);
          yPosition += 5;
        }
        
        if (user.phone) {
          doc.text(`Telefone: ${user.phone}`, 25, yPosition);
          yPosition += 5;
        }
        
        if (user.age) {
          doc.text(`Idade: ${user.age} anos`, 25, yPosition);
          yPosition += 5;
        }
        
        if (user.address) {
          doc.text(`Endereço: ${user.address}`, 25, yPosition);
          yPosition += 5;
        }
        
        yPosition += 10;
      });
      
      // Salvar PDF
      doc.save('usuarios-tardezinha.pdf');
      
      toast({
        title: "PDF gerado com sucesso!",
        description: "O arquivo foi baixado automaticamente."
      });
      
    } catch (error: any) {
      toast({
        title: "Erro ao gerar PDF",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  const exportToExcel = async () => {
    setExporting(true);
    try {
      // Buscar dados dos usuários
      const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name');

      if (error) throw error;

      // Preparar dados para Excel
      const excelData = users?.map(user => ({
        'Nome': user.name,
        'Telefone': user.phone || ''
      })) || [];

      // Criar workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Adicionar worksheet ao workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Usuários');
      
      // Salvar arquivo
      XLSX.writeFile(wb, 'usuarios-telefones-tardezinha.xlsx');
      
      toast({
        title: "Excel gerado com sucesso!",
        description: "O arquivo foi baixado automaticamente."
      });
      
    } catch (error: any) {
      toast({
        title: "Erro ao gerar Excel",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <Button
        onClick={exportToPDF}
        disabled={exporting}
        variant="outline"
        className="border-blue-300 text-blue-600 hover:bg-blue-50"
      >
        {exporting ? (
          <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mr-2" />
        ) : (
          <FileText className="w-4 h-4 mr-2" />
        )}
        Exportar PDF
      </Button>
      
      <Button
        onClick={exportToExcel}
        disabled={exporting}
        variant="outline"
        className="border-green-300 text-green-600 hover:bg-green-50"
      >
        {exporting ? (
          <div className="w-4 h-4 border-2 border-green-600/30 border-t-green-600 rounded-full animate-spin mr-2" />
        ) : (
          <FileSpreadsheet className="w-4 h-4 mr-2" />
        )}
        Exportar Excel
      </Button>
    </div>
  );
};