import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sake } from '@/domain/models/sake';
import { SakeRepository } from '@/infrastructure/repositories/sakeRepository';

export const useSakeList = () => {
  const searchParams = useSearchParams();
  const initialKeyword = searchParams.get('q') || '';
  const initialTaste = searchParams.get('taste') || '';

  const [sakes, setSakes] = useState<Sake[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // リポジトリを呼び出してデータを取得
        // キーワード（初心者/ギフト/晩酌など）を正しく渡す
        const data = await SakeRepository.fetchSakes({
          keyword: initialKeyword,
          taste: initialTaste
        });
        setSakes(data);
      } catch (err) {
        console.error('データ取得エラー:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [initialKeyword, initialTaste]);


  const getCurrentFilter = () => {
    if (initialTaste === '甘口') return 'sweet';
    if (initialTaste === '辛口') return 'dry';
    if (initialKeyword === '初心者') return 'beginner';
    if (initialKeyword === 'ギフト') return 'gift';
    if (initialKeyword === '晩酌') return 'daily';
    return 'all';
  };

  return {
    sakes, 
    loading, 
    keyword, 
    setKeyword, 
    sortOrder, 
    setSortOrder,
    initialTaste, 
    initialKeyword, 
    getCurrentFilter
  };
};