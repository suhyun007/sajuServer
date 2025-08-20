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
  
  return `${genderText} ${birthData.birthYear}년 ${birthData.birthMonth}월 ${birthData.birthDay}일 ${timeText} ${hour12}시 ${birthData.birthMinute}분에 태어난 사람의 사주를 통한 오늘의 운세를 알려줘 아래의 json 형태로 알려줘 

{
  "today_fortune": {
    "overall": "오늘 운세를 적어줘 ",
    "wealth": "금전적인 부분에 대한거",
    "health": "건강 상태",
    "love": "연애 운",
    "advice": "조언"
  }
}`;
}

export const SAJU_SYSTEM_PROMPT = "당신은 전문적인 사주 상담사입니다. 사주를 기반으로 정확하고 도움이 되는 운세를 제공해주세요. 응답은 반드시 요청된 JSON 형태로만 제공해주세요.";
