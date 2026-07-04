from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from groq import Groq

from crowd_prediction import predict_crowd

import os
import json

from datetime import datetime

###############################################################
# Flask App
###############################################################

app = Flask(__name__)

###############################################################
# Load Environment Variables
###############################################################

load_dotenv()

###############################################################
# Initialize Groq
###############################################################

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

###############################################################
# DATASET LOADER
###############################################################

def load_json(filename):

    path = os.path.join("data", filename)

    if not os.path.exists(path):

        print(f"Dataset not found : {filename}")

        return {}

    with open(path, "r", encoding="utf-8") as file:

        return json.load(file)

###############################################################
# Load Main Datasets
###############################################################

campus_data = load_json("campus_map.json")

building_info = load_json("building_info.json")

buildings = load_json("buildings.json")

departments = load_json("departments.json")

floor_maps = load_json("floor_maps.json")

rooms = load_json("rooms.json")

navigation_graph = load_json("navigation_graph.json")

landmarks = load_json("landmarks.json")

lifts = load_json("lifts.json")

stairs = load_json("stairs.json")

washrooms = load_json("washrooms.json")

entrances = load_json("entrances.json")

###############################################################
# Floor Datasets
###############################################################

ground_floor = load_json("etc/ground_floor.json")

first_floor = load_json("etc/first_floor.json")

second_floor = load_json("etc/second_floor.json")

third_floor = load_json("etc/third_floor.json")

fourth_floor = load_json("etc/fourth_floor.json")

fifth_floor = load_json("etc/fifth_floor.json")

sixth_floor = load_json("etc/sixth_floor.json")

###############################################################
# Navigation Graphs
###############################################################

ground_navigation = load_json("etc/ground_navigation.json")

first_navigation = load_json("etc/first_floor_navigation.json")

second_navigation = load_json("etc/second_floor_navigation.json")

third_navigation = load_json("etc/third_floor_navigation.json")

fourth_navigation = load_json("etc/fourth_floor_navigation.json")

fifth_navigation = load_json("etc/fifth_floor_navigation.json")

sixth_navigation = load_json("etc/sixth_floor_navigation.json")

###############################################################
# Combined Context for Chatbot
###############################################################

combined_context = {

    "campus_map": campus_data,

    "building_information": building_info,

    "buildings": buildings,

    "departments": departments,

    "rooms": rooms,

    "landmarks": landmarks,

    "lifts": lifts,

    "stairs": stairs,

    "washrooms": washrooms,

    "entrances": entrances

}

###############################################################
# Crowd Prediction Locations
###############################################################

CROWD_LOCATIONS = [

    "Library",

    "Cafeteria",

    "Admission Cell",

    "Fees Counter",

    "Bank",

    "Registrar Office",

    "Training and Placement Cell",

    "Computer Centre Lab 2",

    "Computer Centre Lab 3",

    "Girls Hostel"

]

###############################################################
# Helper Functions
###############################################################

def search_place(user_message):

    message = user_message.lower()

    for place, info in campus_data.items():

        if place.lower() in message:

            return place, info

    return None, None


###############################################################

def search_room(user_message):

    message = user_message.lower()

    for room, info in rooms.items():

        room_name = str(room).lower()

        if room_name in message:

            return room, info

        if isinstance(info, dict):

            if "name" in info:

                if info["name"].lower() in message:

                    return room, info

    return None, None


###############################################################

def search_department(user_message):

    message = user_message.lower()

    for department in departments.keys():

        if department.lower() in message:

            return department

    return None


###############################################################

def detect_crowd_query(message):

    keywords = [

        "crowd",

        "busy",

        "rush",

        "occupancy",

        "waiting",

        "queue"

    ]

    return any(

        word in message.lower()

        for word in keywords

    )

###############################################################

def get_current_datetime():

    now = datetime.now()

    return {

        "month": now.strftime("%B"),

        "hour": now.hour,

        "day": now.weekday()

    }

###############################################################

def predict_current_crowd(place):

    current = get_current_datetime()

    return predict_crowd(

        month=current["month"],

        place=place,

        hour=current["hour"],

        day=current["day"]

    )

###############################################################

