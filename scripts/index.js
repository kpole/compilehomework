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
    console.log(symbols);
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
        console.log(tr);
        table.appendChild(tr);
    }
}


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


function createGrammer(){
    let value = document.getElementById("grammar-text").value;
    console.log(value);
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
    console.log(productions_list);
    createParseTable();
}

function addItemToParseSetp(table, strArr){
    let tr = document.createElement("tr");
    for(let item of strArr){
        tr.appendChild(createTd(item));
    }
    table.appendChild(tr);
}
function createTd(str){
    let td = document.createElement("td");
    td.innerHTML = str;
    return  td;
}
function createParseText(){
    let value = document.getElementById("parse-text").value;
    let res = analysis(value);
    let table = document.createElement("table");
    let tr = document.createElement("tr");
    tr.appendChild(createTd("栈"));
    tr.appendChild(createTd("输入"));
    tr.appendChild(createTd("动作"));
    table.appendChild(tr);
    for(let strArr of res){
        addItemToParseSetp(table, strArr);
    }
    document.getElementById("parse-steps-container").innerHTML = "";
    document.getElementById("parse-steps-container").appendChild(table);
}

// 调用入口
window.onload = function(){
    this.createParseTable();
    let res = analysis("baa");
    this.console.log(items);
    this.console.log(edges);
    this.console.log(res);
}