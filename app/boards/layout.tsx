import Header from '@/components/layout/Header';

export default function BoardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {children}
      </main>
    </>
  );
}

