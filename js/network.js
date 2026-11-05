export class NeuralNetwork {
    constructor(inputCount = 9, hiddenCount = 18, outputCount = 9) {
        this.inputCount = inputCount;
        this.hiddenCount = hiddenCount;
        this.outputCount = outputCount;

        this.weightsInputHidden = this.createWeights(
            hiddenCount,
            inputCount
        );

        this.weightsHiddenOutput = this.createWeights(
            outputCount,
            hiddenCount
        );

        this.hiddenBias = Array(hiddenCount).fill(0);
        this.outputBias = Array(outputCount).fill(0);

        this.lastInputs = Array(inputCount).fill(0);
        this.lastHidden = Array(hiddenCount).fill(0);
        this.lastOutputs = Array(outputCount).fill(0);
        this.lastSelectedMove = null;
    }

    createWeights(rows, columns) {
        const scale = Math.sqrt(2 / columns);

        return Array.from({ length: rows }, () =>
            Array.from(
                { length: columns },
                () => (Math.random() * 2 - 1) * scale
            )
        );
    }

    activate(value) {
        return Math.tanh(value);
    }

    predict(inputs) {
        if (inputs.length !== this.inputCount) {
            throw new Error(
                `Expected ${this.inputCount} inputs, received ${inputs.length}`
            );
        }

        const hidden = [];

        for (let i = 0; i < this.hiddenCount; i++) {
            let sum = this.hiddenBias[i];

            for (let j = 0; j < this.inputCount; j++) {
                sum += this.weightsInputHidden[i][j] * inputs[j];
            }

            hidden.push(this.activate(sum));
        }

        const outputs = [];

        // Hidden layer to output layer
        for (let i = 0; i < this.outputCount; i++) {
            let sum = this.outputBias[i];

            for (let j = 0; j < this.hiddenCount; j++) {
                sum += this.weightsHiddenOutput[i][j] * hidden[j];
            }

            outputs.push(sum);
        }


        this.lastInputs = [...inputs];
        this.lastHidden = [...hidden];
        this.lastOutputs = [...outputs];

        return outputs;
    }

    clone() {
        const copy = new NeuralNetwork(
            this.inputCount,
            this.hiddenCount,
            this.outputCount
        );

        copy.weightsInputHidden = this.weightsInputHidden.map(row => [...row]);
        copy.weightsHiddenOutput = this.weightsHiddenOutput.map(row => [...row]);

        copy.hiddenBias = [...this.hiddenBias];
        copy.outputBias = [...this.outputBias];

        return copy;
    }

    mutate(rate = 0.1, strength = 0.3) {
        const mutateValue = value => {
            if (Math.random() < rate) {
                return value + (Math.random() * 2 - 1) * strength;
            }

            return value;
        };

        this.weightsInputHidden = this.weightsInputHidden.map(row =>
            row.map(mutateValue)
        );

        this.weightsHiddenOutput = this.weightsHiddenOutput.map(row =>
            row.map(mutateValue)
        );

        this.hiddenBias = this.hiddenBias.map(mutateValue);
        this.outputBias = this.outputBias.map(mutateValue);

        return this;
    }

    static crossover(parentA, parentB) {
        const child = new NeuralNetwork(
            parentA.inputCount,
            parentA.hiddenCount,
            parentA.outputCount
        );

        const combine = (a, b) =>
            a.map((row, i) =>
                row.map((value, j) =>
                    Math.random() < 0.5 ? value : b[i][j]
                )
            );

        child.weightsInputHidden = combine(
            parentA.weightsInputHidden,
            parentB.weightsInputHidden
        );

        child.weightsHiddenOutput = combine(
            parentA.weightsHiddenOutput,
            parentB.weightsHiddenOutput
        );

        child.hiddenBias = parentA.hiddenBias.map((value, i) =>
            Math.random() < 0.5 ? value : parentB.hiddenBias[i]
        );

        child.outputBias = parentA.outputBias.map((value, i) =>
            Math.random() < 0.5 ? value : parentB.outputBias[i]
        );

        return child;
    }

    toJSON() {
        return {
            inputCount: this.inputCount,
            hiddenCount: this.hiddenCount,
            outputCount: this.outputCount,
            weightsInputHidden: this.weightsInputHidden,
            weightsHiddenOutput: this.weightsHiddenOutput,
            hiddenBias: this.hiddenBias,
            outputBias: this.outputBias
        };
    }

    static fromJSON(data) {
        const network = new NeuralNetwork(
            data.inputCount,
            data.hiddenCount,
            data.outputCount
        );

        network.weightsInputHidden = data.weightsInputHidden;
        network.weightsHiddenOutput = data.weightsHiddenOutput;
        network.hiddenBias = data.hiddenBias;
        network.outputBias = data.outputBias;

        return network;
    }
}
