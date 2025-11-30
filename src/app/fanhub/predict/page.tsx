//src/app/fanhub/predict/page.tsx

import PredictionList from "./components/PredictionList";

export default function PredictPage() {
  return (
    <div className="space-y-6">

      <div className="px-4 pt-2">
        <h1 className="text-2xl font-bold">WHO WINS?</h1>
        <p className="text-sm opacity-70 mt-1">
          Fan predictions · Vote for who you think will win. 
        </p>
      </div>

      <PredictionList />
    </div>
  );
}
