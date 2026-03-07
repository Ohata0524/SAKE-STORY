import { supabase } from "@/infrastructure/supabase/supabaseClient";
import { LoginInput, SignupInput } from "@/domain/schemas/schemas";

export const authRepository = {
  // ログイン処理
  async login(data: LoginInput) {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) throw error;
    return true;
  },

  // 修正ポイント：新規登録処理を追加
  async signUp(data: SignupInput) {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });
    if (error) throw error;
    return true;
  },

  // ログアウト処理
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
};
