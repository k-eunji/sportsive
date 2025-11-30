// src/app/chakraEmotionCache.ts

import createCache from '@emotion/cache';

const chakraCache = createCache({ key: 'css', prepend: true });

export default chakraCache;
