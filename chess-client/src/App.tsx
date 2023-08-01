/* eslint-disable */

import { useState, useRef, useEffect } from "react";
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

    return <Board board={chess.board} turn={chess.turn == "w" ? "white" : "black"} play_move={play_move} getLegalMoves={getLegalMoves} />
    // const boardEl = useRef<HTMLDivElement | null>(null);
    // const draggingEl = useRef<HTMLDivElement | null>(null);
    // const pieceEl = useRef<SVGSVGElement | null>(null);
    // const testEl = useRef<HTMLDivElement | null>(null);
    // const highlightEl = useRef<HTMLDivElement | null>(null);
    // const lastHighlightSq = useRef<string | null>(null);
    // const [isDragging, setIsDragging] = useState(false);
    // const [currentSquare, setCurrentSquare] = useState("");
    // const dnd = useDndStore(state => ({...state}), shallow);
    //
    // const onMouseDown = (e: React.MouseEvent) => {
    //     if (!boardEl.current) return;
    //
    //     
    //     
    //     
    //     // if (!boardEl.current || !pieceEl.current) return;
    //     // _boardRect = boardEl.current.getBoundingClientRect();
    //     // const pieceRect = pieceEl.current.getBoundingClientRect();
    //     // const x = e.clientX - pieceRect.left;
    //     // const y = e.clientY - pieceRect.top;
    //     // _pieceRect = pieceRect;
    //     //
    //     // const el = e.currentTarget as HTMLDivElement;
    //     // el.classList.toggle("dragging");
    //     //
    //     // const boardRect = _boardRect;
    //     // const boardx = e.clientX - boardRect.left;
    //     // const boardy = e.clientY - boardRect.top;
    //     //
    //     // let file = Math.floor(boardx / _pieceRect.width);
    //     // let rank = 7 - Math.floor(boardy / _pieceRect.height) + 1;
    //     //
    //     //
    //     // // let transform = window.getComputedStyle(pieceEl.current).getPropertyValue("transform");
    //     // // let matrix = new WebKitCSSMatrix(transform);
    //     //
    //     // // console.log(matrix);
    //     // // let translateX = matrix.e;
    //     // // let translateY = matrix.f;
    //     //
    //     // // snap the center of the piece to the cursor
    //     // let newTranslateX = boardx - pieceRect.width / 2;
    //     // let newTranslateY = boardy - pieceRect.height / 2;
    //     // pieceEl.current.style.transform = `translate(${newTranslateX}px, ${newTranslateY}px)`;
    //     //
    //     // if (highlightEl.current) {
    //     //     highlightEl.current.style.display = "block";
    //     //
    //     //     // if (lastHighlightSq.current) {
    //     //     if (
    //     //         lastHighlightSq.current != `${String.fromCharCode(97 + file)}${rank}`
    //     //     ) {
    //     //         if (lastHighlightSq.current) {
    //     //             highlightEl.current.classList.toggle(`sq-${lastHighlightSq.current}`);
    //     //         }
    //     //         highlightEl.current.classList.toggle(
    //     //             `sq-${String.fromCharCode(97 + file)}${rank}`
    //     //         );
    //     //     }
    //     //     // }
    //     // }
    //     //
    //     // // TODO save current square to lastSquare?
    //     //
    //     // draggingEl.current = el;
    //     // setIsDragging(true);
    // };
    //
    //
    // const onTouchStart = (e: React.TouchEvent) => {
    //     if (!boardEl.current || !pieceEl.current) return;
    //
    //     let touch = e.touches[0];
    //
    //
    //     const el = e.currentTarget as HTMLDivElement;
    //     el.classList.toggle("dragging");
    //
    //     const pieceRect = pieceEl.current.getBoundingClientRect();
    //     const x = touch.clientX - pieceRect.left;
    //
    //     const y = touch.clientY - pieceRect.top;
    //     _pieceRect = pieceRect;
    //     _boardRect = boardEl.current.getBoundingClientRect();
    //
    //     // snap the center of the piece to the cursor
    //     pieceEl.current.style.transform = `translate(${x - pieceRect.width / 2
    //         }px, ${y - pieceRect.height / 2}px)`;
    //
    //     draggingEl.current = el;
    //     setIsDragging(true);
    // };
    //
    // // const onMouseMove = (e: React.MouseEvent) => {};
    //
    // const onMouseUp = (e: React.MouseEvent) => { };
    //
    // useEffect(() => {
    //     const mousemove = (e: MouseEvent) => {
    //         e.preventDefault();
    //         if (
    //             !isDragging ||
    //             !draggingEl.current ||
    //             !boardEl.current ||
    //             !_boardRect ||
    //             !_pieceRect
    //         )
    //             return;
    //
    //         requestAnimationFrame(() => {
    //             const boardRect = _boardRect;
    //
    //             const x = clamp(e.clientX - boardRect.left, 0, boardRect.width);
    //             const y = clamp(e.clientY - boardRect.top, 0, boardRect.height);
    //
    //             let file = clamp(Math.floor(x / _pieceRect.width), 0, 7);
    //             let rank = clamp(7 - Math.floor(y / _pieceRect.height) + 1, 1, 8);
    //
    //             if (highlightEl.current) {
    //                 highlightEl.current.style.display = "block";
    //
    //                 if (
    //                     lastHighlightSq.current &&
    //                     lastHighlightSq.current !=
    //                     `${String.fromCharCode(97 + file)}${rank}`
    //                 ) {
    //                     highlightEl.current.classList.toggle(
    //                         `sq-${lastHighlightSq.current}`
    //                     );
    //                     highlightEl.current.classList.toggle(
    //                         `sq-${String.fromCharCode(97 + file)}${rank}`
    //                     );
    //                 }
    //             }
    //
    //             const pieceRect = _pieceRect;
    //
    //             let pieceX = Math.floor(x - pieceRect.width / 2);
    //             let pieceY = Math.floor(y - pieceRect.height / 2);
    //
    //
    //             // let pieceX = Math.floor(
    //             //     x - (pieceRect.left - boardRect.left) - pieceRect.width / 2
    //             // );
    //             //
    //             // let pieceY = Math.floor(
    //             //     y - (pieceRect.top - boardRect.top) - pieceRect.height / 2
    //             // );
    //
    //             pieceEl.current.style.transform = `translate(${pieceX}px, ${pieceY}px)`;
    //             lastHighlightSq.current = `${String.fromCharCode(97 + file)}${rank}`;
    //         });
    //     };
    //
    //     const mouseup = (e: MouseEvent) => {
    //         if (!draggingEl.current || !pieceEl.current) return;
    //
    //         requestAnimationFrame(() => {
    //             pieceEl.current.style.removeProperty("transform");
    //
    //             if (highlightEl.current) {
    //                 highlightEl.current.style.display = "none";
    //                 highlightEl.current.className = "highlight";
    //             }
    //
    //
    //             if (draggingEl.current.classList.contains("dragging")) {
    //                 draggingEl.current.classList.toggle("dragging");
    //             }
    //             draggingEl.current = null;
    //             lastHighlightSq.current = null;
    //         });
    //
    //         setIsDragging(false);
    //         setCurrentSquare(lastHighlightSq.current);
    //     };
    //
    //     const touchmove = (e: TouchEvent) => {
    //         // e.preventDefault();
    //         if (
    //             !isDragging ||
    //             !draggingEl.current ||
    //             !boardEl.current ||
    //             !_boardRect ||
    //             !_pieceRect
    //         )
    //             return;
    //
    //         let touch = e.touches[0];
    //
    //         requestAnimationFrame(() => {
    //             const boardRect = _boardRect;
    //             const x = touch.clientX - boardRect.left;
    //             const y = touch.clientY - boardRect.top;
    //
    //             console.log(Math.floor(x / _pieceRect.width));
    //
    //             const pieceRect = _pieceRect;
    //
    //             let pieceX = Math.floor(
    //                 x - (pieceRect.left - boardRect.left) - pieceRect.width / 2
    //             );
    //             let pieceY = Math.floor(
    //                 y - (pieceRect.top - boardRect.top) - pieceRect.height / 2
    //             );
    //
    //             pieceEl.current.style.transform = `translate(${pieceX}px, ${pieceY}px)`;
    //         });
    //     };
    //
    //     const touchend = (e: TouchEvent) => {
    //         if (!draggingEl.current || !pieceEl.current) return;
    //
    //         requestAnimationFrame(() => {
    //             pieceEl.current.style.removeProperty("transform");
    //
    //             draggingEl.current.classList.toggle("dragging");
    //             draggingEl.current = null;
    //         });
    //         setIsDragging(false);
    //     };
    //
    //     document.addEventListener("mousemove", mousemove);
    //     document.addEventListener("mouseup", mouseup);
    //     document.addEventListener("touchmove", touchmove);
    //     document.addEventListener("touchend", touchend);
    //     return () => {
    //         document.removeEventListener("mousemove", mousemove);
    //         document.removeEventListener("mouseup", mouseup);
    //         document.removeEventListener("touchmove", touchmove);
    //         document.removeEventListener("touchend", touchend);
    //     };
    // }, [isDragging, _boardRect, _pieceRect]);
    //
    // return (
    //     <div>
    //         <Board/>
    //     </div>
    //     // <div
    //     //     className="chess-container"
    //     //     // onMouseMove={testMove}
    //     //     // onMouseUp={onMouseUp}
    //     //     // onMouseDown={testDown}
    //     //     ref={testEl}
    //     // >
    //     //     <div ref={boardEl} className="chess-board" onContextMenu={(e) => {
    //     //         e.preventDefault();
    //     //         return false;
    //     //     }}
    //     //     >
    //     //         <div ref={highlightEl} className="highlight"></div>
    //     //         {/*<div className="piece sq-e1">*/}
    //     //         <svg
    //     //             onMouseDown={onMouseDown}
    //     //             onTouchStart={onTouchStart}
    //     //             viewBox="0 0 45 45"
    //     //             ref={pieceEl}
    //     //             className={`svg-piece sq-${currentSquare}`}
    //     //         >
    //     //             <use href={`${pieces}#piece-black-rook`}></use>
    //     //         </svg>
    //     //         {/*</div>*/}
    //     //         {/* 
    //     // <div className="piece sq-e1">
    //     //   <svg viewBox="0 0 45 45">
    //     //     <use href={`${pieces}#piece-black-knight`}></use>
    //     //   </svg>
    //     // </div> */}
    //
    //             // {/* <div className="w_king piece"></div> */}
    //             // {/* <div className="w_king piece"></div>
    //     // <div className="w_king piece"></div>
    //     // <div className="w_king piece"></div>
    //     // <div className="w_king piece"></div>
    //     // <div className="w_king piece"></div>
    //     // <div className="w_king piece"></div>
    //     // <div className="w_king piece"></div>
    //     // <div className="w_king piece"></div> */}
    //     //     </div>
    //     // </div>
    // );
}

// function App() {
//   const [chess] = useState<Chess>(() => {
//     const chess = new Chess();
//     chess.newGame();

//     return chess;
//   });
//   const [flipped, setFlipped] = useState(false);
//   const [, rerender] = useState({});
//   const [myTurn, setMyTurn] = useState<"w" | "b">("w");

//   const flipBoard = () => {
//     // console.log(myTurn);
//     setFlipped((flipped) => !flipped);
//   };

//   const move = (from: string, to: string, promotion_piece: string | null) => {
//     chess.move({
//       from,
//       to,
//       promotion_piece,
//     });

//     setMyTurn(chess.turn);

//     rerender({});
//   };

//   const can_move = (
//     from: string,
//     to: string,
//     promotion_piece: string | null
//   ): boolean => {
//     if (chess.turn == myTurn) {
//       return chess.can_move({ from, to, promotion_piece });
//     }
//     return false;
//   };

//   return (
//     <div>
//       <div className={`chess-container ${flipped ? "flipped" : ""}`}>
//         <Board
//           board={chess.board}
//           move={move}
//           can_move={can_move}
//           flipped={flipped}
//           turn={myTurn}
//         />
//       </div>
//       <button onClick={flipBoard}>Flip</button>
//     </div>
//   );
// }

export default App;
