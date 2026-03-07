'use client';

import React from 'react';
import Link from 'next/link';
import { User, LogOut, Heart, ArrowLeft, Star, X } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50 md:py-6">
      <main className="w-full max-w-5xl bg-white min-h-screen md:rounded-2xl shadow-lg mx-auto overflow-hidden flex flex-col">
        {/* ヘッダー */}
        <header className="flex items-center justify-between p-5 border-b border-gray-100 bg-white">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="font-bold text-xl font-serif">マイページ</h1>
          <button onClick={handleLogout} className="p-2 hover:bg-red-50 rounded-full text-gray-600 hover:text-red-500"><LogOut className="w-5 h-5" /></button>
        </header>

        {/* プロフィール */}
        <section className="p-8 flex items-center gap-6 border-b border-gray-100">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center border-2 border-indigo-100"><User className="w-10 h-10 text-indigo-300" /></div>
          <div>
            <h2 className="text-xl font-bold">{userEmail.split('@')[0]} 様</h2>
            <p className="text-sm text-gray-500">{userEmail}</p>
          </div>
        </section>

        {/* タブ切り替え */}
        <div className="flex border-b border-gray-200">
          {(['reviews', 'favorites'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-4 font-bold relative ${activeTab === tab ? 'text-indigo-900' : 'text-gray-400'}`}>
              {tab === 'reviews' ? 'レビュー履歴' : 'お気に入り'}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-900 mx-16 rounded-t-full" />}
            </button>
          ))}
        </div>

        {/* コンテンツエリア */}
        <div className="flex-1 bg-gray-50 p-6">
          {activeTab === 'reviews' ? (
            <div className="space-y-4">
              {reviews.length === 0 ? <p className="text-center py-10 text-gray-400">履歴がありません</p> : 
                reviews.map(r => (
                  <ReviewCard 
                    key={r.id} review={r} 
                    onDelete={() => handleDeleteReview(r.id)} 
                    onEdit={() => { setEditingReview(r); setEditRating(r.rating); setEditComment(r.comment); }} 
                  />
                ))
              }
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {favorites.map(fav => (
                <Link href={`/list/${fav.sakes?.id}`} key={fav.id} className="bg-white rounded-xl border overflow-hidden shadow-sm hover:-translate-y-1 transition group">
                  <div className="aspect-square relative p-3 bg-gray-50">
                    <Image src={fav.sakes?.image_url || '/no-image.png'} alt="fav" fill className="object-cover mix-blend-multiply" />
                  </div>
                  <div className="p-3 font-bold text-sm truncate">{fav.sakes?.name}</div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 編集モーダル */}
        {editingReview && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 relative">
              <button onClick={() => setEditingReview(null)} className="absolute top-4 right-4 text-gray-400"><X /></button>
              <h2 className="text-xl font-bold mb-6">レビューを編集</h2>
              <div className="flex gap-2 mb-6">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setEditRating(n)}><Star className={`w-8 h-8 ${n <= editRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} /></button>
                ))}
              </div>
              <textarea value={editComment} onChange={e => setEditComment(e.target.value)} className="w-full border rounded-xl p-3 h-32 mb-6" />
              <div className="flex gap-3">
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
