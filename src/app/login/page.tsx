'use client';

import React from 'react';
import Link from 'next/link';
import { useLogin } from '@/hooks/useLogin';
import { Button } from '@/components/atoms/Button';
import { FormField } from '@/components/molecules/FormField';

export default function LoginPage() {
  const { register, handleSubmit, errors, isSubmitting } = useLogin();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-10 px-6 shadow-xl sm:rounded-2xl sm:px-12 border border-gray-100">
          
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-wider text-indigo-950 font-serif">SAKE STORY</h1>
            <h2 className="mt-4 text-xl font-bold text-gray-900">おかえりなさい</h2>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <FormField
              label="メールアドレス"
              type="email"
              placeholder="example@email.com"
              error={errors.email}
              {...register("email")}
            />

            <FormField
              label="パスワード"
              type="password"
              placeholder="••••••••"
              error={errors.password}
              {...register("password")}
            />

            <div className="pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'ログイン中...' : 'ログイン'}
              </Button>
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
