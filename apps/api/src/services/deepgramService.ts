const apiKey = process.env.DEEPGRAM_API_KEY;

const buildUrl = (model: string) => {
  const params = new URLSearchParams({
    model,
    encoding: 'mp3',
    container: 'mp3'
  });
  return `https://api.deepgram.com/v1/speak?${params.toString()}`;
};

export const synthesizeSpeech = async (text: string, model: string) => {
  if (!apiKey) {
    throw new Error('Missing DEEPGRAM_API_KEY');
  }

  const response = await fetch(buildUrl(model), {
    method: 'POST',
    headers: {
      Authorization: `Token ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Deepgram error: ${message}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};
