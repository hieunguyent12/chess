import { ChessWasm } from "friendly-chess-wasm";
import { memory } from "friendly-chess-wasm/friendly_chess_wasm_bg.wasm";

type Move = {
    from: string;
    to: string;
    promotion_piece: string | null;
};

export class Chess {
    private chess: ChessWasm;
    public board: Uint8Array;
    public turn: "w" | "b";

    private default_fen =
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    private new_fen = "8/k4P2/8/8/8/8/2p5/7K w - - 0 1";
    constructor() {
        this.chess = ChessWasm.new();

        this.turn = this.chess.turn() as "w" | "b";
        this.board = new Uint8Array(memory.buffer, this.chess.board(), 256);
    }

    public newGame() {
        this.chess.load_fen(this.new_fen);
    }

    public getLegalMoves(sq: string) {
        return this.chess.moves_for_square(sq)
    }

    public move({ from, to, promotion_piece }: Move) {
        this.chess.play_move({
            from,
            to,
            promotion_piece,
        });

        this.turn = this.chess.turn() as "w" | "b";
    }

    public can_move({ from, to }: Move): boolean {
        const moves = this.chess.moves_for_square(from) as Move[];

        return moves.some((move) => move.from === from && move.to === to);
    }
}











