export interface EpisodeRequest {
  gender: 'female' | 'male' | 'nonBinary';
  loveStatus: string;
  currentDate: string;
  genre: string;
  language: 'ko' | 'en' | 'ja' | 'zh';
  ageGroup: string;
  world: string;
  weather: string;
  item: string;
  plotDevice: string;
}
function getTargetLength(language: string): string {
  switch (language) {
    case 'ko': // 한국어
    case 'ja': // 일본어
    case 'zh': // 중국어
      return 'around 400–450 characters';
    default:   // 영어
      return 'around 600–700 characters';
  }
}

export function generateEpisodePrompt(episodeData: EpisodeRequest): string {
  const { gender, loveStatus, currentDate, genre, language, ageGroup, world, weather, item, plotDevice } = episodeData;
  
  const languageLabel =
    language === 'ko' ? 'Korean' :
    language === 'ja' ? 'Japanese' :
    language === 'zh' ? 'Chinese' : 'English';
  return `
Write a short episode using the following inputs:
1. Incorporate the following inputs naturally into the story:
   - Age group of the main character: ${ageGroup}
   - Gender of the main character: ${gender}
   - Story world or background: ${world}
   - Tone or emotional mood: ${loveStatus}
   - Current date: ${currentDate}
   - Genre: ${genre}
   - Weather: ${weather}
   - Object/item: ${item}
   - Plot device/event: ${plotDevice}
2. The episode must be written in ${languageLabel}, weaving these elements naturally into the narrative.
`;
}

// System 프롬프트 함수 (언어별 동적 생성)
export function getEpisodeSystemPrompt(language: string): string {
  const languageLabel = 
    language === 'ko' ? 'Korean' :
    language === 'ja' ? 'Japanese' :
    language === 'zh' ? 'Chinese' : 'English';
    
  return `You are a professional fiction writer who creates short daily episodes,
designed to feel like a small piece of literature delivered each day.
Guidelines:
1. Write in ${languageLabel}.
2. Keep the tone immersive, warm, and meaningful, as if offering readers a small gift for the day.
4. Focus on beauty, imagination, and emotional depth rather than predictions or fortune.
5. Write a short episode that feels like a brief but complete story. 
 For ${languageLabel}, aim for approximately ${getTargetLength(language)} in length.
6. Return only valid JSON in the following format:
{
  "title": "Episode title",
  "content": "Episode content",
  "contentLength": Number of characters in content string,
  "summary": "One-line summary of this episode",
  "tomorrowSummary": "Write it in the same style as a book's one-line teaser, mysterious but warm"
}`;
}
