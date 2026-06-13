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
    <div className="bg-zinc-900 p-8 rounded-3xl">
      <h3 className="text-center text-2xl font-bold mb-8">Схема зала</h3>

      <div className="w-[70%] h-5 bg-zinc-400 mx-auto mb-12 rounded flex items-center justify-center text-xs font-semibold text-zinc-900 tracking-widest">
        ЭКРАН
      </div>

      <div className="max-w-4xl mx-auto space-y-3">
        {rows.map((row) => (
          <div key={row} className="flex items-center gap-3">
            <div className="w-8 text-right font-bold text-zinc-400">{row}</div>
            
            <div className="flex gap-1.5 flex-1 justify-center">   {/* ← уменьшил gap до 1.5px */}
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
                    className={`w-9 h-9 rounded-xl text-xs font-semibold transition-all flex items-center justify-center border
                      ${isBooked 
                        ? 'bg-red-950 border-red-900 text-red-400 cursor-not-allowed' 
                        : isSelected 
                          ? 'bg-red-600 border-red-500 text-white scale-110 shadow-lg' 
                          : 'bg-zinc-700 border border-zinc-600 hover:bg-zinc-600 hover:border-zinc-400 text-white'
                      }`}
                  >
                    {seatNumber}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-8 mt-12 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-zinc-700 rounded-xl border border-zinc-600"></div>
          <span>Свободно</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-600 rounded-xl"></div>
          <span>Выбрано</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-950 border border-red-900 rounded-xl"></div>
          <span>Занято</span>
        </div>
      </div>
    </div>
  );
}