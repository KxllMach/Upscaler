export function HeroSection() {
  return (
    <div className="flex flex-col items-center text-center max-w-4xl mx-auto px-4 mt-16 mb-16">
      {/* Main Title */}
      <h1 className="font-space-grotesk font-bold text-5xl lg:text-6xl text-white leading-tight mb-6">
        AI-Powered Private Image Upscaling
        <br />
        Natively on YOUR Device
      </h1>
      
      {/* Subtitle */}
      <p className="font-space-grotesk font-bold text-base text-text-secondary leading-relaxed max-w-md">
        Upscale your images on your device's hardware. No spying, No cloud, No Stress
      </p>
    </div>
  );
}
