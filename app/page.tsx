"use client";

import { useEffect, useRef } from "react";
import BookCanvas from "./book-canvas";

export default function Home() {
  const wordmarkRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // Wordmark intro via Web Animations API:
    // 1400ms after a 150ms delay: opacity 0 -> 1, translateY(4vh) -> 0, blur(14px) -> 0, cubic-bezier(.2,.8,.2,1)
    if (wordmarkRef.current) {
      wordmarkRef.current.animate(
        [
          { opacity: 0, transform: "translateY(4vh)", filter: "blur(14px)" },
          { opacity: 1, transform: "translateY(0)", filter: "blur(0px)" },
        ],
        {
          duration: 1400,
          delay: 150,
          easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
          fill: "forwards",
        }
      );
    }
  }, []);

  return (
    <main className="fixed inset-0 w-full h-full overflow-hidden bg-black select-none pointer-events-auto">
      {/* 1. Nav (z 5) */}
      <header className="fixed z-[5] top-[2.5vh] md:top-[4.6vh] left-[5vw] right-[5vw] md:left-[23.3vw] md:right-[23.4vw] h-[4.4vh] flex items-center justify-between text-[max(11px,0.78vw)] font-medium text-white animate-nav">
        {/* Logo */}
        <div className="flex items-center gap-[0.7vw] cursor-pointer">
          {/* Logo tile: 2.1vw x 2.4vw with dark bar (left 32%, 24% wide, 64% tall) */}
          <div className="relative w-[18px] h-[22px] md:w-[2.1vw] md:h-[2.4vw] rounded-[3px] md:rounded-[0.25vw] bg-[#b8a58a] flex items-center shrink-0 overflow-hidden">
            <div
              className="absolute bg-[#16120d] rounded-[1px]"
              style={{
                left: "32%",
                width: "24%",
                height: "64%",
                top: "18%",
              }}
            />
          </div>
          <div className="flex flex-col justify-center leading-none">
            <span
              className="text-[max(17px,1.55vw)] leading-none text-white tracking-tight"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Aura
            </span>
          </div>
        </div>

        {/* Centre links (hidden on phones <=760px) */}
        <nav className="hidden md:flex items-center gap-[2.3vw] ml-[11.4vw] text-white">
          <a
            href="#books"
            className="flex items-center gap-1 opacity-[0.88] hover:opacity-100 transition-opacity"
          >
            <span>Books</span>
            <svg
              className="w-[0.55vw] h-[0.55vw] stroke-current stroke-[2] fill-none"
              viewBox="0 0 24 24"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </a>
          <a
            href="#authors"
            className="opacity-[0.88] hover:opacity-100 transition-opacity"
          >
            Authors
          </a>
          <a
            href="#journal"
            className="opacity-[0.88] hover:opacity-100 transition-opacity"
          >
            Journal
          </a>
          <a
            href="#more"
            className="flex items-center gap-1 opacity-[0.88] hover:opacity-100 transition-opacity"
          >
            <span>More</span>
            <svg
              className="w-[0.55vw] h-[0.55vw] stroke-current stroke-[2] fill-none"
              viewBox="0 0 24 24"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </a>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-[2.4vw]">
          <a
            href="#signin"
            className="hidden md:inline-block opacity-[0.88] hover:opacity-100 transition-opacity cursor-pointer"
          >
            Sign in
          </a>
          <button
            type="button"
            className="bg-white text-black font-medium rounded-[0.4vw] px-[3vw] py-[1.5vh] md:px-[1vw] md:py-[0.55vw] transition-transform duration-150 hover:-translate-y-[1px] active:translate-y-0 cursor-pointer shadow-sm text-center leading-none text-[max(11px,0.78vw)]"
          >
            Start reading
          </button>
        </div>
      </header>

      {/* 2. Wordmark (z 1) */}
      <div
        className="fixed z-[1] inset-x-0 flex justify-center pointer-events-none"
        style={{
          top: "var(--wordmark-top)",
        }}
      >
        <h1
          ref={wordmarkRef}
          className="m-0 p-0 text-white select-none whitespace-nowrap text-center opacity-0 font-normal"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "var(--fs)",
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          Aura
        </h1>
      </div>

      {/* 4. Canvas (z 2) */}
      <BookCanvas />

      {/* Responsive CSS variables */}
      <style jsx global>{`
        :root {
          --fs: min(46vh, 32vw);
          --wordmark-top: calc(46.5vh - (min(46vh, 32vw) * 0.8));
        }

        @media (max-width: 760px) {
          :root {
            --fs: 36vw;
            --wordmark-top: 14vh;
          }
        }
      `}</style>
    </main>
  );
}
