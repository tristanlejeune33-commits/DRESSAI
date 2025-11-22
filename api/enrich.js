import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items } = req.body;

    if (!items) {
      return res.status(400).json({ error: 'Items list is required' });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Tu es un directeur artistique de mode expert en photographie. Ta tâche est de décrire visuellement des vêtements pour un rendu 3D photoréaliste."
        },
        {
          role: "user",
          content: `Voici une liste de vêtements : "${items}".
          
          Décris cette tenue pour un prompt de génération d'image (DALL-E 3).
          Pour CHAQUE vêtement, décris précisément :
          1. La matière exacte (ex: laine épaisse, soie brillante, cuir grainé).
          2. La texture (ex: côtelé, lisse, rugueux).
          3. La coupe et le tombé sur le corps (ex: structuré aux épaules, fluide, moulant).
          4. Les détails (boutons, coutures, reflets de lumière).
          
          Fais un seul paragraphe descriptif en ANGLAIS, très visuel, sans introduction ni conclusion.`
        }
      ]
    });

    const description = response.choices[0].message.content;
    res.status(200).json({ description });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}