var vows = require('vows'),
    assert = require('assert');

var r = require('../lib/roster.js');
var Roster = r.Roster;
var RosterItem = r.RosterItem;


var suite = vows.describe('RosterItem');

suite.addBatch({
    'save': {
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
    'save': {
        topic: function() {
            var self = this;
            var roster = new Roster("julien@ouvre-boite.com");
            var item  = new RosterItem(roster, "astro@remote.com", "from", "Julien")
            item.save(function() {
                RosterItem.find(roster, "astro@remote.com", function(item) {
                    item.delete(function() {
                        RosterItem.find(roster, "nope@remote.com", function(item) {
                            self.callback(null, item)
                        });
                    });
                });
            });
        },
        'it should save': function (error, item) {
            assert.isNull (item);       
        }
    }
});

suite.addBatch({
    'find': {
        topic: function() {
            var self = this;
            var roster = new Roster("julien@ouvre-boite.com");
            RosterItem.find(roster, "nope@remote.com", function(item) {
                self.callback(null, item)
            });
        },
        'get the user': function (item) {
            assert.isNull (item);       
        }
    }
});


suite.addBatch({
    'find': {
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
    'add': {
        topic: function() {
            var self = this;
            Roster.find("julien@superfeedr.com", function(roster) {
                roster.add(new RosterItem(roster, "hello@msgboy.com", "both", "Msgboy"), function(item) {
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

