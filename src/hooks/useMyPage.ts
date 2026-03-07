import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/infrastructure/supabase/supabaseClient';
import { authRepository } from '@/infrastructure/repositories/authRepository';
import { reviewRepository } from '@/infrastructure/repositories/reviewRepository';
import { favoriteRepository } from '@/infrastructure/repositories/favoriteRepository';
import { myReviewListSchema, myFavoriteListSchema } from '@/domain/schemas/schemas';
import { z } from "zod";
import { myReviewSchema, myFavoriteSchema } from '@/domain/schemas/schemas';

type ReviewWithSake = z.infer<typeof myReviewSchema>;
type FavoriteWithSake = z.infer<typeof myFavoriteSchema>;

export const useMyPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'reviews' | 'favorites'>('reviews');
  const [userEmail, setUserEmail] = useState('');
  const [reviews, setReviews] = useState<ReviewWithSake[]>([]);
  const [favorites, setFavorites] = useState<FavoriteWithSake[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 編集モーダル用
  const [editingReview, setEditingReview] = useState<ReviewWithSake | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');

  const fetchData = useCallback(async (userId: string, isMounted: boolean) => {
    try {
      const [reviewData, favData] = await Promise.all([
        reviewRepository.findByUserId(userId),
        favoriteRepository.findByUserId(userId)
      ]);
      if (!isMounted) return;

      const rResult = myReviewListSchema.safeParse(reviewData);
      if (rResult.success) setReviews(rResult.data);

      const fResult = myFavoriteListSchema.safeParse(favData);
      if (fResult.success) setFavorites(fResult.data);
    } catch (e) {
      console.error(e);
    } finally {
      if (isMounted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!isMounted) return;
      if (!user) return router.push('/login');
      
      setUserEmail(user.email || 'ゲスト');
      void fetchData(user.id, isMounted);
    };
    init();
    return () => { isMounted = false; };
  }, [router, fetchData]);

  const handleLogout = async () => {
    if (confirm('ログアウトしますか？')) {
      await authRepository.logout();
      router.push('/login');
    }
  };

  const handleDeleteReview = async (id: number) => {
    if (!confirm('削除しますか？')) return;
    await reviewRepository.delete(id);
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  const handleUpdateReview = async () => {
    if (!editingReview) return;
    await reviewRepository.update(editingReview.id, editRating, editComment);
    setEditingReview(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) fetchData(user.id, true);
  };

  return {
    activeTab, setActiveTab, userEmail, reviews, favorites, loading,
    editingReview, setEditingReview, editRating, setEditRating, editComment, setEditComment,
    handleLogout, handleDeleteReview, handleUpdateReview
  };
};