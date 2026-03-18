export async function askGPT(prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
    }),
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

export async function categorize(description: string): Promise<string> {
  const categories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Utilities', 'Salary', 'Other'];
  const prompt = `Categorize this transaction: "${description}". Choose one from: ${categories.join(', ')}. Reply with only the category name.`;
  const result = await askGPT(prompt);
  return categories.includes(result.trim()) ? result.trim() : 'Other';
}
