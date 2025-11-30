// src/pages/_document.tsx

import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';
import createEmotionServer from '@emotion/server/create-instance';
import chakraCache from '@/app/chakraEmotionCache';
import theme from 'theme'; // 초기 컬러모드 설정이 있는 테마
import { ColorModeScript } from '@chakra-ui/color-mode';

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const originalRenderPage = ctx.renderPage;
    const { extractCriticalToChunks } = createEmotionServer(chakraCache);

    ctx.renderPage = () =>
      originalRenderPage({
        enhanceApp: (App: any) => (props) => <App emotionCache={chakraCache} {...props} />,
      });

    const initialProps = await Document.getInitialProps(ctx);
    const emotionStyles = extractCriticalToChunks(initialProps.html);
    const emotionStyleTags = emotionStyles.styles.map((style) => (
      <style
        key={style.key}
        data-emotion={`${style.key} ${style.ids.join(' ')}`}
        dangerouslySetInnerHTML={{ __html: style.css }}
      />
    ));

    // ✅ 수정된 부분: styles를 배열로 안전하게 변환
    const baseStyles = Array.isArray(initialProps.styles)
      ? initialProps.styles
      : [initialProps.styles].filter(Boolean);

    return {
      ...initialProps,
      styles: [...baseStyles, ...emotionStyleTags],
    };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          {this.props.styles}
        </Head>
        <body>
          {/* ✅ ColorModeScript에 초기 컬러모드 설정 적용 */}
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
