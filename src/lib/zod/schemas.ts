import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.number().min(1, "星を選択してください").max(5),
  comment: z.string()
    .min(1, "コメントを入力してください")
    .max(500, "500文字以内で入力してください"),
});

//  ログイン用バリデーション 
export const loginSchema = z.object({
  email: z.string()
    .min(1, "メールアドレスを入力してください")
    .email("正しいメールアドレスの形式で入力してください"),
  password: z.string()
    .min(1, "パスワードを入力してください"),
});
export type LoginInput = z.infer<typeof loginSchema>; // 型をエクスポート


//  新規登録用バリデーション 
export const signupSchema = z.object({
  email: z.string()
    .min(1, "メールアドレスを入力してください")
    .email("正しいメールアドレスの形式で入力してください"),
  password: z.string()
    .min(8, "パスワードは8文字以上で入力してください")
    .regex(/^[a-zA-Z0-9]+$/, "半角英数字で入力してください"),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
export type SignupInput = z.infer<typeof signupSchema>; // 型もエクスポート


export const sakeSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "銘柄名は必須です"),
  brewery: z.string().min(1, "酒造名は必須です"),
  taste: z.string().nullable().default("中口"),
  description: z.string().nullable().default("説明文はありません"),
  image_url: z.string().nullable(),
  price: z.number().nullable(),
  prefecture: z.string().nullable().optional(),
  // 詳細ページで使う追加項目
  official_url: z.string().nullable().optional(),
  rec_cold: z.string().nullable().optional(),
  rec_room: z.string().nullable().optional(),
  rec_hot: z.string().nullable().optional(),
  pairing_name: z.string().nullable().optional(),
  pairing_type: z.string().nullable().optional(),
});

export const sakeListSchema = z.array(sakeSchema);
export type Sake = z.infer<typeof sakeSchema>;


// マイページ表示用の簡略化されたお酒スキーマ
const sakeSimpleSchema = z.object({
  id: z.number(),
  name: z.string(),
  image_url: z.string().nullable(),
});

// レビュー履歴用（お酒情報付き）
export const myReviewSchema = z.object({
  id: z.number(),
  rating: z.number(),
  comment: z.string(),
  created_at: z.string(),
  sakes: sakeSimpleSchema.nullable(),
});
export const myReviewListSchema = z.array(myReviewSchema);

// お気に入り用（お酒情報付き）
export const myFavoriteSchema = z.object({
  id: z.number(),
  created_at: z.string(),
  sakes: sakeSimpleSchema.nullable(),
});
export const myFavoriteListSchema = z.array(myFavoriteSchema);

