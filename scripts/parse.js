/*
    Production: 产生式
        left: String 左部，非终结符
        right: String 右部
*/
function Production(left, right){
this.left = left;
this.right = right;
}
/*
    Item: 项目集里面的一个子项
        production_id ： int 是对应的产生式在productions里面的下标
        pos: int 点的位置
        lookahead：String 搜索符
        equal: function 判断Item是否相等
*/
function Item(production_id, pos, lookahead){
    this.production_id = production_id; //int 
    this.pos = pos;
    this.lookahead = lookahead; // set
    this.equal = function(item) {
        if(this.production_id == item.production_id && this.pos == item.pos && item.lookahead == this.lookahead) return true;
        return false;
    }
}
/*
    Edge : 边
        ver : int 表示有向边指向的节点编号
        symbol: String 边上的符号
*/
function Edge(ver, symbol){
    this.ver = ver;
    this.symbol = symbol;
}
/*
更换文法时需要清空的数据
    edges
    items
    productions
    Terminal
    Nonterminal
    symbols
    NT_produtcions
    firstCollection
    productions_list
    actions
    trans
*/
var edges = new Array(); // 领接表，放置状态转换图，是一个二维数组，第一维元素类型为int，第二维元素类型是Edge
var items = new Array(); // 二维数组，放置所有的项目集，第一维元素类型是int，第二维元素类型是Set
var productions = new Array(); // 放所有产生式，元素类型是production
var Terminal = new Array();     //终结符数组，元素类型是char
var Nonterminal = new Array();  //非终结符数组
var symbols = new Array();      //所有终结符
var NT_productions = new Array();  // 以某一个非终结符为左部的产生式，NT_productions['S'] 表示以S为左部的产生式集合，数组元素是production类型
var firstCollection = new Array();  //元素类型是set，firstCollection['S']表示S的First集合
var productions_list = new Array(); // 所有的产生式列表，用户网页端输入产生式后，使用该数组接受

// action.get("1 a") = {type:"s/r", target:}
var actions = new Map();
// trans.get("1 a") = 2;
var trans = new Map();

//这里得到产生式输入，空使用@，例子
productions_list.push("T->S");
productions_list.push("S->BB");
productions_list.push("B->bB|a");

// productions_list.push("Z->S");
// productions_list.push("S->L=R");
// productions_list.push("S->R");
// productions_list.push("L->aR");
// productions_list.push("L->b");
// productions_list.push("R->L");


// 1. 得到终结符与非终结符
function getSymbols(){
    for(let item of productions_list){
        // S->xxx|xxx|xxxx
        for(let ch of item){
            if(ch == '-' || ch == '>' || ch == '|')continue;
            if(ch >= 'A' && ch <= 'Z') {
                if(Nonterminal.indexOf(ch) == -1) Nonterminal.push(ch);
            } else {
                if(Terminal.indexOf(ch) == -1) Terminal.push(ch);
            }
        }
    }
    symbols = Terminal.concat(Nonterminal);
    Nonterminal.forEach(function(value, index, array){
        NT_productions[value] = new Array();
    })
    // console.log("终结符");
    // console.log(Terminal);
    // console.log("非终结符");
    // console.log(Nonterminal);
}

// 2. 得到产生式
function getProductions(){
    for(let item of productions_list){
        let left = item[0];
        let right = "";
        // S->aSb
        for(let i = 3; i < item.length; i++){
            if(item[i] == '|'){
                let production = new Production(left, right);
                productions.push(production);
                NT_productions[left].push(production);
                right = "";
            } else {
                right += item[i];
            }
        }
        let production = new Production(left, right);
        productions.push(production);
        NT_productions[left].push(production);
    }
    // console.log(productions);
        //console.log(NT_productions);
}

//3. 计算First集合
function union(A, B){
    let res = new Set(A);
    for(let item of B){
        res.add(item);
    }
    return res;
}

