
interface TranslationResponse {
  translatedText: string;
  detectedSourceLanguage?: string;
}

export const translateText = async (text: string, targetLanguage: string): Promise<TranslationResponse> => {
  try {
    // Using MyMemory API (free translation service)
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLanguage}`
    );
    
    const data = await response.json();
    
    if (data.responseStatus === 200) {
      return {
        translatedText: data.responseData.translatedText,
        detectedSourceLanguage: data.responseData.detectedSourceLanguage
      };
    } else {
      throw new Error('Translation failed');
    }
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error('Failed to translate text');
  }
};

export const SUPPORTED_LANGUAGES = [
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'tr', name: 'Turkish' },
  { code: 'nl', name: 'Dutch' },
  { code: 'sv', name: 'Swedish' },
  { code: 'no', name: 'Norwegian' },
];
