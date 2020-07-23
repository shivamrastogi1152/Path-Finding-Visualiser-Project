var rows = 50
var cols = 50
var grid = new Array(cols);

var openset = [];///Nodes yet to be evaluated
var closedset = []; ///The nodes of set which have already been evaluated
var w,h;
var blockprobabilty = 0.3; 
var nosolution = false;

var running = false;

var button = document.getElementById("btn");
button.addEventListener('click',()=>{
    running=true
    button.style.backgroundColor = 'red';
});

var dijbtn = document.getElementById('dij');
var astarbtn = document.getElementById('astar');

var rundij=false;
var runastar=true;

dijbtn.addEventListener('click',()=>{

    dijbtn.style.backgroundColor='yellowgreen';
    astarbtn.style.backgroundColor = 'white';

    rundij=true;
    runastar=false;
})

astarbtn.addEventListener('click',()=>{
    astarbtn.style.backgroundColor='yellowgreen';
    dijbtn.style.backgroundColor='white';

    rundij=false;
    runastar=true;
})

var start;
var end;
var path = [];

function node(i,j)
{   
    this.i=i;
    this.j=j;

    this.f=0;
    this.g=0;
    this.h=0;
    this.block = false;

    if(random(1) < blockprobabilty ) this.block=true;

    this.neighbors = [];
    this.parent = undefined; ///To keep track of the best path

    this.show = (color)=>{

        // if(this.block)
        {
        fill(color);
        if(this.block) {
            fill(0);
        }
        noStroke();
        rect(this.i*w,this.j*h,w-1,h-1);
        }
    }

    this.addNeighbors = function(grid) {

        var i = this.i;
        var j = this.j;

        if(i<cols-1) this.neighbors.push(grid[i+1][j]);

        if(i>0) this.neighbors.push(grid[i-1][j]);

        if(j<rows-1) this.neighbors.push(grid[i][j+1]);

        if(j>0) this.neighbors.push(grid[i][j-1]);

        if(i>0 & j>0) this.neighbors.push(grid[i-1][j-1])

        if(i>0 & j<rows-1) this.neighbors.push(grid[i-1][j+1])

        if(i<cols-1 & j>0) this.neighbors.push(grid[i+1][j-1])

        if(i<cols-1 & j<rows-1) this.neighbors.push(grid[i+1][j+1])
    }
}

function getvertex(openset)
{
    var ans=0;
    for(let i=0;i<openset.length;i++)
    {
        if(openset[i].f < openset[ans].f)
        {
            ans=i;
        }
    }
    return ans;
}

function Remove(target,arr)
{
    for(var i=arr.length-1;i>=0;i--)
    {
        if(arr[i]==target) arr.splice(i,1);
    }
}

function heuristic(a,b)
{   
    if(rundij) return 0;

    else 
    {
        var diffX = a.i-b.i;
        var diffY = a.j-b.j;
        diffX*=diffX;
        diffY*=diffY;

        var sum = diffX+diffY;
        var h = Math.sqrt(sum); 
        return h;
    }
    // return 0;
}

function setup()
{   
    console.log('A*');
    createCanvas(600,600);


    w = width/cols;
    h = height/rows;

    var Canvas = document.getElementById("defaultCanvas0");
    Canvas.style.display = 'block';
    Canvas.style.margin = '0 auto';

    for(let i=0;i<cols;i++)
    {
        grid[i]=new Array(rows);
        for(let j=0;j<rows;j++)
        {
            grid[i][j] = new node(i,j);
        }
    }

    for(let i=0;i<cols;i++)
    {
        for(let j=0;j<rows;j++)
        {
            grid[i][j].addNeighbors(grid);
        }
    }
        // console.log(grid);

    var x=0;
    var y=0;
    var squareX=cols-1;
    var squareY=rows-1; 

    Canvas.addEventListener('click',()=>{

        x = event.pageX - Canvas.getBoundingClientRect().left;
        y = event.pageY - Canvas.getBoundingClientRect().top;

        squareX = Math.floor(x/w);
        squareY = Math.floor(y/h);

        start = grid[0][0];
        end = grid[squareX][squareY];

        start.block=false;
        end.block=false;

        closedset = [];
        openset = [];
        openset.push(start);

        // console.log(x,y);
        console.log(squareX,squareY);
    })

        start = grid[0][0];
        end = grid[squareX][squareY];

        start.block=false;
        end.block=false;

    openset.push(start);

}