function getFirstCollection(ch){
    // console.log(ch);
    if(firstCollection[ch] == null) firstCollection[ch] = new Set();
    // console.log(firstCollection[ch].size);
    if(firstCollection[ch].size != 0) return firstCollection[ch];
    for(let item of NT_productions[ch]){
        // 是终结符，直接添加
        let flag = 1;
        for(let elem of item.right){
            
            if(elem == ch) {
                flag = -1;
                break;
            }
            if(Terminal.indexOf(elem) != -1){
                flag = -1;
                firstCollection[ch] = union(firstCollection[ch], firstCollection[elem]);
                break;
            } else {
                getFirstCollection(elem);
                if(firstCollection[elem].has('@')){
                    firstCollection[elem].delete('@')
                    firstCollection[ch] = union(firstCollection[ch], firstCollection[elem]);
                    firstCollection[elem].add('@');
                } else {
                    flag = -1;
                    firstCollection[ch] = union(firstCollection[ch], firstCollection[elem]);
                    break;
                }
            }
        }
        if(flag == 1) {
            firstCollection[ch].add('@');
        }
    }
}

function getFirst(){
    for(let ch of Terminal) {
        firstCollection[ch] = new Set();
        firstCollection[ch].add(ch); //终结符的First只有他自己
    }
    for(let ch of Nonterminal) {
        getFirstCollection(ch);
    }
    // console.log(firstCollection);
}
// 4. 求状态转换图
// 将set转为String，存在lookahead搜索符
function setToString(set){
    let res = "";
    for(let item of set){
        res += item;
    }
    return res;
}
// x 向 y 连一条标记为z的边
function addEdge(x, y, z){
    if(edges[x] == undefined) edges[x] = new Array();
    edges[x].push(new Edge(y, z));
}
// 判断两个set是否相等，元素类型是item
function equal(setA, setB) {
    // console.log(setA, setB);
    let temp = new Set(setA);
    for (let i of setB) {
        for(let j of temp) {
            if(i.equal(j)) temp.delete(j);
        }
    }
    return temp.size == 0;
}
//在items数组中定位item，不存在返回-1
function getItemsIndex(item){
    for(let i = 0; i < items.length; i++){
        if(equal(items[i], item)) return i;
    }
    return -1;
}
function existIn(I, next){
    for(let elem of I){
        if(elem.equal(next)) return true;
    }
    return false;
}
//BFS 求 I 的闭包 , I : set<Item> 类型
function closure(I){
    let q = new Array();
    for(let item of I){
        q.push(item);
    }
    while(q.length != 0){
        let now = q.shift(); // 获得队首元素，顺便出栈
        let next;
        let production_id = now.production_id;
        let pos = now.pos;
        let lookahead = now.lookahead;
        let production = productions[production_id].right;
        // 点的位置在最后，是规约项，跳过
        if(pos == production.length) continue;
        let ch = production[pos];
        // 如果是非终结符，跳过
        if(Terminal.indexOf(ch) != -1) continue;
        // 对 ch 的每个产生式
        for(let item of NT_productions[ch]){
            let index = productions.indexOf(item);
            // 如果后面只有一个字符, 那么搜索符不变, 否则搜索福是后面那个字符的First集合
            if(pos == production.length - 1){
                next = new Item(index, 0, lookahead);
            } else {
                next = new Item(index, 0, setToString(firstCollection[production[pos + 1]]));
            }
            // 如果I中已经有了，就跳过，否则加入队列
            if(existIn(I,next))continue;
            q.push(next);
            I.add(next);
        }
    }
    return I;
}
// I 项目集，沿 X 可以到达的项目集闭包
function goto(I, X){
    let J = new Set();
    for(let item of I){
        let production_id = item.production_id;
        let pos = item.pos;
        let lookahead = item.lookahead;
        let production = productions[production_id].right;
        if(production[pos] != X) continue;
        let next = new Item(production_id, pos + 1, lookahead);
        J.add(next);
    }
    // console.log(I);
    // console.log(X);
    // console.log(J);
    return closure(J);
}

