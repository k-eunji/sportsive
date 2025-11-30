// src/components/ui/ThemeSelector.tsx

'use client';

import { useEffect, useState } from 'react';

/* 🎨 globals.css와 일치하는 테마 팔레트 */
const themePresets = {
  red: { from: '#E02424', to: '#FF5A5A', foreground: '#111111' },     // ✅ 검정 고정
  orange: { from: '#FF6A00', to: '#FF9A3D', foreground: '#2B1700' },  // 어두운 브라운
  yellow: { from: '#D4A017', to: '#F5D547', foreground: '#3D2B00' },  // 갈색
  green: { from: '#147A3C', to: '#2ECC71', foreground: '#0A1F0A' },   // 어두운 초록
  blue: { from: '#2563EB', to: '#38BDF8', foreground: '#111111' },    // ✅ 검정 고정
  navy: { from: '#1E3A8A', to: '#3B82F6', foreground: '#111111' },    // ✅ 검정 고정
  purple: { from: '#7C3AED', to: '#C084FC', foreground: '#111111' },  // ✅ 검정 고정
  sky: { from: '#0A9CD6', to: '#7DD3FC', foreground: '#06202B' },     // 어두운 네이비
  black: { from: '#111111', to: '#333333', foreground: '#111111' },   // ✅ 검정 고정
  white: { from: '#E5E5E5', to: '#FAFAFA', foreground: '#111111' },   // 기본 흰 테마
} as const;

type ThemeName = keyof typeof themePresets;

export default function ThemeSelector() {
  const [theme, setTheme] = useState<ThemeName>('blue');

  /* 🌈 초기 테마 불러오기 */
  useEffect(() => {
    const saved = localStorage.getItem('fan-theme') as ThemeName | null;
    const current = saved || theme;
    applyTheme(current);
    setTheme(current);
  }, []);

  /* 🎨 테마 적용 함수 */
    const applyTheme = (name: ThemeName) => {
    const { from, to } = themePresets[name];
    const root = document.documentElement;

    root.setAttribute('data-theme', name);
    root.style.setProperty('--primary-from', from);
    root.style.setProperty('--primary-to', to);
    root.style.setProperty('--primary', to);
    root.style.setProperty('--foreground', themePresets[name].foreground);

    localStorage.setItem('fan-theme', name);
    
    };

  const handleThemeChange = (newTheme: ThemeName) => {
    applyTheme(newTheme);
    setTheme(newTheme);
  };

  /* 🎛️ 렌더링 */
  return (
    <div className="grid grid-cols-5 gap-1.5">
      {(
        Object.entries(themePresets) as [ThemeName, { from: string; to: string }][]
      ).map(([t, { from, to }]) => {
        const isSelected = theme === t;
        return (
          <button
            key={t}
            onClick={() => handleThemeChange(t)}
            title={t}
            aria-label={`Set theme to ${t}`}
            className={`
              relative w-5 h-5 md:w-6 md:h-6 rounded-full border
              transition-all duration-200
              hover:scale-110 active:scale-95
              ${isSelected ? 'ring-2 ring-offset-1 ring-[var(--ring)] shadow-md' : 'shadow-sm'}
            `}
            style={{
              background: `linear-gradient(145deg, ${from}, ${to})`,
            }}
          >
            <span
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  'linear-gradient(to top, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.6) 40%, rgba(255,255,255,0) 80%)',
                mixBlendMode: 'overlay',
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
