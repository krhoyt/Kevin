# Blog History

A chronological summary of Kevin Hoyt's blog posts.

---

## 2015-05-14: Real-Time Drone Telemetry

A real-time telemetry demonstration using a DJI Phantom 2 quadcopter equipped with an Arduino sensor array (GPS, compass, accelerometer, temperature, humidity) that transmitted flight data via XBee radio to an Inmarsat satellite modem. The data was then published through Kaazing Gateway using WebSockets, achieving less than one second latency from sensor to mobile device. This project explored the feasibility of a "black box in the cloud" for aircraft flight data recording, demonstrating how real-time publish-subscribe architecture could enable multiple stakeholders to independently record and process telemetry data.

---

## 2015-05-14: Real-Time Engine Telemetry

A project demonstrating real-time vehicle telemetry using an ELM-327 Bluetooth OBD adapter connected to a car's on-board diagnostics system. A Java program running on a laptop read engine data (RPM, speed, fuel level, coolant temperature) via serial communication, merged it with GPS coordinates from a USB module, and published the combined data through Kaazing Gateway using AMQP over WebSocket. The web client displayed the real-time telemetry on Google Maps with SVG-rendered gauges, all achieved for about $100 in hardware costs.

---

## 2015-05-15: Real-Time Barcode Scanner

A demonstration of connecting a physical barcode scanner to the web in real-time using an Intel Edison with built-in Wi-Fi. The Java application on the Edison communicated with the scanner via serial port (jSSC library), looked up product information using Amazon's Product Advertising API, and published the data through Kaazing Gateway. The web client displayed scanned items in a shopping cart interface, showcasing how real-time messaging could modernize Point of Sale systems and enable real-time supply chain visibility.

---

## 2017-04-01: Getting Started in Developer Advocacy

A comprehensive guide for those new to developer relations, covering essential aspects of building a career in the field. The post emphasizes the importance of personal branding for career longevity across technology shifts, the concept of "the long tail" for content strategy, and the value of technical writing through blogging and books. It also covers video content creation, social media presence (especially Twitter), and how to balance employer messaging with authentic personal voice. The guidance is drawn from the author's experience entering developer relations in 2007.

---

## 2018-02-08: Developer Advocacy and the Project Triangle

An application of the classic "Good, Fast, or Cheap - Pick Two" project triangle to developer relations and community building. The post explores three scenarios: fast and good community building through expensive talent acquisition; fast and cheap marketing-heavy approaches that yield shallow engagement; and the preferred path of good and cheap through patient investment in documentation, product quality, and genuine dialogue. The article argues against quantifying developer relationships as metrics and advocates for treating developer communities as friends rather than numbers.

---

## 2018-10-23: Image Processing in a Web Worker

A technical deep-dive into offloading computationally intensive image processing from the main thread using Web Workers. The post walks through capturing webcam frames via WebRTC, converting them to grayscale in a separate thread, and rendering the results without impacting UI performance. It demonstrates how to decouple the rendering loop (using requestAnimationFrame) from the processing loop, sharing state through a common property. The technique maintained 60fps while processing 307,200 pixels per frame.

---

## 2018-10-31: Transferable ImageData

A follow-up to the Web Worker image processing post, explaining how to optimize data transfer between threads using transferable objects. Instead of copying ImageData by value (structured clone), the post shows how to pass the underlying ArrayBuffer by reference, cutting transfer time from ~20ms to ~10ms. The technique involves extracting the buffer from Uint8ClampedArray and reconstructing the ImageData on the receiving end, with the caveat that transferred objects are no longer available to the sending thread.

---

## 2018-12-19: What I Install

A personal inventory of applications installed on a fresh Mac OS Mojave installation, reflecting the author's developer workflow. The list includes Chrome for web standards development, TextMate and VS Code for editing, GitHub Desktop for version control, Adobe Creative Cloud from their 15-year Adobe tenure, Docker for containerized development, Querious for MySQL, Xcode primarily for iOS Simulator, Paw for API testing, and various collaboration tools (Slack, Zoom, Webex, Box) required for IBM corporate work.

