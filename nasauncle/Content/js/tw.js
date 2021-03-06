$(document).ready(function () {
    console.log("ready!");

    //取得目前使用者所在位置經緯度
    getLocation();

});

//使用者所在座標
var userLatitude = 0;
var userLongitude = 0;

//取得世界地圖 world.json (TopoJSON格式)
d3.json("/Content/data/county2.json", function (county) {

    //取得行政區輪廓資料
    var features = topojson.feature(county, county.objects["COUNTY_MOI_1051214"]).features;

    //取得『投影函式』
    //scale(300): 投影後的地圖大小
    //translate([300,300]):投影後的中心位置
    //clipAngel(90): 投影時，地球另一面的區塊略過不畫
    var projection = d3.geo.mercator().center([121, 24]).scale(6000) // 座標變換函式

    //取得『轉換函式』: 功能為..將..『建立資料』轉換成『SVG Path 標籤』
    //var path = d3.geo.path().projection(projection);
    var path = d3.geo.path().projection( // 路徑產生器
        projection
    );

    d3.select("svg").selectAll("path").data(features)
        .enter().append("path").attr({
            "d": path,
            "stroke": function() { return "#bbb"; },
            "fill": function(d) { return "#ccc"; }
        });


    //危險區座標.
    var dangerArea = {
        features: [{
            "type": "Feature",
            "properties": { "mag": 5, "time": 1430470821000 },
            "geometry": { "type": "Point", "coordinates": [121.42, 25.17, 11.5] } //taipei
        }, {
            "type": "Feature",
            "properties": { "mag": 10, "time": 1430470821000 },
            "geometry": { "type": "Point", "coordinates": [121.17, 25.17, 11.5] } //taipei外海
        }, {
            "type": "Feature",
            "properties": { "mag": 15, "time": 1430470821000 },
            "geometry": { "type": "Point", "coordinates": [121, 22, 11.5] } //墾丁
        }]
    };

    //危險區的...圓形標示 (return 值是圓圈大小)
    var pathDangerArea = d3.geo.path().projection(projection)
        .pointRadius(function(it) {
            return parseFloat(it.properties.mag);
        });

    //建立『危險區』的g群組.
    d3.select("#svg").selectAll("g.dangerArea").data(dangerArea.features)
        .enter().append("g").attr("class", "dangerArea");

    //在每個『『危險區』的g群組』後加一個『危險區的<path> tag』
    //=>執行到此行後, 己可在地球儀上看到N個黑點!
    var circleDangerArea = d3.select("#svg").selectAll("g.dangerArea").append("path");

    //將『危險區的<path> tag』與『圓形標示』連結    
    var updateDangerAreaLocation = function() {
        circleDangerArea.attr({
            d: pathDangerArea,
            fill: "none",
            stroke: "#f00"
        });
    };

    //=>執行到此行後, N個黑點 己 改為 紅色圈圈.(但大小不會變, 原因還要查!)
    updateDangerAreaLocation();

    //放大
    $("#enlargeBtn").click(function() {
        //window.alert("enlargeBtn!");

        let width = $("#svg").attr("width");
        width = width.slice(0, -1);
        width = parseInt(width) + 10;
        $("#svg").attr("width", width + "%");
        //window.alert("width=" + $("#svg").attr("width"));

        let height = $("#svg").attr("height");
        height = height.slice(0, -1);
        height = parseInt(height) + 10;
        $("#svg").attr("height", height + "%");
        //window.alert("height=" + $("#svg").attr("height"));
    });

    //縮小
    $("#shrinkdownBtn").click(function() {
        //window.alert("shrinkdownBtn!");

        let width = $("#svg").attr("width");
        width = width.slice(0, -1);
        width = parseInt(width) - 10;
        $("#svg").attr("width", width + "%");
        //window.alert("width=" + $("#svg").attr("width"));

        let height = $("#svg").attr("height");
        height = height.slice(0, -1);
        height = parseInt(height) - 10;
        $("#svg").attr("height", height + "%");
        //window.alert("height=" + $("#svg").attr("height"));

    });

});

//取得目前使用者所在位置經緯度
function getLocation(defer) {
    if (navigator.geolocation) {//
        navigator.geolocation.getCurrentPosition(savePositionAndMarkOnEarth);//有拿到位置就呼叫 showPosition 函式
    } else {
        m.innerHTML = "您的瀏覽器不支援 顯示地理位置 API ，請使用其它瀏覽器開啟 這個網址";
    }
}

//取得使用者目前徑緯度並標示在地球上.
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

    //========================
    //建立『危險區』的g群組.
    d3.select("#svg").selectAll("g.nowUserAxis").data(nowUserAxis.features)
        .enter().append("g").attr("class", "nowUserAxis");

    //在每個『『危險區』的g群組』後加一個『危險區的<path> tag』
    //=>執行到此行後, 己可在地球儀上看到N個黑點!
    var circleDangerArea = d3.select("#svg").selectAll("g.nowUserAxis").append("path");
    //========================

    ////建立『危險區』的g群組.
    //d3.select("#svg").selectAll("g.dangerArea").data(dangerArea.features)
    //    .enter().append("g").attr("class", "dangerArea");

    ////在每個『『危險區』的g群組』後加一個『危險區的<path> tag』
    ////=>執行到此行後, 己可在地球儀上看到N個黑點!
    //var circleDangerArea = d3.select("#svg").selectAll("g.dangerArea").append("path");
    //========================


    //顯示使用者所在位置經緯度
    showPosition(position);
}

//顯示使用者所在位置經緯度
function showPosition(position) {
    var m = document.getElementById("msg");
    m.innerHTML = "目前位置 緯度: " + position.coords.latitude +
                ", 經度: " + position.coords.longitude;
}