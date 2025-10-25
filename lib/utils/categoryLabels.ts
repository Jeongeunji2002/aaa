// 카테고리 라벨 유틸리티

import type { BoardCategory } from '@/types';

export const categoryLabels: Record<BoardCategory, string> = {
  NOTICE: '공지사항',
  FREE: '자유게시판',
  QNA: '질문과 답변',
};

export const getCategoryLabel = (category: BoardCategory): string => {
  return categoryLabels[category] || category;
};

export const categoryOptions: { value: BoardCategory; label: string }[] = [
  { value: 'NOTICE', label: '공지사항' },
  { value: 'FREE', label: '자유게시판' },
  { value: 'QNA', label: '질문과 답변' },
];

