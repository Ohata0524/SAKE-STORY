import Link from 'next/link';
import Image from 'next/image';
import { Sake } from '@/domain/models/sake';
import { getDisplayImageUrl } from '@/app/lib/imageUtils';

export const SakeListCard = ({ sake }: { sake: Sake; sortOrder?: string }) => {
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
        
        {/* バッジ（味・価格）：image_9ce185.png のデザインを再現 */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
          <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm border border-gray-100">
            {sake.taste}
          </span>
          <span className="bg-indigo-700/90 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm">
            ¥{sake.price?.toLocaleString()}
          </span>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
      </div>
      <h4 className="font-bold text-gray-900 text-lg mb-1 truncate group-hover:text-indigo-700 transition">
        {sake.name}
      </h4>
      <p className="text-sm text-gray-600 font-bold">{sake.brewery} / {sake.prefecture}</p>
    </Link>
  );
};