function draw()
{
    background(color(100,100,100));
    
    // while(!openset.empty()) this should have been used but since the draw 
    // function is already a looping over itself so no need to use the while loop

    if(openset.length>0 && running){

        var minFvaluevertex = getvertex(openset); 
        
        var currnode = openset[minFvaluevertex];    ///Current node will be the one which has lowst f value

        if(currnode == end)
        {
            console.log("Path Found!");
            noLoop();
            alert("Path Found!");
            // return;
            
        }

        else 
        {
            Remove(currnode,openset);
            closedset.push(currnode);
            
            for(var i=0;i<currnode.neighbors.length;i++)
            {
                var neighbor = currnode.neighbors[i];

                ///Only evaluate the neighbors who haven't already been evaluated (Not already present in closedset)
                /// and the nieghbors should be blocked
                ///If a certain nieghbor is already present in closetSet then we have already found the 
                ///most efficient method of reaching that neighbor
                if( !closedset.includes(neighbor) && !neighbor.block )
                {   
                    var tentativeGscore = 0;
                    if(Math.abs(neighbor.i - currnode.i)>=1 && Math.abs(neighbor.j-currnode.j)>=1)
                    {   
                        ///For a diagonal neighbor the increment in g value should be sqrt(2)?
                        tentativeGscore = currnode.g + Math.sqrt(2); 
                    }
                    else tentativeGscore= currnode.g+1;
                    
                    ///If current neighbor is present in the openset it might be possible that already existing
                    /// Gscore for that neighbor is better than the path that we're currently following, so before
                    ///updating we should check if the current path is a better path (path with lesser g value)
                    var foundBetterPath=false;
                    if(openset.includes(neighbor)) 
                    {
                        if(tentativeGscore < neighbor.g){
                            neighbor.g = tentativeGscore;
                            foundBetterPath=true;
                        }
                    }
                    else 
                    {
                        neighbor.g = tentativeGscore;
                        openset.push(neighbor);
                        foundBetterPath=true;
                    }

                    if(foundBetterPath)
                    {   
                        neighbor.h = heuristic(neighbor,end);
                        neighbor.f = neighbor.g + neighbor.h;
                        neighbor.parent = currnode;
                    }
                   

                }
            }
        }

    }

    else if(openset.length<=0 && running) {
        console.log("No Solution");
        nosolution = true;
        noLoop();
        alert("No Solution!");
    }

    for(let i=0;i<cols;i++)
    {
        for(let j=0;j<rows;j++)
        {
            grid[i][j].show(color(255));
        }
    }

    ///Closed set will be marked by red color
    for(let i=0;i<closedset.length;i++)
    {
        closedset[i].show(color(255,0,0));
    }

    ///Open set will be marked by green color
    for(let i=0;i<openset.length;i++)
    {
        openset[i].show(color(0,255,0));
    }

    ///Evaluating the path at each frame
    if(nosolution==false && running)
    {
        var temp = currnode;
        path = [];
        path.push(temp);
        while(temp.parent!=undefined)
        {
            path.push(temp.parent);
            temp = temp.parent;
        }
    }
    ///Path will be marked by blue color
    // for(var i=0;i<path.length;i++)
    // {
    //     path[i].show(color(0,0,255));
    // }

    noFill();
    stroke(color(255,255,255));
    strokeWeight(w/3);

    beginShape();
    for(var i=0;i<path.length;i++)
    {
        vertex(path[i].i*w+w/2,path[i].j*h+h/2);
    }
    endShape();

}

