"use strict"
/*　位置记录表，初始为[1, 1]
[2, 0][2, 1][2, 2]
[1, 0][1, 1][1, 2]
[0, 0][0, 1][0, 2]
*/
//初始化位置
var eaterPosition = [1, 1];
var foodPosition = [0, 2];
//每次游戏开始在start()初始化，由judge()维护
var score = 0;
var level = 1;
var speed = 5;
//第一次进去游戏初始化为０，以后由judge()维护
var best = 0;
//每次游戏开始在start初始化，用于流程控制
var gameIsOver = false;
//用于难度控制
var bombCounter = 0;
//记录动画函数地址
var welcomeAnimation = undefined;
var endAnimation = undefined;

/************************************************
*     　　流程控制：欢迎、初始化、开始、结束
************************************************/
function welcome() {
    var welcomeButton = document.getElementById("welcomeButton").getContext("2d");
    var innerBoundary = 5;
    welcomeButton.lineWidth = 3;
    welcomeButton.lineCap = 'round';
    welcomeButton.beginPath();
    welcomeButton.arc(50 + innerBoundary, 50 + innerBoundary, 50, 3 / 2 * Math.PI, Math.PI, true);
    welcomeButton.arc(50 + innerBoundary, 50 + innerBoundary, 50, Math.PI, Math.PI / 2, true);
    welcomeButton.lineTo(250 + innerBoundary, 100 + innerBoundary);
    welcomeButton.arc(250 + innerBoundary, 50 + innerBoundary, 50, Math.PI / 2, 0, true);
    welcomeButton.arc(250 + innerBoundary, 50 + innerBoundary, 50, 0, 3 / 2 * Math.PI, true);
    welcomeButton.lineTo(50 + innerBoundary, 0 + innerBoundary);
    welcomeButton.strokeStyle = 'red';
    welcomeButton.stroke();
    //欢迎闪动
    var text = document.getElementById("welcomeText");
    var textGo = document.getElementById("welcomeGo");
    var i = 0;
    var iFlag = true;
    welcomeAnimation = setInterval(function(){ 
        text.style.color = 'rgb(255,' + String(i) + ',' + '0)';
        textGo.style.color = 'rgb(255,' + String(i) + ',' + '0)';
        welcomeButton.strokeStyle = 'rgb(255,' + String(i) + ',' + '0)';
        welcomeButton.stroke();
        if (iFlag) {
            i++;
        }
        else {
            i--;
        }
        if (i === 0) {
            iFlag = true;
        }
        if (i === 125) {
            iFlag = false;
        }
    }, 10);
}
function entry() {
    var welcomeBox = document.getElementById("welcomeBox");
    var score = document.getElementById("score");
    var battleField = document.getElementById("battleField");
    var level = document.getElementById("level");
    var failedInfo = document.getElementById("failedInfo");
    failedInfo.style.display = "none";
    welcomeBox.style.display = "none";
    score.style.display = "block";
    level.style.display = "block";
    battleField.style.display = "block";
    start();
}
function start() {
    gameIsOver = false;
    score = 0;
    document.getElementById("currentScore").innerHTML = String(0);
    level = 1;
    document.getElementById("currentLevel").innerHTML = String(1);
    speed = 5;
    //策略控制
    var bombController = setInterval(function(){ 
        if (bombCounter < level + 1 && level <= 3) {
            bombCreater(speed);
        } 
        else if (level > 3 && bombCounter <= 4) {
            bombCreater(speed);
        }
    }, 350);
    var stateJudger = setInterval(function(){
        if (gameIsOver) {
            clearInterval(bombController);
            clearInterval(stateJudger);
            end();
        }
    }, 100)
}
function end() {
    var failedInfo = document.getElementById("failedInfo");
    var scoreBox = document.getElementById("score");
    var battleField = document.getElementById("battleField");
    var level = document.getElementById("level");
    scoreBox.style.display = "none";
    level.style.display = "none";
    battleField.style.display = "none";
    failedInfo.style.display = "block";
    //绘图
    var tryAgainButton = document.getElementById("tryAgainButton").getContext("2d");
    var innerBoundary = 5;
    tryAgainButton.strokeStyle = 'red';
    tryAgainButton.lineWidth = 3;
    tryAgainButton.lineCap = 'round';
    tryAgainButton.beginPath();
    tryAgainButton.arc(50 + innerBoundary, 50 + innerBoundary, 50, 3 / 2 * Math.PI, Math.PI, true);
    tryAgainButton.arc(50 + innerBoundary, 50 + innerBoundary, 50, Math.PI, Math.PI / 2, true);
    tryAgainButton.lineTo(250 + innerBoundary, 100 + innerBoundary);
    tryAgainButton.arc(250 + innerBoundary, 50 + innerBoundary, 50, Math.PI / 2, 0, true);
    tryAgainButton.arc(250 + innerBoundary, 50 + innerBoundary, 50, 0, 3 / 2 * Math.PI, true);
    tryAgainButton.lineTo(50 + innerBoundary, 0 + innerBoundary);
    tryAgainButton.stroke();
    //闪动
    var text = document.getElementById("failedText");
    text.innerHTML = "Game Over\nScore: " + String(score);
    var textGo = document.getElementById("tryAgain");
    var i = 0;
    var iFlag = true;
    endAnimation = setInterval(function(){ 
        text.style.color = 'rgb(255,' + String(i) + ',' + '0)';
        textGo.style.color = 'rgb(255,' + String(i) + ',' + '0)';
        tryAgainButton.strokeStyle = 'rgb(255,' + String(i) + ',' + '0)';
        tryAgainButton.stroke();
        if (iFlag) {
            i++;
        }
        else {
            i--;
        }
        if (i <= 0) {
            iFlag = true;
        }
        if (i >= 125) {
            iFlag = false;
        }
    }, 10);
}

