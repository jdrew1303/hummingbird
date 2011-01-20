if(!Hummingbird) { var Hummingbird = {}; }

Hummingbird.Base = function() {};

Hummingbird.Base.prototype = {

  validMessageCount: 0,

  messageRate: 20,

  initialize: function() {
    this.averageLog = [];
    this.setFilter();
    this.registerHandler();
  },

  registerHandler: function() {
    this.socket.registerHandler(this.onData, this);
  },

  onMessage: function(message) {
    console.log("Base class says: " + JSON.stringify(message));
  },

  onData: function(fullData) {
    var average;
    var message = this.extract(fullData);
    if(typeof(message) != "undefined") {
      this.validMessageCount += 1;

      // Calculate the average over N seconds if the averageOver option is set
      if(this.options.averageOver) { average = this.addToAverage(message); }

      if((!this.options.every) || (this.validMessageCount % this.options.every == 0)) {
        this.onMessage(message, this.average());
      }
    }
  },

  extract: function(data) {
    if(typeof(data) == "undefined") { return; }

    var obj = data;
    for(var i = 0, len = this.filter.length; i < len; i++) {
      obj = obj[this.filter[i]];
      if(typeof(obj) == "undefined") { return; }
    }

    return obj;
  },

  setFilter: function() {
    // TODO: extend this (and extract) to support multiple filters
    var obj = this.options.data;

    this.filter = [];

    while(typeof(obj) == "object") {
      for(var i in obj) {
        this.filter.push(i);
        obj = obj[i];
        break;
      }
    }
  },

  addToAverage: function(newValue) {
    var averageCount = this.options.averageOver * this.messageRate;

    this.averageLog.push(newValue);
    if(this.averageLog.length > averageCount) {
      this.averageLog.shift();
    }
  },

  average: function() {
    if(this.averageLog.length == 0) { return 0; }

    return this.averageLog.sum() * 1.0 / this.averageLog.length * this.messageRate;
  }

};