// 得到所有项目集，并构成一个DFA
function getItems(){
    let q = new Array();
    let startItems = new Set();
    for(let item of NT_productions[Nonterminal[0]]){
        startItems.add(new Item(productions.indexOf(item), 0, "$"));
    }
    startItems = closure(startItems);
    // 将startItems 的编号设置为0，放入队列
    let count = 0;
    q.push(count ++);
    items = new Array();
    items.push(startItems);
    while(q.length != 0){
        let id = q.shift();
        let I = items[id];
        for(let ch of symbols){
            let nextItems = goto(I, ch);
            if(nextItems.size == null || nextItems.size == 0) continue;
            let nextId = getItemsIndex(nextItems);
            if(nextId == -1){
                nextId = count++;
                q.push(nextId);
                items.push(nextItems);
            }
            // console.log(id + " " + ch + " " + nextId);
            addEdge(id, nextId, ch);
        }
    }
}



function getParsingTable(){
    for(let i = 0; i < items.length; i++){
        if(edges[i] != undefined)
        for(let edge of edges[i]){
            if(Nonterminal.indexOf(edge.symbol) != -1) {
                trans.set(i + " " + edge.symbol, edge.ver);
            } else {
                actions.set(i + " " + edge.symbol, {
                    "type" : "s",
                    "target" : edge.ver
                });
            }
        }
        for(let item of items[i]){
            // console.log(item);
            if(item.pos == productions[item.production_id].right.length) { // 规约项目
                for(let j=0; j < item.lookahead.length; j++){
                    let ch = item.lookahead[j];
                    // console.log(ch);
                    // i -> ch, 规约 id
                    if(item.production_id == 0) {
                        actions.set(i + " " + ch, {
                            "type" : "Acc",
                            "target" : ""
                        });
                    } else {
                        actions.set(i + " " + ch, {
                            "type" : "r",
                            "target" : item.production_id
                        });
                    }
                }
            }
        }
    }
    // console.log(actions);
    // console.log(trans);
}
// 分析过程
function stackToString(stack){
    let res = "";
    for(let elem of stack) res += elem + " ";
    return res;     
}
function analysis(str){
    str += "$"
    let stack = new Array();
    stack.push(0);
    let i = 0; // str 的指针
    let res = new Array(); //  返回值，一个二维数组，res[i] 表示第 i 行要输出的三个内容
    res.push([
        stackToString(stack),
        str,
    ]);
    while(i < str.length){
        // console.log(stack);
        let a = str[i];
        let state = stack.slice(-1)[0];
        // console.log(state);
        // console.log(a);
        let ret = actions.get(state + " " + a);
        if(ret == undefined) {
            res[res.length-1].push("Error");
            break;
        }
        if(ret.type == "s"){
            stack.push(a);
            stack.push(ret.target);
            res[res.length-1].push("移进");
            i++;
        } else if(ret.type == "r"){
            let length = productions[ret.target].right.length;
            while(length--) {
                stack.pop();
                stack.pop();
            }
            let goto = trans.get(stack.slice(-1)[0] + " " + productions[ret.target].left);
            if(goto == undefined) {
                res[res.length-1].push("Error");
                break;
            }
            stack.push(productions[ret.target].left);
            stack.push(goto);
            res[res.length-1].push("按" + productions[ret.target].left + "->" + productions[ret.target].right + "规约");
        } else if(ret.type == "Acc") {
            res[res.length-1].push("接受");
            break;
        }
        res.push([
            stackToString(stack),
            str.slice(i)
        ]);
    }
    return res;
}

function getDepth(){
    let depth = new Array(items.length);
    let deg = new Array(items.length);
    let queue = new Array();
    let list = new Array();
    for(let i=0;i<depth.length;i++) depth[i] = -1,deg[i] = 0;
    for(let i=0;i<depth.length;i++){
        if(edges[i] != undefined)
        for(let item of edges[i]){
            if(item.ver != i)
                deg[item.ver] ++;
        }
    }
    depth[0] = 0;
    queue.push(0);
    // console.log(edges);
    while(queue.length){
        let x = queue.shift();
        list.push(x);
        if(edges[x] == undefined) continue;
        for(let item of edges[x]){ 
            if(item.ver == x) continue;
            if(--deg[item.ver] == 0){
                depth[item.ver] = depth[x] + 1;
                queue.push(item.ver);
            }
        }
    }
    return [depth, list];
}