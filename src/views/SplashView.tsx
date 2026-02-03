import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * SplashView - Entry point for RSK Digital Site Diary
 *
 * Design Constraints Applied:
 * - Rule #1 (Anti-Typing): No text inputs
 * - Rule #2 (Glove-First): Massive 96px button height
 * - Rule #3 (High-Contrast): Dark slate background with safety yellow CTA
 */
export const SplashView = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate brief loading/branding display (2 seconds)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleStart = () => {
    // Navigate to Safety Check (first screen in linear flow)
    navigate('/safety-check');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8">
      {/* Main Branding Container */}
      <div className="flex flex-col items-center gap-8 max-w-2xl w-full">

        {/* App Logo/Icon Placeholder */}
        <div className="w-32 h-32 bg-slate-800 rounded-lg flex items-center justify-center border-4 border-yellow-500">
          {/* Replace with actual logo/icon */}
          <svg
            className="w-20 h-20 text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
        </div>

        {/* App Title - Massive, Uppercase */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl uppercase tracking-wide text-white font-black">
            RSK Digital
          </h1>
          <h2 className="text-3xl uppercase tracking-wide text-white font-black">
            Site Diary
          </h2>
          <p className="text-slate-300 font-medium text-lg tracking-wide">
            PROTOTYPE v0.1
          </p>
        </div>

        {/* Tagline */}
        <p className="text-slate-300 font-medium text-xl text-center max-w-md">
          Ruggedized shift logging for extreme environments
        </p>

        {/* Loading State or CTA Button */}
        {isLoading ? (
          <div className="flex flex-col items-center gap-6 mt-8">
            {/* Loading Spinner - High Contrast */}
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-700 border-t-yellow-500"></div>
            <p className="text-slate-400 font-medium text-lg uppercase tracking-wide">
              Loading...
            </p>
          </div>
        ) : (
          /* Primary CTA - Massive Touch Target */
          <button
            onClick={handleStart}
            className="w-full h-24 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-2xl uppercase tracking-wide rounded-lg transition-colors shadow-lg active:scale-98"
          >
            START SHIFT
          </button>
        )}

        {/* Footer Info */}
        <div className="mt-12 text-center space-y-2">
          <p className="text-slate-500 font-medium text-sm uppercase tracking-wide">
            Optimized for iPad
          </p>
          <p className="text-slate-500 font-medium text-sm uppercase tracking-wide">
            Glove-Friendly Interface
          </p>
        </div>
      </div>
    </div>
  );
};

export default SplashView;
