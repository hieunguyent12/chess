import { useEffect, useState } from "react";
import { useChessStore } from "../../stores/chess";
import { WebsocketClient } from "../../websocket/type";
import { WebsocketChessClient } from "../../websocket/client";
import Board from "./board";
import { Color, Move } from "../../types";

function Chess() {
  const chessStore = useChessStore((state) => state);
  const [wsClient] = useState<WebsocketClient>(
    () => new WebsocketChessClient()
  );
  const [joinGameId, setJoinGameId] = useState("");
  const [, rerender] = useState({});

  const play_move = (m: Move) => {
    if (m.from == "" || m.to == null) return;
    if (m.to == m.from) return;

    try {
      chessStore.engine.move(m);
      wsClient.makeMove(m);
    } catch {
      console.error("Illegal move");
    }
  };

  const switchColor = (color: Color) => {
    chessStore.setMyColor(color);
  };

  useEffect(() => {
    const { engine } = chessStore;

    let unsubscribeToGameEngine = engine.subscribeToGameEvents((evt) => {
      switch (evt) {
        case "new-game":
          rerender({});
          break;
        case "move":
          rerender({});
          break;
        case "new-status":
          const myStatus = engine.gameStatus[chessStore.myColor];
          if (myStatus.win) {
            console.log(`You won by ${myStatus.win}`);
          } else if (myStatus.lose) {
            console.log(`You lose by ${myStatus.lose}`);
          } else if (engine.gameStatus.draw) {
            console.log(`Draw by ${engine.gameStatus.draw}`);
          }

          break;
        default:
          break;
      }
    });

    let unsubscribeToWs = wsClient.onmessage((msg) => {
      switch (msg.type) {
        case "connect":
          console.log("Connected to WS server!");
          console.log(`My ID: ${msg.payload.id}`);
          chessStore.setMyId(msg.payload.id);
          break;
        case "creategame":
          console.log(msg.payload);
          chessStore.setGameId(msg.payload.id);
          break;
        case "opponentjoined":
          console.log(`Opponent:`);
          console.log(msg.payload);
          let opponent = msg.payload;
          if (opponent.color === "w") {
            chessStore.setMyColor("black");
          } else {
            chessStore.setMyColor("white");
          }
          chessStore.setOpponent(msg.payload);
          break;
        case "makemove":
          console.log("move", msg);
          engine.move(msg.payload as Move);
          break;
        default:
          console.log(msg);
          break;
      }
    });

    engine.newGame();

    return () => {
      unsubscribeToGameEngine();
      unsubscribeToWs();
    };
  }, [chessStore]);

  const { engine, myColor, myName, gameName, setGameName, setMyName } =
    chessStore;
  return (
    <div>
      <Board
        board={engine.board}
        play_move={play_move}
        myColor={myColor}
        getLegalMoves={(from: string) => engine.getLegalMoves(from)}
      />
      <div className="room-input-container">
        <input
          value={gameName}
          onChange={(e) => setGameName(e.target.value)}
          type="text"
          placeholder="game name"
        />
        <button onClick={() => wsClient.createGame(gameName, myColor)}>
          create
        </button>
      </div>
      <div>
        <input
          value={joinGameId}
          onChange={(e) => setJoinGameId(e.target.value)}
          type="text"
          placeholder="game id"
        />
        <button onClick={() => wsClient.joinGame(joinGameId)}>join</button>
      </div>
      <div>
        <input
          value={myName}
          onChange={(e) => setMyName(e.target.value)}
          type="text"
          placeholder="player name"
        />
        <button onClick={() => wsClient.updateName(myName)}>update</button>
      </div>
      <button onClick={() => switchColor("white")}>Play as white</button>
      <button onClick={() => switchColor("black")}>Play as black</button>
    </div>
  );
}

export default Chess;
