import LoginForm from '@/components/auth/LoginForm';

export const metadata = {
  title: '로그인 - 정은지',
  description: '정은지 로그인 페이지 - 소셜 로그인 지원',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <LoginForm />
    </div>
  );
}

