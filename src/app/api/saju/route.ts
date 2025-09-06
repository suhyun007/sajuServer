import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { generateFortunePrompt, getFortuneSystemPrompt, SajuRequest } from '@/lib/prompts/sajuFortune';

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface SajuFortuneResponse {
  success: boolean;
  data?: {
    love: string;
    wealth: string;
    health: string;
    study: string;
    overall: string;
  };
  error?: string;
}

// OpenAI API를 사용하여 가이드라인 생성
async function generateFortune(fortuneData: SajuRequest): Promise<SajuFortuneResponse['data']> {
  try {
    const startTime = new Date();
    console.log('=== OpenAI API 호출 시작 (시) ===');
    console.log('호출 시점:', startTime.toISOString());
    const prompt = generateFortunePrompt(fortuneData);
    console.log('생성된 프롬프트:', prompt);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: getFortuneSystemPrompt(fortuneData.language)
        },
        {
          role: "user",
          content: prompt,
        }
      ],
      temperature: 0.7,       // 창의성 vs 일관성 밸런스
      max_tokens: 500,        // 500자 내외 요청 + JSON 마무리 공간 확보
      top_p: 1,               // (기본값, 그대로 두면 됨)
      frequency_penalty: 0,   // 반복 억제 (필요하면 조정)
      presence_penalty: 0,    // 새로운 주제 탐색 (필요 없으면 0)
      response_format: { type: 'json_object' },
    });

    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    console.log('OpenAI API 호출 완료 시점:', endTime.toISOString());
    console.log('OpenAI API 호출 소요 시간:', duration + 'ms');
    const responseText = completion.choices[0]?.message?.content || '';
    console.log('OpenAI 원본 응답:', responseText);
    
    // JSON 파싱 시도
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log('JSON 매치 결과:', jsonMatch[0]);
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('파싱된 JSON:', JSON.stringify(parsed, null, 2));
        
        // 필수 필드 검증
        if (parsed.love && parsed.wealth && parsed.health && parsed.study && parsed.overall) {
          return {
            love: parsed.love,
            wealth: parsed.wealth,
            health: parsed.health,
            study: parsed.study,
            overall: parsed.overall,
          };
        } else {
          throw new Error('필수 필드가 누락되었습니다');
        }
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
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== 가이드 API 호출 시작 ===');
    const body: SajuRequest = await request.json();
    console.log('요청 데이터:', JSON.stringify(body, null, 2));
    
    // 필수 필드 검증
    const requiredFields = ['birthYear', 'birthMonth', 'birthDay', 'birthHour', 'birthMinute', 'gender', 'location', 'loveStatus', 'currentDate', 'language'];
    for (const field of requiredFields) {
      const value = body[field as keyof SajuRequest];
      console.log(`필드 ${field} 값:`, value, '타입:', typeof value);
      if (value === undefined || value === null) {
        console.log(`❌ 필수 필드 누락: ${field}`);
        return NextResponse.json(
          { success: false, error: `필수 정보가 누락되었습니다: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // 입력값 검증
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
        { success: false, error: '유효하지 않은 출생일자입니다.' },
        { status: 400 }
      );
    }
    
    if (body.birthHour < 0 || body.birthHour > 23) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 출생시간입니다.' },
        { status: 400 }
      );
    }
    
    if (body.birthMinute < 0 || body.birthMinute > 59) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 출생분입니다.' },
        { status: 400 }
      );
    }
    
    if (!['female', 'male', 'nonBinary'].includes(body.gender)) {
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
    
    // OpenAI를 통한 에피소드 생성
    console.log('OpenAI API 호출 시작...');
    const fortuneData = await generateFortune(body);
    console.log('OpenAI 응답 결과:', JSON.stringify(fortuneData, null, 2));
    
    const responseData = {
      success: true,
      data: fortuneData,
    };
    
    console.log('=== 최종 응답 ===');
    console.log('응답 데이터:', JSON.stringify(responseData, null, 2));
    console.log('==================');
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('=== 오늘의 가이드라인 API 오류 발생 ===');
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
    message: '오늘의 가이드라인 API 서버가 정상적으로 작동 중입니다.',
    endpoints: {
      POST: '/api/saju - 개인화된 오늘의 가이드라인 생성',
    },
    note: 'OpenAI API 키가 필요합니다. 환경 변수 OPENAI_API_KEY를 설정해주세요.',
  });
}