---

## 2019-01-17: LightBlue Bean to IBM Cloud

A tutorial on connecting a Punch Through LightBlue Bean BLE development board to IBM Cloud services via an iOS Swift application. The Bean ran Arduino code to read accelerometer and temperature data, exposing it via BLE scratch characteristics. The iOS app received this data and forwarded it to both IBM Cloudant (via REST API) and Watson IoT Platform (via HTTP), demonstrating how simple HTTP requests can integrate IoT devices with cloud databases and MQTT brokers without complex drivers.

---

## 2019-01-17: Teaching Watson to See My Garage

A practical machine learning project using Watson Visual Recognition to detect whether a garage door is open or closed. A Raspberry Pi Zero with camera captured images every five minutes for training data, which were then resized and cropped using Python/Pillow to focus on the relevant portion. The custom classifier was trained on four categories (open/closed, day/night) and deployed on the Pi, which listened for MQTT commands via Watson IoT to classify the current state. The solution integrated with Amazon Alexa for voice queries.

---

## 2019-01-23: Serverless Upload to Object Storage

A technical guide on uploading files to IBM Cloud Functions (Apache OpenWhisk) and persisting them to IBM Cloud Object Storage. The post covers parsing multipart HTTP requests using the "parted" library when the function is configured with `--web raw`, then using the IBM COS SDK (S3-compatible) to store the file. Key implementation details include handling async/await properly within the parsing callback and configuring COS credentials (endpoint, API key, service instance ID) as function parameters rather than in code.

---

## 2019-01-30: Serverless Download from Object Storage

The companion piece to the upload tutorial, demonstrating how to retrieve files from IBM Cloud Object Storage via serverless functions. The post covers using the COS SDK's getObject() method, returning the promise directly to keep the function running, and properly formatting the response with Content-Disposition headers for download prompts and Base64-encoded body content. It also includes bonus snippets for browsing objects (listObjectsV2) and deleting objects from buckets.

---

## 2019-02-06: Serverless Storage Redux

A revisitation of the COS upload/download workflow, this time using the REST API directly instead of the SDK. The post argues for understanding underlying HTTP transactions rather than blindly using libraries, demonstrating token-based authentication and simple PUT/GET requests with request-promise. It showcases how async/await elegantly handles complex operations like deleting all objects in a bucket before deleting the bucket itself, turning what would be callback hell into readable, sequential code.

---

## 2019-02-14: IBM and the Open Organization

A detailed review of Red Hat CEO Jim Whitehurst's book "The Open Organization" in the context of IBM's acquisition of Red Hat. The post distills key concepts around purpose-driven organizations, igniting passion over metrics, building authentic community engagement, meritocracy over hierarchy, encouraging debate and criticism, and inclusive decision-making. Each concept is examined through the lens of developer relations, emphasizing how these principles align with building genuine developer communities and avoiding the "marketing megaphone" approach.

---

## 2019-04-08: Functions, Storage, Watson... Oh, My!

A demonstration of IBM Cloud Functions' new trigger feature for Cloud Object Storage, creating an automated pipeline where uploading an image triggers a function that sends it to Watson Visual Recognition for classification, then stores the results in Cloudant. The post walks through creating triggers, handling the COS REST API for file retrieval, properly formatting multipart requests to Watson, and storing enriched classification data. It uses request-promise for clean promise chaining and discusses the granularity question of when to split actions into sequences.

---

## 2020-06-29: Tic-Tac-Toe Light

A retrospective on a live demonstration at HTML5 Developer Conference showcasing WebSockets for IoT. The project consisted of a custom enclosure housing an Arduino Yun with nine Adafruit NeoPixels in a 3x3 grid, controllable via a web interface through Kaazing Gateway. Nearly 200 conference attendees simultaneously controlled the lights, with the Arduino maintaining a single WebSocket connection handling ~20 bytes per color change - a scalable solution compared to HTTP polling that would have crushed the 16MHz microcontroller.

---

## 2021-06-21: Building a Calendar with Stencil

