import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SakeRepository } from '@/infrastructure/repositories/sakeRepository';
import { Sake } from '@/domain/models/sake';

export const useHome = () => {
  const router = useRouter();
  const [sakes, setSakes] = useState<Sake[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [showAgeModal, setShowAgeModal] = useState(false);

  useEffect(() => {
    const isVerified = localStorage.getItem('age-verified');
    if (!isVerified) setShowAgeModal(true);
  }, []);

  const fetchRecommended = useCallback(async () => {
    setLoading(true);
    try {
      const data = await SakeRepository.fetchSakes({ limit: 8 });
      setSakes(data || []);
    } catch (error) {
      console.error('データ取得失敗:', error);
      setSakes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommended();
  }, [fetchRecommended]);

  // 検索バーからの遷移
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      router.push(`/list?q=${encodeURIComponent(keyword)}`);
    }
  };

  /**
   * 修正ポイント：handleFilterClick
   * カテゴリーボタンをクリックした際に、正しいURLへジャンプさせます
   */
  const handleFilterClick = (label: string) => {
    const paths: Record<string, string> = {
      "初心者おすすめ": "/list?q=初心者",
      "甘口": "/list?taste=甘口",
      "辛口": "/list?taste=辛口",
      "ギフト用": "/list?q=ギフト",
      "自分用": "/list?q=晩酌"
    };
    const targetPath = paths[label] || '/list';
    console.log("Navigating to:", targetPath); // デバッグ用
    router.push(targetPath);
  };

  const handleAgeVerify = () => {
    localStorage.setItem('age-verified', 'true');
    setShowAgeModal(false);
  };

  return {
    sakes,
    loading,
    keyword,
    setKeyword,
    showAgeModal,
    handleSearch,
    handleFilterClick, // これが返されていないと page.tsx でエラーになります
    handleAgeVerify
  };
};