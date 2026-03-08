import { supabase } from "@/infrastructure/supabase/supabaseClient";

export const favoriteRepository = {
  async isFavorite(userId: string, sakeId: number) {
    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('sake_id', sakeId)
      .maybeSingle();
    return !!data;
  },
  
  async add(userId: string, sakeId: number) {
    return await supabase.from('favorites').insert({ user_id: userId, sake_id: sakeId });
  },
  
  async remove(userId: string, sakeId: number) {
    return await supabase.from('favorites').delete().eq('user_id', userId).eq('sake_id', sakeId);
  },

  async findByUserId(userId: string) {
    const { data, error } = await supabase
      .from('favorites')
      .select('id, created_at, sakes (id, name, image_url)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};
