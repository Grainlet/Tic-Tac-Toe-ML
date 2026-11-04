import { GeneticAlgorithm } from "./genetic.js";
import { Fitness } from "./rewards.js";
import {
    createBoard,
    getWinner,
    isDraw,
    chooseMove
} from "./game.js";

export class TrainingManager {
    constructor(options = {}) {
        this.algorithm = new GeneticAlgorithm({
            populationSize: options.populationSize || 200,
            inputCount: 9,
            hiddenCount: 18,
            outputCount: 9,
            eliteCount: 10,
            mutationRate: 0.12,
            mutationStrength: 0.35
        });

        this.onBoardUpdate = options.onBoardUpdate || (() => {});
        this.onGeneration = options.onGeneration || (() => {});

        this.opponentOffsets = [1, 7, 19, 43];

        this.isTraining = false;
        this.generation = this.algorithm.generation;
    }

    async playMatch(networkX, networkO, showBoard = false) {
        const board = createBoard();
        let currentPlayer = 1;

        while (true) {
            const network = currentPlayer === 1
                ? networkX
                : networkO;

            const move = chooseMove(
                network,
                board,
                currentPlayer
            );

            if (move === -1 || board[move] !== 0) {
                return {
                    winner: currentPlayer === 1 ? -1 : 1,
                    board
                };
            }

            board[move] = currentPlayer;

            if (showBoard) {
                this.onBoardUpdate([...board]);


                await new Promise(resolve => setTimeout(resolve, 15));
            }

            const winner = getWinner(board);

            if (winner !== null) {
                return { winner, board };
            }

            if (isDraw(board)) {
                return { winner: 0, board };
            }

            currentPlayer = currentPlayer === 1 ? -1 : 1;
        }
    }

    recordResult(fitnessX, fitnessO, winner) {
        if (winner === 1) {
            fitnessX.win();
            fitnessO.lose();
        } else if (winner === -1) {
            fitnessX.lose();
            fitnessO.win();
        } else {
            fitnessX.draw();
            fitnessO.draw();
        }
    }

    async trainGeneration() {
        if (this.isTraining) return;

        this.isTraining = true;

        const population = this.algorithm.population;
        const fitnessScores = population.map(() => new Fitness());

        let matchCount = 0;

        try {
            for (let i = 0; i < population.length; i++) {
                if (!this.isTraining) break;

                for (const offset of this.opponentOffsets) {
                    const opponentIndex = (i + offset) % population.length;

                    if (opponentIndex === i) continue;

                    const networkA = population[i].network;
                    const networkB = population[opponentIndex].network;


                    const firstMatch = await this.playMatch(
                        networkA,
                        networkB,
                        matchCount % 20 === 0
                    );

                    this.recordResult(
                        fitnessScores[i],
                        fitnessScores[opponentIndex],
                        firstMatch.winner
                    );

                    matchCount++;

                    if (!this.isTraining) break;

                    // Match 2: network B plays as X.
                    const secondMatch = await this.playMatch(
                        networkB,
                        networkA,
                        matchCount % 20 === 0
                    );


                    this.recordResult(
                        fitnessScores[opponentIndex],
                        fitnessScores[i],
                        secondMatch.winner
                    );

                    matchCount++;
                }
            }

            if (!this.isTraining) return;


            for (let i = 0; i < population.length; i++) {
                population[i].fitness = fitnessScores[i].calculate();
            }

            this.algorithm.rankPopulation();

            const bestFitness = this.algorithm.bestFitness;

            this.algorithm.nextGeneration();
            this.generation = this.algorithm.generation;

            this.algorithm.saveToStorage();

            this.onGeneration({
                generation: this.generation,
                bestFitness
            });

            this.onBoardUpdate(Array(9).fill(0));

        } finally {
            this.isTraining = false;
        }
    }

    async start() {
        if (this.isTraining) return;

        this.isTraining = true;

        while (this.isTraining) {
            await this.trainGeneration();
        }
    }

    stop() {
        this.isTraining = false;
    }

    getBestNetwork() {
        return this.algorithm.getBestNetwork();
    }

    loadSavedAI() {
        const loaded = this.algorithm.loadFromStorage();

        if (loaded) {
            this.generation = this.algorithm.generation;
        }

        return loaded;
    }

    reset() {
        this.stop();
        this.algorithm.reset();
        this.generation = 1;

        this.onGeneration({
            generation: this.generation,
            bestFitness: 0
        });

        this.onBoardUpdate(Array(9).fill(0));
    }
}

