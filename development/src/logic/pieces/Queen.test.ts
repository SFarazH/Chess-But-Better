import { OVERWORLD_BOARD_ID } from '../Constants';
import { Game } from '../GameController';
import { Player, PlayerColors } from '../Players';
import { Position } from './PiecesHelpers';
import { Queen } from './Queen';

jest.mock('../../LogicAdapter.ts');

let game: Game;
const whitePlayer = new Player(PlayerColors.WHITE);

beforeAll(() => {
  game = new Game();
});

describe('Piece movements', () => {
  test('Validating Queen movement', () => {
    const initialPosition: Position = {
      coordinates: [2, 5],
      boardId: OVERWORLD_BOARD_ID,
    };
    const queen = new Queen(game, initialPosition, whitePlayer);

    const newStraightPosition: Position = {
      coordinates: [2, 2],
      boardId: OVERWORLD_BOARD_ID,
    };
    const validStraightMove = queen.validateMove({
      position: newStraightPosition,
    });
    expect(validStraightMove).toEqual(newStraightPosition);

    const newDiagonalPosition: Position = {
      coordinates: [5, 5],
      boardId: OVERWORLD_BOARD_ID,
    };
    const validDiagonalMove = queen.validateMove({
      position: newDiagonalPosition,
    });
    expect(validDiagonalMove).toEqual(newDiagonalPosition);
    
    const invalidPosition: Position = {
      coordinates: [0, 0],
      boardId: OVERWORLD_BOARD_ID,
    };
    const invalidMove = queen.validateMove({ position: invalidPosition });
    expect(invalidMove).toEqual(initialPosition);
  });
});
