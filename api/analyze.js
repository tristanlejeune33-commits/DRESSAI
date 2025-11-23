import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "Tu es un assistant styliste expert. Ta tâche est d'analyser visuellement une image pour aider à choisir des vêtements. Tu dois répondre UNIQUEMENT au format JSON."
        },
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "Analyse cette silhouette pour un conseil vestimentaire. Retourne un objet JSON avec ces clés exactes :\n" +
                    "- shape (une valeur parmi: 'sablier', 'poire', 'triangle-inverse', 'rectangle', 'ovale')\n" +
                    "- skin (une valeur parmi: 'clair', 'medium', 'mat', 'fonce')\n" +
                    "- eyes (une valeur parmi: 'Bleu', 'Vert', 'Noisette', 'Marron', 'Noir', 'Gris')\n" +
                    "- hair (une valeur parmi: 'Blond (Clair/Foncé)', 'Châtain', 'Brun / Noir', 'Roux / Auburn', 'Gris / Blanc', 'Coloré (Vif)')\n"
            },
            {
              type: "image_url",
              image_url: {
                url: image
              }
            }
          ]
        }
      ],
      max_tokens: 300
    });

    const content = response.choices[0].message.content;
    const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(jsonStr);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}