def get_floor_data(floor):

    floors = {

        "ground": ground_floor,

        "ground floor": ground_floor,

        "first": first_floor,

        "first floor": first_floor,

        "second": second_floor,

        "second floor": second_floor,

        "third": third_floor,

        "third floor": third_floor,

        "fourth": fourth_floor,

        "fourth floor": fourth_floor,

        "fifth": fifth_floor,

        "fifth floor": fifth_floor,

        "sixth": sixth_floor,

        "sixth floor": sixth_floor

    }

    return floors.get(floor.lower())


###############################################################

def get_floor_map(floor):

    return floor_maps.get(floor)

###############################################################

def room_exists(room_name):

    return room_name in rooms

###############################################################

def navigation_exists(location):

    return location in navigation_graph

###############################################################

print("====================================")

print("Campus Navigation Assistant Loaded")

print("====================================")

print(f"Buildings Loaded : {len(buildings)}")

print(f"Rooms Loaded : {len(rooms)}")

print(f"Departments Loaded : {len(departments)}")

print(f"Landmarks Loaded : {len(landmarks)}")

print("Indoor Navigation Ready")

print("Crowd Prediction Ready")

print("Chatbot Ready")

print("====================================")

# =====================================================
# AI Recommendation
# =====================================================

def generate_recommendation(crowd_level):

    if crowd_level.lower() == "low":

        return "Excellent time to visit."

    elif crowd_level.lower() == "medium":

        return "Moderate crowd expected. You may experience a short waiting time."

    else:

        return "Avoid visiting now unless necessary. Peak crowd is expected."


###############################################################
# ROUTES
###############################################################

@app.route("/")
def home():
    return render_template("index.html")


###############################################################
# CAMPUS DATA API
###############################################################

@app.route("/campus-data")
def campus_data_route():
    return jsonify(campus_data)


###############################################################
# ROOM SEARCH API
###############################################################

@app.route("/room/<room_name>")
def room_search(room_name):

    room, info = search_room(room_name)

    if room is None:
        return jsonify({
            "success": False,
            "message": "Room not found."
        }),404

    return jsonify({
        "success": True,
        "room": room,
        "details": info
    })


###############################################################
# DEPARTMENT SEARCH API
###############################################################

@app.route("/department/<department_name>")
def department_search(department_name):

    department = search_department(department_name)

    if department is None:

        return jsonify({
            "success":False,
            "message":"Department not found."
        }),404

    return jsonify({

        "success":True,

        "department":department,

        "details":departments[department]

    })


###############################################################
# FLOOR INFORMATION API
###############################################################

@app.route("/floor/<floor>")
def floor_information(floor):

    floor_data = get_floor_data(floor)

    if floor_data is None:

        return jsonify({
            "success":False,
            "message":"Floor not found."
        }),404

    return jsonify(floor_data)


###############################################################
# FLOOR MAP API
###############################################################

@app.route("/floor-map/<floor>")
def floor_map(floor):

    image = get_floor_map(floor)

    if image is None:

        return jsonify({

            "success":False,

            "message":"Map not available."

        }),404

    return jsonify({

        "success":True,

        "image":image

    })


###############################################################
# CHATBOT
###############################################################

