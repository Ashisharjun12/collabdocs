import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ? import.meta.env.VITE_SOCKET_URL : "http://localhost:3000";

export const socketService = {
  socket: null,

  connect(docId) {
    if (this.socket) return this.socket;

    this.socket = io(SOCKET_URL, {
      query: { docId },
      withCredentials: true,
      transports: ["websocket"]
    });

    return this.socket;
  },

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  },

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  },

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  },

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
};
