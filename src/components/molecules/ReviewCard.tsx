import Link from 'next/link';
import Image from 'next/image';
import { Star, Edit, Trash2 } from 'lucide-react';
import { z } from "zod";
import { myReviewSchema } from '@/domain/schemas/schemas';

// Zodから厳密な型を抽出
type ReviewWithSake = z.infer<typeof myReviewSchema>;

interface ReviewCardProps {
  review: ReviewWithSake;
  onEdit: () => void;
  onDelete: () => void;
}

export const ReviewCard = ({ review, onEdit, onDelete }: ReviewCardProps) => (
  <div className="bg-white p-5 md:p-6 rounded-xl border border-gray-200 shadow-sm relative group hover:shadow-md transition">
    <div className="absolute top-5 right-5 flex gap-2 z-10">
      <button onClick={onEdit} className="p-1.5 bg-gray-100 hover:bg-indigo-100 text-gray-500 rounded-full transition" title="編集">
        <Edit className="w-4 h-4" />
      </button>
      <button onClick={onDelete} className="p-1.5 bg-gray-100 hover:bg-red-100 text-gray-500 rounded-full transition" title="削除">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
    
    <Link href={`/list/${review.sakes?.id}`} className="flex flex-col md:flex-row gap-5">
      <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden relative flex-shrink-0">
        <Image 
          src={review.sakes?.image_url || '/no-image.png'} 
          alt="sake" 
          fill 
          className="object-cover mix-blend-multiply" 
        />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-lg mb-2">{review.sakes?.name || '不明な銘柄'}</h3>
        <div className="flex items-center gap-1 text-yellow-400 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
          ))}
        </div>
        <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">{review.comment}</p>
      </div>
    </Link>
  </div>
);
