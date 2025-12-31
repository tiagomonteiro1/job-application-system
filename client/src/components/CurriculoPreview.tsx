import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Loader2, X, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface CurriculoPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  htmlContent: string;
  onGerarPDF: () => void;
  isGeneratingPDF: boolean;
}

export default function CurriculoPreview({
  open,
  onOpenChange,
  htmlContent,
  onGerarPDF,
  isGeneratingPDF,
}: CurriculoPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState(800);

  useEffect(() => {
    if (open && iframeRef.current && htmlContent) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(htmlContent);
        iframeDoc.close();

        // Ajustar altura do iframe após carregar conteúdo
        setTimeout(() => {
          const height = iframeDoc.body.scrollHeight;
          setIframeHeight(Math.min(height + 40, 1200)); // Máximo 1200px
        }, 100);
      }
    }
  }, [open, htmlContent]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[900px] max-h-[90vh] overflow-hidden flex flex-col glass-card">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                Preview do Currículo Premium
              </DialogTitle>
              <DialogDescription>
                Visualize como ficará seu currículo antes de gerar o PDF final
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Preview Area */}
        <div className="flex-1 overflow-auto bg-muted/30 rounded-lg p-4 border border-border">
          <div className="bg-white rounded-lg shadow-2xl mx-auto" style={{ maxWidth: '210mm' }}>
            <iframe
              ref={iframeRef}
              title="Currículo Preview"
              className="w-full border-0 rounded-lg"
              style={{ height: `${iframeHeight}px` }}
              sandbox="allow-same-origin"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Fechar Preview
          </Button>
          <Button
            onClick={onGerarPDF}
            disabled={isGeneratingPDF}
            className="flex-1 glow-effect bg-gradient-to-r from-primary to-accent"
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Gerar PDF Premium
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
