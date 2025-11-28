import { GoogleGenAI } from "@google/genai";
import { Battery } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateStockAnalysis = async (inventory: Battery[]): Promise<string> => {
  try {
    const inventorySummary = inventory.map(item => 
      `- ${item.brand} ${item.amperage}Ah: ${item.quantity} unidades (Mínimo ideal: ${item.minStock})`
    ).join('\n');

    const prompt = `
      Atue como um gerente de logística especialista em lojas de baterias automotivas.
      Analise o seguinte inventário atual da loja e forneça um relatório curto e estratégico (máximo 3 parágrafos).
      
      Dados do Inventário:
      ${inventorySummary}

      Instruções:
      1. Identifique itens críticos (estoque abaixo do mínimo ou zerado).
      2. Sugira ações de reposição urgentes.
      3. Se o estoque estiver saudável, elogie o equilíbrio.
      4. Use formatação Markdown para deixar o texto legível.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Não foi possível gerar a análise no momento.";
  } catch (error) {
    console.error("Erro ao chamar Gemini:", error);
    return "Erro ao conectar com a IA para análise de estoque. Verifique sua chave de API.";
  }
};
