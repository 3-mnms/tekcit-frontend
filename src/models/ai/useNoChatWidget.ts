// src/shared/hooks/useNoChatWidget.ts
import { useEffect, useState } from 'react';

export default function useNoChatWidget() {
  const [noChat, setNoChat] = useState(false);

  const compute = () => {
    const usp = new URLSearchParams(window.location.search);
    const q = usp.get('nochat');
    if (q === '1' || q === 'true') return true;
    if (window.name?.includes('tekcit-popup')) return true;
    return false;
  };

  useEffect(() => {
    setNoChat(compute());
    const onPop = () => setNoChat(compute());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return noChat;
}
