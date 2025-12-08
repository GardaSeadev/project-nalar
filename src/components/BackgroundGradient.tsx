export default function BackgroundGradient() {
  return (
    <div className="fixed inset-0 bg-slate-950 -z-10">
      {/* Top-left radial gradient blob */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
      
      {/* Bottom-right radial gradient blob */}
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      
      {/* Center radial gradient blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
    </div>
  );
}
