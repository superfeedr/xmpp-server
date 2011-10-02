var redis = require("redis"),
    client = redis.createClient();

client.on("error", function (err) {
    console.log("Redis connection error to " + client.host + ":" + client.port + " - " + err);
});

var Roster = function(owner) {
    this.owner = owner;
    this.items = []
};

var RosterItem = function(roster, jid, state, name) {
    this.roster = roster;
    this.jid = jid;
    this.state = state;
    this.name = name;
}

Roster.key = function(jid) {
    return "roster:" + jid.toString();
};

RosterItem.key = function(owner, jid) {
    return "rosterItem:" + owner.toString() + ":" + jid.toString();
}

Roster.find = function(jid, cb) {
    var roster = new Roster(jid);
    roster.reload(cb);
};

Roster.prototype.reload = function(cb) {
    var self = this;
    client.smembers(Roster.key(self.owner), function(err, obj) {
        var counts = 0;
        if(!obj || obj.length == 0) {
            cb(self);
        }
        else {
            self.items = []; // clear the current items.
            obj.forEach(function(contact) {
                RosterItem.find(self, contact, function(item) {
                    counts++;
                    self.items.push(item);
                    if(counts == obj.length) {
                        cb(self);
                    }
                });
            });
        }
    });
};

Roster.prototype.eachSubscription = function(types, callback) {
    var self = this;
    self.reload(function() {
        self.items.forEach(function(item) {
            if(types.indexOf(item.state) >= 0) {
                callback(item);
            }
        });
    });
};

Roster.prototype.subscriptions = function(types, callback) {
    // TODO
};

Roster.prototype.add = function(item, callback) {
    var self = this;
    // And now also add the jid to the set
    client.sadd(Roster.key(self.owner), item.jid, function(err, obj) {
        callback();
    });
};

RosterItem.prototype.save = function(callback) {
    var self = this;
    client.hmset(RosterItem.key(this.roster.owner, this.jid), {state: this.state, name: this.name}, function(err, obj) {
        self.roster.add(self, function() {
            callback(err, self);
        });
    });
}

RosterItem.prototype.delete = function(callback) {
    var self = this;
    client.del(RosterItem.key(this.roster.owner, this.jid), function(err, obj) {
        callback(err, self);
    });
}

RosterItem.find = function(roster, jid, cb) {
    var self = this;
    client.hgetall(RosterItem.key(roster.owner, jid), function(err, obj) {
        if(isEmpty(obj)) {
            cb(new RosterItem(roster, jid, "none", ""));
        } 
        else {
            cb(new RosterItem(roster, jid, obj.state, obj.name));
        }
    });
}

exports.Roster = Roster;
exports.RosterItem = RosterItem;


function isEmpty(ob){
   for(var i in ob){ if(ob.hasOwnProperty(i)){return false;}}
  return true;
}
