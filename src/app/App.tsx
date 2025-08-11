// src/app/App.tsx
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router/router";
import { tokenStore } from "@/shared/storage/tokenStore";
import { useAuthStore } from "@/shared/storage/useAuthStore";
import { getMyInfo } from "@/shared/api/auth/login";

export default function App() {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const initAuth = async () => {
      const token = tokenStore.get();
      if (!token) return;

      try {
        const me = await getMyInfo();
        setUser({ role: me.role, name: me.name });
      } catch (err) {
        console.error("자동 로그인 실패", err);
      }
    };

    initAuth();
  }, [setUser]);

  return <RouterProvider router={router} />;
}
