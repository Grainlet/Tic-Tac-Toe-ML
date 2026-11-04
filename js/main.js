import { Game, chooseMove } from "./game.js";
import { Renderer } from "./render.js";
import { TrainingManager } from "./training.js";

const renderer = new Renderer();
const training = new TrainingManager({
    onBoardUpdate: board => {
        renderer.renderTraining(board);
    },

    onGeneration: data => {
        renderer.renderGeneration(data.generation);
    }
});


const menuScreen = document.getElementById("menu");
const gameScreen = document.getElementById("game-screen");
const trainingScreen = document.getElementById("training-screen");
const watchScreen = document.getElementById("watch-screen");


const playButton = document.getElementById("play-button");
const trainButton = document.getElementById("train-button");
const watchButton = document.getElementById("watch-button");

const gameBackButton = document.getElementById("game-back");
const trainingBackButton = document.getElementById("training-back");
const watchBackButton = document.getElementById("watch-back");

const restartButton = document.getElementById("restart-button");
const watchRestartButton = document.getElementById("watch-restart");


let game = null;
let watchGame = null;

let trainingActive = false;
let watchActive = false;



function showScreen(screen) {
    menuScreen.classList.add("hidden");
    gameScreen.classList.add("hidden");
    trainingScreen.classList.add("hidden");
    watchScreen.classList.add("hidden");

    screen.classList.remove("hidden");
}

function showMenu() {
    stopTraining();
    stopWatching();
    showScreen(menuScreen);
}

function startGame() {
    stopTraining();
    stopWatching();

    const bestNetwork = training.getBestNetwork();

    game = new Game({
        network: bestNetwork,

        onUpdate: state => {
            renderer.renderGame(state);
        }
    });

    showScreen(gameScreen);
    renderer.clearGame();

    game.restart();

    if (!bestNetwork) {
        document.getElementById("game-status").textContent =
            "No trained AI found. Train one first!";
    }
}

function handleHumanMove(index) {
    if (!game || game.finished) return;

    const moved = game.playHumanMove(index);

    if (!moved) return;

    if (!game.finished) {
        setTimeout(() => {
            if (game && !game.finished) {
                game.playAIMove();
            }
        }, 350);
    }
}



async function startTraining() {
    stopWatching();

    if (trainingActive) return;

    trainingActive = true;
    showScreen(trainingScreen);

    training.loadSavedAI();

    renderer.renderGeneration(training.generation);
    renderer.clearTraining();

    while (trainingActive) {
        await training.trainGeneration();
    }
}

function stopTraining() {
    trainingActive = false;
    training.stop();
}


function startWatching() {
    stopTraining();
    stopWatching();

    showScreen(watchScreen);

    const bestNetwork = training.getBestNetwork();

    if (!bestNetwork) {
        document.getElementById("watch-status").textContent =
            "Train an AI first to watch it play.";

        renderer.clearWatch();
        return;
    }

    watchActive = true;

    let networkX = bestNetwork.clone();
    let networkO = bestNetwork.clone();

    let currentMatch = null;

    async function playNextMatch() {
        if (!watchActive) return;

        currentMatch = new Game({
            network: null,

            onUpdate: state => {
                renderer.renderWatch({
                    ...state,
                    result: state.finished
                        ? state.winner === 0
                            ? "draw"
                            : "win"
                        : null
                });
            }
        });


        currentMatch.board = Array(9).fill(0);
        currentMatch.currentPlayer = 1;

        renderer.clearWatch();

        while (watchActive && !currentMatch.finished) {
            const player = currentMatch.currentPlayer;

            const network = player === 1
                ? networkX
                : networkO;

            const move = currentMatch.board.length
                ? await getAIMove(network, currentMatch, player)
                : -1;

            if (!watchActive || move === -1) break;

            currentMatch.makeMove(move, player);

            await new Promise(resolve => setTimeout(resolve, 450));
        }

        if (watchActive) {
            await new Promise(resolve => setTimeout(resolve, 1200));


            const previousX = networkX;
            networkX = networkO;
            networkO = previousX;

            playNextMatch();
        }
    }

    playNextMatch();
}

async function getAIMove(network, currentGame, player) {
    return chooseMove(
        network,
        currentGame.board,
        player
    );
}

function stopWatching() {
    watchActive = false;
}


playButton.addEventListener("click", startGame);
trainButton.addEventListener("click", startTraining);
watchButton.addEventListener("click", startWatching);

gameBackButton.addEventListener("click", showMenu);
trainingBackButton.addEventListener("click", showMenu);
watchBackButton.addEventListener("click", showMenu);

restartButton.addEventListener("click", () => {
    if (game) {
        game.restart();
    }
});

watchRestartButton.addEventListener("click", () => {
    startWatching();
});

// Human board clicks
document.querySelectorAll(".cell").forEach(cell => {
    cell.addEventListener("click", () => {
        const index = Number(cell.dataset.index);
        handleHumanMove(index);
    });
});



training.loadSavedAI();
showScreen(menuScreen);
