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

export function resolveDailyElements(dateStr: string) {
  return {
    genre: 'daily',
    item: pickDaily(ALLOWED_ITEMS, `i-${dateStr}`),
  };
}

type Item = typeof ALLOWED_ITEMS[number];

export interface PoetryRequest {
  gender: 'female' | 'male' | 'nonBinary';
  loveStatus: string;
  currentDate: string;
  language: 'ko' | 'en' | 'ja' | 'zh';
  ageGroup: string;
  world: string;
  genre: 'daily';
  item: Item;
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