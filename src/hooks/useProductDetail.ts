import { useState, useEffect, useCallback, use } from 'react';
import { supabase } from '@/infrastructure/supabase/supabaseClient';
import { sakeRepository } from '@/infrastructure/repositories/sakeRepository';
import { favoriteRepository } from '@/infrastructure/repositories/favoriteRepository';
import { Sake } from '@/domain/models/sake';

export const useProductDetail = (paramsPromise: Promise<{ id: string }>) => {
  const { id } = use(paramsPromise);
  const [sake, setSake] = useState<Sake | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchSake = useCallback(async (isMounted: boolean) => {
    const sakeId = Number(id);
    if (isNaN(sakeId)) return setLoading(false);

    try {
      const data = await sakeRepository.findById(sakeId);
      const { data: auth } = await supabase.auth.getUser();
      
      if (!isMounted) return;
      setUserId(auth.user?.id || null);

      if (data) {
        setSake(data);
        if (auth.user) {
          const fav = await favoriteRepository.isFavorite(auth.user.id, sakeId);
          setIsFavorite(fav);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (isMounted) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    fetchSake(isMounted);
    return () => { isMounted = false; };
  }, [fetchSake]);

  const toggleFavorite = async () => {
    if (!userId || !sake) return alert('ログインが必要です');
    if (isFavorite) {
      await favoriteRepository.remove(userId, sake.id);
      setIsFavorite(false);
    } else {
      await favoriteRepository.add(userId, sake.id);
      setIsFavorite(true);
    }
  };

  return { sake, loading, isFavorite, toggleFavorite, userId };
};
