import { supabase } from "../supabase/supabaseClient";
import { Sake } from "../../domain/models/sake";

export const sakeRepository = {
  // 一覧取得
  async findAll(): Promise<Sake[]> {
    const { data, error } = await supabase.from('sakes').select('*');
    if (error) throw error;
    return data as Sake[];
  },

  // IDで1件取得
  async findById(id: number): Promise<Sake | null> {
    const { data, error } = await supabase
      .from('sakes')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return data as Sake;
  }
};
