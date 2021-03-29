import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { COLOR, generateGrid, makeMove, getLastState } from './controller/game';
import { init } from './controller/database';

const PORT = 5000;
const app = express();
app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.json()); // to Parse POST body to JSON


app.use(async (req, res, next) => {
    const db = await init();
    req.db = db;
    next();
})

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

app.post('/api/game/', async (req: Request, res: Response, next) => {
    try {
        const { numberOfColors, gridSize } = req.body;
        const chosenColors = Object.values(COLOR).slice(0, numberOfColors);
        const gameTable = generateGrid(gridSize, chosenColors);
        const gameObj = {
            moves: [{ grid: gameTable, color: null }]
        };

        req.db.get('games')
            .push(gameObj)
            .last()
            .assign({ id: Date.now().toString() })
            .write()
            .then(game => res.send({ gameState: game, chosenColors }))
    }
    catch (e) {
        next(e)
    }
})

app.post('/api/game/:id/move', async (req: Request, res: Response, next) => {
    try {
        const { color } = req.body;
        const gameState = await req.db.get('games')
            .find({ id: req.params.id })
            .value();
        gameState.moves = gameState.moves || [];
        const state = makeMove(color, getLastState(gameState));
        gameState.moves.push(state);
        await req.db.get('games').remove({ id: req.params.id }).write();
        await req.db.get('games').push(gameState).write();

        return res.send({ gameState });
    }
    catch (e) {
        next(e)
    }
})

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

