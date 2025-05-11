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
                if(Math.random() < 0.9){
                    this.grid[i].push(1)
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

            p.verticalMomentum++;
            p.y += p.verticalMomentum

            for(let y = 0; y < this.grid.length; y++){
                for(let x = 0; x < this.grid[y].length; x++){
                    if(this.grid[y][x] != 0){
                        if((p.x + p.width > 50 * x) && (50 * x + 50 > p.x) && (p.y + p.height > 50 * y) && (50 * y + 50 > p.y)){
                            p.y-= p.verticalMomentum;
                            p.canJump = true
                            p.verticalMomentum = 0;
                        }
                    }
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
        this.id = id
        this.canJump = true
    }
}

var w = new World(100,100)




   
function gameTick(){
    setTimeout(function(){
        w.fallPlayers();
        io.emit('updatePlayers',(w.players))
        gameTick()
    },10)
}

gameTick()



io.on('connection',(socket) =>{
    console.log('a user connected')

    p = new Player(2500,-500,socket.id)
    w.addPlayer(p)
    io.emit('draw',w)

    socket.on('disconnect',(reason) =>{
        console.log(reason)
        for(let i = 0; i < w.players.length; i++){
            if(w.players[i].id == socket.id){
                w.players.pop(i)
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
                    for(let y = 0; y < w.grid.length; y++){
                        for(let x = 0; x < w.grid[y].length; x++){
                            if(w.grid[y][x] != 0){
                                if((p.x + p.width > 50 * x) && (50 * x + 50 > p.x) && (p.y + p.height > 50 * y) && (50 * y + 50 > p.y)){
                                    p.x -= p.speed;
                                }
                            }
                        }
                    }
                }
                if(keys.a){
                    p.x -= p.speed;
                    for(let y = 0; y < w.grid.length; y++){
                        for(let x = 0; x < w.grid[y].length; x++){
                            if(w.grid[y][x] != 0){
                                if((p.x + p.width > 50 * x) && (50 * x + 50 > p.x) && (p.y + p.height > 50 * y) && (50 * y + 50 > p.y)){
                                    p.x += p.speed;
                                }
                            }
                        }
                    }
                }
            }
        }
    })


})
