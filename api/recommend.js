import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Tu es un personal shopper expert." },
        { role: "user", content: prompt }
      ],
    });

    // Return the parsed JSON content directly
    const content = completion.choices[0].message.content;
    res.status(200).json(JSON.parse(content));
  } catch (error) {
    console.error('Error in recommend API:', error);
    res.status(500).json({ error: 'Error generating recommendations' });
  }
}