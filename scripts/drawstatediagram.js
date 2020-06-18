total = 0;
// 将项目内容添加到divNode中
function addItemContentToItemNode(divNode, index){
    let preNode = document.createElement('pre');
    preNode.className = "item-node";
    let set = items[index];
    // console.log(set);
    let itemIndex = 0;
    let MaxLength = 0;
    set.forEach((item)=>{
        preNode.appendChild(element('i',
            itemIndex == 0 ?
            ['I', element('sub', index), ' '] :
            undefined
        ));
        itemIndex ++;
        itemNodes(item).forEach(itemNode=>{
            preNode.appendChild(itemNode);
        })
        if(itemIndex !== set.length - 1) {
            preNode.appendChild(document.createElement('br'));
        }
        MaxLength = Math.max(MaxLength, productions[item.production_id].right.length);
    });
    divNode.innerHTML = '';
    divNode.appendChild(preNode);
    divNode.style.width = (MaxLength + 6) * 30 + "px";
    divNode.style.height = (set.size) * 24 + 5 + "px";
}
// 创建div
function drawStateDiagram(){
    let container = document.getElementById("parse-state-container");
    container.innerHTML = "";
    container.style.width = "100%";
    total ++;
    let itemCounts = items.length;
    let temp = getDepth();
    let depth = temp[0]; // 每个点的depth
    let list = temp[1]; // 拓扑序排序之后
    let colNum = new Array(itemCounts);

    for(let i = 0; i < itemCounts; i++)colNum[i] = 0;
    for(let i = 0; i < itemCounts; i ++){
        let id = list[i];
        let x = depth[id];
        let y = colNum[x] ++;
        x = x * 300 + 100;
        y = y * 300 + 100;
        let div = document.createElement("div");
        addItemContentToItemNode(div, id);
        div.className = "item";
        div.style.left = x + "px";
        div.style.top = y + "px";
        div.id = "item_" +total+id;
        container.appendChild(div);
    }
    container.style.height = Math.max(...colNum) * 350 + "px";
    drawStateLine();
}
// 绘制边
function drawStateLine(){
    let itemCounts = items.length;
    jsPlumb.ready(function () {
        let common = {
            paintStyle: { stroke: 'lightgray', strokeWidth: 5 },
            connector : ['StateMachine'],
            endpointStyle: { fill: 'lightgray', outlineStroke: 'darkgray', outlineWidth: 1 },
            maxConnections: -1
        }

        jsPlumb.importDefaults({
            DragOptions : { cursor: "crosshair" },
            Endpoints : [ [ "Dot", { radius:0.01 } ], [ "Dot", { radius:0.01 } ] ],
            ConnectionsDetachable: false
        });

        for(let i = 0; i < itemCounts; i++){
            if(edges[i] == undefined) continue;
            for(let edge of edges[i]){
                let ver = edge.ver;
                let symbol = edge.symbol;
                jsPlumb.connect({
                    source: 'item_' +total+ i,
                    target: 'item_' +total+ ver,
                    anchor: "Continuous",
                    overlays: [
                        ['PlainArrow', { width: 30, length: 30, location: 0.5 }],
                        ['Label', { label:symbol, id:"symbol_" + symbol, cssClass:"item-node-label-font"}]
                    ]
                },common)
            }
        }

        for(let i = 0; i < itemCounts; i++){
            jsPlumb.draggable('item_' + total + i);
        }
    });
}