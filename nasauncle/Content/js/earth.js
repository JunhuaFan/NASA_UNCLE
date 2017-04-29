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

//取得世界地圖 world.json (TopoJSON格式)
d3.json("/Content/data/world.json", function (world) {

    //取得『投影函式』
    //scale(300): 投影後的地圖大小
    //translate([300,300]):投影後的中心位置
    //clipAngel(90): 投影時，地球另一面的區塊略過不畫
    var projection = d3.geo.orthographic().scale(300).translate([300, 300]).clipAngle(90);

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

    //危險區座標.
    var dangerArea = {
        features: [{
            "type": "Feature",
            "properties": { "mag": 3, "time": 1430470821000 },
            "geometry": { "type": "Point", "coordinates": [139.92, 35.93, 11.5] }
        }, {
            "type": "Feature",
            "properties": { "mag": 3, "time": 1430470821000 },
            "geometry": { "type": "Point", "coordinates": [121.42, 25.17, 11.5] }
        }, {
            "type": "Feature",
            "properties": { "mag": 3, "time": 1430470821000 },
            "geometry": { "type": "Point", "coordinates": [110.3, 20.07, 11.5] }
        }, {
            "type": "Feature",
            "properties": { "mag": 3, "time": 1430470821000 },
            "geometry": { "type": "Point", "coordinates": [11.2, 42.44, 11.5] }
        }, {
            "type": "Feature",
            "properties": { "mag": 3, "time": 1430470821000 },
            "geometry": { "type": "Point", "coordinates": [-2.9, 53.35, 11.5] }
        }, {
            "type": "Feature",
            "properties": { "mag": 3, "time": 1430470821000 },
            "geometry": { "type": "Point", "coordinates": [146.93, -36.08, 11.5] }
        }, {
            "type": "Feature",
            "properties": { "mag": 3, "time": 1430470821000 },
            "geometry": { "type": "Point", "coordinates": [-74.2, 40.48, 11.5] }
        }, {
            "type": "Feature",
            "properties": { "mag": 3, "time": 1430470821000 },
            "geometry": { "type": "Point", "coordinates": [-122.8122, 47.22363, 11.5] }
        }, {
            "type": "Feature",
            "properties": { "mag": 3, "time": 1430470821000 },
            "geometry": { "type": "Point", "coordinates": [-56.2166666666667, -34.9166666666667, 11.5] }
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
            updateDangerAreaLocation();
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

    enlargeTime = enlargeTime - 1;
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

    //建立『危險區』的g群組.
    d3.select("#svg").selectAll("g.nowUserAxis").data(nowUserAxis.features)
        .enter().append("g").attr("class", "nowUserAxis");

    //在每個『『危險區』的g群組』後加一個『危險區的<path> tag』
    //=>執行到此行後, 己可在地球儀上看到N個黑點!
    var circleDangerArea = d3.select("#svg").selectAll("g.nowUserAxis").append("path");

    //顯示使用者所在位置經緯度
    showPosition(position);
}

//顯示使用者所在位置經緯度
function showPosition(position) {
    var m = document.getElementById("msg");
    m.innerHTML = "目前位置 緯度: " + position.coords.latitude +
                ", 經度: " + position.coords.longitude;
}

