export const REWARDS = {
    WIN: 10,
    DRAW: 3,
    LOSS: -5,
    INVALID_MOVE: -10,
    MOVE_PENALTY: -0.01
};

export class Fitness {
    constructor() {
        this.score = 0;
        this.wins = 0;
        this.draws = 0;
        this.losses = 0;
        this.invalidMoves = 0;
        this.gamesPlayed = 0;
    }

    win() {
        this.score += REWARDS.WIN;
        this.wins++;
        this.gamesPlayed++;
    }

    draw() {
        this.score += REWARDS.DRAW;
        this.draws++;
        this.gamesPlayed++;
    }

    lose() {
        this.score += REWARDS.LOSS;
        this.losses++;
        this.gamesPlayed++;
    }

    invalidMove() {
        this.score += REWARDS.INVALID_MOVE;
        this.invalidMoves++;
    }

    recordMove() {
        this.score += REWARDS.MOVE_PENALTY;
    }

    calculate() {
        if (this.gamesPlayed === 0) {
            return this.score;
        }

        const winRate = this.wins / this.gamesPlayed;
        const drawRate = this.draws / this.gamesPlayed;
        const lossRate = this.losses / this.gamesPlayed;

        return (
            winRate * 10 +
            drawRate * 3 -
            lossRate * 5 -
            this.invalidMoves * 2
        );
    }

    reset() {
        this.score = 0;
        this.wins = 0;
        this.draws = 0;
        this.losses = 0;
        this.invalidMoves = 0;
        this.gamesPlayed = 0;
    }
}

