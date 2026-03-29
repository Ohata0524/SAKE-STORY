import { useState, useEffect, use } from 'react';
import { Sake } from '@/domain/models/sake';
import { SakeRepository } from '@/infrastructure/repositories/sakeRepository';
import { useAuth } from '@/hooks/useAuth';
import { favoriteRepository } from '@/infrastructure/repositories/favoriteRepository';

/**
 * 銘柄詳細のロジックを管理するカスタムフック
 */
export const useProductDetail = (params: Promise<{ id: string }>) => {
  const { id } = use(params);
  const { user } = useAuth();
  const [sake, setSake] = useState<Sake | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const loadDetail = async () => {
      setLoading(true);
      try {
        const data = await SakeRepository.fetchSakes({});
        // IDの型不一致を防ぐため文字列で比較
        const target = data.find(s => String(s.id) === String(id));
        setSake(target || null);

        if (user && target) {
          const favoriteStatus = await favoriteRepository.isFavorite(user.id, target.id);
          setIsFavorite(favoriteStatus);
        }
      } catch (error) {
        console.error('詳細の取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [id, user]);

  /**
   * お気に入り登録・解除の切り替え
   */
  const toggleFavorite = async () => {
    if (!user || !sake) return;
    try {
      if (isFavorite) {
        /* 修正：removeFavorite -> remove に変更 */
        await favoriteRepository.remove(user.id, sake.id);
      } else {
        /* 修正：addFavorite -> add に変更 */
        await favoriteRepository.add(user.id, sake.id);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('お気に入り操作に失敗しました:', error);
    }
  };

  return { sake, loading, isFavorite, toggleFavorite };
};