export async function askAI(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        maxOutputTokens: 500,
      }
    }),
  });

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export async function categorize(description: string): Promise<string> {
  const categories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Utilities', 'Salary', 'Other'];
  const prompt = `Categorize this transaction: "${description}". Choose one from: ${categories.join(', ')}. Reply with only the category name in English without any markdown or formatting.`;
  const result = await askAI(prompt);
  return categories.includes(result.trim()) ? result.trim() : 'Other';
}
