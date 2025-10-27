import Link from 'next/link';
import { Board } from '@/types';
import { getCategoryLabel, formatDate } from '@/lib/utils';

interface BoardCardProps {
  board: Board;
}

export default function BoardCard({ board }: BoardCardProps) {
  const categoryColors: Record<string, string> = {
    NOTICE: 'bg-red-100 text-red-800',
    FREE: 'bg-blue-100 text-blue-800',
    QNA: 'bg-green-100 text-green-800',
  };
  
  return (
    <Link href={`/boards/${board.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 p-6 cursor-pointer border border-gray-200 hover:border-blue-400">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800 flex-1 line-clamp-2 hover:text-blue-600 transition">
            {board.title}
          </h3>
          <span className={`ml-3 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${categoryColors[board.category] || 'bg-gray-100 text-gray-800'}`}>
            {getCategoryLabel(board.category)}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
          {board.content}
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{formatDate(board.createdAt)}</span>
          {board.imageUrl && (
            <span className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>이미지</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

