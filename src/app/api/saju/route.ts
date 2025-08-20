import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { generateSajuFortunePrompt, SAJU_SYSTEM_PROMPT, SajuRequest } from '@/lib/prompts';

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface TodayFortune {
  overall: string;
  wealth: string;
  health: string;
  love: string;
  advice: string;
}

export interface SajuResponse {
  success: boolean;
  data?: {
    saju: string;
    elements: {
      year: string;
      month: string;
      day: string;
      hour: string;
    };
    today_fortune: TodayFortune;
  };
  error?: string;
}

// 간단한 사주 계산 함수
function calculateSaju(birthData: SajuRequest): { saju: string; elements: { year: string; month: string; day: string; hour: string } } {
  const { birthYear, birthMonth, birthDay, birthHour } = birthData;
  
  const yearElement = getYearElement(birthYear);
  const monthElement = getMonthElement(birthMonth);
  const dayElement = getDayElement(birthDay);
  const hourElement = getHourElement(birthHour);
  
  const saju = `${yearElement}${monthElement}${dayElement}${hourElement}`;
  
  return {
    saju,
    elements: {
      year: yearElement,
      month: monthElement,
      day: dayElement,
      hour: hourElement,
    },
  };
}

function getYearElement(year: number): string {
  const elements = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  return elements[year % 10];
}

function getMonthElement(month: number): string {
  const elements = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
  return elements[month - 1];
}

function getDayElement(day: number): string {
  const elements = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  return elements[day % 10];
}

function getHourElement(hour: number): string {
  const elements = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  return elements[Math.floor(hour / 2) % 12];
}

// OpenAI API를 사용하여 운세 생성
async function generateTodayFortune(birthData: SajuRequest, _saju: string): Promise<TodayFortune> {
  try {
    console.log('=== OpenAI API 호출 시작 ===');
    const prompt = generateSajuFortunePrompt(birthData);
    console.log('생성된 프롬프트:', prompt);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: SAJU_SYSTEM_PROMPT
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    console.log('OpenAI 원본 응답:', responseText);
    
    // JSON 파싱 시도
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log('JSON 매치 결과:', jsonMatch[0]);
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('파싱된 JSON:', JSON.stringify(parsed, null, 2));
        return parsed.today_fortune;
      } else {
        console.log('JSON 패턴 매치 실패');
      }
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
    }

    // JSON 파싱에 실패한 경우 에러 반환
    console.log('JSON 파싱 실패');
    throw new Error('OpenAI 응답 파싱 실패: 유효하지 않은 JSON 형식');

  } catch (error) {
    console.error('OpenAI API 호출 오류:', error);
    throw error; // 에러를 상위로 전파
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== 사주 API 호출 시작 ===');
    const body: SajuRequest = await request.json();
    console.log('요청 데이터:', JSON.stringify(body, null, 2));
    
    // 입력 검증
    if (!body.birthYear || !body.birthMonth || !body.birthDay || !body.birthHour || !body.gender) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }
    
    if (body.birthYear < 1900 || body.birthYear > 2100) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 출생년도입니다.' },
        { status: 400 }
      );
    }
    
    if (body.birthMonth < 1 || body.birthMonth > 12) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 출생월입니다.' },
        { status: 400 }
      );
    }
    
    if (body.birthDay < 1 || body.birthDay > 31) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 출생일입니다.' },
        { status: 400 }
      );
    }
    
    if (body.birthHour < 0 || body.birthHour > 23) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 출생시간입니다.' },
        { status: 400 }
      );
    }
    
    if (!['male', 'female'].includes(body.gender)) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 성별입니다.' },
        { status: 400 }
      );
    }

    // OpenAI API 키 확인
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }
    
    // 사주 계산
    const sajuData = calculateSaju(body);
    console.log('사주 계산 결과:', JSON.stringify(sajuData, null, 2));
    
    // OpenAI를 통한 오늘의 운세 생성
    console.log('OpenAI API 호출 시작...');
    const todayFortune = await generateTodayFortune(body, sajuData.saju);
    console.log('OpenAI 응답 결과:', JSON.stringify(todayFortune, null, 2));
    
    const responseData = {
      success: true,
      data: {
        ...sajuData,
        today_fortune: todayFortune,
      },
    };
    
    console.log('=== 최종 응답 ===');
    console.log('응답 데이터:', JSON.stringify(responseData, null, 2));
    console.log('==================');
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('=== 사주 API 오류 발생 ===');
    console.error('오류 타입:', error?.constructor?.name || 'Unknown');
    console.error('오류 메시지:', String(error));
    console.error('오류 스택:', error instanceof Error ? error.stack : '스택 정보 없음');
    console.error('==================');
    
    return NextResponse.json(
      { 
        success: false, 
        error: `서버 오류가 발생했습니다: ${String(error)}` 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: '사주 API 서버가 정상적으로 작동 중입니다.',
    endpoints: {
      POST: '/api/saju - 사주 계산 및 오늘의 운세',
    },
    note: 'OpenAI API 키가 필요합니다. 환경 변수 OPENAI_API_KEY를 설정해주세요.',
  });
}
