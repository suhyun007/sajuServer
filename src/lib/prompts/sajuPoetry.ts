export interface PoetryRequest {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  birthMinute: number;
  gender: 'female' | 'male' | 'nonBinary';
  location: string;
  loveStatus: string;
  currentDate: string;
  genre: string;
  language: 'ko' | 'en' | 'ja' | 'zh';
}
//user prompt
export function generatePoetryPrompt(poetryData: PoetryRequest): string {
  const { birthYear, birthMonth, birthDay, birthHour, birthMinute, gender, location, loveStatus, currentDate, genre, language } = poetryData;
  
  const languageLabel =
    language === 'ko' ? 'Korean' :
    language === 'ja' ? 'Japanese' :
    language === 'zh' ? 'Chinese' : 'English';  
  return `
User information:
- Date of birth: ${birthYear}-${birthMonth}-${birthDay} ${birthHour}:${birthMinute}
- Gender: ${gender}
- Birthplace: ${location}
- Love status: ${loveStatus}
- Current date: ${currentDate}
- genre: ${genre}
- write in ${languageLabel} format.`;
}

// System 프롬프트 함수 (언어별 동적 생성)
export function getPoetrySystemPrompt(language: string): string {
  const languageLabel = 
    language === 'ko' ? 'Korean' :
    language === 'ja' ? 'Japanese' :
    language === 'zh' ? 'Chinese' : 'English';
    
    return `You are a professional poet creating daily personalized poems.

    Guidelines:
    1. Reflect the user's birth information and current situation, but do NOT explicitly mention birth date, birthplace, zodiac signs, or astrology terms.
    2. Write a warm, emotional, and deeply touching poem that captures today's feelings (based on the current date).
    3. Use beautiful, evocative expressions that resonate with the reader's heart.
    4. Structure the poem in 4–6 stanzas, free verse style.
    5. Around 350 characters in ${languageLabel}.
    6. Include both a title and the full poem text.
    7. Consider rhythm and flow for a lyrical tone.
    8. Return only valid JSON in the following format:
    {
      "title": "Poem title",
      "poem": "Full poem text",
      "stanzaCount": number of stanzas,
      "summary": "One-line emotional summary of the poem",
      "tomorrowHint": "One-line teaser for tomorrow's poem"
    }`;
}