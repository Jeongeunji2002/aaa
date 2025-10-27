// 게시판 관련 타입 정의

export type BoardCategory = 'NOTICE' | 'FREE' | 'QNA';

export interface Board {
  id: number;
  title: string;
  content: string;
  category: BoardCategory;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  author?: string;
}

export interface CreateBoardData {
  title: string;
  content: string;
  category: BoardCategory;
}

export interface UpdateBoardData {
  title?: string;
  content?: string;
  category?: BoardCategory;
}

export interface PageableData {
  pageNumber: number;
  pageSize: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

export interface BoardListResponse {
  content: Board[];
  pageable: PageableData;
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

