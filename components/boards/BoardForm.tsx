'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { categoryOptions } from '@/lib/utils';
import type { BoardCategory } from '@/types';

const boardSchema = z.object({
  title: z
    .string()
    .min(1, '제목을 입력하세요.')
    .max(200, '제목은 최대 200자까지 가능합니다.'),
  content: z
    .string()
    .min(1, '내용을 입력하세요.')
    .max(5000, '내용은 최대 5000자까지 가능합니다.'),
  category: z.enum(['NOTICE', 'FREE', 'QNA'], '카테고리를 선택하세요.'),
});

type BoardFormData = z.infer<typeof boardSchema>;

interface BoardFormProps {
  initialData?: {
    title: string;
    content: string;
    category: BoardCategory;
    imageUrl?: string;
  };
  onSubmit: (data: BoardFormData, file: File | null) => Promise<void>;
  isSubmitting: boolean;
  submitLabel: string;
}

export default function BoardForm({
  initialData,
  onSubmit,
  isSubmitting,
  submitLabel,
}: BoardFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialData?.imageUrl || null
  );
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BoardFormData>({
    resolver: zodResolver(boardSchema),
    defaultValues: initialData || {
      title: '',
      content: '',
      category: 'FREE',
    },
  });
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      try {
        // 강화된 파일 검증
        const { validateFile } = await import('@/lib/utils/fileValidation');
        const validation = await validateFile(file);
        
        if (!validation.isValid) {
          toast.error(validation.error || '파일 검증에 실패했습니다.');
          return;
        }
        
        setSelectedFile(file);
        
        // 미리보기 생성
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
        
        toast.success('파일이 성공적으로 선택되었습니다.');
        
      } catch (error) {
        console.error('파일 검증 오류:', error);
        toast.error('파일 검증 중 오류가 발생했습니다.');
      }
    }
  };
  
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(initialData?.imageUrl || null);
    
    // 파일 input 초기화
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };
  
  const onSubmitForm = async (data: BoardFormData) => {
    await onSubmit(data, selectedFile);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      {/* 카테고리 */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          카테고리 <span className="text-red-500">*</span>
        </label>
        <select
          {...register('category')}
          id="category"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        >
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
        )}
      </div>
      
      {/* 제목 */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          제목 <span className="text-red-500">*</span>
        </label>
        <input
          {...register('title')}
          type="text"
          id="title"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          placeholder="제목을 입력하세요"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>
      
      {/* 내용 */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
          내용 <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register('content')}
          id="content"
          rows={12}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-vertical"
          placeholder="내용을 입력하세요"
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
        )}
      </div>
      
      {/* 이미지 업로드 */}
      <div>
        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
          이미지 첨부
        </label>
        <div className="flex items-center space-x-4">
          <label
            htmlFor="file-upload"
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium cursor-pointer transition duration-200 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>파일 선택</span>
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {(selectedFile || previewUrl) && (
            <button
              type="button"
              onClick={handleRemoveFile}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition duration-200"
            >
              제거
            </button>
          )}
        </div>
        <p className="mt-2 text-sm text-gray-500">
          {selectedFile
            ? `선택된 파일: ${selectedFile.name}`
            : '이미지 파일 (최대 10MB)'}
        </p>
        
        {/* 이미지 미리보기 */}
        {previewUrl && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">미리보기</p>
            <div className="relative w-full max-w-md">
              <img
                src={previewUrl}
                alt="미리보기"
                className="w-full h-auto rounded-lg border border-gray-300"
              />
            </div>
          </div>
        )}
      </div>
      
      {/* 제출 버튼 */}
      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition duration-200"
        >
          {isSubmitting ? '처리 중...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

