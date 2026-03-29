import { supabase } from '../supabase/supabaseClient'; // 相対パス
import { Sake } from '@/domain/models/sake';

export const SakeRepository = {
  async fetchSakes(filters: { keyword?: string; taste?: string; limit?: number }) {
    let query = supabase.from('sakes').select('*');

    if (filters.keyword) {
      const k = `%${filters.keyword}%`;
      query = query.or(`name.ilike.${k},brewery.ilike.${k},description.ilike.${k},prefecture.ilike.${k}`);
    }

    if (filters.taste && filters.taste !== 'all') {
      query = query.eq('taste', filters.taste);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Sake[];
  }
};