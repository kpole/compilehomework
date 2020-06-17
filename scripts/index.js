var parse_step;
var curIndex;

// 判断符号类型
const symbolClass = symbol => {
    if (symbol === Nonterminal[0]) {
        return 'start-symbol';
    }
    if (symbol === '$') {
        return 'end-marker';
    }
    if (Nonterminal.indexOf(symbol) != -1) {
        return 'non-terminal';
    }
    if (Terminal.indexOf(symbol) != -1) {
        return 'terminal';
    }
};

// 在pre中创建<b>
const symbolNode = (symbol, additionalClass) => {
    let classes = [symbolClass(symbol)];
    if(additionalClass !== undefined){
        classes.push(additionalClass);
    }
    return element('b', symbol, classes);
}

// 创建页面元素
const element = (tag, content, classes, attrs) => {
    let node = document.createElement(tag);
    let contentItems;
    if (content === undefined) {
        contentItems = [];
    } else if (Array.isArray(content)) {
        contentItems = content;
    } else {
        contentItems = [content];
    }
    contentItems.forEach(contentItem => {
        if (typeof contentItem === 'object') {
            node.appendChild(contentItem);
        } else {
            node.appendChild(document.createTextNode(contentItem));
        }
    });
    if (classes !== undefined) {
        if (Array.isArray(classes)) {
            node.classList.add(...classes);
        } else {
            node.classList.add(classes);
        }
    }
    if (attrs !== undefined) {
        Object.keys(attrs).forEach(key => {
            node[key] = attrs[key];
        });
    }
    return node;
};
/*
    将分析表显示到前端 id 为parse-table的table组件
    分析表内容在actions和trans中
    actions与trans都为Map
    actions.get("1 a") = {type:"s/r", target: 目标状态}
    trans.get("1 S") = 2
*/
function showParseTable(){
    let table = document.getElementById("parse-table");
    while(table.childElementCount > 2){
        table.removeChild(table.lastChild);
    }
    // 修改列表宽度
    document.getElementById("table-actions").setAttribute("colspan", Terminal.length+1);
    document.getElementById("table-trans").setAttribute("colspan", Nonterminal.length-1);
    //清空第二行元素,然后进行修改
    let tr = document.getElementById("table-col-item");
    tr.innerHTML = "";
    let symbols = Terminal;
    symbols.push("$");
    symbols = symbols.concat(Nonterminal);
    symbols.splice(Terminal.length, 1); 
    // console.log(symbols);
    for(let symbol of symbols){
        let td = document.createElement("td");
        if(Terminal.indexOf(symbol) != -1) td.className = "terminal";
        else if(symbol == '$') td.className = "end-marker";
        else td.className = "non-terminal";
        td.innerHTML = symbol;
        tr.appendChild(td);
    }
    
    for(let i=0; i < items.length; i++){
        let tr = document.createElement("tr");
        let td = document.createElement("td");
        td.innerHTML = i;
        // console.log(i);
        tr.appendChild(td);
        for(let j of symbols){
            let td = document.createElement("td");
            if(Nonterminal.indexOf(j) != -1){
                let temp = trans.get(i + " " + j);
                if(temp == undefined){
                    td.innerHTML = " ";
                }
                else {
                    td.innerHTML = temp;
                }
            } else {
                let temp = actions.get(i + " " + j);
                // console.log("非终结符");
                // console.log(temp);
                if(temp == undefined){
                    td.className = "error";
                    td.innerHTML = " ";
                }
                else {
                    if(temp.type == "r") {
                        td.className = "reduce";
                    } else if(temp.type == "s"){
                        td.className = "shift";
                    } else if(temp.type == "Acc"){
                        td.className = "accept";
                    }
                    td.innerHTML = temp.type + temp.target;
                }
            }
            tr.appendChild(td);
        }
        // console.log(tr);
        table.appendChild(tr);
    }
}

