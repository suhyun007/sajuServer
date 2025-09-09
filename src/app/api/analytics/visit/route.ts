import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      guestId, 
      userId, 
      deviceInfo, 
      ipAddress,
      nation 
    } = body;

    console.log('방문 로그 요청 데이터:', {
      guestId,
      userId,
      deviceInfo,
      ipAddress,
      nation
    });

    // IP 주소 추출 (클라이언트에서 전달하지 않은 경우)
    const clientIP = ipAddress || 
      request.headers.get('x-forwarded-for') || 
      request.headers.get('x-real-ip') || 
      '127.0.0.1';

    // user_visit_logs 테이블에 데이터 삽입
    const { data, error } = await supabaseAdmin
      .from('user_visit_logs')
      .insert({
        guest_id: guestId || null,
        user_id: userId || null,
        device_info: deviceInfo,
        ip_address: clientIP,
        nation: nation || null
      })
      .select()
      .single();

    if (error) {
      console.error('방문 로그 저장 오류:', error);
      return NextResponse.json({
        success: false,
        error: '방문 로그 저장에 실패했습니다.',
        details: error.message
      });
    }

    return NextResponse.json({
      success: true,
      message: '방문 로그가 성공적으로 저장되었습니다.',
      data: {
        id: data.id,
        guest_id: data.guest_id,
        session_id: data.session_id,
        visited_dt: data.visited_dt
      }
    });

  } catch (error) {
    console.error('방문 로그 API 오류:', error);
    return NextResponse.json({
      success: false,
      error: '서버 오류가 발생했습니다.',
      details: String(error)
    });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const guestId = searchParams.get('guestId');
    const userId = searchParams.get('userId');

    let query = supabaseAdmin
      .from('user_visit_logs')
      .select('*')
      .order('visited_dt', { ascending: false })
      .limit(10);

    if (guestId) {
      query = query.eq('guest_id', guestId);
    }
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('방문 로그 조회 오류:', error);
      return NextResponse.json({
        success: false,
        error: '방문 로그 조회에 실패했습니다.',
        details: error.message
      });
    }

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('방문 로그 조회 API 오류:', error);
    return NextResponse.json({
      success: false,
      error: '서버 오류가 발생했습니다.',
      details: String(error)
    });
  }
}
