/*==================================================
    DOM ELEMENTS
==================================================*/

const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");
const chatMessages = document.getElementById("chatMessages");

const navigateBtn = document.getElementById("navigateBtn");
const destinationInput = document.getElementById("destinationInput");
const navigationResult = document.getElementById("navigationResult");

const predictCrowdBtn = document.getElementById("predictCrowdBtn");
const crowdLocation = document.getElementById("crowdLocation");
const crowdResult = document.getElementById("crowdResult");

const buildingPanel = document.getElementById("buildingInfo");
const mapButtons = document.querySelectorAll(".map-btn");

const loader = document.getElementById("loader");
const toast = document.getElementById("toast");

const scrollTopBtn = document.getElementById("scrollTopBtn");

const floatingChat = document.getElementById("floatingChat");

const themeToggle = document.getElementById("themeToggle");

const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");

let crowdChart = null;

/*==================================================
    WINDOW LOADER
==================================================*/

window.addEventListener("load", () => {

    setTimeout(() => {

        loader.style.opacity = "0";

        loader.style.visibility = "hidden";

    }, 1000);

});

/*==================================================
    MOBILE MENU
==================================================*/

if(menuBtn){

    menuBtn.addEventListener("click",()=>{

        navLinks.classList.toggle("active");

    });

}

/*==================================================
    DARK MODE
==================================================*/

if(themeToggle){

    themeToggle.addEventListener("click",()=>{

        document.body.classList.toggle("dark-mode");

        const icon = themeToggle.querySelector("i");

        if(document.body.classList.contains("dark-mode")){

            icon.classList.remove("fa-moon");
            icon.classList.add("fa-sun");

            localStorage.setItem("theme","dark");

        }

        else{

            icon.classList.remove("fa-sun");
            icon.classList.add("fa-moon");

            localStorage.setItem("theme","light");

        }

    });

}

/* Restore Theme */

window.addEventListener("DOMContentLoaded",()=>{

    const savedTheme = localStorage.getItem("theme");

    if(savedTheme==="dark"){

        document.body.classList.add("dark-mode");

        themeToggle.innerHTML=
        '<i class="fa-solid fa-sun"></i>';

    }

});

/*==================================================
    SCROLL TO TOP
==================================================*/

window.addEventListener("scroll",()=>{

    if(window.scrollY>350){

        scrollTopBtn.style.display="block";

    }

    else{

        scrollTopBtn.style.display="none";

    }

});

scrollTopBtn.addEventListener("click",()=>{

    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

});

/*==================================================
    FLOATING CHAT BUTTON
==================================================*/

floatingChat.addEventListener("click",()=>{

    document.querySelector(".chatbot-panel")
    .scrollIntoView({

        behavior:"smooth"

    });

});

/*==================================================
    FEATURE CARD BUTTONS
==================================================*/

document.getElementById("chatCardBtn")
.addEventListener("click",()=>{

    document.querySelector(".chatbot-panel")
    .scrollIntoView({

        behavior:"smooth"

    });

});

document.getElementById("navigationCardBtn")
.addEventListener("click",()=>{

    document.querySelector(".navigation-card")
    .scrollIntoView({

        behavior:"smooth"

    });

});

document.getElementById("crowdCardBtn")
.addEventListener("click",()=>{

    document.querySelector(".crowd-card")
    .scrollIntoView({

        behavior:"smooth"

    });

});

/*==================================================
    TOAST NOTIFICATION
==================================================*/

function showToast(message){

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(()=>{

        toast.classList.remove("show");

    },3000);

}

/*==================================================
    CREATE CHAT MESSAGE
==================================================*/

function addMessage(message,type){

    const messageDiv=document.createElement("div");

    messageDiv.className=
    type==="user" ?
    "user-message":
    "bot-message";

    messageDiv.innerHTML=message.replace(/\n/g,"<br>");

    chatMessages.appendChild(messageDiv);

    chatMessages.scrollTop=
    chatMessages.scrollHeight;

}

/*==================================================
    TYPING INDICATOR
==================================================*/

function showTyping(){

    const typing=document.createElement("div");

    typing.className="typing";

    typing.id="typingIndicator";

    typing.innerHTML=`

        <span></span>

        <span></span>

        <span></span>

    `;

    chatMessages.appendChild(typing);

    chatMessages.scrollTop=
    chatMessages.scrollHeight;

}

function removeTyping(){

    const typing=
    document.getElementById("typingIndicator");

    if(typing){

        typing.remove();

    }

}

/*==================================================
    API HELPER
==================================================*/

