import { createFileRoute, useNavigate } from '@tanstack/react-router';
import React, { useState } from 'react';
import Login from '../components/Login';

export const Route = createFileRoute('/')({
  component: App,
});

function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState<null | { userId: number; email: string; role: string }>(null);
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Login
        onSuccess={(u) => {
          setUser(u);
          navigate({ to: '/dashboard' });
        }}
      />
    </div>
  );
}
