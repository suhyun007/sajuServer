export interface SajuRequest {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  birthMinute: number;
  gender: 'female' | 'male' | 'nonBinary';
  location: string;
  tone: string;
  currentDate: string;
  genre: string;
  language: 'ko' | 'en' | 'ja' | 'zh';
}

export function generateFortunePrompt(fortuneData: SajuRequest): string {
  const { birthYear, birthMonth, birthDay, birthHour, birthMinute, gender, location, tone, currentDate, genre, language } = fortuneData;
  
  const languageLabel =
    language === 'ko' ? 'Korean' :
    language === 'ja' ? 'Japanese' :
    language === 'zh' ? 'Chinese' : 'English';
  return `
User information:
- Date of birth: ${birthYear}-${birthMonth}-${birthDay} ${birthHour}:${birthMinute}
- Gender: ${gender}
- Birthplace: ${location}
- Love status: ${tone}
- Current date: ${currentDate}
- genre: ${genre}
- write in ${languageLabel} format.`;  
}

export function getFortuneSystemPrompt(language: string): string {
  const languageLabel = 
    language === 'ko' ? 'Korean' :
    language === 'ja' ? 'Japanese' :
    language === 'zh' ? 'Chinese' : 'English';
    
  return `You are a professional writer who gently creates daily personalized short stories inspired by subtle energies of the day.  

  Please keep these points in mind while writing:
  1. Do not explicitly mention the chosen items. Incorporate them naturally into the story or poem so that the narrative flows smoothly.
  2. Let the tone feel warm and hopeful, reflecting the emotions and atmosphere of today (based on the current date).  
  3. Highlight the small beauties and hidden meanings in everyday life.  
  4. It would be lovely to weave in gentle hints of destiny or guidance without stating them directly.  
  5. Each field should be written in ${languageLabel}, with exactly 2 lines for each item.  
  6. The total length can be around 400~500 characters.  
  7. Return only valid JSON in the following format:  

  {
    "love": "Love",
    "wealth": "Wealth",
    "health": "Health",
    "study": "Study & Business",
    "overall": "Overall"
  }`;
}