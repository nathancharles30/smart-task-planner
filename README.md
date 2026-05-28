# Smart Task Planner - Advanced JavaScript Web Application



##### Author

Nathan Charles

Web Innovations - Project Coursework



1. ### Project Overview (Reflection)

To begin I developed the smart task planner to embody an ambitious, JavaScript-driven web application designed to go further than just a static task list and instead actively reason about time constraints, deadlines, and scheduling feasibility.



The core aim of this project was to explore algorithmic backtracking and scheduling in a client-side web environment while maintain a usable clear interface for end users. This directly aligns with the web innovation to demonstrate meaningful interactivity and technical sophistication using JavaScript.



Rather than relying on external scheduling libraries, I integrated my own constraint-based-scheduler. allowing me to demonstrate deeper understanding of JavaScript logic, state management, and debugging.



### 2\. Key Features

**Add Tasks:**

* Duration (Minutes)
* Deadline (Time-based constraint)
* 

**Generate a daily schedule within fixed working hours**



**Intelligent handling of:**

* Insufficient time
* Deadline conflicts
* Unscheduled tasks



**Clear visual separation between:**

* Scheduled tasks
* Unscheduled tasks
* 

**Persistent state using local storage**



**Clear-all functionality to reset planning session**



**Modular JavaScript architecture:**

* Scheduler.js
* Constraints.js
* Main.js
* Store.js

### 

### 3\. Technical Implementation

**This demonstrates advanced JavaScript concepts including:**

* Constraint-based scheduling
* Backtracking algorithms (attemptbacktrackday)
* Defensive programming and error handling
* ISO time parsing and validation
* Modular ES6 architecture
* Centralised state management
* Event delegation for dynamic DOM rendering



**A key technical challenge I encountered included ensuring valid time bound and avoiding runtime failures such as:**

* invalid ISO dates
* Undefined schedular settings
* Inconsistent state mutations



**These were fixed through:**

* Strict validation of day bounds
* Default schedular options
* Explicit error throwing when constraints are invalid

This process significantly strengthened my debugging and architectural decision-making skills.



### 4\. Setup Instructions

**Requirements**

* Modern browser (Chrome, Edge, Firefox)
* JavaScript enabled
* No server required



**Running the application**

1. Open index.html in a browser
2. Add tasks using the from
3. Click generate schedule
4. Review scheduled and unscheduled tasks
5. use clear tasks to reset

### 

### 5\. Known Limitations and Future Improvements

* Currently supports single-day planning window
* Break periods are supported in code but not yet exposed via UI
* No drag and-drop-timeline editing



**Future Improvements include:**

* Multi-day scheduling
* Priority weighting
* Visual timeline canvas rendering
* Exporting schedules to calendar formats

### 

### 6\. Academic Integrity and AI Declaration

**AI tools were used as an assistive debugging aid, especially for:**

* Clarifying JavaScript error messages
* Error messages in html (Chrome)



**All finalised code, structure, and implementation decisions were adopted, adapted and validated by me.**

###### 

