$(document).ready(function () {
    console.log("ready!");

    //取得目前使用者所在位置經緯度
    getLocation();
});

//記錄放大縮小倍數
let enlargeTime = 0;

//使用者所在座標
var userLatitude = 0;
var userLongitude = 0;

//危險區域資料
let dangerAreaData;

//取得世界地圖 world.json (TopoJSON格式)
d3.json("/Content/data/world.json", function (world) {

    //取得『投影函式』
    //scale(300): 投影後的地圖大小
    //translate([300,300]):投影後的中心位置
    //clipAngel(90): 投影時，地球另一面的區塊略過不畫
    let projection = d3.geo.orthographic().scale(300).translate([300, 300]).clipAngle(90);

    //取得『轉換函式』: 功能為..將..『建立資料』轉換成『SVG Path 標籤』
    var path = d3.geo.path().projection(projection);

    ///使用topojson這個工具, 由『世界地圖 world.json』取出各國邊際線集合.
    var countries = topojson.feature(world, world.objects.countries).features;

    //取得d3的色碼表
    var color = d3.scale.category20();

    //印出『各國邊際線集合』
    console.log(countries);

    //在svg上畫『各國邊際線』(path的d屬性代表路徑資料)
    //參考網址: http://www.oxxostudio.tw/articles/201406/svg-04-path-1.html
    var polygon = d3.select("#svg").selectAll("path").data(countries)
        .enter().append("path").attr({
            "d": path,
            "stroke": function() { return "#bbb"; },
            "fill": function(d) { return "#ccc"; }
        });

    //==============
    //原畫危險區程式碼
    //==============

    //當有托拉地球儀時, 進行旋轉.
    d3.select("#svg").call(d3.behavior.drag()
        .origin(function() {
            r = projection.rotate();
            return { x: r[0], y: -r[1] };
        })
        .on("drag", function() {
            rotate = projection.rotate();
            projection.rotate([d3.event.x, -d3.event.y, rotate[2]]);
            d3.select("#svg").selectAll("path").attr("d", path);
            //updateDangerAreaLocation(dangerAreaData);
        }));
});

//放大
$("#enlargeBtn").click(function() {
    //window.alert("enlargeBtn!");

    let widthPixOrg = $("#svg").prop("width").animVal.value;
    widthPixNew = parseInt(widthPixOrg) * 1.2;
    $("#svg").attr("width", widthPixNew + "px");
    $("#svg").css("margin-left", parseInt($("#svg").css("margin-left")) - (widthPixOrg * 0.1) + "px");


    let heightPixOrg = $("#svg").prop("height").animVal.value;
    heightPixNew = parseInt(heightPixOrg) * 1.2;
    $("#svg").attr("height", heightPixNew + "px");
    $("#svg").css("margin-top", parseInt($("#svg").css("margin-top")) - (heightPixOrg * 0.1) + "px");
    $("#svg").css("margin-bottom", parseInt($("#svg").css("margin-bottom")) - (heightPixOrg * 0.1) + "px");

    enlargeTime = enlargeTime + 1;    
});

//縮小
$("#shrinkdownBtn").click(function() {
    //window.alert("shrinkdownBtn!");

    if (enlargeTime <= 0) {
        return;
    }

    let widthPixOrg = $("#svg").prop("width").animVal.value;
    widthPixNew = parseInt(widthPixOrg) / 1.2;
    $("#svg").attr("width", widthPixNew + "px");
    $("#svg").css("margin-left", parseInt($("#svg").css("margin-left")) + ((widthPixOrg/1.2) * 0.1) + "px");

    let heightPixOrg = $("#svg").prop("height").animVal.value;
    heightPixNew = parseInt(heightPixOrg) / 1.2;
    $("#svg").attr("height", heightPixNew + "px");
    $("#svg").css("margin-top", parseInt($("#svg").css("margin-top")) + ((heightPixOrg / 1.2) * 0.1) + "px");
    $("#svg").css("margin-bottom", parseInt($("#svg").css("margin-bottom")) + ((heightPixOrg / 1.2) * 0.1) + "px");

    enlargeTime = enlargeTime - 1;
});

//取得目前使用者所在位置經緯度
function getLocation() {
    //if (navigator.geolocation) {//
    //    navigator.geolocation.getCurrentPosition(savePositionAndMarkOnEarth);//有拿到位置就呼叫 showPosition 函式
    //} else {
    //    m.innerHTML = "您的瀏覽器不支援 顯示地理位置 API ，請使用其它瀏覽器開啟 這個網址";
    //}
    let position = {coords: {}};
    position.coords.latitude = 25.021743299999997;
    position.coords.longitude = 121.53536629999999;
    savePositionAndMarkOnEarth(position);
}

//將使用者目前徑緯度標示在地球上.
function savePositionAndMarkOnEarth(position) {

    //緯度 (Latitude)
    userLatitude = position.coords.latitude;

    //經度 (Longitude)
    userLongitude = position.coords.longitude;

    //目前使用者座標點.
    var nowUserAxis = {
        features: [{
            "type": "Feature",
            "properties": { "mag": 3, "time": 1430470821000 },
            "geometry": { "type": "Point", "coordinates": [userLongitude, userLatitude, 11.5] }
        }]
    };

    //建立『目前使用者』的g群組.
    d3.select("#svg").selectAll("g.nowUserAxis").data(nowUserAxis.features)
        .enter().append("g").attr("class", "nowUserAxis");

    //在每個『『目前使用者』的g群組』後加一個『目前使用者的<path> tag』
    //=>執行到此行後, 己可在地球儀上看到N個黑點!
    var circleDangerArea = d3.select("#svg").selectAll("g.nowUserAxis").append("path");

    //顯示使用者所在位置經緯度
    showPosition(position);

    //取得危險資料.
    getDangerAreaData();
}