// 创建一个新的语法分析表
function createParseTable(){
    edges = [];
    items = [];
    productions = [];
    Terminal = [];
    Nonterminal = [];
    symbols = [];
    NT_productions = [];
    firstCollection = [];
    actions = new Map();
    trans = new Map();  
    this.getSymbols();
    this.getProductions();
    this.getFirst();
    this.getItems();
    this.getParsingTable();
    this.showParseTable();
}

// 获取项目集中，单个项目的解析符号
const itemNodes = item => {
    let nodes = new Array();
    let production = productions[item.production_id];
    let pos = item.pos;
    nodes.push(symbolNode(production.left));
    nodes.push(document.createTextNode('-> '));
    let right = production.right.slice(0, pos) + '•' + production.right.slice(pos);
    for(let ch of right){
        nodes.push(symbolNode(ch));
    }
    nodes.push(document.createTextNode(','));
    let lookahead = "";
    for(let i = 0; i < item.lookahead.length; i++){
        let ch = item.lookahead[i];
        if(i !== 0) lookahead += "/";
        lookahead += ch;
    }
    nodes.push(symbolNode(lookahead, 'lookahead'));
    return nodes;
}

// 填充页面项目集
function createCollections(){
    let preNode = document.createElement('pre');
    items.forEach((set,setIndex)=>{
        let flag = true;
        set.forEach((item, itemIndex)=>{
            preNode.appendChild(element('i',
                flag ?
                ['I', element('sub', setIndex), ' '] :
                undefined
            ));
            flag = false;
            itemNodes(item).forEach(itemNode=>{
                preNode.appendChild(itemNode);
            })
            if(itemIndex !== set.length - 1) {
                preNode.appendChild(document.createElement('br'));
            }
        })
        if(setIndex !== items.length - 1){
            preNode.appendChild(document.createElement('br'));
            preNode.appendChild(document.createElement('br'));
        }
    });
    document.getElementById('collection-container').innerHTML = '';
    document.getElementById('collection-container').appendChild(preNode);
}

// 创建新的文法
function createGrammer(){
    let value = document.getElementById("grammar-text").value;
    // console.log(value);
    productions_list = [];
    let str = "";
    for(let ch of value){
        if(ch == ' ') continue;
        if(ch == '\n'){
            productions_list.push(str);
            str="";
        } else {
            str += ch;
        }
    }
    if(str != "") productions_list.push(str);
    // console.log(productions_list);
    createParseTable();
    createCollections();
    drawStateDiagram();
}

// 清空语法分析器
function clearGrammer(){
    document.getElementById("grammar-text").value = '';
    document.getElementById('grammar-container').innerHTML='';
    document.getElementById('collection-container').innerHTML='';
    document.getElementById('parse-steps-container').innerHTML='';
    document.getElementById('parse-tree-container').innerHTML='';
    document.getElementById("parse-text").value = '';
    let table = document.getElementById("parse-table");
    while(table.childElementCount > 2){
        table.removeChild(table.lastChild);
    }
    document.getElementById('table-col-item').innerHTML='';
}

// 将分析步骤添加到table最后一行
function addItemToParseSetp(table, strArr, index){
    let tr = document.createElement("tr");
    tr.appendChild(element("td", index));
    // console.log(strArr);
    for(let item of strArr){
        if(item == '接受')
            tr.className = "current-step";
        else if(item == 'Error') 
            tr.className = "error-step";
        tr.appendChild(element("td", item));
    }
    table.appendChild(tr);
}

// 当输入解析式的内容发生变化时，调用该函数
function parseTextChange(){
    let value = document.getElementById("parse-text").value;
    if(value == '') return;
    parse_step = analysis(value);
    curIndex = 0;
}

