import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { generateFortunePrompt, getFortuneSystemPrompt, SajuRequest } from '@/lib/prompts/sajuFortune';

// OpenAI 클라이언트 초기화 (키가 있을 때만)
let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

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

    if (!openai) {
      throw new Error('OpenAI API 키가 설정되지 않았습니다.');
    }

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
      max_tokens: 400,        // 500자 내외 요청 + JSON 마무리 공간 확보
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
    const servedDate = body.currentDate ?? new Date().toISOString().slice(0, 10);
    console.log('servedDate:', servedDate);

    // OS 종류 확인
    const userAgent = request.headers.get('user-agent') || '';
    const customOSHeader = request.headers.get('x-client-os') || '';
    const isIOS = userAgent.includes('iPhone') || userAgent.includes('iPad') || userAgent.includes('iPod') || customOSHeader.toLowerCase() === 'ios';
    const isAndroid = userAgent.includes('Android') || customOSHeader.toLowerCase() === 'android';
    const osType = isIOS ? 'iOS' : isAndroid ? 'Android' : 'Unknown';
    
    console.log('User-Agent:', userAgent);
    console.log('Custom OS Header:', customOSHeader);
    console.log('OS Type:', osType);
    console.log('isIOS:', isIOS);
    console.log('isAndroid:', isAndroid);

    const needDummy = true;
    const hostHeader = request.headers.get('host') || '';
    const hostname = request.nextUrl.hostname || '';
    const localHosts = ['localhost', '127.0.0.1', '::1', '10.0.2.2'];
    const isLocalHost = localHosts.includes(hostname) || localHosts.some(h => hostHeader.startsWith(h));
    console.log({ needDummy, hostHeader, hostname, isLocalHost });

    // OS별 조건부 처리 예시
    if (isIOS) {
      console.log('iOS 클라이언트에서 요청됨');
      // iOS 특화 로직이나 데이터 처리
    } else if (isAndroid) {
      console.log('Android 클라이언트에서 요청됨');
      // Android 특화 로직이나 데이터 처리
    } else {
      console.log('알 수 없는 OS 또는 웹 클라이언트에서 요청됨');
    }

    if ((needDummy && isLocalHost) || osType =='Android') {
      console.log('더미 데이터 반환 모드');
      console.log('언어:', body.language);
      
      let dummyData;
      
      if (body.language === 'en') {
        // 영어 더미 데이터
        dummyData = {
          success: true,
          data: {
            "love": "Take time to listen to your partner today. Small gestures of kindness can strengthen your relationship.",
            "wealth": "Review your budget and spending habits. Consider setting aside a small amount for future goals.",
            "health": "Stay hydrated and get enough rest. A short walk or light exercise can boost your energy.",
            "study": "Focus on one task at a time. Break down complex topics into smaller, manageable parts.",
            "overall": "Start your day with a positive mindset. Small steps toward your goals can make a big difference.",
            "servedDate": servedDate,
            "osType": osType  // OS 정보를 응답에 포함
          }
        };
      } else if (body.language === 'ja') {
        // 일본어 더미 데이터
        dummyData = {
          success: true,
          data: {
            "love": "今日はパートナーの話をよく聞いてみましょう。小さな親切な行動が関係を深めます。",
            "wealth": "予算と支出を見直してみましょう。将来の目標のために少しずつ貯金を始めるのも良いでしょう。",
            "health": "水分補給を忘れず、十分な休息を取りましょう。短い散歩や軽い運動で気分が良くなります。",
            "study": "一度に一つのことに集中しましょう。複雑な内容も小さな部分に分けて取り組むと理解しやすくなります。",
            "overall": "前向きな気持ちで一日を始めましょう。目標に向けた小さな一歩が大きな変化をもたらします。",
            "servedDate": servedDate,
            "osType": osType  // OS 정보를 응답에 포함
          }
        };
      } else if (body.language === 'zh') {
        // 중국어 더미 데이터
        dummyData = {
          success: true,
          data: {
            "love": "今天花时间倾听伴侣的心声。小小的善意举动可以加深你们的关系。",
            "wealth": "检查一下你的预算和消费习惯。考虑为未来目标存一点钱。",
            "health": "保持充足的水分摄入和休息。短距离散步或轻度运动可以提升你的精力。",
            "study": "一次专注于一个任务。将复杂的话题分解成更小、更容易管理的部分。",
            "overall": "以积极的心态开始新的一天。朝着目标的小步骤可以带来很大的改变。",
            "servedDate": servedDate,
            "osType": osType  // OS 정보를 응답에 포함
          }
        };
      } else {
        // 한국어 더미 데이터 (기본값)
        dummyData = {
          success: true,
          data: {
            "love": "당신의 사랑은 더욱 깊어질 것입니다. 서로의 마음을 이해하고, 따뜻한 대화로 연결될 순간이 찾아옵니다.",
            "wealth": "소소한 재정적 기쁨이 찾아올 수 있습니다. 작은 성취가 큰 행복으로 이어질 것입니다.",
            "health": "오늘은 몸과 마음이 균형을 이루는 날입니다. 자신을 돌보는 시간을 가지세요.",
            "study": "새로운 배움이 여러분을 기다리고 있습니다. 호기심을 가지고 도전해보세요.",
            "overall": "오늘은 새로운 시작의 기운을 느낄 수 있습니다. 긍정적인 마음으로 하루를 맞이하세요.",
            "servedDate": servedDate,
            "osType": osType  // OS 정보를 응답에 포함
          }
        };
      }
      
      console.log('더미 데이터 응답:', JSON.stringify(dummyData, null, 2));
      return NextResponse.json(dummyData);
    }

    // 더미 데이터가 아닌 경우에만 실제 API 로직 실행
    console.log('실제 OpenAI API 호출 모드');
    
    // 더미 데이터가 아닌 경우에만 실제 API 로직 실행
    console.log('실제 OpenAI API 호출 모드');
    console.log('OS 타입:', osType);
    
    // OS별 조건부 처리
    if (isIOS) {
      console.log('iOS 클라이언트에서 실제 API 요청됨');
      // iOS 특화 로직 (예: 특정 프롬프트 조정, 응답 포맷 변경 등)
    } else if (isAndroid) {
      console.log('Android 클라이언트에서 실제 API 요청됨');
      // Android 특화 로직 (예: 특정 프롬프트 조정, 응답 포맷 변경 등)
    } else {
      console.log('알 수 없는 OS 또는 웹 클라이언트에서 실제 API 요청됨');
    }
    
    // 필수 필드 검증
    const requiredFields = ['birthYear', 'birthMonth', 'birthDay', 'birthHour', 'birthMinute', 'gender', 'location', 'tone', 'currentDate', 'language'];
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
      data: { ...fortuneData, servedDate: (body as unknown as Record<string, unknown>)?.currentDate as string || new Date().toISOString().slice(0,10) },
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
