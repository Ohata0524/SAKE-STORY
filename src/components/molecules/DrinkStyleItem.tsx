import { Snowflake, Thermometer, Flame } from 'lucide-react';

type Level = 'double_circle' | 'circle' | 'triangle';

const icons = {
  cold: <Snowflake className="w-8 h-8 text-blue-400" />,
  room: <Thermometer className="w-8 h-8 text-green-600" />,
  hot: <Flame className="w-8 h-8 text-red-500" />,
};

const LevelIcon = ({ level }: { level: Level }) => {
  if (level === 'double_circle') return <span className="text-3xl font-black text-indigo-900 block mt-2">◎</span>;
  if (level === 'circle') return <span className="text-2xl font-bold text-gray-400 block mt-2">○</span>;
  return <span className="text-xl text-gray-300 block mt-2">△</span>;
};

export const DrinkStyleItem = ({ type, label, level }: { type: 'cold'|'room'|'hot', label: string, level: Level }) => (
  <div className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl ${level === 'double_circle' ? 'bg-indigo-50 border-2 border-indigo-100' : ''}`}>
    {icons[type]}
    <span className="text-base font-bold mt-2 text-gray-600">{label}</span>
    <LevelIcon level={level} />
  </div>
);
