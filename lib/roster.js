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
    client.smembers(Roster.key(jid), function(err, obj) {
        var counts = 0;
        var roster = new Roster(jid);
        if(!obj || obj.length == 0) {
            cb(roster);
        }
        else {
            obj.forEach(function(contact) {
                RosterItem.find(roster, contact, function(item) {
                    counts++;
                    roster.items.push(item);
                    if(counts == obj.length) {
                        cb(roster);
                    }
                });
            });
        }
    });
};

Roster.prototype.add = function(item, callback) {
    var self = this;
    // Let's first save the item
    item.save(function() {
        // And now also add the jid to the set
        client.sadd(Roster.key(self.owner), item.jid, function(err, obj) {
            callback();
        });
    })
};

RosterItem.prototype.save = function(callback) {
    var self = this;
    client.hmset(RosterItem.key(this.roster.owner, this.jid), {state: this.state, name: this.name}, function(err, obj) {
        callback(err, self);
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
