import { create } from "zustand";
import { ChessEngine } from "../chess_engine";
import { Color } from "../types";

interface Opponent {
  id: string;
  name: string;
  color: string;
}

enum WinLoseCondition {
  Checkmate,
  Resign,
  Overtime,
}

enum DrawCondition {
  InsufficientMaterial,
  Stalemate,
  Repetition,
}

interface GameStatus {
  win: WinLoseCondition | null;
  lose: WinLoseCondition | null;
  draw: DrawCondition | null;
}

interface ChessGame {
  gameId: string | null;
  gameName: string;
  myId: string | null;
  myName: string;
  myColor: Color;
  opponent: Opponent | null;
  gameStatus: GameStatus;

  engine: ChessEngine;

  setMyId: (myId: string) => void;
  setMyName: (myName: string) => void;
  setMyColor: (myColor: Color) => void;
  setGameName: (gameName: string) => void;
  setGameId: (gameId: string) => void;
  setOpponent: (opponent: Opponent) => void;
}

const engine = new ChessEngine();

export const useChessStore = create<ChessGame>((set) => ({
  // we will receive gameId from server when we create a new game
  gameId: null,

  // will receive from server as well
  myId: null,

  gameName: "",
  myName: "",
  myColor: "white",
  opponent: null,
  gameStatus: {
    win: null,
    lose: null,
    draw: null,
  },
  engine,

  setMyId: (myId: string) => set({ myId }),
  setMyName: (myName: string) => set({ myName }),
  setMyColor: (myColor: Color) => set({ myColor }),
  setGameName: (gameName: string) => set({ gameName }),
  setGameId: (gameId: string) => set({ gameId }),
  setOpponent: (opponent: Opponent) => set({ opponent }),
}));
