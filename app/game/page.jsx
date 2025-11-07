// app/game/page.jsx
"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";

export default function Game() {
  const p = useSearchParams();
  const name = p.get("name");
  const room = p.get("room");
  const role = p.get("role");

  const [users, setUsers] = useState([]);
  const [chat, setChat] = useState([]);
  const [text, setText] = useState("");
  const [showScenario, setShowScenario] = useState(true);
  const [gameStage, setGameStage] = useState("intro"); // intro → discussion → voting
  const [isHost, setIsHost] = useState(false);
  const [assignedRoles, setAssignedRoles] = useState({});
  const [userRole, setUserRole] = useState("");
  const [votingOptions, setVotingOptions] = useState([]);
  const [userVote, setUserVote] = useState("");
  const [voteResults, setVoteResults] = useState(null);
  
  const socketRef = useRef(null);
  const chatContainerRef = useRef(null);

  const gameRoles = [
    "Директор школи",
    "Підліток-художник",
    "Поліцейський",
    "Вчитель мистецтв",
    "Батько учня",
    "Представник громади",
    "Психолог",
    "Журналіст"
  ];

  const handleRoomUpdate = useCallback((data) => {
    setUsers([...data.players, ...data.specs]);
    // Перший гравець стає ведучим
    if (data.players.length > 0 && data.players[0].name === name) {
      setIsHost(true);
    }
  }, [name]);

  const handleMessage = useCallback((message) => {
    setChat(prevChat => [...prevChat, message]);
  }, []);

  const handleGameUpdate = useCallback((data) => {
    if (data.stage) setGameStage(data.stage);
    if (data.roles) setAssignedRoles(data.roles);
    if (data.votingOptions) setVotingOptions(data.votingOptions);
    if (data.voteResults) setVoteResults(data.voteResults);
  }, []);

  const handleRoleAssignment = useCallback((data) => {
    if (data.roles && data.roles[name]) {
      setUserRole(data.roles[name]);
    }
  }, [name]);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io("", { path: "/api/socket" });
    }

    const socket = socketRef.current;
    
    socket.emit("join", { roomId: room, name, role });
    socket.on("room", handleRoomUpdate);
    socket.on("msg", handleMessage);
    socket.on("gameUpdate", handleGameUpdate);
    socket.on("roleAssigned", handleRoleAssignment);

    return () => {
      socket.off("room", handleRoomUpdate);
      socket.off("msg", handleMessage);
      socket.off("gameUpdate", handleGameUpdate);
      socket.off("roleAssigned", handleRoleAssignment);
    };
  }, [room, name, role, handleRoomUpdate, handleMessage, handleGameUpdate, handleRoleAssignment]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat]);

  const sendMessage = useCallback(() => {
    if (text.trim() && socketRef.current) {
      socketRef.current.emit("msg", { roomId: room, text, name });
      setText("");
    }
  }, [text, room, name]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  }, [sendMessage]);

  // Функції для ведучого
  const assignRoles = useCallback(() => {
    if (socketRef.current && isHost) {
      socketRef.current.emit("assignRoles", { roomId: room });
    }
  }, [room, isHost]);

  const startDiscussion = useCallback(() => {
    if (socketRef.current && isHost) {
      socketRef.current.emit("changeStage", { roomId: room, stage: "discussion" });
    }
  }, [room, isHost]);

  const startVoting = useCallback(() => {
    if (socketRef.current && isHost) {
      const options = [
        "Покарати винних",
        "Організувати легальний стіт-арт",
        "Провести переговори",
        "Інше рішення"
      ];
      socketRef.current.emit("startVoting", { roomId: room, options });
      socketRef.current.emit("changeStage", { roomId: room, stage: "voting" });
    }
  }, [room, isHost]);

  const submitVote = useCallback((option) => {
    if (socketRef.current && role === "player") {
      socketRef.current.emit("submitVote", { roomId: room, vote: option });
      setUserVote(option);
    }
  }, [room, role]);

  const getRoleBadgeColor = useCallback((userRole) => {
    return userRole === "player" ? "bg-green-500" : "bg-purple-500";
  }, []);

  const getCurrentUserRoleColor = useCallback(() => {
    return role === "player" ? "text-green-600" : "text-purple-600";
  }, [role]);

  const getStageColor = useCallback((stage) => {
    switch(stage) {
      case "intro": return "bg-blue-500";
      case "discussion": return "bg-yellow-500";
      case "voting": return "bg-green-500";
      default: return "bg-gray-500";
    }
  }, []);

  const getStageText = useCallback((stage) => {
    switch(stage) {
      case "intro": return "Вступ";
      case "discussion": return "Обговорення";
      case "voting": return "Голосування";
      default: return stage;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, []);
я
  const playerCount = users.filter(u => u.role === "player").length;
  const maxPlayers = 10;

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-900 to-purple-900 text-white p-4">
      {/* Scenario Modal */}
      {showScenario && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-center">Гра Місто рішень</h2>
            
            <div className="space-y-4">
              <div className="bg-blue-900/30 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">📖 Сюжет ситуації</h3>
                <p>Школа прокинулася з графіті на фасаді. Частина мешканців обурена, інші вважають це самовираженням. Знайдіть рішення, яке врахує всі сторони!</p>
              </div>

              <div className="bg-green-900/30 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">🎯 Мета гри</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Врахувати позиції всіх сторін</li>
                  <li>Уникнути покарання для галочки</li>
                  <li>Перетворити проблему на можливість</li>
                </ul>
              </div>

              {role === "player" && (
                <div className="bg-yellow-900/30 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">🎭 Ваша роль</h3>
                  <p>Ви отримаєте конкретну роль і будете відстоювати її позицію під час обговорення.</p>
                </div>
              )}

              {role === "spectator" && (
                <div className="bg-purple-900/30 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">👀 Ваше завдання</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Спостерігати за конфліктами</li>
                    <li>Аналізувати аргументи</li>
                    <li>Брати участь у рефлексії</li>
                  </ul>
                </div>
              )}

              <div className="text-center mt-6">
                <button
                  onClick={() => setShowScenario(false)}
                  className="bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105"
                >
                  Почати гру!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Game Stage Header */}
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`px-4 py-2 rounded-lg ${getStageColor(gameStage)} font-bold`}>
                {getStageText(gameStage)}
              </div>
              {isHost && (
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-400">⭐ Ви - ведучий</span>
                </div>
              )}
            </div>
            
            <div className="text-right">
              <h1 className="text-2xl font-bold">Місто Рішень</h1>
              <p className="text-gray-300">Кімната: <span className="font-mono text-yellow-300">{room}</span></p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Participants & Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Participants Panel */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/10 shadow-2xl">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <h2 className="text-xl font-bold">Учасники кімнати</h2>
                <span className="ml-2 bg-white/20 px-2 py-1 rounded-full text-sm">
                  {users.length}
                </span>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {users.map((user, index) => (
                  <div 
                    key={user.id || index} 
                    className={`p-3 rounded-lg transition-all duration-300 ${
                      user.name === name ? "bg-blue-500/30 border border-blue-400" : "bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 ${getRoleBadgeColor(user.role)}`}></div>
                        <span className="font-medium">{user.name}</span>
                        {user.name === name && (
                          <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded">Ви</span>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {user.role === "player" ? "Гравець" : "Спостерігач"}
                      </span>
                    </div>
                    {assignedRoles[user.name] && (
                      <div className="mt-2 text-xs bg-black/30 px-2 py-1 rounded border border-white/20">
                        🎭 {assignedRoles[user.name]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Game Controls */}
            {isHost && (
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/10 shadow-2xl">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <span className="mr-2">🎮</span>
                  Керування грою
                </h3>
                
                <div className="space-y-3">
                  {gameStage === "intro" && (
                    <>
                      <button
                        onClick={assignRoles}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                      >
                        Розподілити ролі
                      </button>
                      <button
                        onClick={startDiscussion}
                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg transition-colors"
                      >
                        Почати обговорення
                      </button>
                    </>
                  )}
                  
                  {gameStage === "discussion" && (
                    <button
                      onClick={startVoting}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      Перейти до голосування
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* User Role Info */}
            {userRole && (
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/10 shadow-2xl">
                <h3 className="text-lg font-bold mb-2 flex items-center">
                  <span className="mr-2">🎭</span>
                  Ваша роль
                </h3>
                <div className="bg-yellow-900/30 p-3 rounded-lg border border-yellow-500/50">
                  <p className="font-semibold text-yellow-300">{userRole}</p>
                  <p className="text-sm mt-2 text-yellow-200">
                    Відстоюйте позицію вашої ролі під час обговорення!
                  </p>
                </div>
              </div>
            )}

            {/* Voting Panel */}
            {gameStage === "voting" && role === "player" && !userVote && (
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/10 shadow-2xl">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <span className="mr-2">🗳️</span>
                  Голосування
                </h3>
                <div className="space-y-2">
                  {votingOptions.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => submitVote(option)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-left"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Vote Results */}
            {voteResults && (
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/10 shadow-2xl">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <span className="mr-2">📊</span>
                  Результати голосування
                </h3>
                <div className="space-y-3">
                  {Object.entries(voteResults).map(([option, votes]) => (
                    <div key={option} className="bg-white/10 p-3 rounded-lg">
                      <div className="flex justify-between mb-1">
                        <span>{option}</span>
                        <span className="font-bold">{votes} голосів</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${(votes / Math.max(...Object.values(voteResults))) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Chat Panel */}
          <div className="lg:col-span-2">
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/10 shadow-2xl h-full flex flex-col">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="mr-2">💬</span>
                {gameStage === "intro" && "Вступне обговорення"}
                {gameStage === "discussion" && "Дискусія за ролями"}
                {gameStage === "voting" && "Підсумкове обговорення"}
              </h2>
              
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto mb-4 space-y-3 p-2 bg-black/20 rounded-lg max-h-96"
              >
                {chat.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <div className="text-4xl mb-2">💭</div>
                    <p>Повідомлень ще немає</p>
                    <p className="text-sm">Почніть обговорення ситуації!</p>
                  </div>
                ) : (
                  chat.map((message, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg transition-all duration-200 ${
                        message.name === name ? "bg-blue-500/30 ml-4" : "bg-white/10 mr-4"
                      }`}
                    >
                      <div className="flex items-center mb-1">
                        <span className={`font-bold ${
                          message.name === name ? "text-blue-300" : "text-yellow-300"
                        }`}>
                          {message.name}
                        </span>
                        {assignedRoles[message.name] && (
                          <span className="ml-2 text-xs bg-purple-500/30 px-2 py-1 rounded">
                            {assignedRoles[message.name]}
                          </span>
                        )}
                        {message.name === name && (
                          <span className="ml-2 text-xs bg-white/20 px-1 rounded">Ви</span>
                        )}
                        <span className="ml-2 text-xs text-gray-400">
                          {new Date().toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-white">{message.text}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="flex space-x-2">
                <input
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    gameStage === "intro" ? "Задайте питання або висловіть думку..." :
                    gameStage === "discussion" ? "Відстоюйте позицію вашої ролі..." :
                    "Обговоріть результати голосування..."
                  }
                  disabled={gameStage === "voting" && userVote && !isHost}
                />
                <button 
                  onClick={sendMessage}
                  disabled={!text.trim() || (gameStage === "voting" && userVote && !isHost)}
                  className="bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
                >
                  <span className="flex items-center">
                    <span>Надіслати</span>
                    <span className="ml-2">🚀</span>
                  </span>
                </button>
              </div>

              {gameStage === "voting" && userVote && (
                <div className="mt-3 p-3 bg-green-900/30 rounded-lg border border-green-500/50">
                  <p className="text-green-300 text-center">
                    ✅ Ви проголосували за: <strong>{userVote}</strong>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}