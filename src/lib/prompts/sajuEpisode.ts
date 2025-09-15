// ===== Server-side selection lists (moved from client) =====
const ALLOWED_GENRES = [
  'romance', 'fantasy', 'comedy', 'drama', 'historical', 'healing',
  'mystery', 'webNovel', 'classic',
] as const;

const ALLOWED_WEATHERS = [
  'sunny', 'cloudy', 'rainy', 'snowy', 'windy', 'foggy', 'stormy',
] as const;

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

const ALLOWED_PLOT_DEVICES = [
  'unexpectedMeeting', 'missedMessage', 'lostAndFound', 'coincidence', 'misunderstanding', 'promise', 'secretRevealed', 'timeConstraint',
  'weatherTurn', 'helpFromStranger', 'Reunion with a friend', 'Discovery of a hidden talent', 'Receiving a heartfelt gift', 'A letter of gratitude arrives',
  'Festival lights brighten the night', 'Sharing a secret smile', 'A song that brings healing', 'Forgiveness after conflict', 'Unexpected kindness from a stranger',
  'A dream that inspires courage', 'A lucky encounter on the street', 'Rediscovering an old passion', 'A child’s laughter changing the mood', 'Planting seeds of hope',
  'A rainbow after the rain', 'A pet finding its way home', 'Writing the first page of a journal', 'Learning a new skill', 'A surprise celebration', 'Meeting a mentor',
  'Receiving a message of encouragement', 'Helping someone in need', 'A healing journey begins', 'New friendship formed', 'Overcoming fear with courage',
  'A warm meal shared together', 'A community gathering', 'Completing a meaningful project', 'An unexpected reunion', 'A festival dance', 'Singing under the stars',
  'Building something with love', 'Finding beauty in small details', 'Promise of tomorrow', 'A secret revealed brings joy', 'Passing down wisdom',
  'A story told by a grandparent', 'A journey of self-discovery', 'A heartfelt confession', 'First snowfall of the year', 'Fireworks in celebration',
  'A guiding dream', 'Someone returns safely', 'Receiving good news', 'Laughter shared around a fire', 'Finding a long-lost letter', 'Crafting something handmade',
  'Sharing a wish', 'Hopeful sunrise', 'Beginning a new chapter',
] as const;

function pickDaily<T extends readonly string[]>(list: T, seed: string): T[number] {
  // Simple deterministic hash → index
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return list[hash % list.length];
}

export function resolveEpisodeDailyElements(dateStr: string) {
  return {
    genre: pickDaily(ALLOWED_GENRES, `g-${dateStr}`),
    weather: pickDaily(ALLOWED_WEATHERS, `w-${dateStr}`),
    item: pickDaily(ALLOWED_ITEMS, `i-${dateStr}`),
    plotDevice: pickDaily(ALLOWED_PLOT_DEVICES, `p-${dateStr}`),
  };
}

type Genre = typeof ALLOWED_GENRES[number];
type Weather = typeof ALLOWED_WEATHERS[number];
type Item = typeof ALLOWED_ITEMS[number];
type PlotDevice = typeof ALLOWED_PLOT_DEVICES[number];

export interface EpisodeRequest {
  gender: 'female' | 'male' | 'nonBinary';
  loveStatus: string;
  currentDate: string;
  language: 'ko' | 'en' | 'ja' | 'zh';
  ageGroup: string;
  world: string;
  genre: Genre;
  weather: Weather;
  item: Item;
  plotDevice: PlotDevice;
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