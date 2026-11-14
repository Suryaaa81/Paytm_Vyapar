"""
Sarvam AI integration (stub).
Replace with real API calls when SARVAM_API_KEY is available.
"""
import os
import httpx

SARVAM_API_KEY = os.getenv("SARVAM_API_KEY", "")
SARVAM_ASR_URL = "https://api.sarvam.ai/speech-to-text"


async def transcribe_audio(audio_bytes: bytes, language: str = "hi-IN") -> str:
    """
    Send audio to Sarvam ASR and return transcription.
    Falls back to mock if API key is not set.
    """
    if not SARVAM_API_KEY:
        return "Cash sale 450 rupees, credit sale 200 rupees, shop expense 150 rupees"

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                SARVAM_ASR_URL,
                headers={"api-subscription-key": SARVAM_API_KEY},
                files={"file": ("audio.wav", audio_bytes, "audio/wav")},
                data={"language_code": language, "model": "saarika:v1"},
            )
            response.raise_for_status()
            data = response.json()
            return data.get("transcript", "")
    except Exception as e:
        print(f"Sarvam ASR error: {e}")
        return "Cash sale 450 rupees, credit sale 200 rupees, shop expense 150 rupees"
