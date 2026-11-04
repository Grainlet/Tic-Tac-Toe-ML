
import { NeuralNetwork } from "./network.js";

export class GeneticAlgorithm {
    constructor(options = {}) {
        this.populationSize = options.populationSize || 200;
        this.inputCount = options.inputCount || 9;
        this.hiddenCount = options.hiddenCount || 18;
        this.outputCount = options.outputCount || 9;

        this.eliteCount = options.eliteCount || 10;
        this.mutationRate = options.mutationRate || 0.12;
        this.mutationStrength = options.mutationStrength || 0.35;

        this.generation = 1;
        this.bestFitness = -Infinity;
        this.bestNetwork = null;

        this.population = [];
        this.createPopulation();
    }

    createPopulation() {
        this.population = Array.from(
            { length: this.populationSize },
            () => ({
                network: new NeuralNetwork(
                    this.inputCount,
                    this.hiddenCount,
                    this.outputCount
                ),
                fitness: 0
            })
        );
    }

    rankPopulation() {
        this.population.sort(
            (a, b) => b.fitness - a.fitness
        );

        const currentBest = this.population[0];

        if (
            currentBest &&
            currentBest.fitness > this.bestFitness
        ) {
            this.bestFitness = currentBest.fitness;
            this.bestNetwork = currentBest.network.clone();
        }

        return this.population;
    }

    tournamentSelection(size = 5) {
        let winner = null;

        for (let i = 0; i < size; i++) {
            const candidate = this.population[
                Math.floor(Math.random() * this.population.length)
            ];

            if (!winner || candidate.fitness > winner.fitness) {
                winner = candidate;
            }
        }

        return winner;
    }

    createChild(parentA, parentB) {
        const child = NeuralNetwork.crossover(
            parentA.network,
            parentB.network
        );

        child.mutate(
            this.mutationRate,
            this.mutationStrength
        );

        return {
            network: child,
            fitness: 0
        };
    }

    nextGeneration() {
        this.rankPopulation();

        const nextPopulation = [];

        const eliteCount = Math.min(
            this.eliteCount,
            this.populationSize
        );

        for (let i = 0; i < eliteCount; i++) {
            nextPopulation.push({
                network: this.population[i].network.clone(),
                fitness: 0
            });
        }

        while (nextPopulation.length < this.populationSize) {
            const parentA = this.tournamentSelection();
            const parentB = this.tournamentSelection();

            nextPopulation.push(
                this.createChild(parentA, parentB)
            );
        }

        this.population = nextPopulation;
        this.generation++;

        return this.population;
    }

    saveToStorage() {
        if (!this.bestNetwork) return;

        const data = {
            generation: this.generation,
            bestFitness: this.bestFitness,
            bestNetwork: this.bestNetwork.toJSON()
        };

        localStorage.setItem(
            "ticTacToeAI",
            JSON.stringify(data)
        );
    }

    loadFromStorage() {
        const saved = localStorage.getItem("ticTacToeAI");

        if (!saved) return false;

        try {
            const data = JSON.parse(saved);

            this.generation = data.generation || 1;
            this.bestFitness = data.bestFitness ?? -Infinity;

            this.bestNetwork = NeuralNetwork.fromJSON(
                data.bestNetwork
            );

            return true;
        } catch (error) {
            console.error("Couldnt load saved AI:", error);
            return false;
        }
    }

    getBestNetwork() {
    if (!this.bestNetwork) {
        return null;
    }

    return this.bestNetwork.clone();
}



    reset() {
        this.generation = 1;
        this.bestFitness = -Infinity;
        this.bestNetwork = null;

        this.createPopulation();
    }
}
