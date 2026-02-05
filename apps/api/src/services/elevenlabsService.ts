const apiKey = process.env.ELEVENLABS_API_KEY;

const baseUrl = 'https://api.elevenlabs.io/v1/text-to-speech';

const readResponseBuffer = async (response: Response) => {
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

export const synthesizeSpeech = async (text: string, voiceId: string) => {
  if (!apiKey) {
    throw new Error('Missing ELEVENLABS_API_KEY');
  }

  const url = `${baseUrl}/${voiceId}/stream?output_format=mp3_44100_128`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8
      }
    })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`ElevenLabs error: ${message}`);
  }

  return readResponseBuffer(response);
};
