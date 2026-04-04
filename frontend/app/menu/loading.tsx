import React from 'react';

export default function MenuLoading() {
  return (
    <div className="min-h-screen bg-surface px-6 md:px-12 py-16 max-w-[1600px] mx-auto animate-pulse flex flex-col justify-between">
      {/* Top Header Skeleton */}
      <header className="mb-16 flex justify-between items-end w-full">
        <div className="space-y-4 w-1/3">
          <div className="h-4 w-32 bg-surface-container-highest rounded"></div>
          <div className="h-20 w-full bg-surface-container-highest rounded-lg"></div>
        </div>
        <div className="flex items-center gap-8 pb-4">
          <div className="h-10 w-10 bg-surface-container-highest rounded-full"></div>
          <div className="h-10 w-48 bg-surface-container-highest rounded-full"></div>
        </div>
      </header>

      {/* Bento Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-8 h-96 bg-surface-container-highest rounded-xl"></div>
        <div className="lg:col-span-4 h-96 bg-surface-container-highest rounded-xl"></div>
        <div className="lg:col-span-4 h-64 bg-surface-container-highest rounded-xl"></div>
        <div className="lg:col-span-4 h-64 bg-surface-container-highest rounded-xl"></div>
        <div className="lg:col-span-4 h-64 bg-surface-container-highest rounded-xl"></div>
      </div>
    </div>
  );
}
