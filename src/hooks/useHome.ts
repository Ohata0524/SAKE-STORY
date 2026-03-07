'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { sakeRepository } from '@/infrastructure/repositories/sakeRepository';
import { sakeListSchema } from '@/domain/schemas/schemas';
import { Sake } from '@/domain/models/sake';

export const useHome = () => {
  const router = useRouter();
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [sakes, setSakes] = useState<Sake[]>([]);
  const [keyword, setKeyword] = useState('');

  const fetchRecommendations = useCallback(async (isMounted: boolean) => {
    try {
      const data = await sakeRepository.findAll();
      
      if (!isMounted) return;

      const result = sakeListSchema.safeParse(data);
      if (result.success) {
        // トップ画面用に最大8件を表示
        setSakes(result.data.slice(0, 8) as unknown as Sake[]);
      }
    } catch (error) {
      console.error('おすすめ取得失敗:', error);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      // 1. 年齢確認のチェック (localStorage)
      const isVerified = localStorage.getItem('ageVerified');
      
      // 修正：非同期のコンテキスト内で実行することで Cascading Renders を回避
      if (!isVerified && isMounted) {
        setShowAgeModal(true);
      }

      // 2. おすすめの取得
      await fetchRecommendations(isMounted);
    };

    void initialize();

    return () => {
      isMounted = false;
    };
  }, [fetchRecommendations]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); 
    if (keyword.trim()) {
      router.push(`/list?q=${encodeURIComponent(keyword)}`);
    }
  };

  const handleFilterClick = (label: string) => {
    if (label === '甘口' || label === '辛口') {
      router.push(`/list?taste=${encodeURIComponent(label)}`);
    } else {
      let searchWord = label;
      if (label === '初心者おすすめ') searchWord = '初心者';
      if (label === 'ギフト用') searchWord = 'ギフト';
      if (label === '自分用') searchWord = '晩酌';
      router.push(`/list?q=${encodeURIComponent(searchWord)}`);
    }
  };

  const handleAgeVerify = () => {
    localStorage.setItem('ageVerified', 'true');
    setShowAgeModal(false);
  };

  return {
    sakes,
    keyword,
    setKeyword,
    showAgeModal,
    handleSearch,
    handleFilterClick,
    handleAgeVerify,
  };
};
