export interface PoetryRequest {
  gender: 'female' | 'male' | 'nonBinary';
  loveStatus: string;
  currentDate: string;
  genre: string;
  language: 'ko' | 'en' | 'ja' | 'zh';
  ageGroup: string;
  world: string;
  item: string;
}
//user prompt
export function generatePoetryPrompt(poetryData: PoetryRequest): string {
  const { gender, loveStatus, currentDate, genre, language, ageGroup, world, item } = poetryData;
  
  const languageLabel =
    language === 'ko' ? 'Korean' :
    language === 'ja' ? 'Japanese' :
    language === 'zh' ? 'Chinese' : 'English';  
    return `
    Write a short poem using the following inputs:
    - Age group of the main character: ${ageGroup}
    - Gender of the main character: ${gender}
    - Story world or background: ${world}
    - Tone or emotional mood: ${loveStatus}
    - Current date: ${currentDate}
    - Genre: ${genre}
    - Object/item: ${item}
    The poem must be written in ${languageLabel}, weaving these elements naturally into the imagery.
    `;
}

// System 프롬프트 함수 (언어별 동적 생성)
export function getPoetrySystemPrompt(language: string): string {
  const languageLabel = 
    language === 'ko' ? 'Korean' :
    language === 'ja' ? 'Japanese' :
    language === 'zh' ? 'Chinese' : 'English';
    
    // 언어별 길이 조정 (시라서 에피소드보다 짧게)
  const targetLength =
  language === 'ko' || language === 'ja' || language === 'zh'
    ? 'around 250–300 characters'
    : 'around 400–450 characters';

  return `You are a professional poet who creates short daily poems,
  designed to feel like a delicate gift of words each day.
  Guidelines:
  1. Write in ${languageLabel}.
  2. The poem should be lyrical, imaginative, and emotionally resonant.
  3. Avoid predictions or fortune-telling; focus on beauty and literary depth.
  4. Aim for ${targetLength}, enough to feel complete but concise.
  5. Return ONLY valid JSON, without explanations, notes, or extra text.
  6. JSON format:
  {
  "title": "Poem title",
  "content": "Poem content (line breaks allowed)",
  "contentLength": Number of characters in content string,
  "summary": "One-line summary of this poem",
  "tomorrowSummary": "One-line teaser for tomorrow's poem"
  }`;

}