/************************************************
*      黑棋（炸弹）：　创建、移动、游戏结束的判定
************************************************/
//炸弹DOM元素的创建
function newBomb() {
    var bomb = document.createElement("div");
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(50, 50, 40, 0, 2 * Math.PI, true);
    ctx.fill();
    bomb.appendChild(canvas);
    bomb.style.width = "100px";
    bomb.style.height = "100px";
    bomb.style.position = "absolute";
    bomb.style.zIndex = "2";
    bomb.style.display = "none";
    var battleField = document.getElementById("battleField");
    battleField.appendChild(bomb);
    return bomb;
}
//炸弹动画控制
function bombCreater(speed) {
    var bomb = newBomb(); bombCounter++;
    var i = parseInt(String(2 * Math.random())); //行列确定
    var j = parseInt(String(3 * Math.random())); //行列序号
    var k = parseInt(String(2 * Math.random())); //来向
    if (i === 0) {
        switch(j) {
            case 0: bomb.style.left = "5px"; break;
            case 1: bomb.style.left = "105px"; break;
            case 2: bomb.style.left = "205px"; break;
        }
        bomb.style.top = String(document.body.clientHeight) + "px";
    }
    if (i === 1) {
        switch(j) {
            case 0: bomb.style.top = "5px"; break;
            case 1: bomb.style.top = "105px"; break;
            case 2: bomb.style.top = "205px"; break;
        }
        bomb.style.left = String(document.body.clientWidth) + "px";
    }
    bomb.style.display = "block";
    //动画控制
    var x = 0;
    if (k === 0) {
        var mover = setInterval(function(){ 
            if (i === 0) {
                bomb.style.top = String(-(document.body.clientHeight - 310) / 2 - 100 + x) + "px";
                if (gameover(bomb) || gameIsOver || x > document.body.clientHeight + 100) {
                    document.getElementById("battleField").removeChild(bomb);
                    clearInterval(mover); bombCounter--;
                }
            }
            else if (i === 1) {
                bomb.style.left = String(-(document.body.clientWidth - 310) / 2 - 100 + x) + "px";
                if (gameover(bomb) || gameIsOver  || x > document.body.clientWidth + 100) {
                    document.getElementById("battleField").removeChild(bomb);
                    clearInterval(mover); bombCounter--;
                }
            }
            x += speed / 2; 
        }, 10);
    }
    else if (k === 1) {
        var mover = setInterval(function(){ 
            if (i === 0) {
                bomb.style.top = String((document.body.clientHeight - 310) / 2 + 310 - x) + "px";
                if (gameover(bomb) || gameIsOver  || x > document.body.clientHeight + 150) {
                    document.getElementById("battleField").removeChild(bomb);
                    clearInterval(mover); bombCounter--;
                }
            }
            else if (i === 1) {
                bomb.style.left = String(+(document.body.clientWidth - 310) / 2 + 310 - x) + "px";
                if (gameover(bomb) || gameIsOver  || x > document.body.clientWidth + 100) {
                    document.getElementById("battleField").removeChild(bomb);
                    clearInterval(mover); bombCounter--;
                }
            }
            x += speed / 2; 
        }, 10);
    }
}    
//判定是否触雷
function gameover(bomb) {
    if (Math.abs((eaterPosition[0]) * 100 + 5 - parseInt(bomb.style.left)) < 50 
    && Math.abs((2 - eaterPosition[1]) * 100 + 5 - parseInt(bomb.style.top)) < 50) {
        gameIsOver = true;
        return true;
    }
    return false;
}
/************************************************
 *           白棋：　移动、得分、升级
 ***********************************************/
