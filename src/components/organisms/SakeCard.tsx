import Link from 'next/link';
import Image from 'next/image';
import { Sake } from '@/domain/models/sake';
import { getDisplayImageUrl } from '@/app/lib/imageUtils';

export const SakeCard = ({ sake }: { sake: Sake }) => {
  const displayImageUrl = getDisplayImageUrl(sake.image_url, sake.name);

  return (
    <Link href={`/list/${sake.id}`} className="group block">
      <div className="relative w-full aspect-[4/5] bg-gray-200 rounded-2xl mb-4 overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
        <Image 
          src={displayImageUrl} 
          alt={sake.name} 
          fill 
          className="object-cover"
          unoptimized 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
      </div>
      <h4 className="font-bold text-gray-900 text-lg mb-1 truncate group-hover:text-indigo-700 transition">
        {sake.name}
      </h4>
      <p className="text-sm text-gray-600 font-bold">
        {sake.brewery} / {sake.prefecture}
      </p>
    </Link>
  );
};
