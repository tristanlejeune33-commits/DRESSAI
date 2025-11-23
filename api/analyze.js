import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image } = req.body; // Base64 image

    if (!image) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        throw new Error("GOOGLE_API_KEY is missing");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Utilisation du modèle demandé par l'utilisateur
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview", apiVersion: "v1beta" });

    // Préparation de l'image
    const base64Data = image.split(',')[1];
    const mimeType = image.split(';')[0].split(':')[1];

    const prompt = `Analyse cette silhouette pour un conseil vestimentaire. Retourne un objet JSON avec ces clés exactes :
    - shape (une valeur parmi: 'sablier', 'poire', 'triangle-inverse', 'rectangle', 'ovale')
    - skin (une valeur parmi: 'clair', 'medium', 'mat', 'fonce')
    - eyes (une valeur parmi: 'Bleu', 'Vert', 'Noisette', 'Marron', 'Noir', 'Gris')
    - hair (une valeur parmi: 'Blond (Clair/Foncé)', 'Châtain', 'Brun / Noir', 'Roux / Auburn', 'Gris / Blanc', 'Coloré (Vif)')
    
    Réponds UNIQUEMENT avec le JSON, sans markdown.`;

    const result = await model.generateContent([
        prompt,
        { inlineData: { data: base64Data, mimeType: mimeType } }
    ]);

    const content = result.response.text();
    const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedResult = JSON.parse(jsonStr);

    res.status(200).json(parsedResult);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}