/* ==========================================================
        CAMPUS NAVIGATION ASSISTANT
        map_v2.js
        PART 1 - MAP ENGINE FOUNDATION
========================================================== */

"use strict";

/* ==========================================================
                    MAP ENGINE
========================================================== */

const MapEngine = {

    /* ======================================================
                        MAP STATE
    ====================================================== */

    currentBuilding: null,

    currentFloor: 1,

    currentRoom: null,

    currentScale: 1,

    minScale: 0.5,

    maxScale: 4,

    zoomStep: 0.2,

    translateX: 0,

    translateY: 0,

    dragging: false,

    startX: 0,

    startY: 0,

    mapData: {},

    /* ======================================================
                        INITIALIZE
    ====================================================== */

    init() {

        this.cacheDOM();

        this.bindEvents();

        this.loadMapData();

        console.log("Map Engine Initialized");

    },

    /* ======================================================
                        CACHE DOM
    ====================================================== */

    cacheDOM() {

        this.mapContainer =
            document.querySelector("#mapContainer");

        this.mapImage =
            document.querySelector("#campusMap");

        this.floorSelector =
            document.querySelector("#floorSelector");

        this.buildingSelector =
            document.querySelector("#buildingSelector");

        this.zoomInButton =
            document.querySelector("#zoomIn");

        this.zoomOutButton =
            document.querySelector("#zoomOut");

        this.resetButton =
            document.querySelector("#resetMap");

        this.fullscreenButton =
            document.querySelector("#fullscreenMap");

        this.roomLayer =
            document.querySelector("#roomLayer");

    },

    /* ======================================================
                        EVENTS
    ====================================================== */

    bindEvents() {

        if (this.zoomInButton) {

            this.zoomInButton.addEventListener(

                "click",

                () => this.zoomIn()

            );

        }

        if (this.zoomOutButton) {

            this.zoomOutButton.addEventListener(

                "click",

                () => this.zoomOut()

            );

        }

        if (this.resetButton) {

            this.resetButton.addEventListener(

                "click",

                () => this.resetView()

            );

        }

        if (this.floorSelector) {

            this.floorSelector.addEventListener(

                "change",

                (event)=>{

                    this.changeFloor(event.target.value);

                }

            );

        }

        if (this.buildingSelector) {

            this.buildingSelector.addEventListener(

                "change",

                (event)=>{

                    this.changeBuilding(event.target.value);

                }

            );

        }

        if (this.mapImage) {

            this.mapImage.addEventListener(

                "wheel",

                (event)=>{

                    this.handleWheel(event);

                }

            );

        }

    },

    /* ======================================================
                        LOAD DATA
    ====================================================== */

    async loadMapData(){

        try{

            const response=

                await fetch(

                    "/static/data/maps/maps.json"

                );

            this.mapData=

                await response.json();

        }

        catch(error){

            console.error(

                "Unable to load map data.",

                error

            );

        }

    },

    /* ======================================================
                        BUILDING
    ====================================================== */

    changeBuilding(building){

        this.currentBuilding=building;

        console.log(

            "Building:",

            building

        );

    },

    /* ======================================================
                        FLOOR
    ====================================================== */

    changeFloor(floor){

        this.currentFloor=parseInt(floor);

        console.log(

            "Floor:",

            floor

        );

    },

    /* ======================================================
                        ZOOM
    ====================================================== */

    zoomIn(){

        this.currentScale=

        Math.min(

            this.maxScale,

            this.currentScale+

            this.zoomStep

        );

        this.updateTransform();

    },

    zoomOut(){

        this.currentScale=

        Math.max(

            this.minScale,

            this.currentScale-

            this.zoomStep

        );

        this.updateTransform();

    },

    handleWheel(event){

        event.preventDefault();

        if(event.deltaY<0){

            this.zoomIn();

        }

        else{

            this.zoomOut();

        }

    },

    /* ======================================================
                        RESET
    ====================================================== */

    resetView(){

        this.currentScale=1;

        this.translateX=0;

        this.translateY=0;

        this.updateTransform();

    },

    /* ======================================================
                        UPDATE
    ====================================================== */

    updateTransform(){

        if(!this.mapImage)

            return;

        this.mapImage.style.transform=

        `translate(${this.translateX}px,

        ${this.translateY}px)

        scale(${this.currentScale})`;

    }

};

