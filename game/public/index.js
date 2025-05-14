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
    d:false,
    w:false,
    s:false
}

class World{
    constructor(grid){
        this.grid = grid.grid
        this.players = grid.players
    }
    draw(){
        let p;
        for(let i = 0; i < this.players.length; i++){
            if (this.players[i].id == socket.id){
                p = this.players[i]
            }
        }

        let filler = 0; 
        if (Math.floor((p.y - 900)/50) > 0){
            filler = Math.floor((p.y - 900)/50)
        }

        for(let y = filler;  (y < this.grid.length) && (y < Math.floor((p.y + 800)/50)); y++){
            filler = 0;
            if (Math.floor((p.x - 900)/50) > 0){
                filler = Math.floor((p.x - 900)/50)
            }
            for(let x = filler; (x < this.grid[y].length) && (x < Math.floor((p.x + 900)/50)); x++){
                if(this.grid[y][x] != 0){
                    c.fillStyle = "black"
                    c.fillRect(x*50 + xOffset ,y*50 + yOffset,50,50);
                    c.fillStyle = this.grid[y][x].color
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
            c.fillStyle = "black"
            if(this.players[i].damagedTimer > 0){
                c.fillStyle = "red"
            }
            c.fillRect(this.players[i].x + xOffset,this.players[i].y + yOffset,50,50)
            c.fillStyle = "red"
            c.fillRect(this.players[i].x + xOffset+5,this.players[i].y + yOffset+5,40,40)
        }
    }
    update(grid){
        this.grid = grid
    }

}

socket.on('draw',(w) =>{
    world = new World(w);
    window.addEventListener('keydown',keysPressed)
    window.addEventListener('keyup',keysReleased)
    animate()

})
socket.on('reDraw',(w) =>{
    world.update(w.grid)

})
socket.on('updatePlayers',(players) =>{
    world.players = players
})
function animate(){
    c.fillStyle = "cyan"
    c.fillRect(0,0,canvas.width,canvas.height)
    window.requestAnimationFrame(animate)
    socket.emit('playerMove',(keys))
    world.draw();
    for(let i = 0; i < drawings.length; i++){
        drawings[i].draw();
    }
    for(let i = 0; i < world.players.length; i++){
        if(world.players[i].id == socket.id){

            for(let ii = 0; ii < world.players[i].inventory.length; ii++){
                if(ii == world.players[i].selectedValue){
                    c.fillStyle = "yellow"
                    c.fillRect(40,34 + 20 * ii, 200,20)
                }
                c.fillStyle = "black"
                c.font = "20px solid black"
                c.fillText(world.players[i].inventory[ii].name,50,50 + 20 * ii)
                c.fillText(world.players[i].inventoryNumbers[ii],150,50 + 20 * ii)
            }
        }
    }
}
function keysPressed(e){
    if(e.key == "w"){
        socket.emit('playerJump')
        keys.w = true
    }
    if (e.key == "s"){
        keys.s = true
    }
    if(e.key == "o"){
        socket.emit('playerBreak')
    }
    if(e.key == "i"){
        socket.emit('playerPlace')
    }
    if(e.key == "ArrowUp"){
        socket.emit('inventorySelector',("up"))
    }
    if(e.key == "ArrowDown"){
        socket.emit('inventorySelector',("down"))
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
    if(e.key == "w"){
        keys.w = false;
    } 
    if(e.key == "s"){
        keys.s = false;
    }
}