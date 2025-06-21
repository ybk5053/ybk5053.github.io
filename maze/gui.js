class Polygon {
    constructor(cord, col, layer, side) {
        this.cord = cord
        this.col = col
        this.layer = layer
        this.side = side
    }

    lt(o) {
        if (this.layer==o.layer) {
            return this.side<o.side
        }
        return this.layer<o.layer
    }

    eq(o) {
        return this.layer==o.layer && this.side==o.side
    }
}

class GUI {
    constructor(showmap, size, loop=0, wallcol=['green', 'grey', 'blue', 'yellow', 'red', 'orange']) {
        this.wallcol = wallcol
        this.showmap = showmap

        this.maze = new Maze(size, loop=loop)
        this.maze.gen_maze()

        this.canvas = document.getElementById("viewcanvas")
        this.ctx = this.canvas.getContext("2d")
        document.addEventListener('keyup', this.key)
        this.mapcanvas = document.getElementById("mapcanvas")
        this.mapctx = this.mapcanvas.getContext("2d")
        this.mapcanvas.hidden = true

        let left = document.getElementById("left")
        let right = document.getElementById("right")
        let up = document.getElementById("up")
        let down = document.getElementById("down")
        left.onclick = this.left
        right.onclick = this.right
        up.onclick = this.up
        down.onclick = this.down

        if (showmap) {
            this.mapcanvas.hidden = false

            this.draw_map()
            this.draw_player()
        }

        this.draw_view()
    }

    draw_view() {
        this.ctx.clearRect(0,0,this.ctx.canvas.width, this.ctx.canvas.height)
        this.ctx.beginPath()
        this.ctx.fillStyle = "white"
        this.ctx.fillRect(0,0,this.ctx.canvas.width, this.ctx.canvas.height)
        var width = this.canvas.width
        var polygons = this.draw_layer(this.maze.player.position(), this.maze.player.face, width, 0.95, 1.0, 0.05, 0.95, 1.0, 0.0, 0.5)
        polygons.sort((a,b) => {
            return a.lt(b)
        })
        for (let i=0; i<polygons.length; i++) {
            let p = polygons[i]
            this.ctx.beginPath()
            this.ctx.fillStyle = p.col
            this.ctx.lineWidth = "1"
            this.ctx.strokeStyle = "black"
            this.ctx.moveTo(p.cord[0], p.cord[1])
            this.ctx.lineTo(p.cord[2], p.cord[3])
            this.ctx.lineTo(p.cord[4], p.cord[5])
            this.ctx.lineTo(p.cord[6], p.cord[7])
            this.ctx.closePath()
            this.ctx.fill()
            this.ctx.stroke()
        }
    }

    draw_layer(position, face, width, floory, neary, startx, endx, rightx, leftx, limit, ignore='', layer=0, side=0) {
        if (floory <= 0 || floory > 1 || neary < 0 || neary > 1) {
            return []
        }
        if (startx >= 1 || startx > limit || endx < limit || endx <= 0) {
            return []
        }

        var polygon = []
        if (face == 'n') {
            var u = 1
        } else if (face == 's') {
            var u = 3
        } else if (face == 'e') {
            var u = 2
        } else {
            var u = 0
        }
        var l = u-1
        var r = (u+1) % 4
        u = this.wallcol[u]
        l = this.wallcol[l]
        r = this.wallcol[r]
        
        if (this.maze.get_cell(position).end) {
            u = this.wallcol[4]
            l = this.wallcol[4]
            r = this.wallcol[4]
        }
        if (this.maze.get_cell(position).start) {
            u = this.wallcol[5]
            l = this.wallcol[5]
            r = this.wallcol[5]
        }

        
        if (this.maze.get_cell(position)[face]) {
            polygon.push(new Polygon([width*startx, 0, width*endx, 0, width*endx, width*floory, width*startx, width*floory], u, layer, side))
            if (ignore != '') {
                polygon.push(new Polygon([width*startx, 0, width*(startx-0.01), 0, width*(startx-0.01), width*(floory-0.01), width*startx, width*floory], r, layer, side))
                polygon.push(new Polygon([width*endx, 0, width*(endx+0.01), 0, width*(endx+0.01), width*(floory-0.01), width*endx, width*floory], l, layer, side))
            }
        } else if (ignore == 'r') {
            polygon.push(...this.draw_layer(this.maze.get_adj_cell_pos(face,position), face, width, floory-0.05, floory, startx+0.05, endx+0.05, endx+0.05, startx, limit, ignore, layer+1, side))
        } else if (ignore == 'l') {
            polygon.push(...this.draw_layer(this.maze.get_adj_cell_pos(face,position), face, width, floory-0.05, floory, startx, endx-(endx-startx)/4, endx, startx, limit, ignore, layer+1, side))
        } else {
            polygon.push(...this.draw_layer(this.maze.get_adj_cell_pos(face,position), face, width, floory-0.05, floory, startx+0.05, endx-0.05, endx, startx, limit, ignore, layer+1, side))
        }
        if (ignore != 'l') {
            if (this.maze.get_cell(position)[left(face)]) {
                polygon.push(new Polygon([width*leftx, 0, width*startx, 0, width*startx, width*floory, width*leftx, width*neary], l, layer, side))
                polygon.push(new Polygon([width*(leftx-0.01), 0, width*leftx, 0, width*leftx, width*neary, width*(leftx-0.01), width*neary], 'black', layer, side))
            } else {
                polygon.push(...this.draw_layer(this.maze.get_adj_cell_pos(left(face),position), face, width, floory, neary, startx-endx+startx, startx, startx+0.05, startx-endx+startx-0.05, startx, 'r', layer, side+1))
            }
        }
        if (ignore != 'r') {
            if (this.maze.get_cell(position)[right(face)]) {
                polygon.push(new Polygon([width*rightx, 0, width*endx, 0, width*endx, width*floory, width*rightx, width*neary], r, layer, side))
                polygon.push(new Polygon([width*rightx, 0, width*(rightx+0.01), 0, width*(rightx+0.01), width*neary, width*rightx, width*neary], 'black', layer, side))
            } else {
                polygon.push(...this.draw_layer(this.maze.get_adj_cell_pos(right(face),position), face, width, floory, neary, endx, endx+endx-startx, endx+endx-startx+0.05, endx-0.05, endx, 'l', layer, side+1))
            }
        }

        return polygon
    }
    
