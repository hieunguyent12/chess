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
    const [gameName, setGameName] = useState("");
    const [joinGameId, setJoinGameId] = useState("");

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
        if (gameName === "") {
            console.log('game name cannot be emtpy');
            return;
        }

        chess.createGame(gameName);
    }

    const joinGame = () => {
        if (joinGameId === "") {
            console.log('game id cannot be emtpy');
            return;
        }

        chess.joinGame(joinGameId);
        setTimeout(() => {
            rerender({});
        }, 1000);
    }

    useEffect(() => {
        chess.subscribeToOpponentMove(() => rerender({}));
    }, [])

    return (
        <div className="chess-container">
            <Board board={chess.board} turn={chess.turn == "w" ? "white" : "black"} play_move={play_move} getLegalMoves={getLegalMoves} />
            <div className="room-input-container">
                <input value={gameName} onChange={e => setGameName(e.target.value)} type="text" placeholder="game name" />
                <button onClick={createGame}>create</button>
            </div>
            <div className="room-input-container">
                <input value={joinGameId} onChange={e => setJoinGameId(e.target.value)} type="text" placeholder="game id" />
                <button onClick={joinGame}>join</button>
                <button onClick={() => console.log(chess)}>Log state</button>
            </div>
        </div>
    )
}

export default App;
