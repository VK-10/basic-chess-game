console.log("chessGame.js is running");
const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

if (!boardElement) {
    console.error("Error: .chessboard element not found in the DOM");
}

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
    if (!boardElement) {
        console.error("Cannot render board: boardElement is null");
        return;
    }
    const board = chess.board();
    console.log("Chess Board Data:", board);
    boardElement.innerHTML = "";
    board.forEach((row, rowIndex) => {
        row.forEach((square, squareIndex) => {
            const squareElement = document.createElement("div");
            squareElement.classList.add(
                "square",
                (rowIndex + squareIndex) % 2 === 0 ? "white" : "black"
            );
            squareElement.dataset.row = rowIndex;
            squareElement.dataset.column = squareIndex;

            console.log(`Square [${rowIndex}, ${squareIndex}]:`, square);
            if (square) {
                const pieceElement = document.createElement("div");
                pieceElement.classList.add("piece", square.color === "w" ? "white" : "black");
                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color;

                pieceElement.addEventListener("dragstart", (e) => {
                    draggedPiece = e.target;
                    sourceSquare = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.column),
                    };
                });

                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener("dragover", (e) => e.preventDefault());
            squareElement.addEventListener("drop", (e) => {
                e.preventDefault();
                if (draggedPiece) {
                    const targetSquare = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.column),
                    };
                    handleMove(sourceSquare, targetSquare);
                }
            });

            boardElement.appendChild(squareElement);
        });
    });
};

const getPieceUnicode = (piece) => {
    const unicodePieces = {
        'w': { 'p': '♙', 'r': '♖', 'n': '♘', 'b': '♗', 'q': '♕', 'k': '♔' },
        'b': { 'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚' }
    };
    const unicode = unicodePieces[piece.color][piece.type] || '';
    console.log(`Piece ${piece.color}${piece.type} -> Unicode: ${unicode}`);
    return unicode;
};

const handleMove = (source, target) => {
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: "q",
    };

    const result = chess.move(move);
    if (result) {
        renderBoard();
        socket.emit("move", move);
    } else {
        console.log("Invalid move attempted:", move);
    }
};

socket.on("playerRole", (role) => {
    playerRole = role;
    renderBoard();
});

socket.on("spectatorRole", () => {
    playerRole = null;
    renderBoard();
});

socket.on("boardState", (fen) => {
    console.log("Received FEN from server:", fen);
    chess.load(fen);
    renderBoard();
});

socket.on("invalidMove", (move) => {
    console.log("Invalid move:", move);
});

socket.on("move", (move) => {
    chess.move(move);
    renderBoard();
});

renderBoard();