    draw_map() {
        var width = this.mapctx.canvas.width
        var box = width/this.maze.size
        var wall = box/10
        for (let y=0; y<this.maze.size; y++) {
            for (let x=0; x<this.maze.size; x++) {
                let pos = [x,y]
                let cell = this.maze.get_cell(pos)
                let fill = 'grey'
                if (cell.solution) {
                    fill = 'red'
                }
                if (cell.start) {
                    fill = 'green'
                }
                if (cell.end) {
                    fill = 'yellow'
                }
                let tlx = x*box
                let tly = y*box
                let brx = (x+1)*box
                let bry = (y+1)*box
                if (cell.n) {
                    tly += wall
                }
                if (cell.w) {
                    tlx += wall
                }
                if (cell.s) {
                    bry -=wall
                }
                if (cell.e) {
                    brx -= wall
                }
                this.mapctx.beginPath()
                this.mapctx.fillStyle = fill
                this.mapctx.lineWidth = "0"
                this.mapctx.strokeStyle = 'black'
                this.mapctx.fillRect(tlx, tly, brx-tlx, bry-tly)
            }
        }
    }

    draw_player() {
        this.mapctx.clearRect(0,0,this.mapctx.canvas.width, this.mapctx.canvas.height)
        this.draw_map()
        var width = this.mapctx.canvas.width
        var box = width/this.maze.size
        var wall = box/10
        var tlx = this.maze.player.x * box + wall + wall
        var tly = this.maze.player.y * box + wall + wall
        var brx = (this.maze.player.x+1) * box - wall - wall
        var bry = (this.maze.player.y+1) * box - wall - wall
        this.mapctx.beginPath()
        this.mapctx.fillStyle = 'blue'
        this.mapctx.lineWidth = "0"
        this.mapctx.strokeStyle = 'black'
        this.mapctx.arc((tlx+brx)/2, (tly+bry)/2, (brx-tlx)/2, 0, 2*Math.PI)
        this.mapctx.fill()

        var cx = (tlx + brx)/2
        var cy = (tly + bry)/2
        if (this.maze.player.face == 'n') {
            cy -= wall
        } else if (this.maze.player.face == 's') {
            cy += wall
        } else if (this.maze.player.face == 'e') {
            cx += wall
        } else if (this.maze.player.face == 'w') {
            cx -= wall
        }
        this.mapctx.beginPath()
        this.mapctx.fillStyle = 'yellow'
        this.mapctx.fillRect(cx-wall/2, cy-wall/2, wall, wall)
    }

    key(event) {
        switch(event.key) {
            case "w":
            case "ArrowUp":
                gui.maze.move_player_forward()
                gui.draw_view()
                if (gui.showmap) {
                    gui.draw_player()
                }
                if (gui.maze.player.position()[0] == gui.maze.end_x && gui.maze.player.position()[1] == gui.maze.end_y) {
                    gui.endgame()
                }
                break;
            case "a":
            case "ArrowLeft":
                gui.maze.player.turn_left()
                gui.draw_view()
                if (gui.showmap) {
                    gui.draw_player()
                }
                break;
            case "s":
            case "ArrowDown":
                gui.maze.move_player_backward()
                gui.draw_view()
                if (gui.showmap) {
                    gui.draw_player()
                }
                if (gui.maze.player.position()[0] == gui.maze.end_x && gui.maze.player.position()[1] == gui.maze.end_y) {
                    gui.endgame()
                }
                break;
            case "d":
            case "ArrowRight":
                gui.maze.player.turn_right()
                gui.draw_view()
                if (gui.showmap) {
                    gui.draw_player()
                }
                break;
        }
    }

    left() {
        gui.maze.player.turn_left()
        gui.draw_view()
        if (gui.showmap) {
            gui.draw_player()
        }
    }

    right() {
        gui.maze.player.turn_right()
        gui.draw_view()
        if (gui.showmap) {
            gui.draw_player()
        }
    }

    up() {
        gui.maze.move_player_forward()
        gui.draw_view()
        if (gui.showmap) {
            gui.draw_player()
        }
        if (gui.maze.player.position()[0] == gui.maze.end_x && gui.maze.player.position()[1] == gui.maze.end_y) {
            gui.endgame()
        }
    }

    down() {
        gui.maze.move_player_backward()
        gui.draw_view()
        if (gui.showmap) {
            gui.draw_player()
        }
        if (gui.maze.player.position()[0] == gui.maze.end_x && gui.maze.player.position()[1] == gui.maze.end_y) {
            gui.endgame()
        }
    }

    endgame() {
        console.log("end")
        this.ctx.clearRect(0,0,this.ctx.canvas.width, this.ctx.canvas.height)
        this.ctx.beginPath()
        this.ctx.fillStyle = "white"
        this.ctx.fillRect(0,0,this.ctx.canvas.width, this.ctx.canvas.height)
        this.ctx.beginPath()
        this.ctx.font = "30px Arial";
        this.ctx.fillStyle = "black"
        this.ctx.fillText("Congrats",this.ctx.canvas.width/2-50,this.ctx.canvas.height/2-50)
    }
}