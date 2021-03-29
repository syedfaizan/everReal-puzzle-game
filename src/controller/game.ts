interface Coordinates {
    x: number,
    y: number
}
export enum COLOR {
    RED = "red",
    YELLOW = "yellow",
    GREEN = "green",
    BLUE = "blue",
    PURPLE = "purple",
    ORANGE = "orange"
}

export interface Tile {
    color: COLOR,
    included: boolean
}

export type GameTable = Tile[][]

interface GameState {
    grid: GameTable,
    gameWon: boolean,
    color: COLOR
}


export function getRandomColor(chosenColors: string[]): string {
    const colorIndex =
        Math.floor(Math.random() * chosenColors.length) % chosenColors.length;
    return chosenColors[colorIndex];
}

export function generateGrid(gridSize: number, chosenColors: string[]) {
    const gameTable: object[] = [];
    for (let i = 0; i < gridSize; i += 1) {
        gameTable[i] = new Array(gridSize);
        for (let j = 0; j < gridSize; j += 1) {
            gameTable[i][j] = {
                color: getRandomColor(chosenColors),
                included: false
            }
        }
    }
    return gameTable;
}

export function hasGameWon(gameTable: GameTable) {
    for (const row of gameTable) {
        for (const col of row) {
            if (!col.included) {
                return false;
            }
        }
    }
    return true;
}

export function includeTile(row: number, col: number, color: COLOR, gameTable: GameTable) {
    gameTable[row][col].color = color;
    gameTable[row][col].included = true;
    return gameTable;
}


export function checkForNeighbours(row: number, col: number, color: COLOR, gameTable: GameTable) {
    if (gameTable[row][col].included)
        return gameTable;
    if (gameTable[row][col].color === color) {
        gameTable[row][col].included = true;
        return includeNeighbours(row, col, color, gameTable);
    }
    return gameTable;
}

export function includeNeighbours(row: number, col: number, color: COLOR, gameTable: GameTable) {
    if (row < (gameTable.length - 1))
        checkForNeighbours(row + 1, col, color, gameTable);
    if (row > 0)
        checkForNeighbours(row - 1, col, color, gameTable);
    if (col < (gameTable.length - 1))
        checkForNeighbours(row, col + 1, color, gameTable);
    if (col > 0)
        checkForNeighbours(row, col - 1, color, gameTable);
    return gameTable;
}


export function includeAll(color: COLOR, gameTable: GameTable) {
    const oldColor = gameTable[0][0].color;
    if (hasGameWon(gameTable) || color === oldColor)
        return gameTable;
    for (let row = 0; row < gameTable.length; row++) {
        for (let col = 0; col < gameTable.length; col++) {
            if (gameTable[row][col].included) {
                gameTable = includeTile(row, col, color, gameTable);
            }
        }
    }

    for (let row = 0; row < gameTable.length; row++) {
        for (let col = 0; col < gameTable.length; col++) {
            if (gameTable[row][col].included) {
                gameTable = includeNeighbours(row, col, color, gameTable);
            }
        }
    }
    return gameTable;
}



export function makeMove(color: COLOR, gameTable: GameTable, origin: Coordinates = { x: 0, y: 0 }) {
    gameTable[origin.x][origin.y].included = true;
    const newGrid = includeAll(color, gameTable);
    return {
        grid: newGrid,
        gameWon: hasGameWon(newGrid),
        color
    };
}


export function getLastState(gameState) {
    return gameState.moves[gameState.moves.length - 1].grid;
}