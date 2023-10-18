import { Player } from "./players";
import {
  Piece,
  Pawn,
  Bishop,
  Knight,
  Rook,
  Queen,
  King,
  Square,
} from "./pieces";
import { Logger } from "./logger";
import { movePieceOnBoard, destroyPieceOnBoard } from "./board";
import { movePieceOnHellBoard, destroyPieceOnHellBoard, spawnHellPiece } from "./board_hell";
import { movePieceOnHeavenBoard, destroyPieceOnHeavenBoard, spawnHeavenPiece } from "./board_heaven";
import { activeRules } from "./rules";
import { updatePlayersInformation } from "./game";

const whitePlayer: Player = {
  color: "white",
  xp: 0,
  gold: 0,
};
const blackPlayer: Player = {
  color: "black",
  xp: 0,
  gold: 0,
};
export const players = [whitePlayer, blackPlayer];
export let pieces = [
  new Rook([0, 0], players[1]),
  new Knight([1, 0], players[1]),
  new Bishop([2, 0], players[1]),
  new Queen([3, 0], players[1]),
  new King([4, 0], players[1]),
  new Bishop([5, 0], players[1]),
  new Knight([6, 0], players[1]),
  new Rook([7, 0], players[1]),
  new Pawn([0, 1], players[1]),
  new Pawn([1, 1], players[1]),
  new Pawn([2, 1], players[1]),
  new Pawn([3, 1], players[1]),
  new Pawn([4, 1], players[1]),
  new Pawn([5, 1], players[1]),
  new Pawn([6, 1], players[1]),
  new Pawn([7, 1], players[1]),
  new Pawn([0, 6], players[0]),
  new Pawn([1, 6], players[0]),
  new Pawn([2, 6], players[0]),
  new Pawn([3, 6], players[0]),
  new Pawn([4, 6], players[0]),
  new Pawn([5, 6], players[0]),
  new Pawn([6, 6], players[0]),
  new Pawn([7, 6], players[0]),
  new Rook([0, 7], players[0]),
  new Knight([1, 7], players[0]),
  new Bishop([2, 7], players[0]),
  new Queen([3, 7], players[0]),
  new King([4, 7], players[0]),
  new Bishop([5, 7], players[0]),
  new Knight([6, 7], players[0]),
  new Rook([7, 7], players[0]),
];

let currentPlayerIndex = 0;
let turnCounter = 0;
export let roundCounter = 1;
export let deathCounter = 0;

let isCastling = false;
export let isFriendlyFire = false;
export let isPieceKilled = false;
export let isFirstKill = true;

export let fellOffTheBoardPiece: Piece | undefined;

export function getCurrentPlayer(): Player {
  return players[currentPlayerIndex];
}

export function comparePositions(
  firstPosition: Array<number>,
  secondPosition: Array<number>,
): boolean {
  return (
    firstPosition[0] === secondPosition[0] &&
    firstPosition[1] === secondPosition[1]
  );
}

export function switchIsCastling() {
  isCastling = !isCastling;
}

export function getPieceByPosition(
  position: [number, number],
): Piece | undefined {
  return pieces.find((piece) => comparePositions(position, piece.position));
}

function convertSquareIdToPosition(squareId: string): [number, number] {
  return squareId.split(",").map((str) => parseInt(str)) as [number, number];
}

export function onAction(
  draggedElement: HTMLElement,
  targetElement: HTMLElement,
) {
  const draggedElementParentElement =
    draggedElement.parentElement as HTMLElement;
  let squareidType: string;

  if(draggedElementParentElement.hasAttribute("square-id"))
  {
    squareidType = "square-id";
  }
  else if(draggedElementParentElement.hasAttribute("square-hell-id"))
  {
    squareidType = "square-hell-id";
  }
  else
  {
    squareidType = "square-heaven-id";
  }

  console.log("has " + squareidType);

  const draggedElementPosition = convertSquareIdToPosition(
    draggedElementParentElement.getAttribute(squareidType)!,
  );
  const draggedPiece: Piece | undefined = pieces.find((piece) =>
    comparePositions(piece.position, draggedElementPosition),
  );

  if (targetElement.classList.contains("piece")) {
    const targetPiece: Piece | undefined = pieces.find((piece) => {
      const targetElementPosition = convertSquareIdToPosition(
        targetElement.parentElement?.getAttribute(squareidType)!,
      );
      return comparePositions(targetElementPosition, piece.position);
    });

    actOnTurn(draggedPiece, targetPiece);
  } else {
    const targetSquare: Square = {
      position: convertSquareIdToPosition(
        targetElement.getAttribute(squareidType)!,
      ),
    };
    actOnTurn(draggedPiece, targetSquare);
  }
}

