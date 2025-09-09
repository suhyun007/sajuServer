import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, resultType, content, language, servedDate } = body;

    if (!userId || !resultType || !content) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('saju_results')
      .insert({
        user_id: userId,
        result_type: resultType,
        content: content,
        language: language || 'ko',
        served_date: servedDate || new Date().toISOString().slice(0, 10)
      })
      .select()
      .single();

    if (error) {
      console.error('사주 결과 저장 오류:', error);
      return NextResponse.json(
        { success: false, error: '결과 저장에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('사주 결과 저장 API 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const resultType = searchParams.get('resultType');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    let query = supabaseAdmin
      .from('saju_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (resultType) {
      query = query.eq('result_type', resultType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('사주 결과 조회 오류:', error);
      return NextResponse.json(
        { success: false, error: '결과 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('사주 결과 조회 API 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