/* ==========================================================
                    INITIALIZE
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        MapEngine.init();

    }

);

/* ==========================================================
                    END OF PART 1
========================================================== */

/* ==========================================================
        MAP_V2.JS
        PART 2 - MAP INTERACTION ENGINE
========================================================== */

Object.assign(MapEngine, {

/* ==========================================================
                DRAG SUPPORT
========================================================== */

initializeDragging(){

    if(!this.mapImage) return;

    this.mapImage.addEventListener("mousedown",(e)=>{

        this.dragging=true;

        this.startX=e.clientX-this.translateX;

        this.startY=e.clientY-this.translateY;

        this.mapImage.style.cursor="grabbing";

    });

    window.addEventListener("mousemove",(e)=>{

        if(!this.dragging) return;

        this.translateX=e.clientX-this.startX;

        this.translateY=e.clientY-this.startY;

        this.updateTransform();

    });

    window.addEventListener("mouseup",()=>{

        this.dragging=false;

        if(this.mapImage){

            this.mapImage.style.cursor="grab";

        }

    });

},

/* ==========================================================
                CURSOR ZOOM
========================================================== */

zoomAtPoint(mouseX,mouseY,direction){

    const previousScale=this.currentScale;

    if(direction>0){

        this.currentScale=Math.min(

            this.maxScale,

            this.currentScale+this.zoomStep

        );

    }

    else{

        this.currentScale=Math.max(

            this.minScale,

            this.currentScale-this.zoomStep

        );

    }

    const scale=this.currentScale/previousScale;

    this.translateX=

        mouseX-(mouseX-this.translateX)*scale;

    this.translateY=

        mouseY-(mouseY-this.translateY)*scale;

    this.updateTransform();

},

handleWheel(event){

    event.preventDefault();

    const rect=

        this.mapImage.getBoundingClientRect();

    const x=

        event.clientX-rect.left;

    const y=

        event.clientY-rect.top;

    if(event.deltaY<0){

        this.zoomAtPoint(x,y,1);

    }

    else{

        this.zoomAtPoint(x,y,-1);

    }

},

/* ==========================================================
                MAP IMAGE SWITCHING
========================================================== */

loadFloorMap(){

    if(

        !this.mapImage ||

        !this.currentBuilding

    ){

        return;

    }

    const image=

        `/static/maps/${this.currentBuilding}/floor_${this.currentFloor}.png`;

    this.mapImage.src=image;

    console.log(

        "Loaded:",

        image

    );

},

changeBuilding(building){

    this.currentBuilding=building;

    this.loadFloorMap();

},

changeFloor(floor){

    this.currentFloor=parseInt(floor);

    this.loadFloorMap();

},

/* ==========================================================
                ROOM MARKERS
========================================================== */

renderRoomMarkers(){

    if(!this.roomLayer) return;

    this.roomLayer.innerHTML="";

    if(

        !this.mapData.rooms ||

        !this.currentBuilding

    ){

        return;

    }

    const rooms=

        this.mapData.rooms.filter(room=>{

            return(

                room.building===this.currentBuilding &&

                room.floor===this.currentFloor

            );

        });

    rooms.forEach(room=>{

        const marker=

            document.createElement("div");

        marker.className="room-marker";

        marker.style.left=room.x+"px";

        marker.style.top=room.y+"px";

        marker.dataset.room=room.name;

        marker.title=room.name;

        marker.addEventListener("click",()=>{

            this.selectRoom(room);

        });

        this.roomLayer.appendChild(marker);

    });

},

/* ==========================================================
                ROOM SELECTION
========================================================== */

selectRoom(room){

    this.currentRoom=room;

    document

    .querySelectorAll(".room-marker")

    .forEach(marker=>{

        marker.classList.remove("active");

    });

    const selected=

        document.querySelector(

            `[data-room="${room.name}"]`

        );

    if(selected){

        selected.classList.add("active");

    }

    console.log(

        "Selected Room:",

        room.name

    );

},

/* ==========================================================
                REFRESH MAP
========================================================== */

refreshMap(){

    this.loadFloorMap();

    this.renderRoomMarkers();

}

});

/* ==========================================================
                INITIALIZE
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        MapEngine.initializeDragging();

        MapEngine.refreshMap();

    }

);

/* ==========================================================
                END OF PART 2
========================================================== */

