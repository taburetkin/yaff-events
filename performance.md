# Performance
This package was inspired by `backbone` framework and has same api.  
The only goal was make it separate and without any dependencies.  
Also, there is some difference in performance in compare to backbone

**environment**  
- core i3
- chrome 78.0.3904.97 (64)
- 1 000 000 iterations


| | op/sec |
|---| --|
| **on('event', cb)** |
| backbone | 1 600 000 |
| yaff | 1 200 000 |
| **on('event1 event2 event3', cb)** |
| backbone | 700 000 |
| yaff | 600 000 |
| **on({ event1: cb, event2: cb, event3: cb }, context)** |
| backbone | 800 000 |
| yaff | 800 000 |
| **once('event', cb)** |
| backbone | 1 000 000 |
| yaff | 1 200 000 |
| **once('event1 event2 event3', cb)** |
| backbone | 400 000 |
| yaff | 600 000 |
| **once({ event1: cb, event2: cb, event3: cb }, context)** |
| backbone | 400 000 |
| yaff | 800 000 |
| **listenTo(other, 'event', cb)** |
| backbone | 200 000 |
| yaff | 700 000 |
| **listenTo(other, 'event1 event2 event3', cb)** |
| backbone | 200 000 |
| yaff | 400 000 |
| **listenTo(other, { event1: cb, event2: cb, event3: cb }, context)** |
| backbone | 200 000 |
| yaff | 600 000 |
| **listenToOnce(other, 'event', cb)** |
| backbone | 200 000 |
| yaff | 600 000 |
| **listenToOnce(other, 'event1 event2 event3', cb)** |
| backbone | 200 000 |
| yaff | 400 000 |
| **listenToOnce(other, { event1: cb, event2: cb, event3: cb }, context)** |
| backbone | 200 000 |
| yaff | 600 000 |
| **off() when 15 events** |
| backbone | 1 400 000 |
| yaff | 1 400 000 |
| **off() when 3 own events and 5 on listeners** |
| backbone | 400 000 |
| yaff | 1 000 000 |
| **off("event") when there are 3 of 10** |
| backbone | 400 000 |
| yaff | 600 000 |
| **off("event") when there are 12 events and "event" is last** |
| backbone | 200 000 |
| yaff | 1 000 000 |
