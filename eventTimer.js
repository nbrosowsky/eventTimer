/*global window: false */
/*global console: false */

var eventTimer = function () {
    'use strict';

    var startTime = 0,
        now = 0,
        eventIDList = [],
        eventID = 0,
        timerInitialised = false,
        frameMean = 0,
        frame = 1000 / 60,
        eventList = [];

    function stop() {
        // force stop timer //
        window.cancelAnimationFrame(window.requestAnimId);

        // clear queue and reset timer settings //
        startTime = 0;
        now = 0;
        eventIDList = [];
        eventID = 0;
        timerInitialised = false;
        frameMean = 0;
        frame = 1000 / 60;
        eventList = [];
    }

    function start() {
        if (!timerInitialised) {
            timerInitialised = true;
            var lastFrameTime = 0,
                frameTimeHistory = [],
                frameTimeHistoryLength = 60,
                first = true,

                eventFun = function (animationFrameTimeStamp) {
                    // Update timestamps //
                    // get current frame timestamp
                    now = animationFrameTimeStamp;

                    // if it's the first loop, set the start time
                    if (first) {
                        startTime = now;
                        first = false;
                    }

                    // get the timestamp from the last loop
                    if (lastFrameTime === 0) {
                        lastFrameTime = now;
                    }

                    // calculate the interval between now and last animationFrame requests
                    var interval = now - lastFrameTime;
                    lastFrameTime = now;
                    ///////////////////////

                    // create a rolling history of animationFrame interval times from the last 60 loops //
                    // if < 60 loops use 1000/60 as default
                    frameTimeHistory.unshift(interval);
                    while (frameTimeHistory.length > frameTimeHistoryLength) {
                        frameTimeHistory.pop();
                    }


                    if (frameTimeHistory.length === frameTimeHistoryLength) {
                        var total = 0;
                        for (var n = 0; n < frameTimeHistory.length; n++) {
                            total += frameTimeHistory[n];
                        }
                        frameMean = total / frameTimeHistory.length;
                    }
                    // console.log(frameMean);
                    ////////////////////////

                    // process all events in queue //
                    var i = 0;
                    var numEvents = eventIDList.length;
                    var eventsToRemove = [];

                    while (i < numEvents && i < eventIDList.length) {
                        // update time remaining
                        eventIDList[i].timeRemaining -= interval;

                        // find events that are past due (timeRemaining <= 0) or within half the frame interval time
                        if (eventIDList[i].timeRemaining <= 0 || (frameMean > 0 && eventIDList[i].timeRemaining <= (frameMean / 2))) {

                            // console.log(eventIDList[i].timeRemaining)

                            // if setTimeout then remove / if setInterval then reset remaining time //
                            if (eventIDList[i].loop === false) {
                                eventsToRemove.push(eventIDList[i].id);
                            } else {
                                eventIDList[i].timeRemaining = eventIDList[i].waitTime;
                            }

                            // fire event function
                            eventIDList[i].eventFun();
                        }
                        i++;
                    }

                    // remove all expired events
                    for (var m = 0; m < eventsToRemove.length; m++) {
                        cancelRequest(eventsToRemove[m]);
                    }

                    // if all events have expired, then stop timer
                    if (eventIDList.length === 0) {
                        stop();
                    } else {
                        window.requestAnimId = window.requestAnimationFrame(eventFun);
                    }

                };
            window.requestAnimId = window.requestAnimationFrame(eventFun);
        }
    }

    function setTimeout(fun, wait) {
        if (!fun || !wait) {
            return;
            //return console.log("error: missing parameter");
        }
        if (typeof fun === 'function') {
            eventID++;
            var t = {
                eventFun: fun,
                timeRemaining: wait,
                id: eventID,
                waitTime: wait,
                loop: false
            };
            eventIDList.push(t);
            eventList.push(t);
            start();
            return eventID;
        } else {
            return;
            //return console.log("error: not a function");

        }

    }

    function setInterval(fun, wait) {
        if (!fun || !wait) {
            return;
            //return console.log("error: missing parameter");
        }
        if (typeof fun === 'function') {
            eventID++;
            var t = {
                eventFun: fun,
                timeRemaining: wait,
                id: eventID,
                waitTime: wait,
                loop: true
            };
            eventIDList.push(t);
            eventList.push(t);
            start();
            return eventID;
        } else {
            return;
            //return console.log("error: not a function");

        }
    }

    // cancel setTimeout or setIntervals
    // can pass an array of ids to cancel multiple events

    function cancelRequest(id) {
        if (Object.prototype.toString.call(id) === '[object Array]') {
            for (var n = 0; n < id.length; n++) {
                for (var i = 0; i < eventIDList.length; i++) {
                    if (eventIDList[i].id == id[n]) {
                        eventIDList.splice(i, 1);
                        eventList.splice(i, 1);
                    }
                }
            }
        } else {
            for (var m = 0; m < eventIDList.length; m++) {
                if (eventIDList[m].id == id) {
                    eventIDList.splice(m, 1);
                    eventList.splice(m, 1);
                }
            }
        }

    }

    function cancelAllRequests() {
        eventIDList = [];
        eventList = [];
    }

    // Set multiple timed events at once //

    // Usage:
    //        eventTimer.setMultipleTO(
    //         [
    //          [event1, 1000],
    //          [event2, 2000],
    //          [event3, 3000]
    //         ]
    //        )

    function setMultipleTO(array) {
        var idArray = [];
        for (var i = 0; i < array.length; i++) {
            eventID++;
            idArray.push(eventID);
            var t = {
                eventFun: array[i][0],
                timeRemaining: array[i][1],
                id: eventID,
                waitTime: array[i][1],
                loop: false
            };
            eventIDList.push(t);
            eventList.push(t);
        }

        start();
        return idArray;
    }


    function setMultipleInt(array) {
        var idArray = [];
        for (var i = 0; i < array.length; i++) {
            eventID++;
            idArray.push(eventID);
            var t = {
                eventFun: array[i][0],
                timeRemaining: array[i][1],
                id: eventID,
                waitTime: array[i][1],
                loop: true
            };
            eventIDList.push(t);
            eventList.push(t);
        }

        start();
        return idArray;
    }

    return {
        "start": start,
        "stop": stop,
        "setTimeout": setTimeout,
        "setInterval": setInterval,
        "cancelRequest": cancelRequest,
        "cancelAllRequests": cancelAllRequests,
        "eventList": eventList,
        "setMultipleTO": setMultipleTO,
        "setMultipleInt": setMultipleInt
    };

}();



// requestAnim shim layer by Paul Irish
window.requestAnimationFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback, element) {
            // should '60' here be framerate?
            window.setTimeout(callback, 1000 / 60);
        };
})();

// use window.performance() to get max fast and accurate time in milliseconds
window.performance = window.performance || {};
window.performance.now = (function () {
    var load_date = Date.now();
    return window.performance.now ||
        window.performance.mozNow ||
        window.performance.msNow ||
        window.performance.oNow ||
        window.performance.webkitNow ||
        function () {
            return Date.now() - load_date;
        };
})();

/*
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/
// requestanimationframe-for-smart-er-animating
// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel
(function() {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame =
      window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame =
      window[vendors[x]+'CancelAnimationFrame'] ||
      window[vendors[x]+'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function()
        { callback(currTime + timeToCall); }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }
}());
*/
