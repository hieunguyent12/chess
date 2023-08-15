import { ChessWasm } from "friendly-chess-wasm";
import { memory } from "friendly-chess-wasm/friendly_chess_wasm_bg.wasm";
import { Move } from "./types";

type GameEvent = "move" | "new-game";

export class ChessEngine {
  private wasmEngine: ChessWasm;

  private defaultFen =
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  // Subscribers will be notified whenever any events happen, like making a move
  private subscribers: ((eventType: GameEvent) => void)[] = [];

  public board: Uint8Array;
  // public myColor: Color;
  // public opponent: Opponent | null;
  // public gameStatus: GameStatus;

  constructor() {
    console.log("initializing chess engine...");
    this.wasmEngine = ChessWasm.new();
    this.board = new Uint8Array(memory.buffer, this.wasmEngine.board(), 256);
    // this.myColor = "w";
  }

  public newGame(fen: string = this.defaultFen) {
    this.wasmEngine.load_fen(fen);
    this.notifySubscribers("new-game");
  }

  public move(m: Move) {
    this.wasmEngine.play_move(m);
    this.notifySubscribers("move");
  }

  public getLegalMoves(sq: string): Move[] {
    return this.wasmEngine.moves_for_square(sq);
  }

  public can_move({ from, to }: Move): boolean {
    const moves = this.wasmEngine.moves_for_square(from) as Move[];

    return moves.some((move) => move.from === from && move.to === to);
  }

  public subscribeToGameEvents(cb: (evt: GameEvent) => void): () => void {
    this.subscribers.push(cb);

    return () => {
      let idx = this.subscribers.indexOf(cb);
      this.subscribers.splice(idx, 1);
    };
  }

  private notifySubscribers(eventType: GameEvent) {
    this.subscribers.forEach((sub) => sub(eventType));
  }
}
