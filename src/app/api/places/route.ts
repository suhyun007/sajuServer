import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY || 'AIzaSyB0BOU0Kal4_KgtDZTbUocP2eM4uo41Fqc';

// 지역 검색 및 상세 정보 API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input, placeId, action } = body;

    // 검색 액션
    if (action === 'search') {
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
          languageCode: 'ko',
        }),
      });

      if (!response.ok) {
        console.error('Google Places API 오류:', response.status, response.statusText);
        return NextResponse.json(
          { error: '지역 검색에 실패했습니다.' }, 
          { status: response.status }
        );
      }

      const data = await response.json();
      const suggestions = data.suggestions || [];
      
      // 응답 형식을 Flutter에서 사용하기 쉽게 변환
      const predictions = suggestions.map((suggestion: any) => {
        const placePrediction = suggestion.placePrediction;
        return {
          place_id: placePrediction.placeId,
          description: placePrediction.text.text,
        };
      });

      return NextResponse.json({ predictions });
    }

    // 상세 정보 액션
    if (action === 'details') {
      if (!placeId) {
        return NextResponse.json({ error: 'placeId가 필요합니다.' }, { status: 400 });
      }

      const url = `https://places.googleapis.com/v1/places/${placeId}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_API_KEY,
          'X-Goog-FieldMask': 'location,formattedAddress',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        console.error('Google Places Details API 오류:', response.status, response.statusText);
        return NextResponse.json(
          { error: '지역 상세 정보를 가져올 수 없습니다.' }, 
          { status: response.status }
        );
      }

      const data = await response.json();
      
      return NextResponse.json({
        location: data.location,
        formattedAddress: data.formattedAddress,
      });
    }

    return NextResponse.json({ error: '잘못된 액션입니다.' }, { status: 400 });
  } catch (error) {
    console.error('Places API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' }, 
      { status: 500 }
    );
  }
}
