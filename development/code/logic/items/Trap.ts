import { Item } from './Items';
import { Piece } from '../pieces/Piece';
import { Logger } from '../../ui/Logger';
import { trapResource } from '../../ui/Resources';
import { Position } from '../pieces/PiecesUtilities';
import { spawnItemOnBoard } from '../../LogicAdapter';
import { game } from '../../Game';

export class Trap extends Item {
  constructor(position: Position) {
    super('trap', trapResource, position);
  }

  use(piece: Piece): void {
    Logger.logGeneral(`${piece.player.color} ${piece.name} placed a ${this.name} on ${piece.position.coordinates}.`);

    this.position = piece.position;
    game.getItems().push(this);

    spawnItemOnBoard(this);
  }
}