import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      guestId, 
      userId, 
      sessionId,
      menuType 
    } = body;

    // menu_type 유효성 검증
    const validMenuTypes = [
      'splash',      // 스플래시 화면
      'episode',     // 에피소드
      'poetry',      // 시
      'guide',       // 가이드
      'myPage',      // 마이페이지
      'saveInfo',    // 태어난 정보 입력/저장
      'privacy',     // 개인정보처리방침
      'diaries',     // 일기
      'detailDiary' // 일기 상세
    ];

    if (!menuType || !validMenuTypes.includes(menuType)) {
      return NextResponse.json({
        success: false,
        error: '유효하지 않은 메뉴 타입입니다.',
        validTypes: validMenuTypes
      }, { status: 400 });
    }

    // menu_click_logs 테이블에 데이터 삽입
    const { data, error } = await supabaseAdmin
      .from('menu_click_logs')
      .insert({
        guest_id: guestId,
        user_id: userId || null,
        session_id: sessionId || null,
        menu_type: menuType
      })
      .select()
      .single();

    if (error) {
      console.error('메뉴 클릭 로그 저장 오류:', error);
      return NextResponse.json({
        success: false,
        error: '메뉴 클릭 로그 저장에 실패했습니다.',
        details: error.message
      });
    }

    return NextResponse.json({
      success: true,
      message: '메뉴 클릭 로그가 성공적으로 저장되었습니다.',
      data: {
        id: data.id,
        guest_id: data.guest_id,
        menu_type: data.menu_type,
        clicked_dt: data.clicked_dt
      }
    });

  } catch (error) {
    console.error('메뉴 클릭 로그 API 오류:', error);
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
    const menuType = searchParams.get('menuType');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabaseAdmin
      .from('menu_click_logs')
      .select('*')
      .order('clicked_dt', { ascending: false })
      .limit(limit);

    if (guestId) {
      query = query.eq('guest_id', guestId);
    }
    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (menuType) {
      query = query.eq('menu_type', menuType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('메뉴 클릭 로그 조회 오류:', error);
      return NextResponse.json({
        success: false,
        error: '메뉴 클릭 로그 조회에 실패했습니다.',
        details: error.message
      });
    }

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('메뉴 클릭 로그 조회 API 오류:', error);
    return NextResponse.json({
      success: false,
      error: '서버 오류가 발생했습니다.',
      details: String(error)
    });
  }
}
