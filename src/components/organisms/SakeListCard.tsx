import Link from 'next/link';
import Image from 'next/image';
import { Sake } from '@/domain/models/sake';

export const SakeListCard = ({ sake, sortOrder }: { sake: Sake, sortOrder: string }) => (
  <Link href={`/list/${sake.id}`} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition group border border-gray-100 flex flex-col">
    <div className="aspect-[4/5] bg-gray-100 relative flex items-center justify-center overflow-hidden">
      {sake.image_url ? (
        <Image src={sake.image_url} alt={sake.name} fill className="object-cover mix-blend-multiply group-hover:scale-105 transition duration-500" />
      ) : (
        <span className="text-gray-300 font-bold text-lg">No Image</span>
      )}
      <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
        {sake.taste && (
          <span className="bg-white/95 backdrop-blur text-xs px-3 py-1 rounded-lg shadow-sm text-gray-700 font-bold">{sake.taste}</span>
        )}
        <span className="bg-indigo-900/95 backdrop-blur text-sm px-3 py-1.5 rounded-lg shadow-sm text-white font-bold">
          ¥{sake.price?.toLocaleString()}
        </span>
      </div>
    </div>
    <div className="p-5 flex-1 flex flex-col justify-end">
      <p className={`text-xs mb-2 font-bold leading-tight ${sortOrder === 'prefecture' ? 'text-indigo-600' : 'text-gray-600'}`}>
        {sake.brewery} / {sake.prefecture}
      </p>
      <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-indigo-700 transition">{sake.name}</h3>
    </div>
  </Link>
);
