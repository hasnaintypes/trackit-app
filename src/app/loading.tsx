"use client";

import React from "react";

function Spinner() {
  return (
    <>
      <style>
        {`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes spin2 {
          0% {
            stroke-dasharray: 1, 1600;
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dasharray: 800, 800;
            stroke-dashoffset: -400px;
          }
          100% {
            stroke-dasharray: 1600, 1;
            stroke-dashoffset: -1600px;
          }
        }

        .spin2 {
          transform-origin: center;
          animation:
            spin2 1.8s ease-in-out infinite alternate,
            spin 3s linear infinite;
        }
      `}
      </style>

      <svg
        viewBox="0 0 800 800"
        xmlns="http://www.w3.org/2000/svg"
        className="h-28 w-28 md:h-36 md:w-36"
      >
        <circle
          className="spin2 stroke-primary/90"
          cx="400"
          cy="400"
          fill="none"
          r="260"
          strokeWidth="40"
          strokeDasharray="700 1400"
          strokeLinecap="round"
        />
      </svg>
    </>
  );
}

export default function LoadingPage() {
  return (
    <main className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center">
      <div className="animate-in fade-in-50 flex flex-col items-center gap-6 duration-500">
        <Spinner />
        <h1 className="text-2xl font-medium tracking-tight">Loading...</h1>
        <p className="text-muted-foreground text-sm">
          Please hold on while we prepare your experience.
        </p>
      </div>
    </main>
  );
}