async function postData(url,data){

    const response=await fetch(url,{

        method:"POST",

        headers:{

            "Content-Type":"application/json"

        },

        body:JSON.stringify(data)

    });

    return await response.json();

}

/*==================================================
    BUILDING BUTTON ACTIVE STATE
==================================================*/

mapButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        mapButtons.forEach(btn=>{

            btn.classList.remove("active");

        });

        button.classList.add("active");

    });

});

/*==================================================
    AI CHATBOT
==================================================*/

async function sendMessage(){

    const message = userInput.value.trim();

    if(message===""){

        showToast("Please enter a message.");

        return;

    }

    addMessage(message,"user");

    userInput.value="";

    showTyping();

    try{

        const data = await postData("/chat",{

            message:message

        });

        removeTyping();

        addMessage(data.response,"bot");

    }

    catch(error){

        console.error(error);

        removeTyping();

        addMessage(

            "Sorry! Unable to connect to the server.",

            "bot"

        );

        showToast("Server Error");

    }

}

/*==================================================
    SEND BUTTON
==================================================*/

sendBtn.addEventListener("click",sendMessage);

/*==================================================
    ENTER KEY SUPPORT
==================================================*/

userInput.addEventListener("keydown",(event)=>{

    if(event.key==="Enter"){

        event.preventDefault();

        sendMessage();

    }

});

/*==================================================
    INITIAL BOT MESSAGE
==================================================*/

window.addEventListener("DOMContentLoaded",()=>{

    if(chatMessages.children.length===0){

        addMessage(

`👋 Hello!

I'm your Campus Navigation Assistant.

You can ask me things like:

• Where is the library?

• Navigate to Cafeteria

• Tell me about Girls Hostel

• Is the Bank crowded?

• What departments are in Emerging Technology Complex?`,

"bot"

        );

    }

});

/*==================================================
    AUTO SCROLL CHAT
==================================================*/

const observer = new MutationObserver(()=>{

    chatMessages.scrollTop =

    chatMessages.scrollHeight;

});

observer.observe(chatMessages,{

    childList:true

});

/*==================================================
    CHAT SHORTCUT BUTTON
==================================================*/

floatingChat.addEventListener("click",()=>{

    document.querySelector(".chatbot-panel")

    .scrollIntoView({

        behavior:"smooth"

    });

    setTimeout(()=>{

        userInput.focus();

    },600);

});

/*==================================================
    CHAT CARD BUTTON
==================================================*/

const chatCard = document.getElementById("chatCardBtn");

if(chatCard){

    chatCard.addEventListener("click",()=>{

        document.querySelector(".chatbot-panel")

        .scrollIntoView({

            behavior:"smooth"

        });

        setTimeout(()=>{

            userInput.focus();

        },500);

    });

}

/*==================================================
    ESCAPE KEY
==================================================*/

document.addEventListener("keydown",(event)=>{

    if(event.key==="Escape"){

        userInput.blur();

    }

});

/*==================================================
    SMART NAVIGATION
==================================================*/

async function getDirections(){

    const destination = destinationInput.value.trim();

    if(destination===""){

        showToast("Enter a destination.");

        return;

    }

    navigationResult.innerHTML="Loading directions...";

    try{

        const data = await postData("/navigate",{

            destination:destination

        });

        navigationResult.innerHTML=data.route;

        showToast("Directions Loaded");

    }

    catch(error){

        console.error(error);

        navigationResult.innerHTML="Unable to fetch directions.";

    }

}

navigateBtn.addEventListener("click",getDirections);

destinationInput.addEventListener("keydown",(event)=>{

    if(event.key==="Enter"){

        getDirections();

    }

});

/*==================================================
    AI CROWD PREDICTION
==================================================*/



async function predictCrowd(){

    const location =
    document.getElementById("crowdLocation").value;

    const month =
    document.getElementById("crowdMonth").value;

    const day =
    parseInt(document.getElementById("crowdDay").value);

    const hour =
    parseInt(document.getElementById("crowdTime").value);

    const resultBox =
    document.getElementById("crowdResult");

    resultBox.innerHTML = "<p>Predicting crowd...</p>";

    try{

        const response = await fetch("/predict_crowd_dashboard",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                place:location,
                month:month,
                day:day,
                hour:hour

            })

        });

        const data = await response.json();

        let badgeClass="low";

        if(data.crowd_level==="Medium")
            badgeClass="medium";

        if(data.crowd_level==="High")
            badgeClass="high";

        resultBox.innerHTML=`

            <h3>Prediction Result</h3>

            <div class="crowd-level ${badgeClass}">

                ${data.crowd_level}

            </div>

            <div class="recommendation">

                ${data.recommendation}

            </div>

        `;

        drawCrowdGraph(data.hourly_prediction);

    }

    catch(error){

        console.log(error);

        resultBox.innerHTML=`

            <p>

                Unable to predict crowd.

            </p>

        `;

    }

}

