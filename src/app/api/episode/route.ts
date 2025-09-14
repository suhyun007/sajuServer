import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { generateEpisodePrompt, getEpisodeSystemPrompt, EpisodeRequest } from '@/lib/prompts/sajuEpisode';

// OpenAI 클라이언트 초기화 (더미 데이터 사용 시에는 초기화하지 않음)
let openai: OpenAI | null = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export interface EpisodeResponse {
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

// OpenAI API를 사용하여 에피소드 생성
async function generateEpisode(episodeData: EpisodeRequest): Promise<EpisodeResponse['data']> {
  try {
    const startTime = new Date();
    console.log('=== OpenAI API 호출 시작 (에피소드) ===');
    console.log('호출 시점:', startTime.toISOString());
    const prompt = generateEpisodePrompt(episodeData);
    console.log('생성된 프롬프트:', prompt);

    if (!openai) {
      throw new Error('OpenAI API 키가 설정되지 않았습니다.');
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: getEpisodeSystemPrompt(episodeData.language)
        },
        {
          role: "user",
          content: prompt,
        }
      ],
      temperature: 0.7,       // 창의성 vs 일관성 밸런스
      max_tokens: 700,        // 500자 내외 요청 + JSON 마무리 공간 확보
      top_p: 1,               // (기본값, 그대로 두면 됨)
      frequency_penalty: 0,   // 반복 억제 (필요하면 조정)
      presence_penalty: 0,    // 새로운 주제 탐색 (필요 없으면 0)
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
        if (parsed.title && parsed.content) {
          return {
            title: parsed.title,
            content: parsed.content,
            contentLength: parsed.contentLength || '약 600자',
            summary: parsed.summary || '에피소드 요약',
            tomorrowSummary: parsed.tomorrowSummary || '내일 에피소드 미리보기',
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
    console.log('=== 에피소드 API 호출 시작 ===');
    const body: EpisodeRequest = await request.json();
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

    if (needDummy || osType =='Android') {
      console.log('더미 데이터 반환 모드');
      console.log('언어:', body.language);
      
      let dummyData;
      
      if (body.language === 'ko') {
        // 한국어 더미 데이터
        dummyData = {
          success: true,
          data: {
            title: "운명의 만남",
            content: "어느 화창한 아침, 작은 마을의 한 카페에서 한 여인이 커피를 마시며 창밖을 바라보고 있었다. 그 순간, 그녀의 시선이 한 남자와 마주쳤다. 남자는 책을 읽고 있었고, 그의 눈빛은 깊은 이야기를 담고 있었다. 여인은 그와의 대화가 운명처럼 느껴졌다. 서로의 취향에 대해 이야기하며, 두 사람은 마음의 벽을 허물기 시작했다. 오늘은 새로운 인연을 만날 수 있는 특별한 날임을 느끼며, 여인은 웃음을 지었다.",
            contentLength: "416",
            summary: "운명적인 만남을 통해 새로운 인연을 발견하는 이야기입니다.",
            tomorrowSummary: "어제의 만남이 새로운 모험으로 이어지는 이야기를 들려드립니다.",
            servedDate: servedDate,
            osType: osType  // OS 정보를 응답에 포함
          }
        };
      } else {
        // 영어 더미 데이터
        dummyData = {
          success: true,
          data: {
            title: "A Fateful Encounter",
            content: "On a bright morning in a small village café, a woman sipped her coffee while gazing out the window. At that moment, her eyes met those of a man. He was reading a book, and his gaze seemed to hold a world of untold stories. The woman felt as though their conversation was meant to be. As they spoke about their tastes and interests, the walls around their hearts began to fade. Realizing that today was a special day to meet someone new, the woman smiled warmly.",
            contentLength: "416",
            summary: "A story about discovering a new connection through a fateful meeting.",
            tomorrowSummary: "Tomorrow reveals how yesterday’s encounter blossoms into a new adventure.",
            servedDate: servedDate,
            osType: osType  // OS 정보를 응답에 포함
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
    const episodeData = await generateEpisode(body);
    console.log('OpenAI 응답 결과:', JSON.stringify(episodeData, null, 2));
    
    const responseData = {
      success: true,
      data: { ...episodeData, servedDate: (body as unknown as Record<string, unknown>)?.currentDate as string || new Date().toISOString().slice(0,10) },
    };
    
    console.log('=== 최종 응답 ===');
    console.log('응답 데이터:', JSON.stringify(responseData, null, 2));
    console.log('==================');
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('=== 에피소드 API 오류 발생 ===');
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
    message: '에피소드 API 서버가 정상적으로 작동 중입니다.',
    endpoints: {
      POST: '/api/episode - 개인화된 에피소드 생성',
    },
    note: 'OpenAI API 키가 필요합니다. 환경 변수 OPENAI_API_KEY를 설정해주세요.',
  });
}
