// Constants
const boardDisplay = document.querySelector('#board-display');
const playerDisplay = document.querySelector('#player-display');
const roundCounterDisplay = document.querySelector('#round-counter-display');
const infoDisplay = document.querySelector('#info-display');
const boardWidth = 8;
const numberOfPlayers = 2;

// Variables
let turnOf = 'white';
let roundCounter = 1;
let turnCounter = 0;

var board = [
    rookResource, bishopResource, knightResource, queenResource, kingResource, knightResource, bishopResource, rookResource,
    pawnResource, pawnResource, pawnResource, pawnResource, pawnResource, pawnResource, pawnResource, pawnResource,
    '', '',  '', '', '', '', '', '',
    '', '',  '', '', '', '', '', '',
    '', '',  '', '', '', '', '', '',
    '', '',  '', '', '', '', '', '',
    pawnResource, pawnResource, pawnResource, pawnResource, pawnResource, pawnResource, pawnResource, pawnResource,
    rookResource, bishopResource, knightResource, queenResource, kingResource, knightResource, bishopResource, rookResource,
]

function initializeBoard(_board) {
    _board.forEach((_, index) => {
        // Create square elements and set their attributes
        const square = createSquare(index);
        boardDisplay.appendChild(square);
    });

    // Display initial information
    playerDisplay.textContent = turnOf;
    roundCounterDisplay.textContent = roundCounter;
}

function createSquare(index) {
    const square = document.createElement('div');
    square.classList.add('square');

    // Calculate row and column based on index
    const row = Math.floor(index / boardWidth);
    const column = index % boardWidth;
    square.setAttribute('square-id', [column, row]);

    // Determine background color class
    const backgroundColor = getBackgroundColor(column, row);
    square.classList.add(backgroundColor);

    // Add starting pieces
    square.innerHTML = board[index];

    // Set pieces draggable
    square.firstChild?.setAttribute('draggable', true);

    // Tint pieces
    tintPiece(square.firstChild, index);

    return square;
}

function getBackgroundColor(column, row) {
    const isEvenColumn = column % 2 === 0;
    const isEvenRow = row % 2 === 0;
    return isEvenRow ? (isEvenColumn ? 'beige' : 'brown') : (isEvenColumn ? 'brown' : 'beige');
}

function tintPiece(piece, index) {
    if (index < 16) {
        piece.firstChild.classList.add('black');
    }
    if (index > 47) {
        piece.firstChild.classList.add('white');
    }
}

function addDragAndDropListeners() {
    const squares = document.querySelectorAll('#board-display .square');
    squares.forEach((square) => {
        square.addEventListener('dragstart', dragStart);
        square.addEventListener('dragover', dragOver);
        square.addEventListener('drop', dragDrop);
    });
}

// Initialize the board and add event listeners
initializeBoard(board);
addDragAndDropListeners();



let draggedElement;

function dragStart(e) {
    if (e.target.classList.contains('piece')) {
        draggedElement = e.target;
    }
}

function dragDrop(e) {
    e.stopPropagation();
    const target = e.target;
    if (!isAllowedToMove()) return;
    if (!isValidMove(target)) return;

    // Check if there is another piece on the targeted square.
    if (isSquareOccupied(target)) {
        // Make sure the other piece belongs to the current player's oponent.
        if (isSquareOccupiedByEnemy(target)) {
            target.parentNode.append(draggedElement);
            target.remove();
        } else {
            return;
        }
    } else {
        target.append(draggedElement);
    }

    endTurn();
}

function dragOver(e) {
    e.preventDefault();
}

function isAllowedToMove() {
    const target = draggedElement.firstChild;
    return target.classList.contains(turnOf);
}

function isSquareOccupied(targetSquare) {
    return targetSquare.classList.contains('piece');
}

function isSquareOccupiedByEnemy(targetSquare) {
    if (!isSquareOccupied(targetSquare)) return false;
    const oponent = turnOf === 'white' ? 'black' : 'white';
    return targetSquare.firstChild.classList.contains(oponent);
}

