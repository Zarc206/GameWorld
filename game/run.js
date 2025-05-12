const express = require('express')
const app = express()
const port = 3000
const fs = require('fs')

const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new  Server(server,{pingInterval: 2000, pingTimeout: 5000 })

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

server.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

console.log("server  is did loaded");

//----------------------------------------------------------------------------------------------------------------------\\


class World{
    constructor(width,height){
        this.grid = []
        this.players = []
        for(let i = 0; i < height; i++){
            this.grid.push([]);
            for(let ii = 0; ii < width; ii++){
                if((Math.random() < 0.9) && (i > 4)){
                    
                    if (i == 5){
                    this.grid[i].push(new Block("lime",1))
                    } else if (i > 20){
                        this.grid[i].push(new Block("grey",1))
                    } else if(i == 20){
                        if (Math.random() > 0.5){
                            this.grid[i].push(new Block("grey",1))
                        } else {
                            this.grid[i].push(new Block("sienna",1))
                        }
                    } else{
                        this.grid[i].push(new Block("sienna",1))
                    }
                } else {
                    this.grid[i].push(0)
                }
            }
        }
    }

    addPlayer(p){
        this.players.push(p)
    }
    fallPlayers(){
        for(let i = 0; i < this.players.length; i++){
            let p = this.players[i]
            p.damagedTimer--;

            p.verticalMomentum++;
            p.y += p.verticalMomentum

            for(let y = 0; y < this.grid.length; y++){
                for(let x = 0; x < this.grid[y].length; x++){
                    if(this.grid[y][x] != 0){
                        if((p.x + p.width > 50 * x) && (50 * x + 50 > p.x) && (p.y + p.height > 50 * y) && (50 * y + 50 > p.y)){
                            p.y-= p.verticalMomentum;
                            if (p.verticalMomentum > 0){
                            p.canJump = true
                            p.verticalMomentum = 0;
                            }
                        }
                    }
                }
            }
        }
    }
    addStructure(s,iny,inx){
        for(let y = 0; y < s.grid.length; y++){
            for(let x = 0; x < s.grid[y].length; x++){
                if(s.grid[y][x] != 0){
                    this.grid[y+iny][x+inx] = new Block(s.colors[s.grid[y][x] - 1], 1)
                }
            }
        }
    }

}
class Player{
    constructor(x,y,id){
        this.x = x
        this.y = y
        this.speed = 5
        this.verticalMomentum = 0;
        this.width = 50;
        this.height = 50
        this.direction = "left"
        this.facing = "none"
        this.id = id
        this.hp = 100
        this.damagedTimer = 0
        this.canJump = true
    }
}
class Block{
    constructor(color,durability){
        this.color = color
        this.durability = durability
    }
}
class Hitbox{
    constructor(x,y,width,height){
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
    }
}

let tree = {
    grid: [
    [0,1,1,1,0],
    [1,1,1,1,1],
    [0,1,1,1,0],
    [0,0,2,0,0],
    [0,0,2,0,0],
],
    colors: ["green","brown"]
}

var w = new World(500,100)
for(let i = 0; i < w.grid[0].length / 10; i++){
    w.addStructure(tree,0,i * 10 + Math.floor(Math.random()*5))
}



   
function gameTick(){
    setTimeout(function(){
        w.fallPlayers();
        io.emit('updatePlayers',(w.players))
        gameTick()
    },10)
}
function isColide(a,b){
    if((a.x + a.width > b.x) && (b.x + b.width > a.x) && (a.y + a.height > b.y) && (b.y + b.height > a.y)){
        return(true)
    }
    return(false)
}

gameTick()

io.on('connection',(socket) =>{
    console.log('a user connected')

    p = new Player(7500,-500,socket.id)
    w.addPlayer(p)
    io.emit('draw',w)

    socket.on('disconnect',(reason) =>{
        console.log(reason)
        for(let i = 0; i < w.players.length; i++){
            if(w.players[i].id == socket.id){
                w.players.splice(i,1)
            
            }
        }
    })

    socket.on('playerJump',() => {
        for(let i = 0; i < w.players.length; i++){
            if((w.players[i].id == socket.id) && (w.players[i].canJump)){
                w.players[i].canJump = false
                w.players[i].verticalMomentum = -20;
            }
        }
    })

    socket.on('playerMove',(keys) =>{
        for(let i = 0; i < w.players.length; i++){
            if(w.players[i].id == socket.id){
                p = w.players[i]
                if(keys.d){
                    p.x += p.speed;
                    p.direction = "right"
                    for(let y = 0; y < w.grid.length; y++){
                        for(let x = 0; x < w.grid[y].length; x++){
                            if(w.grid[y][x] != 0){
                                if((p.x + p.width > 50 * x) && (50 * x + 50 > p.x) && (p.y + p.height > 50 * y) && (50 * y + 50 > p.y)){
                                    p.x -= p.speed;
                                }
                            }
                        }
                    }
                } else if(keys.a){
                    p.x -= p.speed;
                    p.direction = "left"
                    for(let y = 0; y < w.grid.length; y++){
                        for(let x = 0; x < w.grid[y].length; x++){
                            if(w.grid[y][x] != 0){
                                if((p.x + p.width > 50 * x) && (50 * x + 50 > p.x) && (p.y + p.height > 50 * y) && (50 * y + 50 > p.y)){
                                    p.x += p.speed;
                                }
                            }
                        }
                    }
                } else {
                    p.direction = "none"
                }
                if(keys.w){
                    p.facing = "up"
                } else if (keys.s){
                    p.facing = "down"
                } else {
                    p.facing = "none"
                }
            }
        }
    })

    socket.on('playerBreak',() =>{
        for(let i = 0; i < w.players.length; i++){
            if((w.players[i].id == socket.id)){
                p = w.players[i]
                let xOffDig = 0;
                let yOffDig = 0
                if(p.direction == "right"){
                    xOffDig = 1
                } else if (p.direction == "left") {
                    xOffDig = -1
                }
                if (p.facing == "up"){
                    yOffDig = -1
                } 
                if (p.facing == "down"){
                    yOffDig = 1
                } 
                if ((Math.round(p.y/50) + yOffDig >= 0) && (Math.round(p.x/50) + xOffDig >= 0)){
                    if(w.grid[Math.round(p.y/50) + yOffDig][Math.round(p.x/50) + xOffDig] != 0){
                        w.grid[Math.round(p.y/50) + yOffDig][Math.round(p.x/50) + xOffDig] = 0
                        io.emit('reDraw',w)
                    } else {
                        h = new Hitbox(p.x + 50 * xOffDig, p.y,50,50)
                        for(let i = 0; i < w.players.length; i++){
                            if ((w.players[i] != p) && (isColide(h,w.players[i])) && (w.players[i].damagedTimer < 0)){
                                w.players[i].damagedTimer = 5;
                                w.players[i].hp -= 25
                                if (w.players[i].hp <= 0){
                                    for(let ii = 0; ii < w.players.length; ii++){
                                        if(w.players[ii].id == w.players[i].id){
                                            p = new Player(2500,-500,w.players[ii].id )
                                            w.players.splice(ii,1)
                                            w.addPlayer(p)
                                        
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    })
})
