import { Router } from "express";
import { storagePut } from "../storage";
import { createCurriculo } from "../db";

const router = Router();

router.post("/api/upload-curriculo", async (req, res) => {
  try {
    console.log('[Upload API] Recebendo upload...');
    const { fileBase64, fileName } = req.body;

    if (!fileBase64 || !fileName) {
      console.log('[Upload API] Dados inválidos');
      return res.status(400).json({ error: "Dados inválidos" });
    }

    console.log('[Upload API] Convertendo base64 para buffer...');
    const buffer = Buffer.from(fileBase64, "base64");
    
    console.log('[Upload API] Fazendo upload para S3...');
    const key = `curriculos/${Date.now()}-${fileName}`;
    const result = await storagePut(key, buffer, "application/pdf");

    console.log('[Upload API] Upload S3 bem-sucedido:', result.url);

    // Salvar no banco
    console.log('[Upload API] Salvando no banco de dados...');
    const novoCurriculo = await createCurriculo({
      userId: 1, // TODO: pegar do contexto de autenticação
      originalPdfUrl: result.url,
      originalPdfKey: key,
      status: "uploaded",
    });

    console.log('[Upload API] Currículo salvo com ID:', novoCurriculo.id);

    res.json({
      success: true,
      curriculo: novoCurriculo,
    });
  } catch (error: any) {
    console.error('[Upload API] Erro:', error);
    res.status(500).json({ 
      error: "Erro ao fazer upload",
      message: error.message 
    });
  }
});

export default router;
