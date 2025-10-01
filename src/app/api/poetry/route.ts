import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { generatePoetryPrompt, getPoetrySystemPrompt, PoetryRequest, resolvePoetryDailyElements } from '@/lib/prompts/sajuPoetry';

// OpenAI 클라이언트 초기화 (키가 있을 때만)
let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

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

    if (!openai) {
      throw new Error('OpenAI API 키가 설정되지 않았습니다.');
    }

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
    const servedDate = body.currentDate ?? new Date().toISOString().slice(0, 10);
    console.log('servedDate:', servedDate);
    
    // 날짜 기반 요소를 POST 초기에 계산해 재사용
    const { genre, item } = resolvePoetryDailyElements(servedDate);
    console.log('resolvedDaily', { genre, item });
    // 클라이언트 body와 병합하여 이후 동일 변수로 사용
    const finalBody: PoetryRequest = {
      ...(body as PoetryRequest),
      genre,
      item,
    } as PoetryRequest;
    console.log('finalBody for generation:', JSON.stringify(finalBody));

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

    if (isLocalHost) {
      console.log('더미 데이터 반환 모드');
      console.log('언어:', body.language);
      console.log('OS 타입:', osType);
      
      let dummyData;
      
      if (body.language === 'ko') {
        // 한국어 더미 데이터
        dummyData = {
          success: true,
          data: {
            "title": "사랑의 여정을 기다리며",
            "content": "가을의 첫 숨결, \n온 세상이 황금빛으로 물들어가네.  \n내 마음의 깊은 곳,  \n사랑의 씨앗이 움트기를  \n조용히 바래며,  \n그 사람의 향기를 그려본다.  \n\n그리움의 나날,  \n고백할 수 없는 마음이,  \n파란 하늘 아래,  \n함께할 순간을 꿈꾸며  \n하늘의 별에 소원을 빌어본다.  \n\n이 길의 끝에,  \n마주칠 너를 위해,  \n내 마음의 준비를 다하고  \n한 걸음 더 나아간다.  \n\n사랑이 찾아오는 그 날,  \n내 마음에 피어나는  \n작은 꽃들이,  \n너와 나를 잇는  \n희망의 다리가 될 거야.",
            "contentLength": "400",
            "summary": "사랑의 기다림과 희망을 담은 시.",
            "tomorrowSummary": "내일은 새로운 만남의 가능성을 이야기합니다.",
            "servedDate": servedDate,
            "osType": osType  // OS 정보를 응답에 포함
          }
        };
      } else if (body.language === 'ja') {
        // 일본어 더미 데이터
        dummyData = {
          success: true,
          data: {
            "title": "愛の旅路を待ちながら",
            "content": "秋の最初の息吹、\n世界全体が黄金色に染まっていく。\n私の心の奥深く、\n愛の種が芽生えることを\n静かに願いながら、\nあの人の香りを思い描く。\n\n憧れの日々、\n告白できない心が、\n青い空の下、\n一緒にいる瞬間を夢見て\n空の星に願いを込める。\n\nこの道の終わりに、\n出会うあなたのために、\n心の準備を整えて\n一歩ずつ前進する。\n\n愛が訪れるその日、\n私の心に咲く\n小さな花たちが、\nあなたと私を繋ぐ\n希望の橋となるだろう。",
            "contentLength": "400",
            "summary": "愛の待ち望みと希望を込めた詩。",
            "tomorrowSummary": "明日は新しい出会いの可能性を語ります。",
            "servedDate": servedDate,
            "osType": osType  // OS 정보를 응답에 포함
          }
        };
      } else if (body.language === 'zh') {
        // 중국어 더미 데이터
        dummyData = {
          success: true,
          data: {
            "title": "等待爱的旅程",
            "content": "秋天的第一缕气息，\n整个世界染成了金黄色。\n在我心灵的深处，\n静静地期盼着\n爱的种子发芽，\n描绘着那个人的香气。\n\n思念的日子，\n无法告白的心，\n在蓝天下，\n梦想着共度的时光，\n向天空的星星许愿。\n\n在这条路的尽头，\n为了遇见你，\n我准备好我的心，\n一步一步向前迈进。\n\n当爱到来的那一天，\n在我心中绽放的\n小花朵们，\n将成为连接你我的\n希望之桥。",
            "contentLength": "400",
            "summary": "充满爱的等待和希望的诗。",
            "tomorrowSummary": "明天将讲述新相遇的可能性。",
            "servedDate": servedDate,
            "osType": osType  // OS 정보를 응답에 포함
          }
        };
      } else {
        // 영어 더미 데이터 (기본값)
        dummyData = {
          success: true,
          data: {
            "title": "Awaiting the Journey of Love",
            "content": "The first breath of autumn,  \nturning the whole world into shades of gold.  \nDeep within my heart,  \nI quietly wish for the seed of love to sprout,  \nas I picture the scent of that person.  \n\nDays filled with longing,  \na heart unable to confess,  \ndreaming of moments together  \nbeneath the blue sky,  \nwhispering my wish to the stars above.  \n\nAt the end of this path,  \nfor the moment I meet you,  \nI ready my heart  \nand take one more step forward.  \n\nOn the day love finally arrives,  \nsmall blossoms blooming in my heart  \nwill become a bridge of hope  \nthat connects you and me.",
            "contentLength": "400",
            "summary": "A poem capturing the longing and hope for love.",
            "tomorrowSummary": "Tomorrow speaks of the possibility of a new encounter.",
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
    
    // OpenAI API 키 확인
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }
    
    // OpenAI를 통한 에피소드 생성
    console.log('OpenAI API 호출 시작...');
    const poetryData = await generatePoetry(finalBody);
    console.log('OpenAI 응답 결과:', JSON.stringify(poetryData, null, 2));
    
    const responseData = {
      success: true,
      data: { 
        ...poetryData, 
        servedDate: (body as unknown as Record<string, unknown>)?.currentDate as string || new Date().toISOString().slice(0,10),
        osType: osType  // OS 정보를 응답에 포함
      },
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