document
.getElementById("predictCrowdBtn")
.addEventListener("click",predictCrowd);


/*==================================================
    DRAW GRAPH
==================================================*/

function drawCrowdGraph(values){

    const ctx=document
    .getElementById("crowdChart")
    .getContext("2d");

    if(crowdChart){

        crowdChart.destroy();

    }

    crowdChart=new Chart(ctx,{

        type:"line",

        data:{

            labels:[

                "9 AM",
                "10 AM",
                "11 AM",
                "12 PM",
                "1 PM",
                "2 PM",
                "3 PM",
                "4 PM",
                "5 PM"

            ],

            datasets:[{

                label:"Crowd Level",

                data:values,

                borderColor:"#2e7d32",

                backgroundColor:"rgba(46,125,50,.15)",

                borderWidth:3,

                fill:true,

                tension:.4,

                pointRadius:5

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            scales:{

                y:{

                    min:1,

                    max:3,

                    ticks:{

                        callback:function(value){

                            if(value==1)
                                return "Low";

                            if(value==2)
                                return "Medium";

                            if(value==3)
                                return "High";

                        }

                    }

                }

            }

        }

    });

}



/*==================================================
    LOAD DEFAULT GRAPH
==================================================*/

window.addEventListener(

    "load",

    ()=>{

        loadCrowdGraph(

            crowdLocation.value

        );

    }

);

/*==================================================
    BUILDING INFORMATION
==================================================*/

async function loadBuildingInfo(building){

    if(!buildingPanel) return;

    buildingPanel.innerHTML = `
        <p style="text-align:center;">
            Loading building information...
        </p>
    `;

    try{

        const response = await fetch(

            `/building_info/${encodeURIComponent(building)}`

        );

        if(!response.ok){

            throw new Error("Building not found");

        }

        const data = await response.json();

        let html = `

            <h3>${building}</h3>

        `;

        if(data.location){

            html += `

                <h4>📍 Location</h4>

                <p>${data.location}</p>

            `;

        }

        if(data.description){

            html += `

                <h4>🏢 Description</h4>

                <p>${data.description}</p>

            `;

        }

        if(data.contains){

            html += `

                <h4>📚 Contains</h4>

                <ul>

            `;

            data.contains.forEach(item=>{

                html += `<li>${item}</li>`;

            });

            html += `</ul>`;

        }

        buildingPanel.innerHTML = html;

    }

    catch(error){

        console.error(error);

        buildingPanel.innerHTML = `

            <h3>${building}</h3>

            <p>

                Information is not available.

            </p>

        `;

    }

}

/*==================================================
    MAP BUTTONS
==================================================*/

mapButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        const building =

        button.dataset.building;

        loadBuildingInfo(building);

        showToast(building);

    });

});

/*==================================================
    DEFAULT BUILDING
==================================================*/

window.addEventListener("load",()=>{

    if(mapButtons.length>0){

        const firstBuilding=

        mapButtons[0].dataset.building;

        loadBuildingInfo(firstBuilding);

        mapButtons[0].classList.add("active");

    }

});

/*==================================================
    SMOOTH NAVIGATION LINKS
==================================================*/

document.querySelectorAll('a[href^="#"]')

.forEach(anchor=>{

    anchor.addEventListener("click",(e)=>{

        e.preventDefault();

        const section=

        document.querySelector(

            anchor.getAttribute("href")

        );

        if(section){

            section.scrollIntoView({

                behavior:"smooth"

            });

        }

        if(navLinks){

            navLinks.classList.remove("active");

        }

    });

});

/*==================================================
    SIMPLE FADE ANIMATION
==================================================*/

const sections =

document.querySelectorAll(

    "section"

);

const revealObserver=

new IntersectionObserver(

(entries)=>{

    entries.forEach(entry=>{

        if(entry.isIntersecting){

            entry.target.classList.add(

                "fade-in"

            );

        }

    });

},

{

    threshold:0.15

}

);

sections.forEach(section=>{

    revealObserver.observe(section);

});

/*==================================================
    SEARCH SHORTCUTS
==================================================*/

if(destinationInput){

    destinationInput.setAttribute(

        "autocomplete",

        "off"

    );

}

if(userInput){

    userInput.setAttribute(

        "autocomplete",

        "off"

    );

}

/*==================================================
    CONSOLE MESSAGE
==================================================*/

console.log(

"Campus Navigation Assistant Loaded Successfully"

);

