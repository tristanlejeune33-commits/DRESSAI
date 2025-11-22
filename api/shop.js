export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
      return res.status(500).json({ error: 'Server configuration error: Missing SERPER_API_KEY' });
  }

  try {
    const { q, minPrice, maxPrice } = req.body;

    if (!q) {
        return res.status(400).json({ error: 'Query (q) is required' });
    }

    const requestBody = {
        q: q,
        gl: "fr",
        hl: "fr",
        num: 1
        // tbs: `ppr_min:${minPrice},ppr_max:${maxPrice}` // Désactivé pour garantir des résultats
    };

    const response = await fetch("https://google.serper.dev/shopping", {
        method: "POST",
        headers: {
            "X-API-KEY": apiKey,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Serper API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    console.error('Error in shop API:', error);
    res.status(500).json({ error: error.message });
  }
}