/* ==========================================================
        MAP_V2.JS
        PART 3 - ROUTE ENGINE
========================================================== */

Object.assign(MapEngine, {

/* ==========================================================
                ROUTE STATE
========================================================== */

routeData: [],

currentRoute: null,

navigationSteps: [],

routeCanvas: null,

routeContext: null,

animationFrame: null,

/* ==========================================================
                INITIALIZE ROUTE ENGINE
========================================================== */

initializeRouteEngine(){

    this.routeCanvas=document.querySelector("#routeCanvas");

    if(!this.routeCanvas) return;

    this.routeContext=this.routeCanvas.getContext("2d");

    this.resizeCanvas();

    window.addEventListener(

        "resize",

        ()=>{

            this.resizeCanvas();

        }

    );

},

/* ==========================================================
                CANVAS
========================================================== */

resizeCanvas(){

    if(!this.routeCanvas) return;

    this.routeCanvas.width=

        this.mapContainer.clientWidth;

    this.routeCanvas.height=

        this.mapContainer.clientHeight;

},

clearRouteCanvas(){

    if(!this.routeContext) return;

    this.routeContext.clearRect(

        0,

        0,

        this.routeCanvas.width,

        this.routeCanvas.height

    );

},

/* ==========================================================
                LOAD ROUTES
========================================================== */

async loadRoutes(){

    try{

        const response=

            await fetch(

                "/static/data/routes.json"

            );

        this.routeData=

            await response.json();

    }

    catch(error){

        console.error(error);

    }

},

/* ==========================================================
                FIND ROUTE
========================================================== */

findRoute(start,end){

    const route=

        this.routeData.find(item=>{

            return(

                item.start===start &&

                item.end===end

            );

        });

    if(!route){

        console.warn("Route not found.");

        return;

    }

    this.currentRoute=route;

    this.navigationSteps=route.steps;

    this.drawRoute(route.points);

    this.showNavigationPanel();

},

/* ==========================================================
                DRAW ROUTE
========================================================== */

drawRoute(points){

    if(!this.routeContext) return;

    this.clearRouteCanvas();

    this.routeContext.beginPath();

    this.routeContext.lineWidth=6;

    this.routeContext.strokeStyle="#2563EB";

    this.routeContext.lineCap="round";

    this.routeContext.lineJoin="round";

    this.routeContext.moveTo(

        points[0].x,

        points[0].y

    );

    for(let i=1;i<points.length;i++){

        this.routeContext.lineTo(

            points[i].x,

            points[i].y

        );

    }

    this.routeContext.stroke();

    this.animateRoute(points);

},

/* ==========================================================
                ANIMATION
========================================================== */

animateRoute(points){

    if(!this.routeContext) return;

    let progress=0;

    const animate=()=>{

        progress+=2;

        if(progress>points.length){

            cancelAnimationFrame(

                this.animationFrame

            );

            return;

        }

        this.clearRouteCanvas();

        this.routeContext.beginPath();

        this.routeContext.lineWidth=6;

        this.routeContext.strokeStyle="#2563EB";

        this.routeContext.moveTo(

            points[0].x,

            points[0].y

        );

        for(

            let i=1;

            i<progress;

            i++

        ){

            this.routeContext.lineTo(

                points[i].x,

                points[i].y

            );

        }

        this.routeContext.stroke();

        this.animationFrame=

            requestAnimationFrame(

                animate

            );

    };

    animate();

},

/* ==========================================================
                MARKERS
========================================================== */

drawStartMarker(point){

    this.routeContext.beginPath();

    this.routeContext.fillStyle="#10B981";

    this.routeContext.arc(

        point.x,

        point.y,

        10,

        0,

        Math.PI*2

    );

    this.routeContext.fill();

},

drawEndMarker(point){

    this.routeContext.beginPath();

    this.routeContext.fillStyle="#EF4444";

    this.routeContext.arc(

        point.x,

        point.y,

        10,

        0,

        Math.PI*2

    );

    this.routeContext.fill();

},

/* ==========================================================
                NAVIGATION PANEL
========================================================== */

showNavigationPanel(){

    const panel=

        document.querySelector(

            "#navigationPanel"

        );

    if(!panel) return;

    panel.innerHTML="";

    this.navigationSteps.forEach(step=>{

        const item=

            document.createElement("div");

        item.className="nav-step";

        item.innerHTML=`

            <strong>${step.title}</strong>

            <p>${step.description}</p>

        `;

        panel.appendChild(item);

    });

},

/* ==========================================================
                CLEAR ROUTE
========================================================== */

removeRoute(){

    this.currentRoute=null;

    this.navigationSteps=[];

    this.clearRouteCanvas();

    const panel=

        document.querySelector(

            "#navigationPanel"

        );

    if(panel){

        panel.innerHTML="";

    }

}

});

