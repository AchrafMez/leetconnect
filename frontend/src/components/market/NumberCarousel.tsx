import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  currentPages: number;
  setcurrentPages: React.Dispatch<React.SetStateAction<number>>;
  numberPages: number;
};

const NumberCarousel: React.FC<Props> = ({
  currentPages,
  setcurrentPages,
  numberPages,
}) => {
  const leftPage = () => {
    setcurrentPages((prev) => (prev > 1 ? prev - 1 : numberPages));
  };

  const rightPage = () => {
    setcurrentPages((prev) => (prev < numberPages ? prev + 1 : 1));
  };

  return (
    <div className="flex items-center justify-center gap-3 mt-8">

      {/* Left Arrow */}
      <button
        onClick={leftPage}
        className="w-9 h-9 flex items-center justify-center bg-[#111] rounded-lg hover:bg-[#1A1A1A] transition"
      >
        <ChevronLeft size={18} className="text-gray-400" />
      </button>

      {/* Page Numbers */}
      {Array.from({ length: numberPages }).map((_, index) => {
        const page = index + 1;

        return (
          <button
            key={page}
            onClick={() => setcurrentPages(page)}
            className={`w-9 h-9 rounded-lg text-sm transition
              ${
                currentPages === page
                  ? "bg-[#69B34C] text-white font-semibold"
                  : "bg-[#111] text-gray-400 hover:bg-[#1A1A1A]"
              }
            `}
          >
            {page}
          </button>
        );
      })}

      {/* Right Arrow */}
      <button
        onClick={rightPage}
        className="w-9 h-9 flex items-center justify-center bg-[#111] rounded-lg hover:bg-[#1A1A1A] transition"
      >
        <ChevronRight size={18} className="text-gray-400" />
      </button>

    </div>
  );
};

export default NumberCarousel;