'use client';

import ChatInterface from '@/components/chatkit/ChatInterface';

export default function Home() {
  // In a real app, get userId from authentication
  const userId = 'demo-user';

  return (
    <main className="h-screen">
      <ChatInterface userId={userId} />
    </main>
  );
}
