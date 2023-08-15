import { Color, Move } from "../types";

export type ServerMessageType =
  | "connect"
  | "creategame"
  | "joingame"
  | "opponentjoined"
  | "makemove"
  | "updatename";

export interface ServerMessage {
  type: ServerMessageType;
  payload: any;
}

export interface WebsocketClient {
  createGame(name: string, color: Color): void;
  joinGame(game_id: string): void;
  makeMove(m: Move): void;
  updateGameState(): void;
  updateName(name: string): void;
  onmessage(cb: (msg: ServerMessage) => void): void;
}
