import { useState } from 'react';

export default function SeatMap({ 
  selectedSeats, 
  setSelectedSeats, 
  price, 
  bookedSeatsList = [] 
}) {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seatsPerRow = 12;

  const toggleSeat = (seatId) => {
    if (bookedSeatsList.includes(seatId)) return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  return (
    <div className="bg-zinc-900 p-4 sm:p-6 md:p-8 rounded-3xl">
      <h3 className="text-center text-xl sm:text-2xl font-bold mb-6 sm:mb-8">Схема зала</h3>

      {/* Экран */}
      <div className="w-[90%] sm:w-[80%] md:w-[70%] h-4 sm:h-5 bg-zinc-400 mx-auto mb-8 sm:mb-12 rounded flex items-center justify-center text-[10px] sm:text-xs font-semibold text-zinc-900 tracking-widest">
        ЭКРАН
      </div>

      <div className="max-w-[98%] sm:max-w-4xl mx-auto space-y-2 sm:space-y-3">
        {rows.map((row) => (
          <div key={row} className="flex items-center gap-2 sm:gap-3">
            <div className="w-6 sm:w-8 text-right font-bold text-zinc-400 text-sm sm:text-base">
              {row}
            </div>

            <div className="flex gap-1 sm:gap-1.5 flex-1 justify-center flex-wrap sm:flex-nowrap">
              {Array.from({ length: seatsPerRow }, (_, i) => {
                const seatNumber = i + 1;
                const seatId = `${row}-${seatNumber}`;

                const isBooked = bookedSeatsList.includes(seatId);
                const isSelected = selectedSeats.includes(seatId);

                return (
                  <button
                    key={seatId}
                    onClick={() => toggleSeat(seatId)}
                    disabled={isBooked}
                    className={`
                      w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 
                      rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-semibold 
                      transition-all flex items-center justify-center border active:scale-95
                      ${isBooked 
                        ? 'bg-red-950 border-red-900 text-red-400 cursor-not-allowed' 
                        : isSelected 
                          ? 'bg-red-600 border-red-500 text-white scale-105 sm:scale-110 shadow-lg' 
                          : 'bg-zinc-700 border-zinc-600 hover:bg-zinc-600 hover:border-zinc-400 text-white active:bg-zinc-600'
                      }
                    `}
                  >
                    {seatNumber}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Легенда */}
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-8 sm:mt-10 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-zinc-700 rounded-lg border border-zinc-600"></div>
          <span>Свободно</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-600 rounded-lg"></div>
          <span>Выбрано</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-950 border border-red-900 rounded-lg"></div>
          <span>Занято</span>
        </div>
      </div>
    </div>
  );
}