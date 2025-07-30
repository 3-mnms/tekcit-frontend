// src/pages/home/index.tsx
import { useState } from "react";
import reactLogo from "../../shared/assets/react.svg"; // 별칭(@) 쓰는 경우
import viteLogo from "/vite.svg";                  // vite.svg는 public 루트
import "../../app/styles/App.css";                     // 전역/페이지 스타일

export default function HomePage() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      <h1>Vite + React</h1>

      <div className="card">
        <button onClick={() => setCount((c) => c + 1)}>count is {count}</button>
        <p>
          Edit <code>src/pages/home/index.tsx</code> and save to test HMR
        </p>
      </div>

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}
