'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupInput } from '../../src/lib/zod/schemas'; 

export default function SignupPage() {
  const router = useRouter();

  // useFormの初期化：isLoading から isSubmitting に変更
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur", 
  });

  const onSubmit = async (values: SignupInput) => {
    try {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;

      alert('アカウントを作成しました！ログインしてください。');
      router.push('/login'); 

    } catch (error) {
      console.error('Signup failed', error);
      let message = '不明なエラー';
      if (error instanceof Error) {
        message = error.message;
      }
      alert('登録に失敗しました: ' + message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-10 px-6 shadow-xl sm:rounded-2xl sm:px-12 border border-gray-100">
          
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-wider text-indigo-950 font-serif">SAKE STORY</h1>
            <h2 className="mt-4 text-xl font-bold text-gray-900">新規登録</h2>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            
            {/* メールアドレス */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                メールアドレス
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="example@email.com"
                className={`appearance-none block w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base`}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 font-bold">{errors.email.message}</p>
              )}
            </div>

            {/* パスワード */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
                パスワード
              </label>
              <input
                {...register("password")}
                type="password"
                placeholder="8文字以上"
                className={`appearance-none block w-full px-4 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base`}
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 font-bold">{errors.password.message}</p>
              )}
              {!errors.password && (
                <p className="mt-2 text-sm text-gray-500 font-medium">
                  ※ 半角英数字8文字以上で入力してください
                </p>
              )}
            </div>

            {/* 登録ボタン：isLoading から isSubmitting に変更 */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-base font-bold text-white bg-indigo-900 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform active:scale-[0.98]
                  ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? '登録中...' : '登録する'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              すでにアカウントをお持ちの方は{' '}
              <Link href="/login" className="font-bold text-indigo-900 hover:text-indigo-800 underline ml-1">
                ログイン
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