A deep-dive into creating a calendar web component using Stencil, focusing on the "pre-rendering" technique of calculating display data before the render cycle. The post explains using componentWillRender() to iterate through dates (the "count to 42" approach for 6 weeks x 7 days), populating a Day class with date, month, year, selected, and today properties. CSS Grid handles the variable number of weeks with auto-fill, and data attributes on buttons enable styling for selected/today states while simplifying click handling.

---

## 2021-06-27: Building a Clock with Stencil

A tutorial on creating an analog clock web component that demonstrates SVG manipulation, coordinate math for hand placement, and animation techniques. The post covers using external SVG assets with the `use` element, converting time to decimal format for degree calculations (360/12 for hours, 360*fraction for minutes/seconds), and implementing smooth animation via requestAnimationFrame. It compares state-based rendering versus direct DOM manipulation, finding both perform identically at 60fps, and discusses why CSS transitions don't work well for circular motion.

---

## 2021-07-07: The Secret Life of Tabs

A comprehensive guide to building a tab component with Stencil, covering composition, slots, data attributes, and the slotchange event. The post demonstrates how to dynamically generate tab buttons from composed child elements using data-label attributes, manage selection state through data-selected attributes styled via CSS attribute selectors, handle disabled states via the native button disabled attribute, and control content visibility using the ::slotted() CSS selector. It provides a foundation for understanding most web component concepts.

---

## 2021-07-14: Building a Bar Chart with Stencil

A tutorial on creating a custom bar chart web component from scratch using SVG, avoiding external charting libraries. The post explains determining the maximum value in a dataset to calculate a display ratio, using componentWillRender() to prepare data before rendering, and positioning SVG rect elements based on calculated dimensions. It addresses the SVG coordinate system (0,0 at bottom-left) requiring height offset calculations and demonstrates generating random fill colors, while acknowledging that production charts would abstract these details further.

---

## 2021-07-20: Items and Renderers

An exploration of building generic list components that can render different types of content through item renderers. Starting with a simple string array list, the post progresses to handling objects and introduces the item renderer pattern using JSX variables (capitalized Tag names) to dynamically specify which component renders each item. It discusses the trade-offs of this typeless approach, the need for a default label renderer, and shows how the spread operator can pass unknown object properties to rendered components.

---

## 2021-08-16: Reasons to Stencil

An argument for using Stencil to build standards-based web components instead of framework-specific components (React, Vue, Angular). The post points out that each framework's tutorial immediately introduces proprietary component patterns that lock teams in, preventing code sharing across different technology stacks. Stencil provides modern development conveniences (TypeScript, data binding, decorators) while outputting standard web components that work everywhere. The author suggests using Ionic Framework if building UI components isn't core to your business.

---

## 2022-06-15: Three P Weekly Status Report

A practical guide to weekly status reporting using markdown files with three sections: Progress (what you completed), Priorities (what you intend to do), and Problems (blockers). The post advocates for consistent file naming (YYYY-MM-DD-status.md), carrying forward incomplete priorities as progress, and including personal items that affect productivity. It scales to team-level reporting via a private git repository with transparent access, enabling quick grep searches for managers and reducing annual review burden by creating a year-long paper trail.

---

## 2022-12-02: AWS Transcribe with Python

