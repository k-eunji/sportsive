// src/pages/api/tactics/socket.ts
import { Server } from "socket.io";
import { NextApiRequest } from "next";

export const config = {
  api: { bodyParser: false },
};

const savedTactics: Record<string, any[]> = {};

export default function handler(req: NextApiRequest, res: any) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("New client connected");

      socket.on("joinTeam", (teamId) => {
        socket.join(teamId);
        socket.emit("updatePositions", savedTactics[teamId] ?? []);
      });

      socket.on("movePosition", ({ teamId, positions }) => {
        savedTactics[teamId] = positions;
        socket.to(teamId).emit("updatePositions", positions);
      });
    });
  }
  res.end();
}