// 一步显示所有解析结果
function showAllParseStep(){
    // let value = document.getElementById("parse-text").value;
    // if(value == '') return;
    // parse_step = analysis(value);
    if(parse_step == undefined ||  parse_step == '') parseTextChange();
    if(parse_step == undefined) return;
    let table = document.createElement("table");
    table.id = "parse-steps";
    let tr = document.createElement("tr");
    tr.appendChild(element("th", "序号",undefined,{"width":"50px"}));
    tr.appendChild(element("th", "栈"));
    tr.appendChild(element("th", "输入"));
    tr.appendChild(element("th", "动作",undefined,{"width":"200px"}));
    table.appendChild(tr);
    console.log(parse_step);
    for(let i = 0; i < parse_step.length;i++){
        addItemToParseSetp(table, parse_step[i], i);
    }
    curIndex = 0;
    document.getElementById("parse-steps-container").innerHTML = "";
    document.getElementById("parse-steps-container").appendChild(table);
    // console.log(getDepth());
}

// 单步演示的每一步
function showOneStepOfParse(){
    if(curIndex >= parse_step.length){
        document.getElementById("parse-steps").children[parse_step.length].className = "";
        alert("单步演示已经结束！如需重新演示请点击“清空”按钮");
        return;
    }
    if(curIndex != 0){
        document.getElementById("parse-steps").children[curIndex].className = "";
    }
    let tr = document.getElementById("parse-steps").children[curIndex + 1];
    
    let strArr = parse_step[curIndex];
    if(strArr[2] == "Error")
        tr.className = "error-step";
    else 
        tr.className = "current-step";
    for(let i = 0; i < strArr.length;i++){
       tr.children[i+1].innerHTML = strArr[i]; 
    }
    curIndex ++;
}


// 点击页面“单步演示”按钮触发该函数
function parseTextOneStep(){
    if(parse_step == undefined ||  parse_step == '') parseTextChange();
    if(parse_step == undefined) return;
    if(curIndex == 0){
        let table = document.createElement("table");
        table.id = "parse-steps";
        let tr = document.createElement("tr");
        tr.appendChild(element("th", "序号",undefined,{"width":"50px"}));
        tr.appendChild(element("th", "栈"));
        tr.appendChild(element("th", "输入"));
        tr.appendChild(element("th", "动作",undefined,{"width":"200px"}));
        table.appendChild(tr);
        for(let i = 0; i < parse_step.length; i++){
            addItemToParseSetp(table, [" ", " ", " "], i);
        }
        document.getElementById("parse-steps-container").innerHTML = '';
        document.getElementById("parse-steps-container").appendChild(table);
    }
    showOneStepOfParse();
}

// 点击页面“清空”按钮触发该函数
function clearParseText(){
    document.getElementById("parse-steps-container").innerHTML = '';
    parse_step = "";
    curIndex = 0;
}

// 举个例子
function showExample(){
    document.getElementById("grammar-text").value = "T->S\nS->BB\nB->bB|a\n";
    createGrammer();
    document.getElementById("parse-text").value = "bbaa";
    parse_step = "";
    showAllParseStep();
}

