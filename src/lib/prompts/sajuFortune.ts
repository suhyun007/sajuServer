export interface SajuRequest {
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

export function generateFortunePrompt(fortuneData: SajuRequest): string {
  const { birthYear, birthMonth, birthDay, birthHour, birthMinute, gender, location, loveStatus, currentDate, genre, language } = fortuneData;
  
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

export function getFortuneSystemPrompt(language: string): string {
  const languageLabel = 
    language === 'ko' ? 'Korean' :
    language === 'ja' ? 'Japanese' :
    language === 'zh' ? 'Chinese' : 'English';
    
  return `You are a professional writer creating daily personalized short stories inspired by astrology.
Guidelines:
1. Do NOT mention birth date, birthplace, zodiac signs, or astrology terms.
2. Create a warm, hopeful short story that reflects the energies and possible emotions of today (based on the current date).
3. Focus on beauty and meaning in everyday life.
4. Include subtle hints of destiny or guidance without being explicit.
5. Each field must be written in ${languageLabel}, exactly 2 lines per item.
6. The total is about 450 characters.
7. Return only valid JSON in the following format:
{
  "love": "Love",
  "wealth": "Wealth",
  "health": "Health",
  "study": "Study & Business",
  "overall": "Overall"
}`;
}