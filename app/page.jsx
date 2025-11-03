// app/page.jsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const router = useRouter();

  const joinGame = (role) => {
    if (name.trim() && role) {
      const room = Math.random().toString(36).substring(2, 8).toUpperCase();
      const params = new URLSearchParams({
        name: name.trim(),
        room: room,
        role: role
      });
      router.push(`/game?${params.toString()}`);
    }
  };

  const canJoin = name.trim().length >= 2;

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-900 to-purple-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎮 Місто Рішень</h1>
          <p className="text-gray-300">Гра Місто рішень</p>
        </div>

        <div className="space-y-6">
          {/* Name Input */}
          <div>
            <label className="block text-white mb-2 font-medium">Ваше ім&apos;я</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Введіть ваше ім'я"
              maxLength={20}
            />
            {name.length > 0 && name.length < 2 && (
              <p className="text-red-300 text-sm mt-1">Мінімум 2 символи</p>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-white mb-4 font-medium">Оберіть свою роль у грі</label>
            
            {/* Player Option */}
            <div 
              onClick={() => canJoin && setSelectedRole("player")}
              className={`p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer mb-3 ${
                selectedRole === "player" 
                  ? "bg-green-500/30 border-green-400 shadow-lg scale-105" 
                  : canJoin 
                    ? "bg-white/10 border-white/20 hover:bg-white/20 hover:scale-105" 
                    : "bg-white/5 border-white/10 opacity-50 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                  selectedRole === "player" ? "bg-green-500 border-green-500" : "border-white"
                }`}>
                  {selectedRole === "player" && "✓"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">🕹️</span>
                    <h3 className="font-bold text-lg">Гравець</h3>
                    <span className="ml-2 bg-yellow-500/30 text-yellow-300 px-2 py-1 rounded-full text-xs">
                      Обмеження: 8-10 гравців
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mt-1">
                    Активний учасник з роллю. Будете втілювати конкретного персонажа та брати участь у прийнятті рішень.
                  </p>
                  <div className="mt-2 text-xs text-blue-300">
                     Ролі: Підліток-художник, Директор школи, Поліцейський, Мешканка, Журналіст, тощо
                  </div>
                </div>
              </div>
            </div>

            {/* Spectator Option */}
            <div 
              onClick={() => canJoin && setSelectedRole("spectator")}
              className={`p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                selectedRole === "spectator" 
                  ? "bg-purple-500/30 border-purple-400 shadow-lg scale-105" 
                  : canJoin 
                    ? "bg-white/10 border-white/20 hover:bg-white/20 hover:scale-105" 
                    : "bg-white/5 border-white/10 opacity-50 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                  selectedRole === "spectator" ? "bg-purple-500 border-purple-500" : "border-white"
                }`}>
                  {selectedRole === "spectator" && "✓"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">👁️</span>
                    <h3 className="font-bold text-lg">Спостерігач</h3>
                  </div>
                  <p className="text-gray-300 text-sm mt-1">
                    Спостерігайте за грою, аналізуйте конфлікти та беріть участь у рефлексії. Без обмежень.
                  </p>
                  <div className="mt-2 text-xs text-green-300">
                    📊 Завдання: Аналізувати аргументи, емоції, процес прийняття рішень
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Join Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => joinGame("player")}
              disabled={!canJoin || selectedRole !== "player"}
              className="w-full bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-4 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center"
            >
              <span className="flex items-center">
                <span>Стати Гравцем</span>
                <span className="ml-2">🎭</span>
              </span>
            </button>

            <button
              onClick={() => joinGame("spectator")}
              disabled={!canJoin || selectedRole !== "spectator"}
              className="w-full bg-linear-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-4 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center"
            >
              <span className="flex items-center">
                <span>Спостерігати за Грою</span>
                <span className="ml-2">🔍</span>
              </span>
            </button>
          </div>
        </div>

        {/* Game Info */}
        <div className="mt-6 p-4 bg-black/20 rounded-lg">
          <h3 className="font-bold text-white mb-2">📖 Про гру Місто рішень </h3>
          <p className="text-gray-300 text-sm">
            Школа прокинулася з графіті на фасаді. Знайдіть рішення, яке врахує інтереси всіх сторін: 
            підлітків, школи, мешканців та поліції.
          </p>
        </div>

        {/* Instructions */}
        <div className="mt-4 text-center text-gray-400 text-sm">
          <p>✨ Просто оберіть роль та почніть гру!</p>
          <p className="text-xs mt-1">Кімната створиться автоматично</p>
        </div>
      </div>
    </div>
  );
}