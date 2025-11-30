// src/components/ChakraProviders.tsx

/*"use client";

import React from 'react';
import { CacheProvider } from '@emotion/react';
import { ChakraProvider } from '@chakra-ui/react';
import chakraCache from '../app/chakraEmotionCache';

export default function ChakraProviders({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider value={chakraCache}>
      <ChakraProvider>
        {children}
      </ChakraProvider>
    </CacheProvider>
  );
}*/

"use client";

import React from 'react';
import { CacheProvider } from '@emotion/react';
import { ChakraProvider } from '@chakra-ui/react';
import chakraCache from '../app/chakraEmotionCache';

export default function ChakraProviders({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider value={chakraCache}>
      {/* @ts-ignore */}
      <ChakraProvider>
        {children}
      </ChakraProvider>
    </CacheProvider>
  );
}
