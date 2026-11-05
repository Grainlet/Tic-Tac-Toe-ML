export class Renderer {
    constructor() {
        this.boardElement = document.getElementById("game-board");
        this.trainingBoard = document.getElementById("training-board");
        this.watchBoard = document.getElementById("watch-board");

        this.statusElement = document.getElementById("game-status");
        this.watchStatus = document.getElementById("watch-status");
        this.generationElement = document.getElementById("generation-counter");

        this.cells = this.boardElement
            ? [...this.boardElement.querySelectorAll(".cell")]
            : [];

        this.trainingCells = this.trainingBoard
            ? [...this.trainingBoard.querySelectorAll(".training-cell")]
            : [];

        this.watchCells = this.watchBoard
            ? [...this.watchBoard.querySelectorAll(".watch-cell")]
            : [];
    }

    drawMark(element, value) {
        if (!element) return;

        element.textContent = value === 1
            ? "X"
            : value === -1
                ? "O"
                : "";

        element.classList.toggle("mark-x", value === 1);
        element.classList.toggle("mark-o", value === -1);
    }

    renderGame(state) {
        if (!state) return;

        state.board.forEach((value, index) => {
            const cell = this.cells[index];

            this.drawMark(cell, value);

            if (cell) {
                cell.disabled = value !== 0 || state.finished;
            }
        });

        if (!this.statusElement) return;

        if (state.finished) {
            if (state.result === "win") {
                this.statusElement.textContent = "You won! Well played.";
            } else if (state.result === "loss") {
                this.statusElement.textContent = "The AI wins. Try again!";
            } else {
                this.statusElement.textContent = "It's a draw!";
            }
        } else if (state.currentPlayer === 1) {
            this.statusElement.textContent = "Your turn — X";
        } else {
            this.statusElement.textContent = "AI is thinking...";
        }
    }

    renderTraining(board) {
        if (!board) return;

        board.forEach((value, index) => {
            this.drawMark(this.trainingCells[index], value);
        });
    }

    renderWatch(state) {
        if (!state) return;

        state.board.forEach((value, index) => {
            this.drawMark(this.watchCells[index], value);
        });

        if (!this.watchStatus) return;

        if (state.finished) {
            if (state.result === "draw") {
                this.watchStatus.textContent = "The match ended in a draw.";
            } else {
                this.watchStatus.textContent =
                    state.winner === 1
                        ? "AI X wins!"
                        : "AI O wins!";
            }
        } else {
            this.watchStatus.textContent =
                state.currentPlayer === 1
                    ? "AI X is thinking..."
                    : "AI O is thinking...";
        }
    }

    renderGeneration(generation) {
        if (this.generationElement) {
            this.generationElement.textContent = generation;
        }
    }

    clearGame() {
        this.renderGame({
            board: Array(9).fill(0),
            currentPlayer: 1,
            finished: false,
            result: null
        });
    }

    clearTraining() {
        this.renderTraining(Array(9).fill(0));
    }

    clearWatch() {
        this.renderWatch({
            board: Array(9).fill(0),
            currentPlayer: 1,
            finished: false,
            result: null
        });
    }
}
