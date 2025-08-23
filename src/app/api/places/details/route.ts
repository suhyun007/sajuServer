import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY || 'AIzaSyBwCKMIwdwgDXewKMXlZRo1sqKOxpRtNac';
// 기존 키 (테스트 후 사용 예정): 'AIzaSyB0BOU0Kal4_KgtDZTbUocP2eM4uo41Fqc'

// 지역 상세 정보 API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { placeId } = body;

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
      console.error('Google API 전체 응답:', await response.text());
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
  } catch (error) {
    console.error('지역 상세 정보 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' }, 
      { status: 500 }
    );
  }
}