function move(event)　{
    if (event.key) {
        switch(event.key) {
        case "W":
        case "w":
        case "ArrowUp":     moveUp();    break;
        case "S":
        case "s":
        case "ArrowDown":   moveDown();  break;
        case "d":
        case "D":
        case "ArrowRight":  moveRight(); break;
        case "A":
        case "a":
        case "ArrowLeft":   moveLeft();  break; 
        }
    }
    else {
        var x = event.which || event.keyCode;
        switch(x) {
        case 38:
        case 87:     moveUp(); break;
        case 83:
        case 40:   moveDown(); break;
        case 39:
        case 68:  moveRight(); break;
        case 65:
        case 37:   moveLeft(); break; 
        }
    }
    judge();
}
//移动操作
function moveDown() {
    if (eaterPosition[1] === 0) {
        return undefined;
    }
    var eater = document.getElementById("eater");
    if (eaterPosition[1] === 1) {
        var i = 0;
        var mover = setInterval(function(){ 
            i++;
            eater.style.top = String(105 + 10 * i) + "px";
            if (i >= 12) {
                eater.style.top = "205px";
                clearInterval(mover);
            }
        }, 10);    
    }
    else if (eaterPosition[1] === 2) {    
        var i = 0;
        var mover = setInterval(function(){ 
            i++;
            eater.style.top = String(5 + 10 * i) + "px";
            if (i >= 12) {
                eater.style.top = "105px";
                clearInterval(mover);
            }
        }, 10);    
    }
    eaterPosition[1]--;
}
function moveUp() {
    if (eaterPosition[1] === 2) {
        return undefined;
    }
    var eater = document.getElementById("eater");
    if (eaterPosition[1] === 1) {
        var i = 0;
        var mover = setInterval(function(){ 
            i++;
            eater.style.top = String(105 - 10 * i) + "px";
            if (i >= 12) {
                eater.style.top = "5px";
                clearInterval(mover);
            }
        }, 10);    
    }
    else if (eaterPosition[1] === 0) {    
        var i = 0;
        var mover = setInterval(function(){ 
            i++;
            eater.style.top = String(205 - 10 * i) + "px";
            if (i >= 12) {
                eater.style.top = "105px";
                clearInterval(mover);
            }
        }, 10);    
    }
    eaterPosition[1]++;
}
function moveRight() {
    if (eaterPosition[0] === 2) {
        return undefined;
    }
    var eater = document.getElementById("eater");
    if (eaterPosition[0] === 1) {
        var i = 0;
        var mover = setInterval(function(){ 
            i++;
            eater.style.left = String(105 + 10 * i) + "px";
            if (i >= 12) {
                eater.style.left = "205px";
                clearInterval(mover);
            }
        }, 10);    
    }
    else if (eaterPosition[0] === 0) {    
        var i = 0;
        var mover = setInterval(function(){ 
            i++;
            eater.style.left = String(5 + 10 * i) + "px";
            if (i >= 12) {
                eater.style.left = "105px";
                clearInterval(mover);
            }
        }, 10);    
    }
    eaterPosition[0]++;
}
function moveLeft() {
    if (eaterPosition[0] === 0) {
        return undefined;
    }
    var eater = document.getElementById("eater");
    if (eaterPosition[0] === 1) {
        var i = 0;
        var mover = setInterval(function(){ 
            i++;
            eater.style.left = String(105 - 10 * i) + "px";
            if (i >= 12) {
                eater.style.left = "5px";
                clearInterval(mover);
            }
        }, 10);    
    }
    else if (eaterPosition[0] === 2) {    
        var i = 0;
        var mover = setInterval(function(){ 
            i++;
            eater.style.left = String(205 - 10 * i) + "px";
            if (i >= 12) {
                eater.style.left = "105px";
                clearInterval(mover);
            }
        }, 10);
    }    
    eaterPosition[0]--;
}
//判分、升级
function judge() {
    if (eaterPosition[0] === foodPosition[0] && eaterPosition[1] === foodPosition[1]) {
        document.getElementById("currentScore").innerHTML = String(++score);
        if (score !== 0 && score % 10 === 0) {
            levelUp();
            document.getElementById("currentLevel").innerHTML = String(++level);
            speed++;
        }
        newFood();
    }
    if (score > best) {
        best = score;
        document.getElementById("bestScore").innerHTML = "BEST: " + String(score);
    }
}
function levelUp() {
    var levelInfo = document.createElement("div");
    levelInfo.innerHTML = "LEVEL UP !!!";
    levelInfo.style.width = "310px";
    levelInfo.style.height = "60px";
    levelInfo.style.position = "absolute";
    levelInfo.style.top = "355px";
    levelInfo.style.left = "0px";
    levelInfo.style.zIndex = "-1";
    levelInfo.style.textAlign = "center";
    levelInfo.style.fontWeight = "900";
    levelInfo.style.fontSize = "40px";
    document.getElementById("battleField").appendChild(levelInfo);
    //闪动效果
    var i = 0;
    var timer = 0;
    var iFlag = true;
    var textColor = setInterval(function(){ 
        levelInfo.style.color = 'rgb(255,' + String(i) + ',' + '0)';
        timer++;
        if (iFlag) {
            i = i + 5;
        }
        else {
            i = i - 5;
        }
        if (i <= 0) {
            iFlag = true;
        }
        if (i >= 125) {
            iFlag = false;
        }
        if (timer >= 250) {
            document.getElementById("battleField").removeChild(levelInfo);
            clearInterval(textColor);
        }
    }, 10);
}
//得分后创建新的得分子
function newFood() {
    var p = newPosition();
    while (p[0] === eaterPosition[0] && p[1] === eaterPosition[1] 
    || p[0] === foodPosition[0] && p[1] === foodPosition[1]) {
        p = newPosition();
    }
    var food = document.getElementById("food");
    foodPosition[0] = p[0];
    foodPosition[1] = p[1];
    moveTo(p[0], p[1], food);    
}

