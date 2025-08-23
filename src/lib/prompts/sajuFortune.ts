export interface SajuRequest {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  birthMinute: number;
  gender: 'male' | 'female';
}

export function generateSajuFortunePrompt(birthData: SajuRequest): string {
  const genderText = birthData.gender === 'male' ? '남자' : '여자';
  const timeText = birthData.birthHour >= 12 ? '오후' : '오전';
  const hour12 = birthData.birthHour > 12 ? birthData.birthHour - 12 : birthData.birthHour;
  
  return `${genderText} ${birthData.birthYear}년 ${birthData.birthMonth}월 ${birthData.birthDay}일 ${timeText} ${hour12}시 ${birthData.birthMinute}분에 
  태어난 사람의 사주를 통한 오늘의 운세를 알려줘 
  좀 더 부드럽게 말해줘
  아래의 json 형태로 알려줘 

{
  "today_fortune": {
    "overall": "오늘 운세의 전체적인 내용",
    "wealth": "오늘의 금전 운세",
    "health": "오늘의 건강 운세",
    "love": "오늘의 연애 운세",
    "business": "오늘의 사업 운세",
    "study": "오늘의 공부 운세",
    "advice": "오늘의 조언 한마디"
  },
  "month_fortune": {
    "overall": "이번 달 운세의 전체적인 내용",
    "wealth": "이번 달의 금전 운세",
    "health": "이번 달의 건강 운세",
    "love": "이번 달의 연애 운세",
    "business": "이번 달의 사업 운세",
    "study": "이번 달의 공부 운세",
    "advice": "이번 달의 조언 한마디"
  },
  "year_fortune": {
    "overall": "올해 운세의 전체적인 내용",
    "wealth": "올해의 금전 운세",
    "health": "올해의 건강 운세",
    "love": "올해의 연애 운세",
    "business": "올해의 사업 운세",
    "study": "올해의 공부 운세",
    "advice": "올해의 조언 한마디"
  },
  "star_fortune": {
    "overall": "이번달 별자리 운세의 전체적인 내용",
    "wealth": "이번달 별자리의 금전 운세",
    "health": "이번달 별자리의 건강 운세",
    "love": "이번달 별자리의 연애 운세",
    "business": "이번달 별자리의 사업 운세",
    "study": "이번달 별자리의 공부 운세",
    "advice": "이번달 별자리의 조언 한마디"
  }
}`;
}

export const SAJU_SYSTEM_PROMPT = "당신은 전문적인 사주 상담사입니다. 사주를 기반으로 정확하고 도움이 되는 운세를 제공해주세요. 응답은 반드시 요청된 JSON 형태로만 제공해주세요.";
