'use client';

import React from 'react';
import Link from 'next/link';
import { User, LogOut, ArrowLeft, Star, X } from 'lucide-react';
import { useMyPage } from '@/hooks/useMyPage';
import { Button } from '@/components/atoms/Button';
import { ReviewCard } from '@/components/molecules/ReviewCard';
import Image from 'next/image';

export default function MyPage() {
  const {
    activeTab, setActiveTab, userEmail, reviews, favorites, loading,
    editingReview, setEditingReview, editRating, setEditRating, editComment, setEditComment,
    handleLogout, handleDeleteReview, handleUpdateReview
  } = useMyPage();

  if (loading) return <div className="min-h-screen flex items-center justify-center">読み込み中...</div>;

  return (
    <div className="page-container md:py-6">
      <main className="w-full max-w-5xl bg-surface-card min-h-screen md:min-h-fit md:rounded-sake shadow-lg mx-auto overflow-hidden flex flex-col">
        <header className="flex items-center justify-between p-5 border-b border-gray-100 bg-surface-card">
          <Link href="/" className="p-2 hover:bg-surface-base rounded-full transition group">
            <ArrowLeft className="w-5 h-5 text-gray-800 group-hover:text-brand-accent transition" />
          </Link>
          <h1 className="font-bold text-xl font-serif text-brand-primary">マイページ</h1>
          <button onClick={handleLogout} className="p-2 hover:bg-red-50 rounded-full transition text-gray-600 hover:text-red-500" title="ログアウト">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <section className="p-8 flex items-center gap-6 border-b border-gray-100 bg-surface-card">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center border-2 border-indigo-100 shadow-sm">
            <User className="w-10 h-10 text-indigo-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{userEmail.split('@')[0]} 様</h2>
            <p className="text-sm text-gray-500 font-medium">{userEmail}</p>
          </div>
        </section>

        <div className="flex border-b border-gray-200 bg-surface-card">
          {(['reviews', 'favorites'] as const).map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`flex-1 py-4 font-bold relative transition-colors ${activeTab === tab ? 'text-brand-primary' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {tab === 'reviews' ? 'レビュー履歴' : 'お気に入り'}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-primary mx-16 rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-surface-base p-6">
          {activeTab === 'reviews' ? (
            <div className="space-y-4 max-w-4xl mx-auto">
              {reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Star className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-base font-medium">まだレビュー履歴はありません</p>
                </div>
              ) : (
                /* 修正：mapの閉じ括弧を修正 */
                reviews.map((r) => (
                  <ReviewCard 
                    key={r.id} review={r} 
                    onDelete={() => handleDeleteReview(r.id)} 
                    onEdit={() => { setEditingReview(r); setEditRating(r.rating); setEditComment(r.comment); }} 
                  />
                ))
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {favorites.map((fav) => (
                <Link href={`/list/${fav.sakes?.id}`} key={fav.id} className="bg-surface-card rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
                  <div className="aspect-square relative p-3 bg-surface-base">
                    <Image src={fav.sakes?.image_url || '/no-image.png'} alt="fav" fill className="object-cover mix-blend-multiply group-hover:scale-105 transition duration-500" />
                  </div>
                  <div className="p-4 font-bold text-sm truncate text-gray-900 group-hover:text-brand-accent transition">{fav.sakes?.name}</div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {editingReview && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-surface-card w-full max-w-md rounded-sake p-8 relative shadow-2xl text-center">
              <button onClick={() => setEditingReview(null)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition"><X /></button>
              <h2 className="text-xl font-bold mb-6 text-brand-primary font-serif">レビューを編集</h2>
              <div className="flex gap-2 mb-8 justify-center">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setEditRating(n)} className="transform transition hover:scale-110">
                    <Star className={`w-10 h-10 ${n <= editRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                  </button>
                ))}
              </div>
              <textarea 
                value={editComment} 
                onChange={e => setEditComment(e.target.value)} 
                className="w-full border border-gray-200 rounded-xl p-4 h-32 mb-8 focus:ring-2 focus:ring-brand-accent focus:outline-none transition" 
                placeholder="感想を入力してください..."
              />
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setEditingReview(null)}>キャンセル</Button>
                <Button onClick={handleUpdateReview}>更新する</Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
