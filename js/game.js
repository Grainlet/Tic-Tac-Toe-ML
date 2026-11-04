export const WIN_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

export function createBoard() {
    return Array(9).fill(0);
}

export function getLegalMoves(board) {
    const moves = [];

    for (let i = 0; i < board.length; i++) {
        if (board[i] === 0) {
            moves.push(i);
        }
    }

    return moves;
}

export function getWinner(board) {
    for (const combination of WIN_COMBINATIONS) {
        const [a, b, c] = combination;

        if (
            board[a] !== 0 &&
            board[a] === board[b] &&
            board[b] === board[c]
        ) {
            return board[a];
        }
    }

    return null;
}

export function isDraw(board) {
    return getWinner(board) === null &&
        board.every(cell => cell !== 0);
}

export function getNetworkInputs(board, player) {
    return board.map(cell => {
        if (cell === 0) return 0;
        return cell === player ? 1 : -1;
    });
}

export function chooseMove(network, board, player = -1) {
    const legalMoves = getLegalMoves(board);

    if (legalMoves.length === 0) {
        return -1;
    }

    if (!network) {
        return legalMoves[
            Math.floor(Math.random() * legalMoves.length)
        ];
    }

    const inputs = getNetworkInputs(board, player);
    const outputs = network.predict(inputs);

    let bestMove = legalMoves[0];
    let bestScore = -Infinity;

    for (const move of legalMoves) {
        const score = outputs[move];

        if (
            Number.isFinite(score) &&
            score > bestScore
        ) {
            bestScore = score;
            bestMove = move;
        }
    }

    return bestMove;
}

export class Game {
    constructor(options = {}) {
        this.network = options.network || null;
        this.onUpdate = options.onUpdate || (() => {});
        this.onEnd = options.onEnd || (() => {});

        this.humanPlayer = 1;
        this.aiPlayer = -1;

        this.board = createBoard();
        this.currentPlayer = 1;

        this.winner = null;
        this.finished = false;
        this.result = null;
    }

    playHumanMove(index) {
        if (this.finished) return false;
        if (this.currentPlayer !== this.humanPlayer) return false;
        if (!Number.isInteger(index) || index < 0 || index > 8) return false;
        if (this.board[index] !== 0) return false;

        this.makeMove(index, this.humanPlayer);
        return true;
    }

    playAIMove() {
        if (this.finished) return false;
        if (this.currentPlayer !== this.aiPlayer) return false;

        const move = chooseMove(
            this.network,
            this.board,
            this.aiPlayer
        );

        if (move === -1) return false;

        this.makeMove(move, this.aiPlayer);
        return true;
    }

    makeMove(index, player) {
        if (this.board[index] !== 0 || this.finished) {
            return false;
        }

        this.board[index] = player;

        const winner = getWinner(this.board);

        if (winner !== null) {
            this.winner = winner;
            this.finished = true;
            this.result = winner === this.humanPlayer
                ? "win"
                : "loss";

            this.onUpdate(this.getState());
            this.onEnd(this.getState());

            return true;
        }

        if (isDraw(this.board)) {
            this.finished = true;
            this.result = "draw";

            this.onUpdate(this.getState());
            this.onEnd(this.getState());

            return true;
        }

        this.currentPlayer = player === 1 ? -1 : 1;

        this.onUpdate(this.getState());

        return true;
    }

    setNetwork(network) {
        this.network = network;
    }

    restart() {
        this.board = createBoard();
        this.currentPlayer = this.humanPlayer;

        this.winner = null;
        this.finished = false;
        this.result = null;

        this.onUpdate(this.getState());
    }

    getState() {
        return {
            board: [...this.board],
            currentPlayer: this.currentPlayer,
            winner: this.winner,
            finished: this.finished,
            result: this.result
        };
    }
}
