'use client';

import dynamic from 'next/dynamic';

const App = dynamic(() => import('../App'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
      <div className="w-16 h-16 rounded-full border-4 border-cyan-400/30 border-t-cyan-400 animate-spin mb-4 shadow-[0_0_20px_rgba(34,211,238,0.4)]" />
      <h2 className="text-xl font-black uppercase tracking-wider text-cyan-300">
        MathsLess - MInd Game
      </h2>
      <p className="text-xs text-white/60 mt-1">
        Initializing Physics Engine & Sound Synths...
      </p>
    </div>
  ),
});

export default function Page() {
  return <App />;
}
