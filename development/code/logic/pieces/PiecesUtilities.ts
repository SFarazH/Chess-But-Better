import { Piece } from './Pieces';
import { Player } from '../Players';
import { Item } from '../items/Items';
import { comparePositions } from '../Utilities';
import { game } from '../../Game';

export type Position = {
  coordinates: [number, number],
  boardId: string,
}

export type Square = {
  position: Position;
  occupent?: Piece;
};

export interface PieceType {
  position: Position;
  player: Player;
  resource: string;
  name: string;
  hasMoved: boolean;
  hasKilled: boolean;
}

export function getItemByPosition(
  position: Position,
): Item | undefined {
  return game.getItems().find((item) => comparePositions(position, item.position));
}

