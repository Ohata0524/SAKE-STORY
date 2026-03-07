import { supabase } from "@/infrastructure/supabase/supabaseClient";

export const reviewRepository = {
  // ユーザーごとのレビュー一覧を取得（お酒の情報付き）
  async findByUserId(userId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('id, rating, comment, created_at, sakes (id, name, image_url)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // レビューの更新
  async update(id: number, rating: number, comment: string) {
    const { error } = await supabase
      .from('reviews')
      .update({ rating, comment })
      .eq('id', id);
    if (error) throw error;
  },

  // レビューの削除
  async delete(id: number) {
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) throw error;
  }
};