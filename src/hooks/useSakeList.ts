import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { sakeRepository } from '@/infrastructure/repositories/sakeRepository';
import { sakeListSchema } from '@/domain/schemas/schemas';
import { Sake } from '@/domain/models/sake';

const PREF_ORDER = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
];

export const useSakeList = () => {
  const searchParams = useSearchParams();
  
  const [sakes, setSakes] = useState<Sake[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const [sortOrder, setSortOrder] = useState('newest');

  const initialKeyword = searchParams.get('q') || '';
  const initialTaste = searchParams.get('taste') || '';

  const getCurrentFilter = useCallback(() => {
    if (initialTaste === '甘口') return 'sweet';
    if (initialTaste === '辛口') return 'dry';
    if (initialKeyword === '初心者') return 'beginner';
    if (initialKeyword === 'ギフト') return 'gift';
    if (initialKeyword === '晩酌') return 'daily';
    return 'all';
  }, [initialTaste, initialKeyword]);

  const fetchSakes = useCallback(async (isMounted: boolean) => {
    setLoading(true);
    const q = searchParams.get('q');
    const taste = searchParams.get('taste');

    try {
      const data = await sakeRepository.findAll();
      if (!isMounted) return;

      let filtered = data;
      if (taste) {
        filtered = data.filter(s => s.taste === taste);
      } else if (q) {
        const lowerQ = q.toLowerCase();
        filtered = data.filter(s => 
          s.name.toLowerCase().includes(lowerQ) || 
          s.brewery.toLowerCase().includes(lowerQ)
        );
      }

      const zodResult = sakeListSchema.safeParse(filtered);
      if (zodResult.success) {
        const result = [...zodResult.data] as unknown as Sake[];
        
        // ソート
        if (sortOrder === 'price_asc') {
          result.sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (sortOrder === 'price_desc') {
          result.sort((a, b) => (b.price || 0) - (a.price || 0));
        } else if (sortOrder === 'prefecture') {
          result.sort((a, b) => {
            const indexA = PREF_ORDER.indexOf(a.prefecture || "");
            const indexB = PREF_ORDER.indexOf(b.prefecture || "");
            return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
          });
        }
        setSakes(result);
      }
    } catch (error) {
      console.error(error);
    } finally {
      if (isMounted) setLoading(false);
    }
  }, [searchParams, sortOrder]);

  useEffect(() => {
    let isMounted = true;
    setKeyword(searchParams.get('q') || '');
    void fetchSakes(isMounted);
    return () => { isMounted = false; };
  }, [fetchSakes, searchParams]);

  return {
    sakes, loading, keyword, setKeyword, sortOrder, setSortOrder,
    initialTaste, initialKeyword, getCurrentFilter, fetchSakes
  };
};
