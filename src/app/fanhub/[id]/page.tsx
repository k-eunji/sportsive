//src/app/fanhub/[id]/page.tsx

export const dynamic = "force-dynamic";

import FanHubDetail from "../components/FanHubDetail";

export default async function FanHubPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // ← 반드시 await 해야 함

  return <FanHubDetail id={id} />;
}
