import { Color, Move } from "../types";
import { ServerMessage, ServerMessageType, WebsocketClient } from "./type";

function createServerMessage(type: ServerMessageType, payload: any): string {
  if ((typeof payload !== "object" && !Array.isArray(payload)) || !payload) {
    throw new Error("payload must be a valid object");
  }

  let msg: ServerMessage = {
    type,
    payload,
  };

  console.log(msg);

  return JSON.stringify(msg);
}

export class WebsocketChessClient implements WebsocketClient {
  private socket: WebSocket | null;
  private subscribers: ((msg: ServerMessage) => void)[] = [];

  constructor() {
    let url = "ws://127.0.0.1:8080/ws";
    this.socket = new WebSocket(url);

    this.listen();
  }

  createGame(name: string, color: Color) {
    if (!this.socket) {
      return;
    }

    if (name === "") return;

    this.socket.send(
      createServerMessage("creategame", {
        name,
        // we only need the first letter of the color
        color: color[0],
      })
    );
  }

  joinGame(game_id: string) {
    if (!this.socket) {
      return;
    }

    if (game_id === "") return;

    this.socket.send(
      createServerMessage("joingame", {
        game_id,
      })
    );
  }

  makeMove(m: Move): void {
    if (!this.socket) {
      return;
    }

    this.socket.send(createServerMessage("makemove", m));
  }

  updateGameState(): void {}

  updateName(name: string) {
    if (!this.socket) {
      return;
    }

    if (name === "") return;

    this.socket.send(
      createServerMessage("updatename", {
        name,
      })
    );
  }

  onmessage(cb: (msg: ServerMessage) => void): void {
    this.subscribers.push(cb);
  }

  private listen() {
    this.socket.onmessage = (event) => {
      let msg = JSON.parse(event.data) as ServerMessage;

      this.subscribers.forEach((sub) => sub(msg as ServerMessage));
    };
  }
}