export function onFallOffTheBoard(draggedElement: HTMLElement) {
  let squareidType: string;

  if(draggedElement.parentElement?.hasAttribute("square-id"))
  {
    squareidType = "square-id";
  }
  else if(draggedElement.parentElement?.hasAttribute("square-hell-id"))
  {
    squareidType = "square-hell-id";
  }
  else
  {
    squareidType = "square-heaven-id";
  }

  console.log("has " + squareidType);

  const draggedPiece: Piece | undefined = pieces.find((piece) => {
    const draggedElementPosition = convertSquareIdToPosition(
      draggedElement.parentElement?.getAttribute(squareidType)!,
    );
    return comparePositions(draggedElementPosition, piece.position);
  });

  if (!draggedPiece) return;
  if (!isAllowedToMove(draggedPiece)) return;

  pieces = pieces.filter((piece) => piece !== draggedPiece);
  deathCounter++;
  isPieceKilled = true;
  destroyPieceOnBoard(draggedPiece);

  fellOffTheBoardPiece = draggedPiece;
  endTurn();
}

function isAllowedToMove(draggedPiece: Piece) {
  return draggedPiece.player === getCurrentPlayer();
}

function actOnTurn(
  draggedPiece: Piece | undefined,
  target: Piece | Square | undefined,
) {
  if (!draggedPiece || !target) return;
  if (!isAllowedToMove(draggedPiece)) return;
  if (!draggedPiece.isValidMove(target)) return;
  if (draggedPiece === target) return;

  if ((target as Piece).name !== undefined) {
    const targetPiece = target as Piece;
    actOnTurnPieceToPiece(draggedPiece, targetPiece);
  } else {
    const targetSquare = target as Square;
    actOnTurnPieceToSquare(draggedPiece, targetSquare);
  }
}

function actOnTurnPieceToPiece(draggedPiece: Piece, targetPiece: Piece) {
  if (targetPiece === draggedPiece) return;
  if (targetPiece.board !== draggedPiece.board) return;

  Logger.log(
    `A ${targetPiece.player.color} ${targetPiece.name} was killed by a ${draggedPiece.player.color} ${draggedPiece.name}.`,
  );

  isFriendlyFire = targetPiece.player === draggedPiece.player && targetPiece.board === draggedPiece.board;

  deathCounter++;
  isPieceKilled = true;
  if(targetPiece.board === "normal")
  {
    destroyPieceOnBoard(targetPiece);
    spawnHellPiece(targetPiece);
  }
  else if(targetPiece.board === "hell")
  {
    pieces = pieces.filter((piece) => piece !== targetPiece);
    destroyPieceOnHellBoard(targetPiece);
  }
  else if(targetPiece.board === "heaven")
  {
    pieces = pieces.filter((piece) => piece !== targetPiece);
    destroyPieceOnHeavenBoard(targetPiece);
  }

  const targetSquare: Square = { position: targetPiece.position };
  move(draggedPiece, targetSquare);
}

function actOnTurnPieceToSquare(draggedPiece: Piece, targetSquare: Square) {
  let isValidCastling = true;
  if (isCastling) {
    isValidCastling = castle(draggedPiece, targetSquare);
  }

  if (isValidCastling) {
    move(draggedPiece, targetSquare);
  } else {
    switchIsCastling();
  }
}

function castle(kingPiece: Piece, targetSquare: Square) {
  const possibleRooks = pieces.filter((piece) => {
    return (
      piece.player === getCurrentPlayer() &&
      !piece.hasMoved &&
      piece.name === "Rook"
    );
  });

  const deltaX = targetSquare.position[0] - kingPiece.position[0];
  // Depends on if it's Kingside or Queenside castling
  const isKingsideCastling = deltaX > 0;
  const rookFilter = (piece: Piece) =>
    isKingsideCastling
      ? piece.position[0] > kingPiece.position[0]
      : piece.position[0] < kingPiece.position[0];
  const rookPiece = possibleRooks.find(rookFilter);
  if (!rookPiece) return false;

  const rookPieceTargetPosition: [number, number] = [
    isKingsideCastling
      ? targetSquare.position[0] - 1
      : targetSquare.position[0] + 1,
    kingPiece.position[1],
  ];
  const rookPieceTargetSquare: Square = { position: rookPieceTargetPosition };
  move(rookPiece, rookPieceTargetSquare);
  Logger.log(`${kingPiece.player.color} castled.`);
  return true;
}

function move(draggedPiece: Piece, targetSquare: Square) {
  Logger.logMovement(draggedPiece, targetSquare);
  if(draggedPiece.board === "normal")
  {
    movePieceOnBoard(draggedPiece, targetSquare);
  }
  else if(draggedPiece.board === "hell")
  {
    movePieceOnHellBoard(draggedPiece, targetSquare);
  }
  else if(draggedPiece.board === "heaven")
  {
    movePieceOnHeavenBoard(draggedPiece, targetSquare);
  }
  draggedPiece.position = targetSquare.position;
  draggedPiece.hasMoved = true;

  endTurn();
}

function endTurn() {
  activeRules.forEach((rule) => {
    rule.apply();
  });

  resetVariables();

  currentPlayerIndex =
    currentPlayerIndex + 1 < players.length ? currentPlayerIndex + 1 : 0;
  turnCounter++;

  if (turnCounter % players.length === 0) {
    turnCounter = 0;
    roundCounter++;
  }

  updatePlayersInformation();
}

function resetVariables() {
  isCastling = false;
  isFriendlyFire = false;
  isPieceKilled = false;
  fellOffTheBoardPiece = undefined;
}
