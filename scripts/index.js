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
    parse_step = [];
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
    edges = [];
    items = [];
    productions = [];
    Terminal = [];
    Nonterminal = [];
    symbols = [];
    NT_productions = [];
    firstCollection = [];
    parse_step = [];
    actions = new Map();
    trans = new Map(); 
    document.getElementById("grammar-text").value = '';
    document.getElementById('grammar-container').innerHTML='';
    document.getElementById('collection-container').innerHTML='';
    document.getElementById('parse-steps-container').innerHTML='';
    document.getElementById('parse-state-container').innerHTML='';
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
    if(strArr[2] == "Error")
        tr.className = "error-step";
    else if(strArr[2] == "移进")
        tr.className = "shift-step";
    else if(strArr[2] == "接受")
        tr.className = "accept-step";
    else if(strArr[2][0] == "按")
        tr.className = "reduce-step";
    for(let item of strArr){
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
    // console.log(parse_step);
    for(let i = 0; i < parse_step.length;i++){
        addItemToParseSetp(table, parse_step[i], i);
    }
    curIndex = 0;
    document.getElementById("parse-steps-container").innerHTML = "";
    document.getElementById("parse-steps-container").appendChild(table);
    // console.log(getDepth());
}

function getLastNumber(str){
    // console.log(str);
    let res = 0, cur = 1;
    for(let i = str.length-2;i>=0;i--){
        if(str[i] == ' ') break;
        res += (str[i] - '0') * cur;
        cur *= 10;
    }
    return res;
}



function changeStateDiagram(){
    // console.log(curIndex);
    // console.log(parse_step[curIndex]);
    let curStateIndex = getLastNumber(parse_step[curIndex][0]);
    // console.log("cur" + curStateIndex);
    if(curIndex > 0) {
        let pastStateIndex = getLastNumber(parse_step[curIndex-1][0]);
        // console.log("past" + pastStateIndex);
        document.getElementById("item_" + total+ pastStateIndex).classList.remove("item-current");
    }
    document.getElementById("item_" + total+ curStateIndex).classList.add("item-current");
}

// 单步演示的每一步
function showOneStepOfParse(){
    if(curIndex >= parse_step.length){
        alert("单步演示已经结束！如需重新演示请点击“清空”按钮");
        return;
    }
    changeStateDiagram();
    let tr = document.getElementById("parse-steps").children[curIndex + 1];

    let strArr = parse_step[curIndex];
    if(strArr[2] == "Error")
        tr.className = "error-step";
    else if(strArr[2] == "移进")
        tr.className = "shift-step";
    else if(strArr[2] == "接受")
        tr.className = "accept-step";
    else 
        tr.className = "reduce-step";
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
    document.getElementById("parse-text").value = '';
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

window.onload = function(){
}