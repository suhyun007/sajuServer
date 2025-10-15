const ALLOWED_ITEMS = [
  'letter', 'oldPhoto', 'musicBox', 'umbrella', 'book', 'coffee', 'pendant', 'lantern', 'flower', 'watch',
  'Guiding lantern', 'Lucky charm', 'Healing crystal', 'Golden key', 'Treasure chest', 'Feather of hope',
  'Enchanted harp', 'Friendship bracelet', 'Magic ink pen', 'Love letter', 'Eternal candle', 'Blossoming flower',
  'Starlight pendant', 'Dreamcatcher', 'Rainbow shell', 'Angel’s feather', 'Music box', 'Sunstone', 'Healing herb pouch',
  'Storybook', 'Sapphire ring', 'Festival mask', 'Dove feather', 'Fortune cookie', 'Secret diary', 'Warm blanket', 'Silver locket',
  'Harmony flute', 'Memory photograph', 'Garden seed packet', 'Bright ribbon', 'Lantern of wishes', 'Guiding compass',
  'Magical paintbrush', 'Lucky coin', 'Celebration crown', 'Bottle of fireflies', 'Shooting star charm', 'Happy balloon',
  'Blooming wreath', 'Traveler’s map', 'Peace bell', 'Rainbow crystal', 'Dream journal', 'Songbird cage', 'Hope scroll',
  'Candle of friendship', 'Healing potion', 'Birthday cake', 'Sunrise painting',
] as const;

function pickDaily<T extends readonly string[]>(list: T, seed: string): T[number] {
  // Simple deterministic hash → index
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return list[hash % list.length];
}

export function resolvePoetryDailyElements(dateStr: string) {
  return {
    genre: 'daily',
    item: pickDaily(ALLOWED_ITEMS, `i-${dateStr}`),
  };
}

type Item = typeof ALLOWED_ITEMS[number];

export interface PoetryRequest {
  gender?: 'female' | 'male' | 'nonBinary';  // 선택 사항
  tone?: string;                              // 선택 사항
  currentDate: string;
  language: 'ko' | 'en' | 'ja' | 'zh';
  ageGroup?: string;                          // 선택 사항
  world?: string;                             // 선택 사항
  growthTheme?: string;                       // 성장 테마 (영어 키값)
  loveRelation?: string;                      // 사랑/관계 (영어 키값)
  worldAction?: string;                       // 세상/행동 (영어 키값)
  genre: 'daily';
  item: Item;
}
//user prompt
export function generatePoetryPrompt(poetryData: PoetryRequest): string {
  const { gender, tone, currentDate, genre, language, ageGroup, world, item, growthTheme, loveRelation, worldAction } = poetryData;
  
  const languageLabel =
    language === 'ko' ? 'Korean' :
    language === 'ja' ? 'Japanese' :
    language === 'zh' ? 'Chinese' : 'English';
  
  // 모든 캐릭터 정보를 동적으로 추가
  const characterElements = [];
  if (ageGroup) characterElements.push(`    - Age group of the main character: ${ageGroup}`);
  if (gender) characterElements.push(`    - Gender of the main character: ${gender}`);
  if (world) characterElements.push(`    - Story world or background: ${world}`);
  if (tone) characterElements.push(`    - Tone or emotional mood: ${tone}`);
  if (growthTheme) characterElements.push(`    - Growth theme: ${growthTheme}`);
  if (loveRelation) characterElements.push(`    - Love/Relationship: ${loveRelation}`);
  if (worldAction) characterElements.push(`    - World/Action: ${worldAction}`);
  
  return `
    Write a short poem using the following inputs:
${characterElements.length > 0 ? characterElements.join('\n') : ''}
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
  
  // 언어별 톤 지시사항
  const toneInstruction = 
    language === 'ko' ? 'Use a poetic and emotional tone that feels like a modern Korean short story.' 
      : language === 'ja' ? 'Use delicate and introspective language, like a Japanese literary vignette.' 
      : language === 'zh' ? 'Use elegant, poetic phrasing reminiscent of modern Chinese prose.' 
      : 'Use expressive, lyrical English reminiscent of literary fiction.';

  // 언어별 길이 조정 (시라서 에피소드보다 짧게)
  const targetLength =
  language === 'ko' || language === 'ja' || language === 'zh'
    ? 'around 600–800 characters (approximately 10–14 lines of verse)'
    : 'around 800–900 characters (approximately 10-14 lines of verse)';

  return `You are a professional poet who creates short daily poems,
  designed to feel like a delicate gift of words each day.
  Guidelines:
  1. Do NOT explicitly mention the story world. Incorporate these concepts subtly if needed.
  2. Write in ${languageLabel}.
  3. The poem should be lyrical, imaginative, and emotionally resonant.
  4. Adopt the following tone and mood if provided: ${toneInstruction || 'balanced and introspective'}.
  5. Avoid predictions or fortune-telling; focus on beauty and literary depth.
  6. Aim for ${targetLength}, enough to feel complete but concise.
  7. Return ONLY valid JSON, without explanations, notes, or extra text.
  8. JSON format:
  {
  "title": "Poem title",
  "content": "Poem content (line breaks allowed)",
  "contentLength": Number of characters in content string,
  "summary": "One-line summary of this poem",
  "tomorrowSummary": "One-line teaser for tomorrow's poem"
  }`;

}