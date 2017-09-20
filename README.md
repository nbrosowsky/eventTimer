# eventTimer

A drop-in replacement for setTimeout and setInterval that makes use of requestAnimationFrame. 

The eventTimer, when called, creates a single timer that you can use to queue additional events if needed. When all events in the queue are expired, the timer stops. 

The goal was to try to create a timer that calls the function as close to the requested time interval as possible. This code is an almalgamation of various timers I've seen used. 

Once called, the timer loops using requestAnimationFrame. Within each loop it calculates the time between requestAnimationFrame calls and subtracts each interval from the requested wait time to count down to the callback. When it gets within one frame, it determines whether the function should be called now or wait until the next frame to minimize error (based on the average framerate).


## Usage

```javascript
<script>

// call function 'test' in 2000 ms //
eventTimer.setTimeout(test,2000);

// call function 'test' every 200 ms //
eventTimer.setInterval(test,200);


</script>
```


Calling ```eventTimer.setTimeout``` or ```eventTimer.setInterval``` returns an id number that can be used to cancel the event using ```eventTimer.cancelRequest(id)```. Alternatively, you can cancel all queued events using ```eventTimer.cancelAllRequests()```.


```javascript
<script>

// call function 'test' in 2000 ms //
x = eventTimer.setTimeout(test,2000);

eventTimer.cancelRequest(x);

// cancel all events in queue //
eventTimer.cancelAllRequests()

</script>
```


You can also queue multiple events at the same time:

```javascript
<script>

// Set three setTimeout events //
eventTimer.setMultipleTO([
  [event1, 1000],
  [event2, 6000],
  [event3, 6500]
]);

// Set three setInterval events //
eventTimer.setMultipleInt([
  [interval1, 100],
  [interval2, 455],
  [interval3, 1200]
])

</script>
```


Setting multiple events returns an array of ids, that can be used to cancel all the requests


```javascript
<script>
// Set three setInterval events //
x = eventTimer.setMultipleInt([
    [interval1, 100],
    [interval2, 455],
    [interval3, 1200]
   ])
   
eventTimer.cancelRequest(x);
</script>
```