/* ==========================================================
                INITIALIZE
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        MapEngine.initializeRouteEngine();

        MapEngine.loadRoutes();

    }

);

/* ==========================================================
                END OF PART 3
========================================================== */

/* ==========================================================
        MAP_V2.JS
        PART 4 - ADVANCED MAP FEATURES
========================================================== */

Object.assign(MapEngine,{

/* ==========================================================
                USER LOCATION
========================================================== */

userLocation:null,

locationMarker:null,

showUserLocation(x,y){

    this.userLocation={x,y};

    this.renderUserMarker();

},

renderUserMarker(){

    if(!this.roomLayer || !this.userLocation) return;

    if(this.locationMarker){

        this.locationMarker.remove();

    }

    this.locationMarker=document.createElement("div");

    this.locationMarker.className="user-location-marker";

    this.locationMarker.style.left=this.userLocation.x+"px";

    this.locationMarker.style.top=this.userLocation.y+"px";

    this.locationMarker.title="Your Location";

    this.roomLayer.appendChild(this.locationMarker);

},

/* ==========================================================
                SEARCH ROOM
========================================================== */

searchRoom(roomName){

    if(!this.mapData.rooms) return;

    const room=this.mapData.rooms.find(r=>

        r.name.toLowerCase()===

        roomName.toLowerCase()

    );

    if(!room){

        console.warn("Room not found.");

        return;

    }

    this.changeBuilding(room.building);

    this.changeFloor(room.floor);

    setTimeout(()=>{

        this.highlightRoom(room);

    },300);

},

highlightRoom(room){

    this.selectRoom(room);

    this.centerOnPoint(room.x,room.y);

},

/* ==========================================================
                CENTER MAP
========================================================== */

centerOnPoint(x,y){

    if(!this.mapContainer) return;

    const width=this.mapContainer.clientWidth;

    const height=this.mapContainer.clientHeight;

    this.translateX=

        width/2-(x*this.currentScale);

    this.translateY=

        height/2-(y*this.currentScale);

    this.updateTransform();

},

/* ==========================================================
                AUTO CENTER ROUTE
========================================================== */

centerOnRoute(){

    if(!this.currentRoute) return;

    const points=this.currentRoute.points;

    if(!points.length) return;

    let totalX=0;

    let totalY=0;

    points.forEach(point=>{

        totalX+=point.x;

        totalY+=point.y;

    });

    this.centerOnPoint(

        totalX/points.length,

        totalY/points.length

    );

},

/* ==========================================================
                FULLSCREEN
========================================================== */

toggleFullscreen(){

    if(!this.mapContainer) return;

    if(!document.fullscreenElement){

        this.mapContainer.requestFullscreen();

    }

    else{

        document.exitFullscreen();

    }

},

/* ==========================================================
                EXPORT MAP
========================================================== */

exportMap(){

    if(!this.mapContainer) return;

    html2canvas(this.mapContainer)

    .then(canvas=>{

        const link=document.createElement("a");

        link.download="campus-map.png";

        link.href=canvas.toDataURL();

        link.click();

    });

},

/* ==========================================================
                FAVORITES
========================================================== */

favorites:[],

addFavorite(room){

    if(

        this.favorites.includes(room)

    ) return;

    this.favorites.push(room);

    console.log(

        "Favorite Added:",

        room

    );

},

removeFavorite(room){

    this.favorites=

    this.favorites.filter(

        item=>item!==room

    );

},

showFavorites(){

    console.table(

        this.favorites

    );

},

/* ==========================================================
                MINI MAP
========================================================== */

initializeMiniMap(){

    const mini=

        document.querySelector(

            "#miniMap"

        );

    if(!mini) return;

    mini.addEventListener("click",()=>{

        this.resetView();

    });

},

/* ==========================================================
                SHORTCUTS
========================================================== */

initializeKeyboard(){

    document.addEventListener(

        "keydown",

        (event)=>{

            switch(event.key){

                case "+":

                    this.zoomIn();

                    break;

                case "-":

                    this.zoomOut();

                    break;

                case "0":

                    this.resetView();

                    break;

                case "f":

                    this.toggleFullscreen();

                    break;

            }

        }

    );

},

/* ==========================================================
                INITIALIZE ADVANCED
========================================================== */

initializeAdvancedFeatures(){

    this.initializeMiniMap();

    this.initializeKeyboard();

}

});