//顯示使用者所在位置經緯度
function showPosition(position) {
    var m = document.getElementById("msg");
    m.innerHTML = "<center>目前位置</center><center>緯度: " + position.coords.latitude +
                "  </center><center>經度: " + position.coords.longitude + "</center>";
}


//取得危險區資料
function getDangerAreaData() {

    //let dangerAreaData;

    $.get("http://52.220.233.218/Resource/getData",
            {},
            function (dataStr) {
                var data = JSON.parse(dataStr);
                dangerAreaData = data;

                //在地球上畫出危險區.
                drawDangerArea(dangerAreaData);
            });
    
    //$.ajax({
    //    url: "http://52.220.233.218/Resource/getData",
    //    type: "GET",
    //    dataType: 'json',
    //    async: false,
    //    success: function (data, textStatus, jqXHR) {

    //        //data - response from server
    //        console.log(data);

    //        dangerAreaData = data;
    //    },
    //    error: function (jqXHR, textStatus, errorThrown) {

    //    }
    //});

    //return dangerAreaData;

}

//畫出危險區域
function drawDangerArea(dangerAreaData) {

    dangerAxisData = {
        features: []
    }

    //將dangerAreaData轉為AxisData
    for (var i = 0; i < dangerAreaData.length; i++) {

        dangerAxisData.features.push(
            {
                "type": "Feature",
                "properties": { "mag": 3, "time": 1430470821000 },
                "geometry": { "type": "Point", "coordinates": [dangerAreaData[i].Longitude, dangerAreaData[i].Latitude, 11.5] }
            }
        );
    }

    //取得『投影函式』
    //scale(300): 投影後的地圖大小
    //translate([300,300]):投影後的中心位置
    //clipAngel(90): 投影時，地球另一面的區塊略過不畫
    let projection = d3.geo.orthographic().scale(300).translate([300, 300]).clipAngle(90);

    //危險區的...圓形標示 (return 值是圓圈大小)
    var pathDangerArea = d3.geo.path().projection(projection)
        .pointRadius(function (it) {
            return parseFloat(it.properties.mag);
        });

    //建立『危險區』的g群組.
    d3.select("#svg").selectAll("g.dangerArea").data(dangerAxisData.features)
        .enter().append("g").attr("class", "dangerArea");

    //在每個『『危險區』的g群組』後加一個『危險區的<path> tag』
    //=>執行到此行後, 己可在地球儀上看到N個黑點!
    var circleDangerArea = d3.select("#svg").selectAll("g.dangerArea").append("path");

    //將『危險區的<path> tag』與『圓形標示』連結    
    var updateDangerAreaLocation = function () {
        circleDangerArea.attr({
            d: pathDangerArea,
            fill: "none",
            stroke: "#f00"
        });
    };

    //=>執行到此行後, N個黑點 己 改為 紅色圈圈.(但大小不會變, 原因還要查!)
    updateDangerAreaLocation();

    //顯示吉兇資料表.
    showGoodBadTable(dangerAreaData);
}

//顯示吉兇資料表.
function showGoodBadTable(dangerAreaData) {

    for (let i = 0; i < dangerAreaData.length; i++) {

        //經度
        if (
                (
                    ((userLatitude - 5) < dangerAreaData[i].Latitude) &&
                    ((userLatitude + 5) > dangerAreaData[i].Latitude)
                )
                &&
                (
                    ((userLongitude - 5) < dangerAreaData[i].Longitude) &&
                    ((userLongitude + 5) > dangerAreaData[i].Longitude)
                )
            ) {

            let goodThingString = "";
            for (let j=0; j< dangerAreaData[i].good.length; j++){
                goodThingString = goodThingString + "<span class=\"label label-success\">" + dangerAreaData[i].good[j] + "</span>";
            }

            let badThingString = "";
            for (let j=0; j< dangerAreaData[i].bad.length; j++){
                badThingString = badThingString + "<span class=\"label label-danger\">" + dangerAreaData[i].bad[j] + "</span>";
            }

            let UVString = "";
            switch (dangerAreaData[i].UV){
                case 1:
                    UVString = "<span class=\"label label-success\">低量級</span>";
                    break;
                case 2:
                    UVString = "<span class=\"label label-success\">中量級</span>";
                    break;
                case 3:
                    UVString = "<span class=\"label label-warning\">高量級</span>";
                    break;
                case 4:
                    UVString = "<span class=\"label label-danger\">過量級</span>";
                    break;
                case 5:
                    UVString = "<span class=\"label label-danger\">危險級</span>";
                    break;
            }

            let htmlString =
                "<table width=\"100%\" border=\"1\">" +
                "    <tr>" +
                "        <td width=\"30%\">" +
                "            座標" +
                "        </td>" +
                "        <td width=\"70%\">" +
                "            <span class=\"label label-default\" >" + dangerAreaData[i].Latitude + "</span>" +
                "            <span class=\"label label-default\" >" + dangerAreaData[i].Longitude + "</span>" +
                "        </td>" +
                "    </tr>" +
                "    <tr>" +
                "        <td>" +
                "            宜" +
                "        </td>" +
                "        <td>" +
                goodThingString + 
                "        </td>" +
                "    </tr>" +
                "    <tr>" +
                "        <td>" +
                "            忌" +
                "        </td>" +
                "        <td>" +
                badThingString + 
                "        </td>" +
                "    </tr>" +
                "    <tr>" +
                "        <td>" +
                "            紫外線等級" +
                "        </td>" +
                "        <td>" +
                UVString +
                "        </td>" +
                "    </tr>" +
                "</table>";

            $("#goodBadTables").html($("#goodBadTables").html() + htmlString);
        }
    }
}