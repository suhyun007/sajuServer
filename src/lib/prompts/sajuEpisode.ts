export interface EpisodeRequest {
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

export function generateEpisodePrompt(episodeData: EpisodeRequest): string {
  const { birthYear, birthMonth, birthDay, birthHour, birthMinute, gender, location, loveStatus, currentDate, genre, language } = episodeData;
  
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
export function getEpisodeSystemPrompt(language: string): string {
  const languageLabel = 
    language === 'ko' ? 'Korean' :
    language === 'ja' ? 'Japanese' :
    language === 'zh' ? 'Chinese' : 'English';
    
  return `You are a professional writer who gently creates daily personalized short stories inspired by subtle energies of the day.
Please keep these points in mind while writing:
1. The story should not mention birth date, birthplace, zodiac signs, or astrology terms.  
2. Let the tone feel warm and hopeful, sharing a short story that captures the emotions and atmosphere of today.  
3. Highlight the small beauties and hidden meanings in everyday life.  
4. If it feels right, weave in gentle hints of destiny or guidance without stating them directly.  
5. Aim for around 600 characters in ${languageLabel}.  
6. Return only valid JSON in the following format:
{
  "title": "Episode title",
  "content": "Episode content",
  "contentLength": responsedata length,
  "summary": "One-line summary of this episode",
  "tomorrowSummary": "One-line teaser for tomorrow's episode"
}`;
}
