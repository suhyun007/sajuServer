import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // 테스트용 데이터 조회 (실제 생성된 테이블 사용)
    const { data, error } = await supabaseAdmin
      .from('user_visit_logs')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Supabase 연결 테스트 오류:', error);
      return NextResponse.json({
        success: false,
        error: 'Supabase 연결 실패',
        details: error.message
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase 연결 성공!',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Supabase 테스트 오류:', error);
    return NextResponse.json({
      success: false,
      error: '서버 오류',
      details: String(error)
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testData } = body;

    // 테스트용 데이터 삽입 (실제 생성된 테이블 사용)
    const { data, error } = await supabaseAdmin
      .from('user_visit_logs')
      .insert({
        guest_id: '00000000-0000-0000-0000-000000000000', // 테스트용 UUID
        device_info: testData || 'Supabase 테스트 성공!',
        ip_address: '127.0.0.1'
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase 데이터 삽입 테스트 오류:', error);
      return NextResponse.json({
        success: false,
        error: '데이터 삽입 실패',
        details: error.message
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase 데이터 삽입 성공!',
      data: data
    });

  } catch (error) {
    console.error('Supabase 데이터 삽입 테스트 오류:', error);
    return NextResponse.json({
      success: false,
      error: '서버 오류',
      details: String(error)
    });
  }
}
