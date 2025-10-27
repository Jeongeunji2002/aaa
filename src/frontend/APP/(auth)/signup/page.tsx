import SignupForm from '@/src/FRONTEND/SECTION/BODY/AUTH/SignupForm';

export const metadata = {
  title: '회원가입 - 정은지',
  description: '정은지 회원가입 페이지',
};

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <SignupForm />
    </div>
  );
}

