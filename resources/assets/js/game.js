import $ from 'jquery';
window.$ = $;
import chess from 'chess.js';
import ChessBoard from 'chessboardjs';
var noUiSlider = require('nouislider');
import {setting} from './tools';
import * as connect from './connection';

var boardContainer = $('#board-container');
var _turn = 'w';
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

window.board = board;
window.game = game;

function myTurn(piece) {
	return piece[0] === _turn;
}

function removeGreySquares() {
	$('#board .square-55d63').removeClass('is-valid');
}

function greySquare(square) {
	var squareEl = $('#board .square-' + square);
	squareEl.addClass('is-valid');
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
var _currentSourceElement, _currentTargetElement;

function on_Drop(source, target, piece, currentPos) {
	console.log('current -pos', source);
	if(!makeMove(source, target)) return 'snapback';
	var fen = ChessBoard.objToFen(currentPos);
	console.log("Current fen", game.fen());
	gameStatus(game);
	_turn = game.turn();
	_currentSourceElement = $('.square-' + source).get(0);
	_currentTargetElement = $('.square-' + target).get(0);
	_connect();
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
	return;
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

export function orientation(o) {
	board.orientation(o);
}

export function start() {

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

function getOffset( el ) {
    var rect = el.getBoundingClientRect();
    return {
        left: rect.left + window.pageXOffset,
        top: rect.top + window.pageYOffset,
        width: (rect.width || el.offsetWidth) / 2,
        height: (rect.height || el.offsetHeight) / 2
    };
}
var lineElement = $('<div />').css({
	margin: 0,
	padding: 0,
	height: 0,
	'line-height': 1,
	position: 'absolute',
	'border-top': '1px dotted green'
}).appendTo('body');

function _connect(div1, div2, color, thickness) { // draw a line connecting elements
	div1 = div1 || _currentSourceElement;
	div2 = div2 || _currentTargetElement;
	if(!div1 || !div2) return;
	color = color || 'green';
	thickness = thickness || 5;
    var off1 = getOffset(div1);
    var off2 = getOffset(div2);
    // bottom right
    var x1 = off1.left + off1.width;
    var y1 = off1.top + off1.height;
    // top right
    var x2 = off2.left + off2.width;
    var y2 = off2.top + off2.height;
    // distance
    var length = Math.sqrt(((x2-x1) * (x2-x1)) + ((y2-y1) * (y2-y1)));
    // center
    var cx = ((x1 + x2) / 2) - (length / 2);
    var cy = ((y1 + y2) / 2) - (thickness / 2);
    // angle
    var angle = Math.atan2((y1-y2),(x1-x2))*(180/Math.PI);
    // make hr

    lineElement.css({
    	'border-top-width' : thickness,
    	left: cx,
    	top: cy,
    	width: length,
    	transform: `rotate(${angle}deg)`
    });
}

connect.connect();

