const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
var AI = PLAYER.P1;

let AI_LVL = 3;

canvas.width = 500;
canvas.height = 500;
canvas.style.border = '1px solid black';

document.body.append(canvas);

const tilesize = canvas.width / 8;

const tiles = [];

let moving = false;
let mousepos = 0;
let piecemoving = null;

function init(){

    let colorblack = false;
    let indexOfSqr = 0;
    for(let i=0; i<8; i++){
        for(let j=0; j<8; j++){
            let a = null;
            if(colorblack){
                if(BOARD_DEF.board[sqr48[indexOfSqr]] != PIECE_TYPE.NO_PIECE)
                {   
                    a = new Piece(j*tilesize, i*tilesize, tilesize, BOARD_DEF.board[sqr48[indexOfSqr]]);
                }
                tiles.push(new Tile(j*tilesize, i*tilesize, tilesize, colorblack, sqr48[indexOfSqr], a));
                indexOfSqr++;
            }else{
                tiles.push(new Tile(j*tilesize, i*tilesize, tilesize, colorblack, SQR.NONE, a));
            }
            colorblack = !colorblack;
        }
        colorblack = !colorblack;
    }
}

function draw(){
    context.clearRect(0, 0, canvas.width, canvas.height);

    for(let i=0; i<tiles.length; i++){
        tiles[i].draw(context);
    }

    for(let i=0; i<tiles.length; i++){
        tiles[i].drawPiece(context);
    }
}

function collide( source, target ) {
    return !(
        ( ( source.y + source.h ) < ( target.y ) ) ||
        ( source.y > ( target.y + target.h ) ) ||
        ( ( source.x + source.w ) < target.x ) ||
        ( source.x > ( target.x + target.w ) )
    );
}

canvas.onmouseup = function(e){
    moving = false;
    let mp = getPos(canvas, e);

    if(BOARD_DEF.move == AI && withAI){
        return;
    }
    let donePlayerMove = false;
    for(let i=0; i<tiles.length; i++){
        let t = {x: tiles[i].x, y: tiles[i].y, w: tiles[i].size, h: tiles[i].size};
        if(collide(mp, t) && piecemoving != null && tiles[i] != piecemoving && tiles[i].sqr != SQR.NONE){
            if(piecemoving.piece == null) return;
            let move = piecemoving.piece.move(piecemoving.sqr, tiles[i].sqr);

            if(move == null) return;
            if(!updatePiecesPos(piecemoving, move, i, BOARD_DEF)) break;
            donePlayerMove = true;
            break;
        }
    }

    if(piecemoving != null && piecemoving.piece != null && !donePlayerMove){
        piecemoving.piece.x = piecemoving.x;
        piecemoving.piece.y = piecemoving.y;
        piecemoving.piece.size = piecemoving.size;
        piecemoving = null;
    }

}

function updatePiecesPos(piecemoving, move, i, bf){
    if(!move[0]) return false;

    switch(move[1])
    {
        case MOVE_TYPE.MOVE_NORMAL:
        {
            tiles[i].piece = piecemoving.piece;
            tiles[i].piece.x = tiles[i].x;
            tiles[i].piece.y = tiles[i].y;
            tiles[i].piece.size = tiles[i].size;
            piecemoving.piece = null;
            piecemoving = null;

            updateKingPiece(bf.rPieces, PIECE_TYPE.SUPER_RED);
            updateKingPiece(bf.yPieces, PIECE_TYPE.SUPER_YELLOW);

            break;
        }
        case MOVE_TYPE.MOVE_CAPTURE:
        {
            tiles[i].piece = piecemoving.piece;
            tiles[i].piece.x = tiles[i].x;
            tiles[i].piece.y = tiles[i].y;
            tiles[i].piece.size = tiles[i].size;

            for(let toRemove of tiles){
                if (toRemove.sqr == move[2]){
                    toRemove.piece = null;
                    break;
                }
            }

            piecemoving.piece = null;
            piecemoving = null;

            updateKingPiece(bf.rPieces, PIECE_TYPE.SUPER_RED);
            updateKingPiece(bf.yPieces, PIECE_TYPE.SUPER_YELLOW);
        }
    }

    return true;
}

function updateKingPiece(piecePos, pieceType){
    for(let tile of tiles){
        for(let rP of piecePos){
            if(BOARD_DEF.board[rP] == pieceType && tile.sqr == rP){
                tile.piece.pieceType = pieceType;
                break;
            }
        }
    }
}

canvas.onmousedown =  function(e){

    if(BOARD_DEF.move == AI && withAI){
        return;
    }

    let mp = getPos(canvas, e);

    for(let i=0; i<tiles.length; i++){
        let t = {x: tiles[i].x, y: tiles[i].y, w: tiles[i].size, h: tiles[i].size};
        if(collide(mp, t) && tiles[i].piece != null && tiles[i].sqr != SQR.NONE){

            let pTypeSuper = tiles[i].piece.pieceType == PIECE_TYPE.SUPER_RED ? PLAYER.P1 : PLAYER.P2;

            if(BOARD_DEF.move != tiles[i].piece.pieceType){
                if(pTypeSuper != BOARD_DEF.move)
                    break;
            }

            for(let moves of BOARD_DEF.availableMoves){
                if(tiles[i].sqr == moves.piece){
                    piecemoving = tiles[i];
                    mp.size = tilesize;
                    piecemoving.piece.mouseMove(mp);
                    moving = true;
                    break;
                }
            }
            break;
        }
    }
}
function aiMove(bf){}

function minmax(bf, depth, alpha, beta, turn){}

function tempBfClone(bf){}


function getPos(j, e){
    var rect = j.getBoundingClientRect();
    return {x:e.clientX - rect.left, y: e.clientY - rect.top, h: 1, w:1};
}

initBoard(BOARD_DEF);
init();

if(DEBUG){
    var zz = document.createElement('div');
    document.body.append(zz);
}

let counterAlert = 0;
let aiMoveCounter = 0;
let stopLoop = false;

function loop() {
    if(DEBUG){
        zz.innerHTML = "";
        zz.innerHTML = printBoard();
    }

    if(withAI && BOARD_DEF.move == AI){
        aiMoveCounter++;
        if(aiMoveCounter > 20){
            if(BOARD_DEF.availableMoves.length > 0) {
                aiMove(BOARD_DEF);
                aiMoveCounter = 0;
            }
        }
    }

    draw();

    if(BOARD_DEF.availableMoves.length <= 0){
        counterAlert++;
    }
    if(counterAlert > 30){
        let a = BOARD_DEF.move == PLAYER.P1 ? "Yellow" : "Red";
        stopLoop = true;
        alert(a +" player wins!");
    }
    if(!stopLoop) requestAnimationFrame(loop);
}

requestAnimationFrame(loop);