/* ==========================================================
                INITIALIZE
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        MapEngine.initializeAdvancedFeatures();

    }

);

/* ==========================================================
                END OF PART 4
========================================================== */

/* ==========================================================
        MAP_V2.JS
        PART 5 - FINAL MAP ENGINE
========================================================== */

Object.assign(MapEngine,{

/* ==========================================================
                MAP CACHE
========================================================== */

mapCache:{},

preloadMaps(){

    if(!this.mapData.maps) return;

    this.mapData.maps.forEach(map=>{

        const img=new Image();

        img.src=map.image;

        this.mapCache[map.image]=img;

    });

},

/* ==========================================================
                TOUCH SUPPORT
========================================================== */

touchStartDistance:0,

initializeTouchSupport(){

    if(!this.mapContainer) return;

    this.mapContainer.addEventListener(

        "touchstart",

        this.handleTouchStart.bind(this),

        {passive:false}

    );

    this.mapContainer.addEventListener(

        "touchmove",

        this.handleTouchMove.bind(this),

        {passive:false}

    );

},

handleTouchStart(event){

    if(event.touches.length===2){

        this.touchStartDistance=

            this.getTouchDistance(

                event.touches

            );

    }

},

handleTouchMove(event){

    if(event.touches.length!==2)

        return;

    event.preventDefault();

    const distance=

        this.getTouchDistance(

            event.touches

        );

    if(distance>

        this.touchStartDistance){

        this.zoomIn();

    }

    else{

        this.zoomOut();

    }

    this.touchStartDistance=

        distance;

},

getTouchDistance(touches){

    const dx=

        touches[0].clientX-

        touches[1].clientX;

    const dy=

        touches[0].clientY-

        touches[1].clientY;

    return Math.sqrt(

        dx*dx+dy*dy

    );

},

/* ==========================================================
                OVERLAYS
========================================================== */

overlayVisible:true,

toggleOverlay(){

    const overlay=

        document.querySelector(

            "#roomLayer"

        );

    if(!overlay) return;

    this.overlayVisible=

        !this.overlayVisible;

    overlay.style.display=

        this.overlayVisible

        ?"block"

        :"none";

},

/* ==========================================================
                RESPONSIVE
========================================================== */

initializeResponsive(){

    window.addEventListener(

        "resize",

        ()=>{

            this.resizeCanvas();

            this.updateTransform();

        }

    );

},

/* ==========================================================
                RESET MAP
========================================================== */

resetEverything(){

    this.currentScale=1;

    this.translateX=0;

    this.translateY=0;

    this.currentFloor=1;

    this.currentRoom=null;

    this.currentRoute=null;

    this.updateTransform();

    this.clearRouteCanvas();

},

/* ==========================================================
                PERFORMANCE
========================================================== */

optimizeRendering(){

    if(this.mapImage){

        this.mapImage.style.willChange=

            "transform";

    }

},

/* ==========================================================
                DEBUG
========================================================== */

showDebug(){

    console.table({

        Building:

            this.currentBuilding,

        Floor:

            this.currentFloor,

        Scale:

            this.currentScale,

        TranslateX:

            this.translateX,

        TranslateY:

            this.translateY,

        Room:

            this.currentRoom

    });

},

/* ==========================================================
                FINAL INITIALIZATION
========================================================== */

initializeFinal(){

    this.preloadMaps();

    this.initializeTouchSupport();

    this.initializeResponsive();

    this.optimizeRendering();

    console.log(

        "%cInteractive Campus Map Ready",

        "color:#2563EB;font-size:18px;font-weight:bold;"

    );

}

});

/* ==========================================================
                START FINAL ENGINE
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        MapEngine.initializeFinal();

    }

);

/* ==========================================================
                APP CONNECTION
========================================================== */

window.MapEngine=MapEngine;

/* ==========================================================
                END OF MAP_V2.JS
========================================================== */
