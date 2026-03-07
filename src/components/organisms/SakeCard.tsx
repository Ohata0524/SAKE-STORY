import Link from 'next/link';
import Image from 'next/image';
import { Sake } from '@/domain/models/sake';

export const SakeCard = ({ sake }: { sake: Sake }) => (
  <Link href={`/list/${sake.id}`} className="group block">
    <div className="relative w-full aspect-[4/5] bg-gray-200 rounded-2xl mb-4 overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
      {sake.image_url ? (
        <Image src={sake.image_url} alt={sake.name} fill className="object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">No Image</div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
    </div>
    <h4 className="font-bold text-gray-900 text-lg mb-1 truncate group-hover:text-indigo-700 transition">{sake.name}</h4>
    <p className="text-sm text-gray-600 font-bold">{sake.brewery} / {sake.prefecture}</p>
  </Link>
);
