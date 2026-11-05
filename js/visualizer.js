export class NetworkVisualizer {
    constructor(container) {
        this.container = container;

        this.width = 820;
        this.height = 620;

        this.inputX = 115;
        this.hiddenX = 410;
        this.outputX = 705;

        this.inputPositions = this.getPositions(9);
        this.hiddenPositions = this.getPositions(18);
        this.outputPositions = this.getPositions(9);

        this.positionLabels = [
            "Top Left",
            "Top Center",
            "Top Right",
            "Middle Left",
            "Center",
            "Middle Right",
            "Bottom Left",
            "Bottom Center",
            "Bottom Right"
        ];
    }

    getPositions(count) {
        const top = 35;
        const bottom = this.height - 35;
        const spacing = (bottom - top) / (count - 1);

        return Array.from(
            { length: count },
            (_, i) => top + i * spacing
        );
    }

    createSVGElement(name, attributes = {}) {
        const element = document.createElementNS(
            "http://www.w3.org/2000/svg",
            name
        );

        for (const [key, value] of Object.entries(attributes)) {
            element.setAttribute(key, value);
        }

        return element;
    }

    getWeightStyle(weight) {
        const strength = Math.min(Math.abs(weight), 1);

        return {
            color: weight >= 0 ? "#4d9b70" : "#c76b62",
            opacity: 0.12 + strength * 0.65,
            width: 0.5 + strength * 1.5
        };
    }

    getNeuronColor(value) {
        if (value > 0.05) return "#70b88d";
        if (value < -0.05) return "#cf796d";

        return "#e8e5dc";
    }

    addConnection(svg, x1, y1, x2, y2, weight) {
        const style = this.getWeightStyle(weight);

        const line = this.createSVGElement("line", {
            x1,
            y1,
            x2,
            y2,
            stroke: style.color,
            "stroke-width": style.width,
            "stroke-opacity": style.opacity
        });

        svg.appendChild(line);
    }

    addNeuron(svg, x, y, value, selected = false) {
        const circle = this.createSVGElement("circle", {
            cx: x,
            cy: y,
            r: selected ? 9 : 7,
            fill: this.getNeuronColor(value),
            stroke: selected ? "#292720" : "#aaa69b",
            "stroke-width": selected ? 3 : 1
        });

        svg.appendChild(circle);
    }

    addLabel(svg, x, y, text, anchor = "middle") {
        const label = this.createSVGElement("text", {
            x,
            y,
            fill: "#292720",
            "font-size": 13,
            "text-anchor": anchor,
            "font-family": "Marykate, cursive"
        });

        label.textContent = text;
        svg.appendChild(label);
    }

    render(network) {
        if (!this.container || !network) return;

        const inputs = network.lastInputs || Array(9).fill(0);
        const hidden = network.lastHidden || Array(18).fill(0);
        const outputs = network.lastOutputs || Array(9).fill(0);

        const svg = this.createSVGElement("svg", {
            viewBox: `0 0 ${this.width} ${this.height}`,
            width: "100%",
            role: "img",
            "aria-label": "Neural network visualization"
        });


        for (let i = 0; i < network.hiddenCount; i++) {
            for (let j = 0; j < network.inputCount; j++) {
                this.addConnection(
                    svg,
                    this.inputX,
                    this.inputPositions[j],
                    this.hiddenX,
                    this.hiddenPositions[i],
                    network.weightsInputHidden[i][j]
                );
            }
        }

        for (let i = 0; i < network.outputCount; i++) {
            for (let j = 0; j < network.hiddenCount; j++) {
                this.addConnection(
                    svg,
                    this.hiddenX,
                    this.hiddenPositions[j],
                    this.outputX,
                    this.outputPositions[i],
                    network.weightsHiddenOutput[i][j]
                );
            }
        }

        for (let i = 0; i < network.inputCount; i++) {
            this.addNeuron(
                svg,
                this.inputX,
                this.inputPositions[i],
                inputs[i]
            );
        }

        for (let i = 0; i < network.hiddenCount; i++) {
            this.addNeuron(
                svg,
                this.hiddenX,
                this.hiddenPositions[i],
                hidden[i]
            );
        }

        for (let i = 0; i < network.outputCount; i++) {
            this.addNeuron(
                svg,
                this.outputX,
                this.outputPositions[i],
                outputs[i],
                network.lastSelectedMove === i
            );
        }

        this.addLabel(svg, this.inputX, 17, "INPUT LAYER");
        this.addLabel(svg, this.hiddenX, 17, "HIDDEN LAYER");
        this.addLabel(svg, this.outputX, 17, "OUTPUT LAYER");

        for (let i = 0; i < 9; i++) {
            this.addLabel(
                svg,
                this.inputX - 15,
                this.inputPositions[i] + 4,
                this.positionLabels[i],
                "end"
            );

            this.addLabel(
                svg,
                this.outputX + 15,
                this.outputPositions[i] + 4,
                this.positionLabels[i],
                "start"
            );
        }

        this.container.replaceChildren(svg);
    }

    clear() {
        if (this.container) {
            this.container.replaceChildren();
        }
    }
}
