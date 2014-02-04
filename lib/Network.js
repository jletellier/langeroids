var _ = require('underscore');

var Network = module.exports = function(settings) {
    _.extend(this, settings);
};

_.extend(Network.prototype, {
    init: function(game) {
        this.game = game;
        this.prevSnapshot = {};
    },

    onSnapshotDiff: function(snapshotDiff) {
        var game = this.game;
        _.each(snapshotDiff, function(value, key) {
            var component = game[key];
            if (_.isObject(component) && _.isFunction(component.networkUnserialize)) {
                component.networkUnserialize(value);
            }
        });
    },

    update: function() {
        var snapshot = {};
        for (var i = 0; i < this.game.components.length; i++) {
            var component = this.game.components[i];
            if (_.isFunction(component.networkSerialize) && _.isString(component.ID)) {
                var serializedData = component.networkSerialize();
                if (!_.isUndefined(serializedData)) {
                    snapshot[component.ID] = serializedData;
                }
            }
        }

        var snapshotDiff = this.getSnapshotDiff(snapshot, this.prevSnapshot);
        if (snapshotDiff) {
            this.emitSnapshotDiff(snapshotDiff);
        }

        this.prevSnapshot = snapshot;
    },

    getSnapshotDiff: function(current, prev) {
        var diffSnapshot = {};
        _.each(current, function(value, key) {
            if (!_.isEqual(value, prev[key])) {
                diffSnapshot[key] = value;
            }
        });

        if (!_.keys(diffSnapshot).length) return false;
        return diffSnapshot;
    },

    draw: function() {}
});