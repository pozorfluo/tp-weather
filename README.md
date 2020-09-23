# [tp-weather](https://pozorfluo.github.io/tp-weather/index.html)

vanilla typescript web components with KOПЯΛD  
![screencap_00](resources/images/screencap_00.png)

## todo

- [x] Try moving non-UI stuff to a web worker
- [x] Extract komrad, app-solo updates
  - [x] Add debounce
  - [x] Research how to deal with inconsistent read/glitch
- [x] Rename Observable to Feed
- [ ] Allow passing (Source[]?, Subscriber[]?) in Feed ctor
- [ ] Consider wrapping Source (elem, event_name, callback) from DomEvents
- [ ] Consider other Source as regular callback returning value compatible
      with observable type
- [ ] Consider wrapping Generator Source

## mvp-machine

Simple, declarative state machines inspired by statecharts.

handles :

- actions
- automatic transitions
- nested/compound states
- self transitions
- internal transitions
- state entry/exit events

allows :

- guards
- transient states
- final states

does not handle :

- parallel states