@app.route("/chat",methods=["POST"])
def chat():

    data = request.get_json()

    user_message = data.get("message","")

    ###########################################################
    # ROOM SEARCH
    ###########################################################

    room, room_info = search_room(user_message)

    if room:

        response = f"{room}\n\n"

        if isinstance(room_info,dict):

            if "name" in room_info:

                response += f"Name : {room_info['name']}\n"

            if "floor" in room_info:

                response += f"Floor : {room_info['floor']}\n"

            if "department" in room_info:

                response += f"Department : {room_info['department']}\n"

            if "type" in room_info:

                response += f"Type : {room_info['type']}\n"

        return jsonify({

            "response":response

        })


    ###########################################################
    # PLACE SEARCH
    ###########################################################

    place, place_info = search_place(user_message)

    if place:

        answer = f"{place}\n\n"

        if isinstance(place_info,dict):

            if "description" in place_info:

                answer += f"{place_info['description']}\n\n"

            if "location" in place_info:

                answer += f"Location : {place_info['location']}\n"

            if "contains" in place_info:

                answer += "\nContains:\n"

                for item in place_info["contains"]:

                    answer += f"• {item}\n"

            if "nearby" in place_info:

                answer += "\nNearby:\n"

                for item in place_info["nearby"]:

                    answer += f"• {item}\n"

        return jsonify({

            "response":answer

        })


    ###########################################################
    # CROWD PREDICTION
    ###########################################################

    if detect_crowd_query(user_message):

        selected_place = None

        for place in CROWD_LOCATIONS:

            if place.lower() in user_message.lower():

                selected_place = place

                break

        if selected_place:

            try:

                crowd = predict_current_crowd(selected_place)

                if crowd.lower()=="high":

                    advice="This place is expected to be crowded."

                elif crowd.lower()=="medium":

                    advice="Moderate crowd is expected."

                else:

                    advice="Crowd is expected to be low."

                return jsonify({

                    "response":

f"""
Location : {selected_place}

Predicted Crowd :

{crowd}

Recommendation :

{advice}
"""

                })

            except Exception as e:

                return jsonify({

                    "response":str(e)

                })


    ###########################################################
    # AI CHATBOT
    ###########################################################

    try:

        context = json.dumps(

            combined_context,

            indent=2

        )

        completion = client.chat.completions.create(

            model="llama-3.3-70b-versatile",

            temperature=0.2,

            messages=[

                {

                    "role":"system",

                    "content":f"""

You are the official Campus Navigation Assistant for Sri Guru Granth Sahib World University.

You ONLY answer questions related to:

• Campus Navigation

• Buildings

• Departments

• Classrooms

• Laboratories

• Offices

• Indoor Navigation

• Facilities

• Crowd Information

• Campus Services

Use ONLY the information below.

{context}

Rules:

1. Never invent information.

2. If information is unavailable, say:

"I do not have that information yet."

3. Give short answers.

4. Mention the floor whenever available.

5. Mention the building whenever available.

6. Be polite.

"""

                },

                {

                    "role":"user",

                    "content":user_message

                }

            ]

        )

        reply = completion.choices[0].message.content

        return jsonify({

            "response":reply

        })

    except Exception as e:

        return jsonify({

            "response":str(e)

        })

###############################################################
# BUILDING INFORMATION API
###############################################################

@app.route("/building_info/<building_name>")
def get_building_information(building_name):

    building_name = building_name.lower()

    for building, info in building_info.items():

        if building.lower() == building_name:

            return jsonify({

                "success": True,

                "building": building,

                "information": info

            })

    return jsonify({

        "success": False,

        "message": "Building not found."

    }),404


# =====================================================
# ADVANCED CROWD PREDICTION DASHBOARD
# =====================================================

@app.route("/predict_crowd_dashboard", methods=["POST"])
def predict_crowd_dashboard():

    try:

        data = request.get_json()

        place = data["place"]
        month = data["month"]
        hour = int(data["hour"])
        day = int(data["day"])

        # ----------------------------------
        # Current Prediction
        # ----------------------------------

        crowd = predict_crowd(
            month=month,
            place=place,
            hour=hour,
            day=day
        )

        recommendation = generate_recommendation(crowd)

        # ----------------------------------
        # Hourly Prediction (9 AM to 5 PM)
        # ----------------------------------

        hourly_prediction = []

        mapping = {
            "Low": 1,
            "Medium": 2,
            "High": 3
        }

        hourly_text = ""

        for h in range(9,18):

            level = predict_crowd(
                month=month,
                place=place,
                hour=h,
                day=day
            )

            hourly_prediction.append(mapping[level])

            hourly_text += f"{h}:00 -> {level}\n"

        # ----------------------------------
        # AI Insight using Groq
        # ----------------------------------

        prompt = f"""
You are an AI campus assistant.

Crowd Prediction Data

Location: {place}

Month: {month}

Day: {day}

Current Crowd: {crowd}

Hourly Predictions

{hourly_text}

Generate:

1. One short paragraph explaining the crowd pattern.

2. Three recommendations for students.

Keep the response under 120 words.
"""

        completion = client.chat.completions.create(

            model="llama-3.3-70b-versatile",

            messages=[

                {
                    "role":"system",
                    "content":"You are an intelligent campus analytics assistant."
                },

                {
                    "role":"user",
                    "content":prompt
                }

            ],

            temperature=0.3

        )

        insight = completion.choices[0].message.content

        return jsonify({

            "crowd_level": crowd,

            "recommendation": recommendation,

            "ai_insight": insight,

            "hourly_prediction": hourly_prediction

        })

    except Exception as e:

        return jsonify({

            "error": str(e)

        }),500




###############################################################
# ALL BUILDINGS
###############################################################