A step-by-step tutorial for using AWS Transcribe with Python and boto3, covering the complete workflow from uploading audio to S3, starting and polling transcription jobs, to downloading results. The post emphasizes security best practices (IAM groups with limited permissions, environment variables for credentials), explains the asynchronous job model requiring status polling (since Transcribe doesn't support waiters), and includes cleanup code for deleting jobs and S3 objects. All code is available as a GitHub Gist.

---

## 2022-12-27: Four D Time Management

A distilled version of Getting Things Done (GTD) focused on a simple decision matrix: Do it (if you have time now), Defer it (block calendar time for later), Delegate it (assign and schedule follow-up), or Drop it (archive and move on). The post emphasizes externalizing cognitive load to calendars rather than keeping tasks in your head, loading calendar blocks with all relevant details for future context, and color-coding time blocks by activity type (Challenging, Coaching, Connecting, Delivering, etc.) to visualize how time is actually spent.

---

## 2025-07-15: Getting Comfortable with Circles

A tutorial on building a radar chart from scratch using SVG and basic trigonometry, demonstrating that custom charts can be simpler than reaching for a library. The post covers three key rules: convert degrees to radians, use Math.cos() for X-coordinates and Math.sin() for Y-coordinates. It walks through rendering nested circles, calculating spoke positions, mapping data values to the radius, handling SVG viewBox for proper display, and positioning labels with appropriate text-anchor and dominant-baseline values based on angular position.

---

## 2025-08-04: Svelte 5 Ownership Mutation

A deep exploration of Svelte 5's data binding edge cases, particularly the "ownership_invalid_mutation" error that occurs when modifying object properties passed as component props. The post explains that $state creates reactive proxies while $props are snapshots, so modifying nested properties doesn't trigger updates. Solutions include bubbling changes via event listeners or replacing the entire object via destructuring. It also covers using $state.snapshot() for console logging and IndexedDB storage to get actual object values instead of Proxy wrappers.

---

## 2025-10-21: Warp Test Drive

A hands-on review of Warp's agentic development environment, tested against their hiring challenge involving parsing a 9MB data file of space missions. The author, drawing on experience from IBM Watson ML, Amazon SageMaker, and building internal AI tooling, progressed from having Warp generate AWK commands, to Node.js parsing, SQLite database creation, Netlify serverless API functions, and finally a Svelte 5 frontend. The review highlights Warp's accuracy and helpfulness while noting the desire for local LLM support for enterprise/privacy use cases.

---

## 2026-01-06: The Unsung UI Control: Label

A practical guide to building a Label web component as a foundation for design systems, arguing that even simple elements like paragraphs deserve component wrappers for consistent styling and behavior. The post covers CSS variables with defaults, attribute-based styling for semantic usage (color="error", size="body-sm", weight="bold"), the :host() selector for visibility states (hidden, concealed, truncate), and attribute reflection via getters/setters. It distinguishes between composed content (static) and text property (dynamic runtime updates).

---

## 2026-01-09: Web Component Template

A comprehensive Web Component template representing the author's preferred patterns after building hundreds of components. The post covers constructor organization (template, properties, events, shadowRoot, element references), event binding with bind() for clean removal, the _render() method for centralized DOM updates, the _upgrade() pattern for handling pre-initialization property assignment, connectedCallback/disconnectedCallback for lifecycle management, observedAttributes for reactive attributes, and detailed getter/setter patterns for different data types (Boolean, Float, Integer, String, Array, Date, Object).

---

## 2026-01-12: Managing Tech: People

The first in a three-part management series, emphasizing that employees are people with full lives outside work. The post argues against treating employees as replaceable cogs, advocating for genuine 1:1 conversations that explore what's motivating or weighing on them. It addresses the counterargument about paying for results by noting that ignoring 66% of what shapes an employee (their 16 non-work hours) is like ignoring 66% of your business. The approach builds trust and loyalty while still maintaining accountability for deliverables.

---

## 2026-01-14: Managing Tech: Heroes

The second management post introduces the phrase "making people heroes for what it is that they want to achieve." It advocates for understanding employees' true goals through trust-building dialogue that goes beyond standard career conversations. The post embraces radical transparency, including helping employees who want to leave the team, department, or company - reasoning that disengaged employees cost more than supported departures. A personal anecdote describes flying to San Francisco to cheer on an employee completing the Sharkfest swim to Alcatraz.

---

## 2026-01-16: Managing Tech: Professionals

The final management post establishes a professional contract: treating employees as adults who own their careers as a "Business" with multiple functions (Product, Sales, Marketing, Finance, HR, Customer Success, IT, Leadership). The post emphasizes that this contract applies equally to managers - you should not ask someone to do something you haven't done or aren't willing to do. It describes stepping in during emergencies, pair programming through difficulties, and coaching through growth. The modern employment contract is mutual trust and shared responsibility.

---
