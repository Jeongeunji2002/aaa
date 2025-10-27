// 게시판 관련 API

import { apiClient } from './axios';
import type { 
  Board, 
  BoardListResponse, 
  CreateBoardData, 
  UpdateBoardData 
} from '@/types';

// 게시글 목록 조회
export const getBoardList = async (
  page: number = 0, 
  size: number = 10
): Promise<BoardListResponse> => {
  const response = await apiClient.get('/boards', {
    params: { page, size },
  });
  return response.data.data; // 백엔드 응답 구조에 맞게 수정
};

// 게시글 상세 조회
export const getBoardDetail = async (id: number): Promise<Board> => {
  const response = await apiClient.get(`/boards/${id}`);
  return response.data.data; // 백엔드 응답 구조에 맞게 수정
};

// 게시글 작성 (multipart/form-data)
export const createBoard = async (
  data: CreateBoardData,
  file?: File
): Promise<Board> => {
  // 파일 없으면 JSON으로 전송 (멀터 미사용 경로)
  if (!file) {
    const response = await apiClient.post('/boards', data);
    return response.data.data;
  }

  // 파일 있을 때만 multipart 전송
  const formData = new FormData();
  formData.append('request', JSON.stringify(data));
  formData.append('image', file);

  const response = await apiClient.post('/boards', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
};

// 게시글 수정
export const updateBoard = async (
  id: number,
  data: UpdateBoardData,
  file?: File
): Promise<Board> => {
  if (!file) {
    const response = await apiClient.patch(`/boards/${id}`, data);
    return response.data.data;
  }

  const formData = new FormData();
  formData.append('request', JSON.stringify(data));
  formData.append('image', file);

  const response = await apiClient.patch(`/boards/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
};

// 게시글 삭제
export const deleteBoard = async (id: number): Promise<void> => {
  await apiClient.delete(`/boards/${id}`);
};

