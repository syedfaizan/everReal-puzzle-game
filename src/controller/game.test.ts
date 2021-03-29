import {
    generateGrid,
    makeMove,
    getLastState,
    COLOR,
    GameTable,
    getRandomColor,
    hasGameWon,
    Tile,
    includeTile,
    checkForNeighbours,
    includeAll
} from './game'

describe("Test the Game controller", () => {


    test('should return a random color', () => {
        const colors: string[] = Object.values(COLOR);
        const color: string = getRandomColor(colors);
        expect(colors.includes(color)).toBeTruthy();
    })

    test('Generate 2x2 grid', () => {
        const gridSize = 2;
        const grid: any[] = generateGrid(gridSize, Object.values(COLOR));
        expect(grid.length).toBe(gridSize);
        grid.forEach(row => {
            expect(row.length).toBe(gridSize);
        })
    });

    test('Generate 10x10 grid', () => {
        const gridSize = 10;
        const grid: any[] = generateGrid(gridSize, Object.values(COLOR));
        expect(grid.length).toBe(gridSize);
        grid.forEach(row => {
            expect(row.length).toBe(gridSize);
        })
    });

    test('Generate 6x6 grid with 5 colors', () => {
        const noOfColors = 5;
        const gridSize = 6;
        const grid: any[] = generateGrid(gridSize, Object.values(COLOR).slice(0, noOfColors));
        const colors: any[] = [];
        grid.forEach(row => {
            row.forEach(tile => {
                colors.push(tile.color);
            })
        })
        const uniqeColors = [...new Set(colors)];
        expect(uniqeColors.length).toBe(noOfColors)
    });

    test('Check if all cells are included in the region (indicating game won)', () => {
        const testGridTruthy: any = [
            [{ "color": "red", "included": true }, { "color": "red", "included": true }, { "color": "red", "included": true }, { "color": "red", "included": true }],
            [{ "color": "red", "included": true }, { "color": "red", "included": true }, { "color": "red", "included": true }, { "color": "red", "included": true }],
            [{ "color": "red", "included": true }, { "color": "red", "included": true }, { "color": "red", "included": true }, { "color": "red", "included": true }],
            [{ "color": "red", "included": true }, { "color": "red", "included": true }, { "color": "red", "included": true }, { "color": "red", "included": true }]]
        expect(hasGameWon(testGridTruthy)).toBeTruthy();
    })

    test('Check if there are still tiles to be included (game still in progress)', () => {
        const testGridFalsy: any = [
            [{ "color": "red", "included": true }, { "color": "red", "included": true }, { "color": "red", "included": true }, { "color": "red", "included": true }],
            [{ "color": "red", "included": true }, { "color": "red", "included": true }, { "color": "red", "included": true }, { "color": "red", "included": true }],
            [{ "color": "red", "included": true }, { "color": "red", "included": true }, { "color": "red", "included": true }, { "color": "red", "included": true }],
            [{ "color": "red", "included": false }, { "color": "red", "included": false }, { "color": "red", "included": false }, { "color": "red", "included": true }]]
        expect(hasGameWon(testGridFalsy)).toBeFalsy();
    })

    test('Mark a tile as included', () => {
        const row = 0;
        const col = 0;
        const color: any = 'green';
        const testGrid: any = [
            [{ "color": "blue", "included": false }, { "color": "red", "included": false }, { "color": "yellow", "included": false }],
            [{ "color": "red", "included": false }, { "color": "red", "included": false }, { "color": "red", "included": false }],
            [{ "color": "green", "included": false }, { "color": "blue", "included": false }, { "color": "green", "included": false }]];
        const newGrid = includeTile(row, col, color, testGrid);
        expect(newGrid[row][col].included).toBeTruthy();
        expect(newGrid[row][col].color).toBe(color);
    })

    test("Should return same grid if cell is already included", () => {
        const row = 0;
        const col = 0;
        const color: any = 'green';
        const testGrid: any = [
            [{ "color": "blue", "included": true }, { "color": "red", "included": false }],
            [{ "color": "red", "included": false }, { "color": "red", "included": false }],
        ];
        const newGrid = checkForNeighbours(row, col, color, testGrid);
        expect(newGrid).toMatchObject(testGrid)
    })

    test("Should return updated grid if cell has neighbors", () => {
        const row = 0;
        const col = 0;
        const color: any = 'red';
        const testGrid: any = [
            [{ "color": "red", "included": false }, { "color": "red", "included": false }],
            [{ "color": "red", "included": false }, { "color": "green", "included": false }],
        ];
        const outputGrid = [
            [{ "color": "red", "included": true }, { "color": "red", "included": true }],
            [{ "color": "red", "included": true }, { "color": "green", "included": false }],
        ];
        const newGrid = checkForNeighbours(row, col, color, testGrid);
        newGrid.forEach((row, rowIndex) => {
            row.forEach((col, colIndex) => {
                expect(col).toStrictEqual(outputGrid[rowIndex][colIndex])
            })
        })
    });

    test("Should return updated grid with all cells included", () => {
        const color: any = 'red';
        const testGrid: any = [
            [{ "color": "red", "included": false }, { "color": "red", "included": false }],
            [{ "color": "red", "included": false }, { "color": "green", "included": false }],
        ];
        const expectedOutputGrid = [
            [{ color: 'red', included: false }, { color: 'red', included: false }],
            [{ color: 'red', included: false }, { color: 'green', included: false }]
        ];
        const newGrid = includeAll(color, testGrid);
        newGrid.forEach((row, rowIndex) => {
            row.forEach((col, colIndex) => {
                expect(col).toStrictEqual(expectedOutputGrid[rowIndex][colIndex])
            })
        })
    })

    test("Should return the updated game state when a new move is made", () => {
        const color: any = 'red';
        const testGrid: any = [[{ "color": "yellow", "included": false }, { "color": "yellow", "included": false }], [{ "color": "red", "included": false }, { "color": "yellow", "included": false }]];
        const newState = makeMove(color, testGrid);

        const expectedGameState = {
            grid: [[{ "color": "red", "included": true }, { "color": "yellow", "included": false }], [{ "color": "red", "included": true }, { "color": "yellow", "included": false }]],
            gameWon: false,
            color
        }

        expect(newState).toStrictEqual(expectedGameState)
    })

    test("Should return the updated game state when a new move is made and game is won", () => {
        const color: any = 'yellow';
        const testGrid: any = [[{ "color": "red", "included": true }, { "color": "yellow", "included": false }], [{ "color": "red", "included": true }, { "color": "yellow", "included": false }]];
        const newState = makeMove(color, testGrid);

        const expectedGameState = {
            grid: [[{ "color": "yellow", "included": true }, { "color": "yellow", "included": true }], [{ "color": "yellow", "included": true }, { "color": "yellow", "included": true }]],
            gameWon: true,
            color
        }

        expect(newState).toStrictEqual(expectedGameState)
    })

});