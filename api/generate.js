import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, userImage, outfitImages } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        throw new Error("GOOGLE_API_KEY is missing");
    }

    let finalPrompt = prompt;

    // Si on a des images (User ou Outfit), on utilise Gemini pour créer un prompt visuel parfait
    if (userImage || (outfitImages && outfitImages.length > 0)) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            // Utilisation du modèle demandé par l'utilisateur
            const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview", apiVersion: "v1beta" });

            const parts = [];
            
            // Instructions
            parts.push({ text: `Tu es un expert en photographie de mode et en direction artistique.
            Ta tâche est de rédiger un PROMPT DE GÉNÉRATION D'IMAGE (pour Imagen 3) extrêmement détaillé.
            
            Je vais te fournir :
            1. Une photo de l'utilisateur (optionnel) -> Pour capturer ses traits, sa morphologie, sa couleur de peau/cheveux.
            2. Des photos des vêtements (optionnel) -> Pour capturer les textures, coupes, couleurs exactes.
            3. Une description textuelle de base -> "${prompt}"
            
            TA MISSION :
            Rédige un prompt en ANGLAIS, optimisé pour Imagen 3, qui décrit une photo hyper-réaliste de CETTE personne portant CES vêtements.
            Sois très précis sur les textures des vêtements (d'après les images fournies) et l'apparence de la personne (d'après sa photo).
            Le prompt doit commencer par "RAW photo, 8k uhd, dslr..."
            Ne mets pas de markdown, juste le texte du prompt.` });

            // Ajout Image User
            if (userImage) {
                // userImage est en base64 data:image/jpeg;base64,...
                const base64Data = userImage.split(',')[1];
                const mimeType = userImage.split(';')[0].split(':')[1];
                parts.push({ inlineData: { data: base64Data, mimeType: mimeType } });
                parts.push({ text: "Voici la photo de l'utilisateur (à reproduire)." });
            }

            // Ajout Images Outfit (URLs -> Fetch -> Base64)
            if (outfitImages && outfitImages.length > 0) {
                parts.push({ text: "Voici les vêtements à porter :" });
                
                // On limite à 3 images pour ne pas surcharger
                const imagesToProcess = outfitImages.slice(0, 3);
                
                for (const imgUrl of imagesToProcess) {
                    try {
                        // On ne peut pas passer d'URL directement à Gemini via l'API Node pour l'instant sans File API
                        // On fetch l'image et on la passe en inlineData
                        const imgRes = await fetch(imgUrl);
                        const arrayBuffer = await imgRes.arrayBuffer();
                        const buffer = Buffer.from(arrayBuffer);
                        const base64 = buffer.toString('base64');
                        
                        // Détection simple du mime type (fallback jpeg)
                        let mime = "image/jpeg";
                        if(imgUrl.endsWith(".png")) mime = "image/png";
                        if(imgUrl.endsWith(".webp")) mime = "image/webp";

                        parts.push({ inlineData: { data: base64, mimeType: mime } });
                    } catch (e) {
                        console.warn("Impossible de récupérer l'image vêtement:", imgUrl);
                    }
                }
            }

            const result = await model.generateContent(parts);
            const enhancedPrompt = result.response.text();
            console.log("Prompt amélioré par Gemini :", enhancedPrompt);
            finalPrompt = enhancedPrompt;

        } catch (geminiError) {
            console.error("Erreur Gemini Vision (fallback sur prompt textuel):", geminiError);
            // On continue avec le prompt de base si erreur
        }
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: {
          text: finalPrompt
        },
        sampleCount: 1,
        aspectRatio: "1:1"
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'Error generating image with Google API');
    }

    if (!data.predictions || !data.predictions[0] || !data.predictions[0].bytesBase64Encoded) {
         throw new Error('No image returned from Google API');
    }

    const base64Image = data.predictions[0].bytesBase64Encoded;
    const imageUrl = `data:image/png;base64,${base64Image}`;

    res.status(200).json({ url: imageUrl });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}