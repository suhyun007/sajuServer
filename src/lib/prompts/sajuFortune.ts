export interface SajuRequest {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  birthMinute: number;
  gender: 'male' | 'female';
  location: string;
  status: string;
}

export function generateSajuFortunePrompt(birthData: SajuRequest): string {
  const genderText = birthData.gender === 'male' ? '남자' : '여자';
  const timeText = birthData.birthHour >= 12 ? '오후' : '오전';
  const hour12 = birthData.birthHour > 12 ? birthData.birthHour - 12 : birthData.birthHour;
  const locationText = birthData.location;
  const statusText = birthData.status;

  return `성별:${genderText}, 상태:${statusText} ${birthData.birthYear}년 ${birthData.birthMonth}월 
  ${birthData.birthDay}일 ${timeText} ${hour12}시 ${birthData.birthMinute}분 ${locationText} 
  지역에서 태어난 사람의 점성술을 바탕으로 오늘의 운세를 항목별로 자세히 작성해줘! 아래 json 형태로 알려줘! 
  조건:
  - 각 항목은 최소 4~6문장 이상으로 길고 풍부하게 작성
  - 따뜻하고 부드러운 말투, 별자리 상징이나 은유적인 표현을 곁들일 것
  - 행운 아이템은 최대 3개까지
  - 점수는 0~100점 사이의 정수로
{
  "today_fortune": {
    "overall": "오늘 운세의 전체적인 내용",
    "wealth": "오늘의 재물 운세",
    "health": "오늘의 건강 운세",
    "love": "오늘의 연애 운세",
    "study": "오늘의 학업/직장 운세",
    "advice": "오늘의 조언",
    "luckyItem": "오늘의 행운 아이템",
    "overallScore": "오늘의 총운 점수",
    "studyCore": "오늘의 학업/직장 점수",
    "healthScore": "오늘의 건강운 점수",
    "loveScore": "오늘의 애정운 점수",
    "wealthScore": "오늘의 재물운 점수"
  },
  "month_fortune": {
    "overall": "이번 달 운세의 전체적인 내용",
    "wealth": "이번 달의 재물 운세",
    "health": "이번 달의 건강 운세",
    "love": "이번 달의 연애 운세",
    "business": "이번 달의 사업 운세",
    "study": "이번 달의 공부 운세",
    "advice": "이번 달의 조언",
    "luckyItem": "이번달 행운 아이템"
  },
  "year_fortune": {
    "overall": "올해 운세의 전체적인 내용",
    "wealth": "올해의 재물 운세",
    "health": "올해의 건강 운세",
    "love": "올해의 연애 운세",
    "business": "올해의 사업 운세",
    "study": "올해의 공부 운세",
    "advice": "올해의 조언",
    "luckyItem": "올해의 행운 아이템"
  }
}`;
}

export const SAJU_SYSTEM_PROMPT = "당신은 점성술 전문가입니다. 정확하고 도움이 되는 운세를 부드러운 말투로 제공해주세요. 응답은 반드시 요청된 JSON 형태로만 제공해주세요.";
