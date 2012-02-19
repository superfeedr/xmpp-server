var vows = require('vows'),
    assert = require('assert');

var r = require('../lib/roster.js');
var Roster = r.Roster;
var RosterItem = r.RosterItem;


var suite = vows.describe('RosterItem');

suite.addBatch({
    'RosterItem::save': {
        topic: function() {
            var self = this;
            var roster = new Roster("julien@ouvre-boite.com");
            var item  = new RosterItem(roster, "astro@remote.com", "from", "Julien")
            item.save(function() {
                RosterItem.find(roster, "astro@remote.com", function(item) {
                    self.callback(null, item)
                });
            });
        },
        'it should save': function (error, item) {
            assert.isObject (item); 
            assert.equal(item.roster.owner, "julien@ouvre-boite.com");
            assert.equal(item.jid, "astro@remote.com");
            assert.equal(item.state, "from");
            assert.equal(item.name, "Julien");
        }
    }
});

suite.addBatch({
    'RosterItem::delete': {
        topic: function() {
            var self = this;
            var roster = new Roster("julien@ouvre-boite.com");
            var item  = new RosterItem(roster, "friend@remote.com", "from", "Stephan")
            item.save(function() {
                RosterItem.find(roster, "friend@remote.com", function(item) {
                    item.delete(function() {
                        RosterItem.find(roster, "friend@remote.com", function(i) {
                            self.callback(null, i)
                        });
                    });
                });
            });
        },
        'it should return an item with subscription to none': function (error, item) {
            assert.isObject (item); 
            assert.equal(item.roster.owner, "julien@ouvre-boite.com");
            assert.equal(item.jid, "friend@remote.com");
            assert.equal(item.state, "none");
            assert.equal(item.name, "");
        }
    }
});

suite.addBatch({
    'RosterItem::find': {
        topic: function() {
            var self = this;
            var roster = new Roster("julien@ouvre-boite.com");
            RosterItem.find(roster, "nope@remote.com", function(item) {
                self.callback(null, item)
            });
        },
        'get the user': function (item) {
            assert.isObject (item); 
            assert.equal(item.roster.owner, "julien@ouvre-boite.com");
            assert.equal(item.jid, "nope@remote.com");
            assert.equal(item.state, "none");
            assert.equal(item.name, "");
        }
    }
});


suite.addBatch({
    'Roster::find': {
        topic: function() {
            var self = this;
            Roster.find("julien@superfeedr.com", function(roster) {
                self.callback(null, roster);
            });
        },
        'delete the user': function (err, roster) {
            assert.isObject (roster); 
            assert.equal(roster.owner, "julien@superfeedr.com");
        }
    }
});


suite.addBatch({
    'Roster::find': {
        topic: function() {
            var self = this;
            Roster.find("noroster@superfeedr.com", function(roster) {
                self.callback(null, roster);
            });
        },
        'return an empty roster': function (err, roster) {
            assert.isObject (roster); 
            assert.equal(roster.owner, "noroster@superfeedr.com");
            assert.equal(roster.items.length, 0);
        }
    }
});


suite.addBatch({
    'add': {
        topic: function() {
            var self = this;
            Roster.find("julien@superfeedr.com", function(roster) {
                var item = new RosterItem(roster, "hello@msgboy.com", "both", "Msgboy");
                item.save(function(item) {
                    Roster.find("julien@superfeedr.com", function(roster) {
                        self.callback(null, roster);
                    });
                });
            });
        },
        'it should save': function (roster) {
            assert.isObject (roster); 
            assert.equal(roster.owner, "julien@superfeedr.com");
            assert.equal(roster.items.length, 1);
            assert.equal(roster.items[0].roster.owner, "julien@superfeedr.com");
            assert.equal(roster.items[0].jid, "hello@msgboy.com");
            assert.equal(roster.items[0].state, "both");
            assert.equal(roster.items[0].name, "Msgboy");
        }
    }
});

suite.run();

