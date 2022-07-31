class Cell {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.position = [this.x, this.y]
        this.n = true
        this.s = true
        this.e = true
        this.w = true
        this.visited = false
        this.solution = false
        this.start = false
        this.end = false
    }

    eq(o) {
        if (this.x == o.x && this.y == o.y) {
            return true
        }
        return false
    }

    sub(o) {
        if (this.x == o.x) {
            if (this.y+1 == o.y) {
                return 's'
            }
            if (this.y-1 == o.y) {
                return 'n'
            }
        } else if (this.y == o.y) {
            if (this.x+1 == o.x) {
                return 'e'
            }
            if (this.x-1 == o.x) {
                return 'w'
            }
        }
        return 'NA'
    }

    str() {
        string =  '(' + this.x.toString() + ',' + this.y.toString() + '),'
        if (this.n) {
            string = string + 'N'
        }
        if (this.s) {
            string = string + 'S'
        }
        if (this.e) {
            string = string + 'E'
        }
        if (this.w) {
            string = string + 'W'
        }
        if (this.visited) {
            string = string + 'V'
        }
        return string
    }
}

class Player {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.face = 'n'
    }

    position() {
        return [this.x, this.y]
    }

    turn_right() {
        this.face = right(this.face)
    }

    turn_left() {
        this.face = left(this.face)
    }

    turn_back() {
        this.face = left(left(this.face))
    }

    move() {
        if (this.face == 'n') {
            this.y -= 1
        } else if (this.face == 's') {
            this.y += 1
        } else if (this.face == 'e') {
            this.x += 1
        } else if (this.face == 'w') {
            this.x -= 1
        }
    }
}

class Maze {
    constructor(size, loop=0) {
        this.size = size
        this.grid = []
        this.reset_grid()
        this.solution = []
        this.start_x = 0
        this.start_y = 0
        this.end_x = 0
        this.end_y = 0
        this.player = null
        this.loop = loop
    }

    reset_grid() {
        for (let y=0; y<this.size; y++) {
            var row = []
            for (let x=0; x<this.size; x++) {
                row.push(new Cell(x,y))
            }
            this.grid.push(row)
        }
    }

    get_adj(pos) {
        var x = pos[0]
        var y = pos[1]
        var adj = [[x-1,y], [x+1,y], [x,y-1], [x,y+1]]
        for (let i=3; i>-1; i--) {
            if (adj[i][0] > this.size-1 || adj[i][0] < 0 || adj[i][1] > this.size-1 || adj[i][1] < 0) {
                adj.splice(i,1)
            } else if (this.grid[adj[i][1]][adj[i][0]].visited) {
                adj.splice(i,1)
            }
        }
        return adj
    }

    get_cell(pos) {
        return this.grid[pos[1]][pos[0]]
    }

