const BASE_API_URL = "http://localhost:5000"

function getRandomColor(chosenColors) {
    const colorIndex =
        Math.floor(Math.random() * chosenColors.length) % chosenColors.length;
    return chosenColors[colorIndex];
}

function findRegion(arr) {
    var regions = [],        // the current region
        visited = new Set
    var origin = arr[0][0];
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[i].length; j++) {
            if (visited.has(i + '_' + j)) continue
            let land = traverse(i, j)
            if (land) {
                regions.push(land);
            }
        }
    }
    function traverse(x, y, current = []) {
        if (x < 0 || y < 0 || x > arr.length - 1 || y > arr[0].length - 1) {
            return;
        }
        if (!arr[x][y].color || visited.has(x + '_' + y)) {
            return;
        }
        if (x === 0 || y === 0) {

            current.push(arr[x][y].color);
            visited.add(x + '_' + y)
            traverse(x, y + 1, current);
            traverse(x, y - 1, current);
            traverse(x - 1, y, current);
            traverse(x + 1, y, current);
            return current;
        }

    }
    return regions
}



function Tile(props) {
    return (
        <td className={`tile ${props.included ? 'included' : ''}`} style={{ backgroundColor: props.color }}></td>
    )
}

function GameGrid(props) {
    let { grid } = props;
    let gameTable = grid && grid.map((rows, index) => {
        return (
            <tr>
                {rows.map((tile, index) => {
                    return <Tile {...tile}></Tile>
                })}
            </tr>
        )
    });
    return (
        <table className="game-table">
            {gameTable}
        </table>
    )
}
class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            gridSize: 4,
            noOfColors: 4,
            grid: null,
            chosenColors: [],
            gameWon: false,
            steps: 0,
            gameState: null,
            showHistory: false
        }
    }

    onChange = (e) => this.setState({ [e.target.name]: e.target.value });

    startNewGame = () => {
        let { gridSize, noOfColors: numberOfColors } = this.state;
        return axios.post(`${BASE_API_URL}/api/game`, { gridSize, numberOfColors })
            .then(data => {
                let grid = this.getLatestGameState(data).grid;
                this.setState({
                    grid,
                    gameId: data.gameState.id,
                    chosenColors: data.chosenColors,
                    gameWon: false,
                    steps: 0,
                    showHistory: false
                })
            })
    }

    getLatestGameState = ({ gameState: state }) => {
        return state.moves[state.moves.length - 1];
    }
    makeMove = color => {
        let { gameId, gameWon } = this.state;
        if (gameId && !gameWon) {
            return axios.post(`${BASE_API_URL}/api/game/${gameId}/move`, { color })
                .then(data => {
                    let state = this.getLatestGameState(data);
                    return this.setState({
                        grid: state.grid,
                        gameWon: state.gameWon,
                        steps: data.gameState.moves.length - 1, // remove one as the initial state is added automatically
                        gameState: data.gameState
                    })
                })
        }
    }

    hasGameWon = (gameTable) => {
        for (const row of gameTable) {
            for (const col of row) {
                if (!col.included) {
                    return false;
                }
            }
        }
        return true;
    }

    findNeighbouringCells = (grid) => {
        let colorsRows = findRegion(grid);
        let occurances = {};
        colorsRows.forEach(colors => {
            colors.forEach(color => {
                if (occurances.hasOwnProperty(color)) {
                    occurances[color] += 1;
                } else {
                    occurances[color] = 1;
                }
            })
        })
        let colorArray = [];
        Object.keys(occurances).forEach(color => {
            colorArray.push(color);
        })
        return getRandomColor(colorArray);
    }

    getNextMoveForAI = (chosenColors, grid) => {
        return getRandomColor(chosenColors);
        // return this.findNeighbouringCells(grid)
    }

    startAIPlayer = () => {
        const { grid, chosenColors } = this.state;
        if (this.hasGameWon(grid))
            return null;
        this.makeMove(this.getNextMoveForAI(chosenColors, grid))
            .then(() => {
                this.startAIPlayer();
            })
    }

    render = () => {
        let { grid, chosenColors, steps } = this.state;
        return <div class="wrapper">
            <h1>A very popular game</h1>

            <section class="options">
                <div>
                    <label for="grid-size">Grid size:</label>
                    <select value={this.state.gridSize} onChange={this.onChange} name="gridSize" id="grid-size">
                        <option value="2">2x2</option>
                        <option value="3">3x3</option>
                        <option value="4">4x4</option>
                        <option value="5">5x5</option>
                        <option value="6">6x6</option>
                        <option value="7">7x7</option>
                        <option value="8">8x8</option>
                        <option value="9">9x9</option>
                        <option value="10">10x10</option>
                    </select>
                </div>

                <div>
                    <label for="number-of-colors">Colors:</label>
                    <select value={this.state.noOfColors} onChange={this.onChange} name="noOfColors" id="number-of-colors">
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                    </select>
                </div>

                <div><button onClick={this.startNewGame}>Start new game</button></div>
            </section>

            <section className="color-picker">
                {chosenColors.length ?
                    <React.Fragment>
                        <help>Choose next move</help>
                        <section>
                            {chosenColors.map(color => {
                                return <button onClick={() => this.makeMove(color)} className={`color-picker-tile`} style={{ backgroundColor: color }}></button>
                            })}
                        </section>
                        <p>or</p>
                        <section>
                            <button onClick={() => this.startAIPlayer()}>Let AI player play</button>
                        </section>
                        <section>
                            <strong>Steps Used: {steps}</strong>
                        </section>
                    </React.Fragment>
                    : ''}
            </section>

            <section>
                <GameGrid grid={grid}></GameGrid>
            </section>
            <section>
                {this.state.gameWon ?
                    <React.Fragment>
                        <p>Yay! 🎉 You won the game in <strong>{this.state.steps}</strong> steps</p>
                        <button className="btn show-history-btn" onClick={() => this.setState({ showHistory: true })}>Show History</button>
                        <button className="btn" onClick={this.startNewGame}>Restart Game</button>
                    </React.Fragment>
                    : ''}
            </section>

            {
                this.state.showHistory &&
                    this.state.gameState ?
                    <section>
                        <table>
                            <thead>
                                <tr>
                                    <td>Move #</td>
                                    <td>Sequence of colors</td>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.gameState.moves.map((move, index) => {
                                    if (index !== 0) {

                                        return (<tr>
                                            <td>{index}</td>
                                            <td><Tile color={move.color || ''}></Tile></td>
                                        </tr>)
                                    }
                                })}
                            </tbody>
                        </table>
                    </section>
                    : ''
            }


        </div>
    }
}

ReactDOM.render(<Main />, document.getElementById('root'))