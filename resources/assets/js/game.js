import $ from 'jquery';
window.$ = $;
import chess from 'chess.js';
import ChessBoard from 'chessboardjs';
var noUiSlider = require('nouislider');
import {setting} from './tools';

var boardContainer = $('#board-container');

export var board;
export var game;

game = new chess.Chess();
board = ChessBoard('board', {
	draggable: true,
	position: 'start',
	dropOffBoard: 'spapback',
	onDrop: on_Drop,
	onDragStart: on_dragStart,
	onMouseoverSquare: on_mouseoverSquare,
	onMouseoutSquare: on_mouseoutSquare,
		onSnapEnd: on_snapEnd
});

function myTurn(piece) {
	// return piece[0] === turn;
}

function removeGreySquares() {
	$('#board .square-55d63').css('background', '');
}

function greySquare(square) {
	var squareEl = $('#board .square-' + square);
	var background = '#a9a9a9';
	if (squareEl.hasClass('black-3c85d') === true) {
		background = '#696969';
	}
	squareEl.css('background', background);
}

function validateMove(piece) {
  // do not pick up pieces if the game is over
  // or if it's not that side's turn
	if (game.game_over() === true ||
		(game.turn() === 'w' && piece.search(/^b/) !== -1) ||
		(game.turn() === 'b' && piece.search(/^w/) !== -1)) {
		return false;
	}
	return true;
}

function on_mouseoutSquare(square, piece) {
	if(!myTurn(piece)) return;
	removeGreySquares();
}

function on_snapEnd() {
	board.position(game.fen());
}

function on_dragStart(source, piece) {
	if(!myTurn(piece)) {
		console.log('Not my turn');
		return false;
	}
	if(!validateMove(piece)) {
		console.log('Not a valid move');
		return false;
	}
}

function makeMove(source, target) {
	removeGreySquares();
	// see if the move is legal
	return game.move({
		from: source,
		to: target,
		promotion: 'q' // NOTE: always promote to a queen for example simplicity
	});
}

function on_Drop(source, target, piece, currentPos) {
	console.log('current -pos', source);
	if(!makeMove(source, target)) return 'snapback';
	var fen = ChessBoard.objToFen(currentPos);
	console.log("Current fen", fen);
	gameStatus(game);
	app.socket.emit('moving', {
		personId: app.currentClientId,
		moves: source + target,
		fen: game.fen()
	});
}

function on_mouseoverSquare(square, piece) {
	if(!myTurn(piece)) return;
	// get list of possible moves for this square
	var moves = game.moves({
		square: square,
		verbose: true
	});

	// exit if there are no moves available for this square
	if (moves.length === 0) return;

	// highlight the square they moused over
	greySquare(square);

	// highlight the possible squares for this piece
	for (var i = 0; i < moves.length; i++) {
		greySquare(moves[i].to);
	}
}


export function renderBoard() {
	boardEl.show();
	on_BoardInitialize()
	
	return board;
}

$('#reset').click(function() {
	board.position('start');
});

$('#flip-board').click(function() {
	board.flip();
})

function startBoard() {
	game.reset();
	board.fen(game.fen());
}

function on_BoardInitialize() {
	socket.on('moved', function(pos) {
		console.log('response postion', pos);
		game.move(pos.moves, {sloppy: true});
		board.position(game.fen());
		gameStatus(game);
	});
}

function gameStatus(g) {
	if(g.game_over()) {
		$.notify("Game Over", "success");
	}
	if(g.in_check()) {
		$.notify("Check!", "danger");
	}

	if(g.in_checkmate()) {
		$.notify("Check Mate", "warning");
	}

	if(g.in_draw()) {
		$.notify("Game Draw", "info");
	}

	if(g.in_stalemate()) {
		$.notify("Stalemate", "info");
	}

	if(g.insufficient_material()) {
		$.notify("insufficient material", "info");
	}
	g.in_threefold_repetition();
	g.insufficient_material();
}

// Exposed functions.
export function move(m) {
	game.move(m);
	board.fen(game.fen());
}

export function fen(f) {
	game.load(f);
	board.fen(game.fen());
}

export function orientation() {

}

export function start() {

}

export function flip() {

}
var $window = $(window);


var boardZoom = setting('board.zoom') || 30;

$window.on('resize', function() {
	resizeBoard(boardZoom);
});

function resizeBoard(padding) {
	var height = $window.height() - padding;
	var width = height;
	boardContainer.height(height);
	boardContainer.width(width);
	boardContainer.css({'margin-top': padding / 2});
	console.log(padding);
	board.resize();
}

resizeBoard(boardZoom);

var slider2 = $('#c-102').get(0);
if(slider2) {
	noUiSlider.create(slider2, {
	  start: boardZoom,
	  range: {
	    min: -50,
	    max: 500
	  }
	}).on('update', function(val) {
		var val = parseInt(val);
		setting('board.zoom', val);
		boardZoom = val;
		resizeBoard(val);
	});
}