    gen_maze() {
        var edge = ['N', 'S', 'E', 'W']
        edge = edge[Math.floor((Math.random()*edge.length))]
        if (edge == 'N') {
            edge = ['S', 'E', 'W']
            this.start_y = 0
            this.start_x = Math.floor((Math.random()*(this.size-1)))+1
        } else if (edge == 'S') {
            edge = ['N', 'E', 'W']
            this.start_y = this.size-1
            this.start_x = Math.floor((Math.random()*(this.size-1)))+1
        } else if (edge == 'E') {
            edge = ['N', 'S', 'W']
            this.start_x = 0
            this.start_y = Math.floor((Math.random()*(this.size-1)))+1
        } else if (edge == 'W') {
            edge = ['N', 'S', 'E']
            this.start_x = this.size-1
            this.start_y = Math.floor((Math.random()*(this.size-1)))+1
        }

        edge = edge[Math.floor((Math.random()*edge.length))]
        if (edge == 'N') {
            this.end_y = 0
            this.end_x = Math.floor((Math.random()*(this.size-1)))+1
        } else if (edge == 'S') {
            this.end_y = this.size-1
            this.end_x = Math.floor((Math.random()*(this.size-1)))+1
        } else if (edge == 'E') {
            this.end_x = 0
            this.end_y = Math.floor((Math.random()*(this.size-1)))+1
        } else if (edge == 'W') {
            this.end_x = this.size-1
            this.end_y = Math.floor((Math.random()*(this.size-1)))+1
        }

        var route = []
        var end = [this.end_x, this.end_y]
        this.get_cell(end).end = true
        var next = [this.start_x, this.start_y]
        this.get_cell(next).visited = true
        this.get_cell(next).start = true
        this.player = new Player(this.start_x, this.start_y)
        route.push(next)
        var adj = this.get_adj(next)
        while (adj.length>0) {
            next = adj[Math.floor((Math.random()*adj.length))]
            let newc = this.get_cell(next)
            let old = this.get_cell(route[route.length-1])
            newc[newc.sub(old)] = false
            old[old.sub(newc)] = false
            newc.visited = true
            route.push(next)
            adj = this.get_adj(next)
            if (next[0] == end[0] && next[1] == end[1]) {
                if (route.length < this.size) {
                    this.reset_grid()
                    this.gen_maze()
                    break
                }
                this.solution = route.map((x) => x)
                adj = []
            }
            while (adj.length==0) {
                route.pop()
                if (route.length==0) {
                    break
                }
                next = route[route.length-1]
                adj = this.get_adj(next)
            }
        }

        for (let x=0; x < this.solution.length; x++) {
            this.get_cell(this.solution[x]).solution = true
        }

        var loop = Math.floor(this.loop * this.size)
        var tries = 0
        while (loop > 0 && tries < 10) {
            tries += 1
            let row = this.grid[Math.floor((Math.random()*this.grid.length))]
            let cell = row[Math.floor((Math.random()*row.length))]
            let side = ['n', 'e', 's', 'w']
            let wall = side[Math.floor((Math.random()*side.length))]
            if (cell[wall]) {
                if (cell.position[0] == 0 && wall == 'w') {
                    continue
                }
                if (cell.position[1] == 0 && wall == 'n') {
                    continue
                }
                if (cell.position[0] == this.size-1 && wall == 'e') {
                    continue
                }
                if (cell.position[1] == this.size-1 && wall == 's') {
                    continue
                }
                try {
                    var adjc = this.get_adj_cell(wall, cell)
                    if (adjc == null) {
                        continue
                    }
                } catch(err) {
                    continue
                }
                if (this.solution.includes(adjc.position) || this.solution.includes(cell.position)) {
                    continue
                }
                cell[wall] = false
                wall = side[(side.findIndex((x)=>x==wall)+2)%side.length]
                adjc[wall] = false
                loop -= 1
            }
        }
    }

    get_adj_cell(wall, cell) {
        if (wall == 'n') {
            var pos = [cell.x, cell.y-1]
        } else if (wall == 's') {
            var pos = [cell.x, cell.y+1]
        } else if (wall == 'e') {
            var pos = [cell.x+1, cell.y]
        } else if (wall == 'w') {
            var pos = [cell.x-1, cell.y]
        } 
        return this.get_cell(pos)
    }

    get_adj_cell_pos(wall, posi) {
        if (wall == 'n') {
            var pos = [posi[0], posi[1]-1]
        } else if (wall == 's') {
            var pos = [posi[0], posi[1]+1]
        } else if (wall == 'e') {
            var pos = [posi[0]+1, posi[1]]
        } else if (wall == 'w') {
            var pos = [posi[0]-1, posi[1]]
        }
        return pos
    }

    move_player_forward() {
        var cell = this.get_cell(this.player.position())
        if (!cell[this.player.face]) {
            this.player.move()
        }
    }

    move_player_backward() {
        this.player.turn_back()
        var cell = this.get_cell(this.player.position())
        if (!cell[this.player.face]) {
            this.player.move()
        }
        this.player.turn_back()
    }
}

function left(face) {
    wall = ['n', 'e', 's', 'w']
    return wall[(wall.findIndex((x)=>x==face)+3)%wall.length]
}
    
function right(face) {
    wall = ['n', 'e', 's', 'w']
    return wall[(wall.findIndex((x)=>x==face)+1)%wall.length]
}