function isValidMove(target) {
    const piece = draggedElement.id;
    const _startingPosition = draggedElement.parentNode.getAttribute('square-id');
    const _targetPosition = target.getAttribute('square-id') || target.parentNode.getAttribute('square-id'); // Either an empty square or a piece occuping a square

    const startingPosition = [Number(_startingPosition[0]), Number(_startingPosition[2])];
    const targetPosition = [Number(_targetPosition[0]), Number(_targetPosition[2])];

    const deltaX = targetPosition[0] - startingPosition[0];
    const deltaY = targetPosition[1] - startingPosition[1];

    const absoluteDeltaX = Math.abs(deltaX);
    const absoluteDeltaY = Math.abs(deltaY);

    switch (piece) {
        case 'pawn': {
            // Make sure pawn does not move backwards.
            if ((turnOf === 'white' && deltaY > 0) || (turnOf === 'black' && deltaY < 0)) {
                return false;
            }
            
            // Pawns attack diagonally.
            // Check if there is another piece on the targeted square.
            if (isSquareOccupied(target)) {
                const oponent = turnOf === 'white' ? 'black' : 'white';
                // Make sure the other piece belongs to the current player's oponent.
                if (target.firstChild.classList.contains(oponent)) {
                    return absoluteDeltaY === 1 && absoluteDeltaX === 1;
                }
            }

            // Pawns can have an initial two-square move.
            if ((turnOf === 'white' && startingPosition[1] == 6) || (turnOf === 'black' && startingPosition[1] == 1)) {
                return (absoluteDeltaY === 1 || absoluteDeltaY === 2) && absoluteDeltaX === 0
            }

            // Pawns move one square forward.
            return absoluteDeltaY === 1 && absoluteDeltaX === 0;
        }
        case 'bishop': {
            const stepX = (targetPosition[0] > startingPosition[0]) ? 1 : -1;
            const stepY = (targetPosition[1] > startingPosition[1]) ? 1 : -1;

            // Bishops can only move diagonally.
            if (absoluteDeltaY === absoluteDeltaX) {
                return attemptToMove(startingPosition, targetPosition, stepX, stepY, -1);
            }

            return false;
        }
        case 'knight': {
            return absoluteDeltaY * absoluteDeltaX === 2;
        }
        case 'rook': {
            const stepX = (targetPosition[0] > startingPosition[0]) ? 1 : (targetPosition[0] < startingPosition[0]) ? -1 : 0;
            const stepY = (targetPosition[1] > startingPosition[1]) ? 1 : (targetPosition[1] < startingPosition[1]) ? -1 : 0;

            // Rooks can move either vertically or horizontally but not both at the same.
            if (startingPosition[1] === targetPosition[1] || startingPosition[0] === targetPosition[0]) {
                return attemptToMove(startingPosition, targetPosition, stepX, stepY, -1);
            }

            return false;
        }
        case 'queen': {
            const stepX = (targetPosition[0] > startingPosition[0]) ? 1 : (targetPosition[0] < startingPosition[0]) ? -1 : 0;
            const stepY = (targetPosition[1] > startingPosition[1]) ? 1 : (targetPosition[1] < startingPosition[1]) ? -1 : 0;

            // Rooks can move either vertically or horizontally but not both at the same.
            if ((absoluteDeltaY + absoluteDeltaX === Math.abs(absoluteDeltaY - absoluteDeltaX)) || absoluteDeltaY === absoluteDeltaX) {
                return attemptToMove(startingPosition, targetPosition, stepX, stepY, -1);
            }

            return false;
        }
        case 'king': {
            const stepX = (targetPosition[0] > startingPosition[0]) ? 1 : (targetPosition[0] < startingPosition[0]) ? -1 : 0;
            const stepY = (targetPosition[1] > startingPosition[1]) ? 1 : (targetPosition[1] < startingPosition[1]) ? -1 : 0;

            // Rooks can move either vertically or horizontally but not both at the same.
            if (absoluteDeltaY === 1 || absoluteDeltaX === 1) {
                return attemptToMove(startingPosition, targetPosition, stepX, stepY, 1);
            }

            return false;
        }
        default: {
            return false;
        }
    }
}

function attemptToMove(startingPosition, targetPosition, stepX, stepY, limit) {
    let currentPosition = [startingPosition[0], startingPosition[1]];
    let limitCounter = 0;
    while ((currentPosition[0] !== targetPosition[0] || currentPosition[1] !== targetPosition[1]) && limitCounter !== limit) {
        const nextPosition = [currentPosition[0] + stepX, currentPosition[1] + stepY];
        const target = document.querySelector(`[square-id="${nextPosition}"]`);
        if (isSquareOccupied(target.firstChild || target)) {
            return false;
        }
        
        currentPosition[0] += stepX;
        currentPosition[1] += stepY;
        limitCounter++;
    }

    return true;
}

function endTurn() {
    turnOf = turnOf === 'white' ? 'black' : 'white';
    turnCounter++;
    if (turnCounter % numberOfPlayers === 0) {
        turnCounter = 0;
        roundCounter++;
        roundCounterDisplay.textContent = roundCounter;
    }
    playerDisplay.textContent = turnOf;
}
