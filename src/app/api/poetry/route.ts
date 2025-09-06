import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { generatePoetryPrompt, getPoetrySystemPrompt, PoetryRequest } from '@/lib/prompts/sajuPoetry';

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface PoetryResponse {
  success: boolean;
  data?: {
    title: string;
    content: string;
    contentLength: string;
    summary: string;
    tomorrowSummary: string;
  };
  error?: string;
}

// OpenAI API를 사용하여 시 생성
async function generatePoetry(poetryData: PoetryRequest): Promise<PoetryResponse['data']> {
  try {
    const startTime = new Date();
    console.log('=== OpenAI API 호출 시작 (시) ===');
    console.log('호출 시점:', startTime.toISOString());
    const prompt = generatePoetryPrompt(poetryData);
    console.log('생성된 프롬프트:', prompt);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: getPoetrySystemPrompt(poetryData.language)
        },
        {
          role: "user",
          content: prompt,
        }
      ],
      temperature: 0.7,       // 창의성 vs 일관성 밸런스
      max_tokens: 650,        // 500자 내외 요청 + JSON 마무리 공간 확보
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
      const parsed = JSON.parse(responseText);
      console.log('파싱된 JSON:', JSON.stringify(parsed, null, 2));
      const title = parsed.title;
      const poem = parsed.poem ?? parsed.poetry ?? parsed.content;
      if (title && poem) {
        return {
          title,
          content: poem,
          contentLength: `${poem.length}`,
          summary: parsed.summary || '시 요약',
          tomorrowSummary: parsed.tomorrowHint || parsed.tomorrowSummary || '내일 시 미리보기',
        };
      } else {
        throw new Error('필수 필드가 누락되었습니다');
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
    console.log('=== 시 API 호출 시작 ===');
    const body: PoetryRequest = await request.json();
    console.log('요청 데이터:', JSON.stringify(body, null, 2));
    
    // needDummy 파라미터 확인
    // const needDummy = (body as unknown as Record<string, unknown>)['needDummy'] === true;
    const needDummy = true;
    console.log('needDummy 파라미터:', needDummy);

    if (needDummy) {
      console.log('더미 데이터 반환 모드');
      console.log('언어:', body.language);
      
      let dummyData;
      
      if (body.language === 'en') {
        // 영어 더미 데이터
        dummyData = {
          success: true,
          data: {
            "title": "Awaiting the Journey of Love",
            "content": "The first breath of autumn,  \nturning the whole world into shades of gold.  \nDeep within my heart,  \nI quietly wish for the seed of love to sprout,  \nas I picture the scent of that person.  \n\nDays filled with longing,  \na heart unable to confess,  \ndreaming of moments together  \nbeneath the blue sky,  \nwhispering my wish to the stars above.  \n\nAt the end of this path,  \nfor the moment I meet you,  \nI ready my heart  \nand take one more step forward.  \n\nOn the day love finally arrives,  \nsmall blossoms blooming in my heart  \nwill become a bridge of hope  \nthat connects you and me.",
            "contentLength": "400",
            "summary": "A poem capturing the longing and hope for love.",
            "tomorrowSummary": "Tomorrow speaks of the possibility of a new encounter.",
            "servedDate": (body as any)?.currentDate || new Date().toISOString().slice(0,10)
          }
        };
      }else{
        dummyData = {
          success: true,
          data: {
            "title": "사랑의 여정을 기다리며",
            "content": "가을의 첫 숨결, \n온 세상이 황금빛으로 물들어가네.  \n내 마음의 깊은 곳,  \n사랑의 씨앗이 움트기를  \n조용히 바래며,  \n그 사람의 향기를 그려본다.  \n\n그리움의 나날,  \n고백할 수 없는 마음이,  \n파란 하늘 아래,  \n함께할 순간을 꿈꾸며  \n하늘의 별에 소원을 빌어본다.  \n\n이 길의 끝에,  \n마주칠 너를 위해,  \n내 마음의 준비를 다하고  \n한 걸음 더 나아간다.  \n\n사랑이 찾아오는 그 날,  \n내 마음에 피어나는  \n작은 꽃들이,  \n너와 나를 잇는  \n희망의 다리가 될 거야.",
            "contentLength": "400",
            "summary": "사랑의 기다림과 희망을 담은 시.",
            "tomorrowSummary": "내일은 새로운 만남의 가능성을 이야기합니다.",
            "servedDate": (body as any)?.currentDate || new Date().toISOString().slice(0,10)
          }
        };
      }
      console.log('더미 데이터 응답:', JSON.stringify(dummyData, null, 2));
      return NextResponse.json(dummyData);

    }

    // 필수 필드 검증 (0은 허용, undefined/null/빈 문자열만 누락 처리)
    const requiredFields = ['birthYear', 'birthMonth', 'birthDay', 'birthHour', 'birthMinute', 'gender', 'location', 'loveStatus', 'currentDate', 'language'];
    const missing = requiredFields.filter((key) => {
      const v = (body as unknown as Record<string, unknown>)[key];
      return v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
    });
    if (missing.length) {
      return NextResponse.json(
        { success: false, error: `필수 정보가 누락되었습니다: ${missing.join(',')}` },
        { status: 400 }
      );
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
    const poetryData = await generatePoetry(body);
    console.log('OpenAI 응답 결과:', JSON.stringify(poetryData, null, 2));
    
    const responseData = {
      success: true,
      data: { ...poetryData, servedDate: (body as any)?.currentDate || new Date().toISOString().slice(0,10) },
    };
    
    console.log('=== 최종 응답 ===');
    console.log('응답 데이터:', JSON.stringify(responseData, null, 2));
    console.log('==================');
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('=== 시 API 오류 발생 ===');
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
    message: '시 API 서버가 정상적으로 작동 중입니다.',
    endpoints: {
      POST: '/api/poetry - 개인화된 시 생성',
    },
    note: 'OpenAI API 키가 필요합니다. 환경 변수 OPENAI_API_KEY를 설정해주세요.',
  });
}