//绘制圆形
//canvasid画布名称,x,y 坐标,radius 半径,maxValue最大值,process 百分比,backColor 中心颜色, proColor 进度颜色, fontColor 中心文字颜色,fonttitle中心文字内容，unit中心文字单位
function DrawCircle(canvas, x, y, radius, maxValue, process, backColor, proColor, fontColor, fonttitle) {
    if (canvas.getContext) {
        var cts = canvas.getContext('2d');
    } else {
        return;
    }
    cts.beginPath();
    // 坐标移动到圆心  
    cts.moveTo(x, y);
    // 画圆,圆心是24,24,半径24,从角度0开始,画到2PI结束,最后一个参数是方向顺时针还是逆时针  
    cts.arc(x, y, radius, 0, Math.PI * 2, false);
    cts.closePath();
    // 填充颜色  
    cts.fillStyle = backColor;
    cts.fill();

    cts.beginPath();
    // 画扇形的时候这步很重要,画笔不在圆心画出来的不是扇形  
    cts.moveTo(x, y);
    // 跟上面的圆唯一的区别在这里,不画满圆,画个扇形  
    //cts.arc(x, y, radius, Math.PI * 1.5, Math.PI * 1.5 - Math.PI * 2 * process / maxValue, true);
    cts.closePath();
    cts.fillStyle = proColor;
    cts.fill();

    //填充背景白色
    cts.beginPath();
    cts.moveTo(x, y);
    cts.arc(x, y, radius - (radius * 0.10), 0, Math.PI * 2, true);
    cts.closePath();
    cts.fillStyle = 'rgba(255,255,255,1)';
    cts.fill();

    // 画一条线  
    cts.beginPath();
    //cts.arc(x, y, radius - (radius * 0.30), 0, Math.PI * 2, true);
    cts.closePath();
    // 与画实心圆的区别,fill是填充,stroke是画线  
    cts.strokeStyle = backColor;
    cts.stroke();

    //在中间写字 
    cts.font = "bold 15pt Arial";
    cts.fillStyle = fontColor;
    cts.textAlign = 'center';
    cts.textBaseline = 'middle';
    cts.moveTo(x, y);
    cts.fillText(fonttitle, x, y);
}

// 画图， 起点和终点（二维数组）， 线宽，线的颜色，线上面的字符
function DrawLine(canvas, begin_point, end_point, lineWidth, strokeStyle, text, textSize, textFamily){
    // console.log(begin_point);
    // console.log(end_point);
    let ctx = canvas.getContext("2d");
    ctx.beginPath();
    // 5, gray
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.moveTo(begin_point[0], begin_point[1]);
    ctx.lineTo(end_point[0], end_point[1]);
    ctx.stroke();
    ctx.closePath();
    // ctx.font = "30px Georgia";
    ctx.font = textSize + " " + textFamily;
    ctx.fillText(text, begin_point[0] + 3 * (end_point[0] - begin_point[0]) / 8, begin_point[1] + 3 * (end_point[1] - begin_point[1]) / 8);
}


/*
    拓扑序
*/
function drawStateDiagram(){
    let container = document.getElementById("parse-state-container");
    container.innerHTML = "";
    let canvas = document.createElement("canvas");
    let itemCounts = items.length;
    let item = getDepth();
    let depth = item[0]; // 每个点的depth
    let list = item[1]; // 拓扑序排序之后
    let corrdinate = new Array(itemCounts);
    let colNum = new Array(itemCounts);
    // console.log(depth);
    // console.log(list);
    for(let i = 0; i < itemCounts; i++)colNum[i] = 0;
    for(let i = 0; i < itemCounts; i ++){
        let id = list[i];
        let x = depth[id];
        let y = colNum[x] ++;
        corrdinate[id] = [x * 200 + 100, y * 200 + 100];
    }
    console.log(corrdinate);
    // console.log(Math.max(...depth));
    // console.log(Math.max(...colNum));
    canvas.width = Math.max(...depth) * 200 + 200;
    canvas.height = Math.max(...colNum) * 200 + 200;
    // 按照拓扑序去画？对！，生成过程也是，
    DrawCircle(canvas, 100, 100, 50, 30, 15, '#ddd', '#32CD32', '#32CD32', 0);
    // console.log(corrdinate);
    for(let i = 0; i < itemCounts; i ++){
        let stpoint = corrdinate[i];
        if(edges[i] != undefined){
            for(let edge of edges[i]){
                let edpoint = corrdinate[edge.ver];
                DrawCircle(canvas, edpoint[0], edpoint[1], 50, 30, 15, '#ddd', '#32CD32', '#32CD32', edge.ver);
                DrawLine(canvas, [stpoint[0] + 50, stpoint[1]], [edpoint[0] - 50, edpoint[1]], "5px", "gray", edge.symbol, "30px", "Georgia");      
            }
        }
    }
    // console.log(corrdinate);

    container.appendChild(canvas);
}