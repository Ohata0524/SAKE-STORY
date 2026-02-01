'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from './../../src/lib/zod/schemas'; // パスは適宜調整してください

export default function LoginPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isLoading },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      router.push('/');
      router.refresh();

    } catch (error) {
      console.error('Login failed', error);
      let message = 'メールかパスワードが違います';
      if (error instanceof Error) {
        message = error.message;
      }
      alert('ログインに失敗しました: ' + message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-10 px-6 shadow-xl sm:rounded-2xl sm:px-12 border border-gray-100">
          
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-wider text-indigo-950 font-serif">SAKE STORY</h1>
            <h2 className="mt-4 text-xl font-bold text-gray-900">おかえりなさい</h2>
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
                placeholder="••••••••"
                className={`appearance-none block w-full px-4 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base`}
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 font-bold">{errors.password.message}</p>
              )}
            </div>

            {/* ログインボタン */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-base font-bold text-white bg-indigo-900 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform active:scale-[0.98]
                  ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'ログイン中...' : 'ログイン'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              アカウントをお持ちでない方は{' '}
              <Link href="/signup" className="font-bold text-indigo-900 hover:text-indigo-800 underline ml-1">
                新規登録
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

