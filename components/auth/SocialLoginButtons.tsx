'use client';

import { generateOAuthUrl, socialPlatforms } from '@/lib/utils/socialConfig';
import type { SocialProvider } from '@/types/social.types';

export default function SocialLoginButtons() {
  const handleSocialLogin = (provider: SocialProvider) => {
    try {
      const oauthUrl = generateOAuthUrl(provider);
      window.location.href = oauthUrl;
    } catch (error) {
      console.error(`Failed to initiate ${provider} login:`, error);
    }
  };
  
  const platforms: SocialProvider[] = ['naver', 'google', 'kakao', 'discord', 'twitter'];
  
  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">또는 소셜 계정으로 계속</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {platforms.map((provider) => {
          const platform = socialPlatforms[provider];
          const bgColor = platform.color;
          const textColor = platform.textColor || '#FFFFFF';
          
          return (
            <button
              key={provider}
              onClick={() => handleSocialLogin(provider)}
              className="flex items-center justify-center px-4 py-3 rounded-lg font-medium transition duration-200 hover:opacity-90 shadow-md"
              style={{ backgroundColor: bgColor, color: textColor }}
            >
              <span className="text-xl font-bold mr-2">{platform.icon}</span>
              <span className="text-sm">{platform.name}</span>
            </button>
          );
        })}
      </div>
      
      <p className="text-xs text-center text-gray-500 mt-4">
        소셜 로그인은 해당 플랫폼의 계정 정보를 사용합니다.
      </p>
    </div>
  );
}