/************************************************
*                  基础图形绘制
************************************************/
function draw() {
    //画格子
    var gratings = document.getElementById("gratings").getContext("2d");
    var innerBoundary = 5;
    gratings.lineWidth = 3;
    gratings.lineCap = 'round';
    gratings.strokeStyle = 'white';
    //格子边框
    gratings.beginPath();
    gratings.arc(50 + innerBoundary, 50 + innerBoundary, 50, 3 / 2 * Math.PI, Math.PI, true);
    gratings.lineTo(0 + innerBoundary, 250 + innerBoundary);
    gratings.arc(50 + innerBoundary, 250 + innerBoundary, 50, Math.PI, Math.PI / 2, true);
    gratings.lineTo(250 + innerBoundary, 300 + innerBoundary);
    gratings.arc(250 + innerBoundary, 250 + innerBoundary, 50, Math.PI / 2, 0, true);
    gratings.lineTo(300 + innerBoundary, 50 + innerBoundary);
    gratings.arc(250 + innerBoundary, 50 + innerBoundary, 50, 0, 3 / 2 * Math.PI, true);
    gratings.lineTo(50 + innerBoundary, 0 + innerBoundary);
    //格子内线
    gratings.moveTo(100 + innerBoundary, 20 + innerBoundary);
    gratings.lineTo(100 + innerBoundary, 280 + innerBoundary);
    gratings.moveTo(200 + innerBoundary, 20 + innerBoundary);
    gratings.lineTo(200 + innerBoundary, 280 + innerBoundary);
    gratings.moveTo(20 + innerBoundary, 100 + innerBoundary);
    gratings.lineTo(280 + innerBoundary, 100 + innerBoundary);
    gratings.moveTo(20 + innerBoundary, 200 + innerBoundary);
    gratings.lineTo(280 + innerBoundary, 200 + innerBoundary);
    gratings.stroke();

    //白棋
    var eater = document.getElementById("eater").getContext("2d");
    eater.fillStyle = "white";
    eater.beginPath();
    eater.arc(50, 50, 30, 0, 2 * Math.PI, true);
    eater.fill();

    //得分子
    var food = document.getElementById("food").getContext("2d");
    food.beginPath();
    food.moveTo(50, 35);
    food.lineTo(35, 50);
    food.lineTo(50, 65);
    food.lineTo(65, 50);
    food.lineTo(50, 35);
    var i = 0;
    var iFlag = true;
    var foodColor = setInterval(function(){ 
        food.fillStyle = 'rgb(255,' + String(i) + ',' + '0)';
        food.fill();
        if (iFlag) {
            i++;
        }
        else {
            i--;
        }
        if (i === 0) {
            iFlag = true;
        }
        if (i === 175) {
            iFlag = false;
        }
    }, 10);
}

/************************************************
*     　　　　　　　　共享基础功能
************************************************/
function newPosition() {
    var i = parseInt(String(3 * Math.random()));
    var j = parseInt(String(3 * Math.random()));
    return [i, j];
}
function moveTo(x, y, element) {
    switch(x) {
        case 0: element.style.left = "5px";   break;
        case 1: element.style.left = "105px"; break;
        case 2: element.style.left = "205px"; break;
    }
    switch(y) {
        case 0: element.style.top = "205px"; break;
        case 1: element.style.top = "105px"; break;
        case 2: element.style.top = "5px";   break;
    }
}
function stopAnimation(position) {
    switch (position) {
        case "end" :
            clearInterval(endAnimation);
        break;
        case "welcome":
            clearInterval(welcomeAnimation);
        break;
    }
}