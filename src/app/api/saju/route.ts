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
function calculateSaju(birthData: SajuRequest): { saju: string; elements: any } {
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
async function generateTodayFortune(birthData: SajuRequest, saju: string): Promise<TodayFortune> {
  try {
    const prompt = generateSajuFortunePrompt(birthData);

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
    
    // JSON 파싱 시도
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.today_fortune;
      }
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
    }

    // JSON 파싱에 실패한 경우 기본 응답 반환
    return {
      overall: "오늘은 평온한 하루가 될 것입니다.",
      wealth: "재정적으로 안정적인 하루입니다.",
      health: "건강에 특별한 문제는 없을 것입니다.",
      love: "연애운이 평범한 하루입니다.",
      advice: "차분한 마음으로 하루를 보내시기 바랍니다."
    };

  } catch (error) {
    console.error('OpenAI API 호출 오류:', error);
    
    // API 오류 시 기본 응답 반환
    return {
      overall: "오늘은 평온한 하루가 될 것입니다.",
      wealth: "재정적으로 안정적인 하루입니다.",
      health: "건강에 특별한 문제는 없을 것입니다.",
      love: "연애운이 평범한 하루입니다.",
      advice: "차분한 마음으로 하루를 보내시기 바랍니다."
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: SajuRequest = await request.json();
    
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
    
    // OpenAI를 통한 오늘의 운세 생성
    const todayFortune = await generateTodayFortune(body, sajuData.saju);
    
    return NextResponse.json({
      success: true,
      data: {
        ...sajuData,
        today_fortune: todayFortune,
      },
    });
    
  } catch (error) {
    console.error('사주 계산 중 오류 발생:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
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
