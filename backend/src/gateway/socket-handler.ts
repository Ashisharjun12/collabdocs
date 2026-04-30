import { Server, Socket } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { bullmqConnection } from "../infrastructure/bullmq/connection.js";
import { logger } from "../utils/logger.js";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import { _config } from "../config/config.js";

export interface SocketData {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export class SocketHandler {
  private static io: Server<any, any, any, SocketData>;

  public static init(httpServer: HttpServer) {
    const pubClient = bullmqConnection;
    const subClient = pubClient.duplicate();

    this.io = new Server<any, any, any, SocketData>(httpServer, {
      cors: {
        origin: "*", // Adjust this for production
        methods: ["GET", "POST"],
        credentials: true
      },
      adapter: createAdapter(pubClient, subClient)
    });

    // Authentication Middleware
    this.io.use((socket, next) => {
      try {
        let token = socket.handshake.auth?.token ||
          socket.handshake.headers.authorization?.split(" ")[1] ||
          socket.handshake.query?.token;

        // Fallback: Check cookies
        if (!token && socket.handshake.headers.cookie) {
          const cookies = socket.handshake.headers.cookie.split(";").reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split("=");
            acc[key] = value;
            return acc;
          }, {} as any);
          token = cookies.access_token;
        }

        if (!token) {
          return next(new Error("Authentication error: Token missing"));
        }

        const decoded = jwt.verify(token as string, _config.JWT_SECRET!) as any;
        socket.data.user = {
          id: decoded.sub || decoded.id,
          name: decoded.name,
          email: decoded.email,
          avatar: decoded.avatar
        };

        next();
      } catch (err) {
        logger.error(err, "Socket authentication failed");
        next(new Error("Authentication error: Invalid token"));
      }
    });

    this.io.on("connection", (socket: Socket) => {
      const user = socket.data.user;
      const docId = socket.handshake.query.docId as string;

      if (docId) {
        socket.join(docId);
        logger.info({ userId: user.id, docId }, "Authenticated user joined socket room");
      }

      // 1. Typing Indicators
      socket.on("typing_start", (data: { docId: string; userId: string; name: string }) => {
        socket.to(data.docId).emit("user_typing", {
          userId: data.userId,
          name: data.name,
          isTyping: true
        });
      });

      socket.on("typing_stop", (data: { docId: string; userId: string; name: string }) => {
        socket.to(data.docId).emit("user_typing", {
          userId: data.userId,
          name: data.name,
          isTyping: false
        });
      });

      socket.on("disconnect", () => {
        logger.info({ userId: user.id }, "User disconnected from socket");
      });
    });

    logger.info("Socket.io initialized with Redis Adapter");
    return this.io;
  }

  public static getIO() {
    if (!this.io) {
      throw new Error("Socket.io not initialized!");
    }
    return this.io;
  }

  //  chat Broadcast a chat message to a document room
  public static emitToRoom(roomId: string, event: string, payload: any) {
    if (this.io) {
      this.io.to(roomId).emit(event, payload);
    }
  }
}
