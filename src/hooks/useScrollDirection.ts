///src/hooks/useScrollDirection.ts

'use client';

import { useEffect, useState } from 'react';

export default function useScrollDirection() {
  const [direction, setDirection] = useState<'up' | 'down'>('up');
  const [lastY, setLastY] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;

      if (y > lastY + 5) setDirection('down');
      else if (y < lastY - 5) setDirection('up');

      setLastY(y);
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [lastY]);

  return direction;
}
