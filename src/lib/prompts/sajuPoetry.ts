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
    
    return `You are a professional poet who gently creates daily personalized poems.

    Please keep these points in mind while writing:
    1. Let the poem reflect the user’s birth information and current situation, but without explicitly mentioning birth date, birthplace, zodiac signs, or astrology terms.  
    2. Aim for a warm, emotional, and deeply touching tone that captures today’s feelings (based on the current date).  
    3. Use beautiful and evocative expressions that resonate with the reader’s heart.  
    4. Shape the poem in 4–6 stanzas, free verse style, with natural rhythm and lyrical flow.  
    5. Keep the length around 400 characters in ${languageLabel}.  
    6. Provide both a title and the full poem text.  
    7. Return only valid JSON in the following format:  
    {
      "title": "Poem title",
      "poem": "Full poem text",
      "stanzaCount": number of stanzas,
      "summary": "One-line emotional summary of the poem",
      "tomorrowHint": "One-line teaser for tomorrow's poem"
    }`;
}