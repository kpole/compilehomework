
function addItemContentToItemNode(divNode, index){
    let preNode = document.createElement('pre');
    preNode.className = "item-node";
    let set = items[index];
    console.log(set);
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

function drawStateDiagram(){

    let container = document.getElementById("parse-state-container");
    
    container.innerHTML = "";
    container.style.width = "100%";

    let itemCounts = items.length;
    let temp = getDepth();
    let depth = temp[0]; // 每个点的depth
    let list = temp[1]; // 拓扑序排序之后
    let corrdinate = new Array(itemCounts);
    let colNum = new Array(itemCounts);
    console.log(edges);
    console.log(depth);
    console.log(items);
    console.log(list);

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
        div.id = "item_" + id;
        container.appendChild(div);
    }



    jsPlumb.ready(function () {

        let common = {
            paintStyle: { stroke: 'lightgray', strokeWidth: 12 },
            connector : ['StateMachine'],
            endpointStyle: { fill: 'lightgray', outlineStroke: 'darkgray', outlineWidth: 1 },
            maxConnections: -1
        }

        jsPlumb.importDefaults({
            PaintStyle : {
                strokeWidth:12,
                stroke: 'rgba(200,220,200,0.8)'
            },
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
                    source: 'item_' + i,
                    target: 'item_' + ver,
                    anchor: "Continuous",
                    overlays: [
                        ['Arrow', { width: 40, length: 30, location: 0.5 }],
                        ['Label', { label:symbol, id:"symbol_" + symbol, cssClass:"item-node-label-font"}]
                    ]
                },common)
            }
        }

        // jsPlumb.connect({
        //     source: 'item_left',
        //     target: 'item_right',
        //     paintStyle: { stroke: 'lightgray', strokeWidth: 3 },
        //     anchor: ['Left', 'Right'],
        //     connector : ['StateMachine'],
        //     endpointStyle: { fill: 'lightgray', outlineStroke: 'darkgray', outlineWidth: 2 },
        //     overlays: [['Arrow', { width: 12, length: 12, location: 0.95 }]]
        // })

        for(let i = 0; i < itemCounts; i++){
            jsPlumb.draggable('item_' + i);
        }
    });
    container.style.height = Math.max(...colNum) * 350 + "px";
}




// function drawStateDiagram(){
//     let container = document.getElementById("parse-state-container");
//     container.innerHTML = "";
    
//     let canvas = document.createElement("canvas");
//     let itemCounts = items.length;
//     let item = getDepth();
//     let depth = item[0]; // 每个点的depth
//     let list = item[1]; // 拓扑序排序之后
//     let corrdinate = new Array(itemCounts);
//     let colNum = new Array(itemCounts);
//     // console.log(depth);
//     // console.log(list);
//     console.log(edges);
//     console.log(depth);
//     console.log(items);
//     console.log(list);

//     for(let i = 0; i < itemCounts; i++)colNum[i] = 0;
//     for(let i = 0; i < itemCounts; i ++){
//         let id = list[i];
//         let x = depth[id];
//         let y = colNum[x] ++;
//         corrdinate[id] = [x * 200 + 100, y * 200 + 100];
//     }
//     console.log(corrdinate);
//     // console.log(Math.max(...depth));
//     // console.log(Math.max(...colNum));
//     canvas.width = Math.max(...depth) * 200 + 200;
//     canvas.height = Math.max(...colNum) * 200 + 200;
//     // 按照拓扑序去画？对！，生成过程也是，
//     DrawCircle(canvas, 100, 100, 50, 30, 15, '#ddd', '#32CD32', '#32CD32', 0);
//     // console.log(corrdinate);
//     for(let i = 0; i < itemCounts; i ++){
//         let stpoint = corrdinate[i];
//         if(edges[i] != undefined){
//             for(let edge of edges[i]){
//                 let edpoint = corrdinate[edge.ver];
//                 DrawCircle(canvas, edpoint[0], edpoint[1], 50, 30, 15, '#ddd', '#32CD32', '#32CD32', edge.ver);
//                 DrawLine(canvas, [stpoint[0] + 50, stpoint[1]], [edpoint[0] - 50, edpoint[1]], "5px", "gray", edge.symbol, "30px", "Georgia");      
//             }
//         }
//     }
//     // console.log(corrdinate);

//     container.appendChild(canvas);
// }