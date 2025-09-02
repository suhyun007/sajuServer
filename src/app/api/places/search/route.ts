import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY || 'AIzaSyBwCKMIwdwgDXewKMXlZRo1sqKOxpRtNac';
// 기존 키 (테스트 후 사용 예정): 'AIzaSyB0BOU0Kal4_KgtDZTbUocP2eM4uo41Fqc'

// 지역 검색 API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input, language } = body;

    console.log('🌍 서버에서 받은 언어:', language);
    console.log('🌍 서버에서 받은 검색어:', input);

    if (!input) {
      return NextResponse.json({ error: '검색어가 필요합니다.' }, { status: 400 });
    }

    const url = 'https://places.googleapis.com/v1/places:autocomplete';
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'suggestions.placePrediction.placeId,suggestions.placePrediction.text',
      },
      body: JSON.stringify({
        input: input,
        languageCode: language || 'en', // 클라이언트에서 받은 언어 사용, 기본값은 영어
      }),
    });

    if (!response.ok) {
      console.error('Google Places API 오류:', response.status, response.statusText);
      console.error('Google API 전체 응답:', await response.text());
      return NextResponse.json(
        { error: '지역 검색에 실패했습니다.' }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    const suggestions = data.suggestions || [];
    
    // 응답 형식을 Flutter에서 사용하기 쉽게 변환
    const predictions = suggestions.map((suggestion: { placePrediction: { placeId: string; text: { text: string } } }) => {
      const placePrediction = suggestion.placePrediction;
      return {
        place_id: placePrediction.placeId,
        description: placePrediction.text.text,
      };
    });

    return NextResponse.json({ predictions });
  } catch (error) {
    console.error('지역 검색 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' }, 
      { status: 500 }
    );
  }
}
