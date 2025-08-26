'use client';

import { useState } from 'react';
import { SajuRequest } from '@/lib/prompts';

interface TodayFortune {
  overall: string;
  wealth: string;
  health: string;
  love: string;
  advice: string;
}

interface SajuResponse {
  success: boolean;
  data?: {
    saju: string;
    elements: {
      year: string;
      month: string;
      day: string;
      hour: string;
    };
    today_fortune: TodayFortune;
  };
  error?: string;
}

export default function TestPage() {
  const [formData, setFormData] = useState<SajuRequest>({
    birthYear: 1980,
    birthMonth: 1,
    birthDay: 20,
    birthHour: 23,
    birthMinute: 30,
    gender: 'male',
  });

  const [response, setResponse] = useState<SajuResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/saju', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error('API 호출 중 오류:', error);
      setResponse({
        success: false,
        error: 'API 호출 중 오류가 발생했습니다.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'gender' ? value : parseInt(value),
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">사주 기반 오늘의 운세</h1>
          <p className="text-gray-600">OpenAI를 활용한 개인화된 오늘의 운세를 확인해보세요</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  출생년도
                </label>
                <input
                  type="number"
                  name="birthYear"
                  value={formData.birthYear}
                  onChange={handleInputChange}
                  min="1900"
                  max="2100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  출생월
                </label>
                <input
                  type="number"
                  name="birthMonth"
                  value={formData.birthMonth}
                  onChange={handleInputChange}
                  min="1"
                  max="12"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  출생일자
                </label>
                <input
                  type="number"
                  name="birthDay"
                  value={formData.birthDay}
                  onChange={handleInputChange}
                  min="1"
                  max="31"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  출생시간 (24시간)
                </label>
                <input
                  type="number"
                  name="birthHour"
                  value={formData.birthHour}
                  onChange={handleInputChange}
                  min="0"
                  max="23"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  출생분
                </label>
                <input
                  type="number"
                  name="birthMinute"
                  value={formData.birthMinute}
                  onChange={handleInputChange}
                  min="0"
                  max="59"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  성별
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                </select>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '운세 계산 중...' : '오늘의 운세 보기'}
              </button>
            </div>
          </form>
        </div>

        {response && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">오늘의 운세 결과</h2>
            
            {response.success ? (
              <div className="space-y-6">
                {/* 출생 정보 */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">출생 정보</h3>
                  <div className="text-center mb-4">
                    <div className="text-2xl font-bold text-blue-700 mb-2">{response.data?.saju}</div>
                    <p className="text-sm text-blue-600">사주 팔자</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-600">년주</div>
                      <div className="text-lg font-bold text-blue-700">{response.data?.elements.year}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">월주</div>
                      <div className="text-lg font-bold text-blue-700">{response.data?.elements.month}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">일주</div>
                      <div className="text-lg font-bold text-blue-700">{response.data?.elements.day}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">시주</div>
                      <div className="text-lg font-bold text-blue-700">{response.data?.elements.hour}</div>
                    </div>
                  </div>
                </div>

                {/* 오늘의 운세 */}
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <h3 className="text-lg font-medium text-green-800 mb-4">오늘의 운세</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-white rounded-md p-3">
                      <h4 className="font-medium text-green-700 mb-1">전체 운세</h4>
                      <p className="text-gray-700">{response.data?.today_fortune.overall}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-md p-3">
                        <h4 className="font-medium text-green-700 mb-1">💰 재물운</h4>
                        <p className="text-gray-700">{response.data?.today_fortune.wealth}</p>
                      </div>
                      
                      <div className="bg-white rounded-md p-3">
                        <h4 className="font-medium text-green-700 mb-1">💪 건강운</h4>
                        <p className="text-gray-700">{response.data?.today_fortune.health}</p>
                      </div>
                      
                      <div className="bg-white rounded-md p-3">
                        <h4 className="font-medium text-green-700 mb-1">💕 연애운</h4>
                        <p className="text-gray-700">{response.data?.today_fortune.love}</p>
                      </div>
                      
                      <div className="bg-white rounded-md p-3">
                        <h4 className="font-medium text-green-700 mb-1">💡 조언</h4>
                        <p className="text-gray-700">{response.data?.today_fortune.advice}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <h3 className="text-lg font-medium text-red-800 mb-2">오류 발생</h3>
                <p className="text-red-700">{response.error}</p>
                {response.error?.includes('OpenAI API 키') && (
                  <p className="text-sm text-red-600 mt-2">
                    환경 변수 OPENAI_API_KEY를 설정해주세요.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
