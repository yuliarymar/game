import { Server } from "socket.io";

let io;

export const GET = () => {
  if (!io) {
    io = new Server(global.server, {
      path: "/api/socket/io",
    });

    let rooms = {};

    io.on("connection", (socket) => {
      socket.on("joinRoom", ({ roomId, name, role }) => {
        socket.join(roomId);

        if (!rooms[roomId]) rooms[roomId] = { players: [], spectators: [] };
        const player = { id: socket.id, name, role };

        if (role === "гравець") rooms[roomId].players.push(player);
        else rooms[roomId].spectators.push(player);

        io.to(roomId).emit("updateRoom", rooms[roomId]);
      });

      socket.on("message", ({ roomId, text, name }) => {
        io.to(roomId).emit("message", { name, text });
      });

      socket.on("disconnect", () => {
        for (const roomId in rooms) {
          rooms[roomId].players = rooms[roomId].players.filter(
            (p) => p.id !== socket.id
          );
          rooms[roomId].spectators = rooms[roomId].spectators.filter(
            (p) => p.id !== socket.id
          );
          io.to(roomId).emit("updateRoom", rooms[roomId]);
        }
      });
    });
  }

  return new Response("Socket.IO server is running", { status: 200 });
};