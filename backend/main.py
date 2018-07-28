from flask import Flask, request
from datetime import datetime
import json

app = Flask(__name__)

class User:
    def __init__(self, username, coordinates, event_ids):
        self.username = username
        self.coordinates = coordinates #tuple
        self.events = event_ids

    def __eq__(self, other):
        return self.username == other.username
    
    def __hash__(self):
        return self.username.__hash__()
    
    def get_dict(self):
        return {
            "username": self.username,
            "coordinates": self.coordinates,
            "events": self.events
        }

class Event:
    def __init__(self, id, name, coordinates, dt):
        self.id = id
        self.name = name
        self.coordinates = coordinates #tuple
        self.datetime = dt #datetime
    
    def get_simple_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "count":len(self.get_members())
        }

    def get_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "location": self.coordinates,
            "members": self.get_members_dict()
        }

    def get_members_dict(self):
        return [ user.get_dict() for user in users if self.id in user.events]


events = dict() #key = id, value = event
users = set()

events = {
    1 : Event(1,"lol",[1,2],datetime(2018,2,1)),
    2 : Event(2,"openlab",[1,2],datetime(2018,2,1)) ,
    3 : Event(3,"summerstudent",[1,2],datetime(2018,2,1)),
    4 : Event(4,"zipline",[1,2],datetime(2018,3,1))
    }#key = id, value = event

users = set()
users.add(User("millissa",[2,3],[1,2]))
users.add(User("filip",[2,3],[1,3]))
users.add(User("versha",[2,3],[3,2]))


@app.route('/')
def ep_hello():
    return app.send_static_file('index.html')
    #return 'Hello, World!'

@app.route('/upload/', methods=['POST'])
def ep_upload():
    input = json.loads(request.data)

    user = User(**input)
    users.add(user)

    return "OK"  #request.data #echo


@app.route('/events/', methods=['GET'])
def ep_events():
    output = []
    for event in events.values():
        output.append(event.get_simple_dict())

    return json.dumps(output)


@app.route('/fetch/', methods=['POST'])
def ep_fetch():
    input = json.loads(request.data)

    output = []
    for ev_id in input:
        output.append( events[ev_id].get_dict() )
        
    return json.dumps(output)
