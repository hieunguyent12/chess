import "./App.css";
import Chess from "./containers/chess";

function App() {
  return <Chess />;
}

export default App;

/*function App() {
  const [chess] = useState<Chess>(() => {
    const chess = new Chess();
    chess.newGame();
    return chess;
  });
  const [, rerender] = useState({});
  const [playerName, setPlayerName] = useState("");
  const [gameName, setGameName] = useState("");
  const [joinGameId, setJoinGameId] = useState("");
  const [flipped, setFlipped] = useState(false);
  const [opponentName, setOpponentName] = useState("");
  const [gameStatus, setGameStatus] = useState({
    checkmate: false,
    draw: false,
  });

  const getLegalMoves = (from: string): Move[] => {
    return chess.getLegalMoves(from);
  };

  const play_move = (m: Move) => {
    if (m.from == "" || m.to == null) return;
    if (m.to == m.from) return;

    console.log(m);

    try {
      chess.move(m, true);
      rerender({});
    } catch {
      console.error("Illegal move");
    }
  };

  const createGame = () => {
    // if (gameName === "") {
    //     console.log('game name cannot be emtpy');
    //     return;
    // }

    if (playerName === "") {
      console.log("you must set your name before creating a game");
      return;
    }

    chess.createGame(gameName);
  };

  const joinGame = () => {
    if (joinGameId === "") {
      console.log("game id cannot be emtpy");
      return;
    }

    if (playerName.length > 50) {
      console.log("your name must not exceed 50 characters");
      return;
    }

    chess.joinGame(joinGameId, playerName);
    setTimeout(() => {
      rerender({});
    }, 1000);
  };

  const updateName = () => {
    if (playerName === "" || playerName.length > 50) return;

    chess.updateName(playerName);
  };

  const switchColor = (color: "w" | "b") => {
    // flip the board to show the player's color at the bottom

    chess.set_turn(color);
    if (color === "b") {
      setFlipped(true);
    } else {
      setFlipped(false);
    }
  };

  useEffect(() => {
    chess.subscribeToOpponentMove(() => rerender({}));
    chess.subscribeToOpponentConnect((opponent) => {
      if (chess.turn === "b") {
        setFlipped(true);
      } else {
        setFlipped(false);
      }

      console.log(chess);
      // setOpponentName(opponent.name);
    });
    // chess.subscribeToGameStatus((newStatus) => {
    //   setGameStatus(newStatus);
    // });
  }, [chess]);

  return (
    <div className="app-container">
      <p className="opponent-name name">
        {opponentName !== ""
          ? opponentName
          : "Join a room to play with someone"}
      </p>
      <Board
        board={chess.board}
        turn={chess.turn == "w" ? "white" : "black"}
        play_move={play_move}
        getLegalMoves={getLegalMoves}
      />
      <p className="my-name name">{playerName !== "" ? playerName : ""}</p>

      <section className="left-section">
        <div className="room-input-container">
          <input
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            type="text"
            placeholder="game name"
          />
          <button onClick={createGame}>create</button>
        </div>
        <div className="room-input-container">
          <input
            value={joinGameId}
            onChange={(e) => setJoinGameId(e.target.value)}
            type="text"
            placeholder="game id"
          />
          <button onClick={joinGame}>join</button>
          <button onClick={() => console.log(chess)}>Log state</button>
        </div>
        <div>
          <input
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            type="text"
            placeholder="player name"
          />
          <button onClick={updateName}>update</button>
        </div>
        <button onClick={() => switchColor("w")}>Play as white</button>
        <button onClick={() => switchColor("b")}>Play as black</button>
      </section>

      <section className="right-section">
        <p>Clock</p>
      </section>
    </div>
  );
}

export default App;
*/
