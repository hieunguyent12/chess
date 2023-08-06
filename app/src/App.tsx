import { useState, useEffect } from "react";
import "./App.css";
import Board from "./ui/board";
import { Chess } from "./chess";
import { Move } from './types';

function App() {
    const [chess] = useState<Chess>(() => {
        const chess = new Chess();
        chess.newGame();
        return chess;
    });
    const [, rerender] = useState({});
    const [roomName, setRoomName] = useState("");

    const getLegalMoves = (from: string): Move[] => {
        return chess.getLegalMoves(from);
    }

    const play_move = (m: Move) => {
        if (m.from == "" || m.to == null) return;
        if (m.to == m.from) return;

        try {
            chess.move(m);
            rerender({});
        } catch {
            console.error("Illegal move");
        }
    }

    const createGame = () => {
        if (roomName === "") {
            console.log('room name cannot be emtpy');
            return;
        }

        chess.createGame(roomName);
    }

    return (
        <div className="chess-container">
            <Board board={chess.board} turn={chess.turn == "w" ? "white" : "black"} play_move={play_move} getLegalMoves={getLegalMoves} />
            <div className="room-input-container">
                <input value={roomName} onChange={e => setRoomName(e.target.value)} type="text" placeholder="room name" />
                <button onClick={createGame}>create</button>
            </div>
        </div>
    )
}

export default App;
