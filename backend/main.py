from flask import Flask, request
from flask_cors import CORS
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)

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
            "count":len(self.get_members_dict())
        }

    def get_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "location": self.coordinates,
            "members": self.get_members_dict(),
            "datetime": self.datetime
        }

    def get_members_dict(self):
        return [ user.get_dict() for user in users if self.id in user.events]


events = dict() #key = id, value = event
users = set()

events = {
    1 : Event(1,"lol",[[46.229602, 6.053840],[46.229984, 6.054055]],datetime(2018,2,1)),
    2 : Event(2,"openlab",[[46.229984, 6.054055],[46.229984, 6.054055]],datetime(2018,2,1)) ,
    3 : Event(3,"summerstudent",[[46.229984, 6.054055],[46.237599, 6.038118]],datetime(2018,2,1)),
    4 : Event(4,"zipline",[[46.237948, 6.036273],[46.237889, 6.036799]],datetime(2018,3,1))
    }#key = id, value = event

users = set()
users.add(User("millissa",[46.232587,6.045946],[1,2]))
users.add(User("filipe",[46.235088,6.047212],[1,3]))
users.add(User("varsha",[46.237889, 6.036799],[3,2]))
users.add(User("Sinclert",[46.233286, 6.052623],[1,4]))

@app.route('/')
def ep_hello():
    return app.send_static_file('index.html')
    #return 'Hello, World!'

@app.route('/upload/', methods=['POST'])
def ep_upload():
    input = json.loads(request.data)

    user = User(**input)
    users.add(user)
    print(input)

    return "OK"  #request.data #echo


@app.route('/events/', methods=['GET'])
def ep_events():
    output = []
    for event in events.values():
        output.append(event.get_simple_dict())

    return json.dumps(output, indent=4, sort_keys=True, default=str)


@app.route('/fetch/', methods=['GET'])
def ep_fetch():
    #input = json.loads(request.data)

    output = []
    for ev in events.values():
        output.append( ev.get_dict() )
        
    return json.dumps(output, indent=4, sort_keys=True, default=str)


if __name__ == '__main__':
    app.run(host = "127.0.0.1", port = 8080, debug = True)
