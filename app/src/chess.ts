import { ChessWasm } from "friendly-chess-wasm";
import { memory } from "friendly-chess-wasm/friendly_chess_wasm_bg.wasm";

type Move = {
    from: string;
    to: string;
    promotion_piece: string | null;
};

export class Chess {
    private chess: ChessWasm;
    private socket: WebSocket;
    public socket_player_id: null | string;
    public board: Uint8Array;
    public turn: "w" | "b";

    private default_fen =
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    private new_fen = "8/k4P2/8/8/8/8/2p5/7K w - - 0 1";
    private subscribers: (() => void)[] = [];

    constructor() {
        this.chess = ChessWasm.new();

        this.board = new Uint8Array(memory.buffer, this.chess.board(), 256);
        this.turn = "w";

        this.connectToServer();
    }

    public newGame() {
        this.chess.load_fen(this.default_fen);
    }

    public getLegalMoves(sq: string) {
        return this.chess.moves_for_square(sq)
    }

    public move(move: Move) {
        this.chess.play_move(move);

        this.socket.send(`Move ${JSON.stringify({
            player_id: this.socket_player_id,
            ...move
        })}`);
    }

    public can_move({ from, to }: Move): boolean {
        const moves = this.chess.moves_for_square(from) as Move[];

        return moves.some((move) => move.from === from && move.to === to);
    }


    // WEBSOCKETS

    // Create a game with a name
    public createGame(name: string) {
        // socket id must be present to create a room
        if (this.socket_player_id === "") return;

        let game = {
            name,
            player_one_id: this.socket_player_id
        };

        this.socket.send(`CreateGame ${JSON.stringify(game)}`);
    }

    public joinGame(id: string) {
        if (id === "" || this.socket_player_id === "") return;


        let game = {
            id,
            player_id: this.socket_player_id
        };

        this.socket.send(`JoinGame ${JSON.stringify(game)}`);
    }

    public subscribeToOpponentMove(cb: () => void) {
        this.subscribers.push(cb);
    }

    private set_turn(turn: "w" | "b") {
        this.turn = turn;
        // this.chess.set_turn(turn);
    }

    private connectToServer() {
        let url = "ws://127.0.0.1:8080/ws";
        let socket = new WebSocket(url);
        this.socket = socket;

        socket.addEventListener("open", (event) => {
            console.log('connected to chess server');
        })

        socket.addEventListener("message", (event) => {
            let msg = event.data as string;

            if (msg !== "") {
                let parts = msg.split(" ");

                let data: any;

                switch (parts[0]) {
                    case "Connect":
                        data = JSON.parse(parts[1]);
                        this.socket_player_id = data.id;
                        console.log(`Player id: ${this.socket_player_id}`);
                        break;
                    case "CreateGame":
                        data = parts[1];
                        console.log(`Game ${data} created successfully`);
                        break;
                    case "JoinGame":
                        data = parts[1];
                        console.log(`Joined game ${data} successfully! Starting game...`);
                        this.set_turn("b")
                        break;
                    case "PlayerJoined":
                        data = parts[1];
                        console.log(`Player ${data} joined! Starting game...`);
                        break;
                    case "PlayMove":
                        data = JSON.parse(parts[1]);
                        if (data.player_id !== this.socket_player_id) {
                            console.log(data);
                            delete data["player_id"];
                            this.chess.play_move(data as Move);
                            this.subscribers.forEach(sub => sub());
                        }
                        break;
                    default:
                        console.log(msg);
                        break;
                }
            }
        })
    }

}











