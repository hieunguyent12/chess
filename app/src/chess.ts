import { ChessWasm } from "friendly-chess-wasm";
import { memory } from "friendly-chess-wasm/friendly_chess_wasm_bg.wasm";

type Move = {
    from: string;
    to: string;
    promotion_piece: string | null;
};

function splitStringOnce(s: string, delimiter: string) {
    var i = s.indexOf(delimiter);
    var splits = [s.slice(0, i), s.slice(i + 1)];

    return splits;
}

interface Opponent {
    player_id: string;
    player_name: string
}

interface GameStatus {
    checkmating: boolean,
    checkmated: boolean,
    draw: boolean
}

export class Chess {
    public socket_player_id: null | string;
    public board: Uint8Array;
    public turn: "w" | "b";
    public opponent: Opponent;
    public gameStatus: GameStatus = {
        checkmated: false,
        checkmating: false,
        draw: false
    };

    private chess: ChessWasm;
    private socket: WebSocket;
    private default_fen =
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    private new_fen = "8/k4P2/8/8/8/8/2p5/7K w - - 0 1";
    private subscribers: (() => void)[] = [];
    private opponentConnectSubscribers: ((opponent: Opponent) => void)[] = [];
    private gameStatusSubscribers: ((newStatus: GameStatus) => void)[] = [];

    constructor() {
        this.chess = ChessWasm.new();

        this.board = new Uint8Array(memory.buffer, this.chess.board(), 256);
        this.turn = "w";

        this.connectToServer();
    }

    public newGame() {
        this.chess.load_fen(this.new_fen);
    }

    public getLegalMoves(sq: string) {
        return this.chess.moves_for_square(sq)
    }

    public move(move: Move) {
        this.chess.play_move(move);

        if (this.chess.is_checkmate()) {
            if (this.chess.turn() === this.turn) {
                this.gameStatus.checkmated = true;
                console.log("you lost the game");
            } else {
                this.gameStatus.checkmating = true;
                console.log("you won the game");
            }
        }

        if (this.chess.is_draw()) {
            this.gameStatus.draw = true;
            console.log("game draw");
        }

        if (this.chess.is_repetition()) {
            this.gameStatus.draw = true;
            console.log("draw by repetition");
        }

        if (this.chess.is_insufficient_materials()) {
            this.gameStatus.draw = true;
            console.log("draw by insufficient materials");
        }

        this.gameStatusSubscribers.forEach(sub => sub(this.gameStatus))

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
            player_one_id: this.socket_player_id,
            color: this.turn
        };

        this.socket.send(`CreateGame ${JSON.stringify(game)}`);
    }

    public joinGame(id: string, player_name: string) {
        if (id === "" || this.socket_player_id === "") return;


        let game = {
            id,
            player_id: this.socket_player_id,
            player_name
        };

        this.socket.send(`JoinGame ${JSON.stringify(game)}`);
    }

    public updateName(name: String) {
        if (name === "" || name.length > 50 || this.socket_player_id === "") return;

        this.socket.send(`UpdateName ${JSON.stringify({
            name,
            id: this.socket_player_id
        })}`)
    }

    public subscribeToOpponentMove(cb: () => void) {
        this.subscribers.push(cb);
    }

    public subscribeToGameStatus(cb: (newStatus: GameStatus) => void) {
        this.gameStatusSubscribers.push(cb);
    }

    public subscribeToOpponentConnect(cb: (opponent: Opponent) => void) {
        this.opponentConnectSubscribers.push(cb);
    }

    public set_turn(turn: "w" | "b") {
        this.turn = turn;
        // this.chess.set_turn(turn);
    }

    private connectToServer() {
        let url = "ws://127.0.0.1:8080/ws";
        let socket = new WebSocket(url);
        this.socket = socket;

        socket.addEventListener("open", () => {
            console.log('connected to chess server');
        })

        socket.addEventListener("message", (event) => {
            let msg = event.data as string;

            if (msg !== "") {
                let parts = splitStringOnce(msg, " ");

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
                        console.log(parts[1]);
                        data = JSON.parse(parts[1]);

                        this.opponent = {
                            player_id: data.player_id,
                            player_name: data.player_name
                        };

                        this.set_turn(data.color);
                        this.opponentConnectSubscribers.forEach(sub => sub(this.opponent));
                        break;
                    case "PlayerJoined":
                        data = JSON.parse(parts[1]);

                        this.opponent = {
                            player_id: data.player_id,
                            player_name: data.player_name
                        };

                        this.opponentConnectSubscribers.forEach(sub => sub(this.opponent));
                        break;
                    case "PlayMove":
                        data = JSON.parse(parts[1]);
                        if (data.player_id !== this.socket_player_id) {
                            console.log(data);
                            delete data["player_id"];
                            this.chess.play_move(data as Move);

                            if (this.chess.is_checkmate()) {
                                if (this.chess.turn() === this.turn) {
                                    this.gameStatus.checkmated = true;
                                    console.log("you lost the game");
                                } else {
                                    this.gameStatus.checkmating = true;
                                    console.log("you won the game");
                                }
                            }

                            if (this.chess.is_draw()) {
                                this.gameStatus.draw = true;
                                console.log("game draw");
                            }

                            if (this.chess.is_repetition()) {
                                this.gameStatus.draw = true;
                                console.log("draw by repetition");
                            }

                            if (this.chess.is_insufficient_materials()) {
                                this.gameStatus.draw = true;
                                console.log("draw by insufficient materials");
                            }

                            this.gameStatusSubscribers.forEach(sub => sub(this.gameStatus))


                            this.subscribers.forEach(sub => sub());
                        }
                        break;
                    case "UpdateGameStatus":
                        // data = parts[1];
                        //
                        // if (data == "checkmate") {
                        //     this.gameStatus.checkmated = true;
                        // }
                        //
                        // if (data == "draw") {
                        //     this.gameStatus.draw = true;
                        // }
                        //
                        // this.gameStatusSubscribers.forEach(sub => sub(this.gameStatus));
                        // break;

                    default:
                        console.log(msg);
                        break;
                }
            }
        })
    }

}











