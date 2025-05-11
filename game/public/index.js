var canvas = document.getElementById("frame");
var c = canvas.getContext("2d")
const socket = io()
canvas.width = screen.width;
canvas.height = screen.height;

var world;
var drawings = []
var yOffset = 300
var xOffset = 0
var keys = {
    a:false,
    d:false
}

class World{
    constructor(grid){
        this.grid = grid.grid
        this.players = grid.players
        drawings.push(this)
    }
    draw(){
        for(let y = 0; y < this.grid.length; y++){
            for(let x = 0; x < this.grid[y].length; x++){
                if(this.grid[y][x] != 0){
                    c.fillStyle = "black"
                    c.fillRect(x*50 + xOffset ,y*50 + yOffset,50,50);
                    c.fillStyle = "lime"
                    c.fillRect(x*50+1 + xOffset,y*50 +  yOffset + 1, 48,48)
                }
            }
        }
        for(let i = 0; i < this.players.length; i++){
            if(this.players[i].id == socket.id){
                if(this.players[i].x + xOffset > screen.width - 600){
                    xOffset = screen.width - 600 - this.players[i].x;
                }
                if(this.players[i].x + xOffset < 600){
                    xOffset = 600 - this.players[i].x;
                }
                if(this.players[i].y + yOffset > screen.height - 600){
                    yOffset = screen.height - 600 - this.players[i].y;
                }
                if(this.players[i].y + yOffset < 300){
                    yOffset = 300 - this.players[i].y;
                }
            }
            c.fillStyle = "red"
            c.fillRect(this.players[i].x + xOffset,this.players[i].y + yOffset,50,50)
        }
    }

}

socket.on('draw',(w) =>{
    world = new World(w);
    window.addEventListener('keydown',keysPressed)
    window.addEventListener('keyup',keysReleased)

})
socket.on('updatePlayers',(players) =>{
    world.players = players
})

function animate(){
    c.fillStyle = "white"
    c.fillRect(0,0,canvas.width,canvas.height)
    window.requestAnimationFrame(animate)
    socket.emit('playerMove',(keys))
    for(let i = 0; i < drawings.length; i++){
        drawings[i].draw();
    }
}
function keysPressed(e){
    if(e.key == "w"){
        socket.emit('playerJump')
    }
    if(e.key == "d"){
        keys.d = true;
    }
    if(e.key == "a"){
        keys.a = true;
    }
}
function keysReleased(e){
    if(e.key == "d"){
        keys.d = false;
    } 
    if(e.key == "a"){
        keys.a = false;
    }
}
animate()