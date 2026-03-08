'use client';

import React, { useState, useEffect, use, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  ArrowLeft, Heart, BookOpen, Snowflake, Thermometer, Flame, 
  Utensils, Star, User, Quote 
} from 'lucide-react';

import { supabase } from '@/infrastructure/supabase/supabaseClient';
import { sakeRepository } from '@/infrastructure/repositories/sakeRepository';
import { favoriteRepository } from '@/infrastructure/repositories/favoriteRepository';
import { reviewSchema, type ReviewInput } from '@/domain/schemas/schemas';
import { Button } from '@/components/atoms/Button';
import { useProductDetail } from '@/hooks/useProductDetail';

// --- 型定義 ---
type RecommendationLevel = 'double_circle' | 'circle' | 'triangle';

// --- サブコンポーネント ---

// 修正：不足していたLevelIconの定義を追加
const LevelIcon = ({ level }: { level: RecommendationLevel }) => {
  switch (level) {
    case 'double_circle': return <span className="text-3xl font-black text-brand-primary block mt-2">◎</span>;
    case 'circle': return <span className="text-2xl font-bold text-gray-400 block mt-2">○</span>;
    case 'triangle': return <span className="text-xl text-gray-300 block mt-2">△</span>;
    default: return null;
  }
};

const DrinkStyleItem = ({ 
  type, 
  label, 
  level 
}: { 
  type: 'cold' | 'room' | 'hot', 
  label: string, 
  level: RecommendationLevel 
}) => {
  const isBest = level === 'double_circle';
  const icons = {
    cold: <Snowflake className="w-8 h-8 text-blue-400" />,
    room: <Thermometer className="w-8 h-8 text-green-600" />,
    hot: <Flame className="w-8 h-8 text-red-500" />,
  };

  return (
    <div className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl transition-all ${isBest ? 'bg-brand-primary/5 border-2 border-brand-accent/20' : ''}`}>
      {icons[type]}
      <span className={`text-base font-bold mt-2 ${isBest ? 'text-brand-primary' : 'text-gray-600'}`}>{label}</span>
      <LevelIcon level={level} />
    </div>
  );
};

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { sake, loading, isFavorite, toggleFavorite } = useProductDetail(params);

  if (loading) return <div className="page-container flex items-center justify-center font-bold text-gray-400">物語を読み込み中...</div>;
  if (!sake) return <div className="page-container flex items-center justify-center text-gray-400">見つかりませんでした</div>;

  return (
    <div className="page-container">
      <main className="w-full max-w-6xl mx-auto bg-surface-card min-h-screen md:my-8 md:rounded-sake md:shadow-2xl pb-32 relative overflow-hidden">
        <header className="flex justify-between items-center p-6 sticky top-0 bg-surface-card/95 backdrop-blur-md z-20 border-b border-gray-100">
          <Link href="/list" className="p-2 hover:bg-surface-base rounded-full transition group">
            <ArrowLeft className="w-7 h-7 text-gray-600 group-hover:text-brand-accent" />
          </Link>
          <h1 className="font-brand font-bold text-xl text-brand-primary tracking-widest">SAKE STORY</h1>
          <button onClick={toggleFavorite} className="p-2 hover:bg-surface-base rounded-full transition">
            <Heart className={`w-7 h-7 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-800'}`} />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 p-6 lg:p-12">
          <div className="lg:col-span-5">
            <div className="aspect-square bg-surface-base rounded-sake overflow-hidden relative border border-gray-100 shadow-inner">
              <Image 
                src={sake.image_url || '/no-image.png'} 
                alt={sake.name} 
                fill 
                className="object-cover mix-blend-multiply hover:scale-105 transition duration-700" 
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-12">
            <section className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-black text-gray-900 font-brand tracking-tight">{sake.name}</h2>
              <div className="flex flex-wrap gap-3 text-sm font-bold text-gray-600">
                <span className="bg-surface-card px-4 py-1.5 rounded-full border border-gray-200 shadow-sm">{sake.taste}</span>
                <span className="bg-surface-card px-4 py-1.5 rounded-full border border-gray-200 shadow-sm">{sake.prefecture}</span>
                <span className="bg-brand-primary text-white px-4 py-1.5 rounded-full shadow-md">¥{sake.price?.toLocaleString()}</span>
              </div>
            </section>
            
            <section className="relative bg-surface-card border-4 border-brand-primary rounded-sake p-8 md:p-12 shadow-xl overflow-hidden isolate">
              <div className="absolute -right-10 -bottom-10 text-indigo-50 opacity-60 -z-10 transform rotate-12">
                <BookOpen size={240} />
              </div>
              <div className="flex flex-col gap-5 mb-8 relative z-10">
                <div className="self-start bg-brand-primary text-white text-base font-bold px-5 py-2 rounded-full tracking-widest flex items-center gap-2 shadow-md">
                  <BookOpen className="w-4 h-4" /> SAKE STORY
                </div>
                <h3 className="font-serif font-bold text-2xl md:text-3xl text-gray-900 border-b-4 border-brand-accent/20 pb-5 leading-tight">
                  物語 - この一本が生まれるまで
                </h3>
              </div>
              <div className="prose prose-slate max-w-none font-serif leading-relaxed text-gray-900">
                <ReactMarkdown>{sake.description || ''}</ReactMarkdown>
              </div>
              <div className="flex justify-end mt-4"><Quote className="w-10 h-10 text-brand-accent/20 rotate-180" /></div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface-card p-6 rounded-sake border border-gray-100 shadow-sm text-center">
                <h4 className="font-bold text-brand-primary mb-5 border-b border-brand-accent/10 pb-3 font-brand">おすすめの温度帯</h4>
                <div className="flex gap-2">
                  <DrinkStyleItem type="cold" label="冷酒" level={(sake.rec_cold as RecommendationLevel) || 'circle'} />
                  <DrinkStyleItem type="room" label="常温" level={(sake.rec_room as RecommendationLevel) || 'circle'} />
                  <DrinkStyleItem type="hot" label="熱燗" level={(sake.rec_hot as RecommendationLevel) || 'circle'} />
                </div>
              </div>
              <div className="bg-surface-card p-6 rounded-sake border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                <h4 className="font-bold text-brand-primary mb-5 border-b border-brand-accent/10 pb-3 w-full font-brand">おすすめペアリング</h4>
                <Utensils className="w-10 h-10 mb-3 text-brand-accent opacity-80" />
                <span className="text-xl font-bold text-gray-800">{sake.pairing_name || '和食全般'}</span>
              </div>
            </div>

            <div className="pt-6">
              <Button onClick={() => window.open(sake.official_url || '', '_blank')}>公式サイトへ移動</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