@app.route("/buildings")
def get_buildings():

    return jsonify({

        "success":True,

        "buildings":buildings

    })


###############################################################
# ALL DEPARTMENTS
###############################################################

@app.route("/departments")
def get_departments():

    return jsonify({

        "success":True,

        "departments":departments

    })


###############################################################
# ALL ROOMS
###############################################################

@app.route("/rooms")
def get_rooms():

    return jsonify({

        "success":True,

        "rooms":rooms

    })


###############################################################
# LANDMARKS
###############################################################

@app.route("/landmarks")
def get_landmarks():

    return jsonify({

        "success":True,

        "landmarks":landmarks

    })


###############################################################
# LIFTS
###############################################################

@app.route("/lifts")
def get_lifts():

    return jsonify({

        "success":True,

        "lifts":lifts

    })


###############################################################
# STAIRS
###############################################################

@app.route("/stairs")
def get_stairs():

    return jsonify({

        "success":True,

        "stairs":stairs

    })


###############################################################
# WASHROOMS
###############################################################

@app.route("/washrooms")
def get_washrooms():

    return jsonify({

        "success":True,

        "washrooms":washrooms

    })


###############################################################
# ENTRANCES
###############################################################

@app.route("/entrances")
def get_entrances():

    return jsonify({

        "success":True,

        "entrances":entrances

    })


###############################################################
# FLOOR LIST
###############################################################

@app.route("/floors")
def get_floors():

    return jsonify({

        "floors":[

            "Ground Floor",

            "First Floor",

            "Second Floor",

            "Third Floor",

            "Fourth Floor",

            "Fifth Floor",

            "Sixth Floor"

        ]

    })


###############################################################
# NAVIGATION GRAPH
###############################################################

@app.route("/navigation_graph")
def get_navigation_graph():

    return jsonify({

        "success":True,

        "graph":navigation_graph

    })


###############################################################
# SIMPLE NAVIGATION
###############################################################

@app.route("/navigate",methods=["POST"])
def navigate():

    data=request.get_json()

    destination=data.get("destination","")

    room,room_info=search_room(destination)

    if room:

        return jsonify({

            "success":True,

            "destination":room,

            "details":room_info

        })

    place,place_info=search_place(destination)

    if place:

        return jsonify({

            "success":True,

            "destination":place,

            "details":place_info

        })

    return jsonify({

        "success":False,

        "message":"Destination not found."

    })


###############################################################
# FLOOR NAVIGATION
###############################################################

@app.route("/floor_navigation/<floor>")
def floor_navigation(floor):

    graphs={

        "ground":ground_navigation,

        "first":first_navigation,

        "second":second_navigation,

        "third":third_navigation,

        "fourth":fourth_navigation,

        "fifth":fifth_navigation,

        "sixth":sixth_navigation

    }

    graph=graphs.get(floor.lower())

    if graph is None:

        return jsonify({

            "success":False,

            "message":"Floor not found."

        }),404

    return jsonify({

        "success":True,

        "navigation":graph

    })


###############################################################
# CROWD GRAPH
###############################################################

@app.route("/crowd-graph/<location>")
def crowd_graph(location):

    now=datetime.now()

    month=now.strftime("%B")

    day=now.weekday()

    hours=[]

    values=[]

    mapping={

        "Low":1,

        "Medium":2,

        "High":3

    }

    for hour in range(9,18):

        try:

            prediction=predict_crowd(

                month=month,

                place=location,

                hour=hour,

                day=day

            )

        except:

            prediction="Low"

        hours.append(hour)

        values.append(

            mapping.get(prediction,1)

        )

    return jsonify({

        "hours":hours,

        "crowd":values

    })


###############################################################
# CURRENT CROWD
###############################################################

@app.route("/predict_crowd",methods=["POST"])
def predict_crowd_route():

    data=request.get_json()

    result=predict_crowd(

        month=data["month"],

        place=data["place"],

        hour=int(data["hour"]),

        day=int(data["day"])

    )

    return jsonify({

        "crowd_level":result

    })



###############################################################
# HEALTH CHECK
###############################################################

@app.route("/health")
def health():

    return jsonify({

        "status":"running",

        "application":"Campus Navigation Assistant"

    })


###############################################################
# RUN APP
###############################################################

if __name__=="__main__":

    app.run(

        debug=True,

        host="0.0.0.0",

        port=5000

    )

