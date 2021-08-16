---
feature_image: /img/covers/stencil.jpg
unsplash_author: Sergey Zolkin
unsplash_author_url: https://unsplash.com/@szolkin
unsplash_photo_url: https://unsplash.com/photos/32YLLwBI8Q4
title: Reasons to Stencil
description: Congratulations, you have decided to use one of the many libraries and tools available for building modern web interfaces. Now just do not lock yourself into that decision.
permalink: /2021/08/16/reasons-to-stencil/
tags:
  - components
  - stencil  
  - web
  - posts
---

Congratulations, you have decided to use one of the many libraries and tools available for building modern web interfaces. Maybe you have chosen React, and you start through the tutorial. 

The very first React example is a shopping list that extends `React.Component`. Congratulations, you have locked you and your team into React. If another team leveraging Vue wants to use your shopping list component, then they are out of luck - they will have to invest the engineering hours to port it.

As for Vue itself, the tutorial starts off by walking you through some of the high-level features - those slick flow control tricks that Vue brings to the table. Eventually however, you are introduced to `Vue.component()`. This component of course cannot be shared with the team using React.

Components are the third step in the guide to learning Angular. "Components to the rescue!" is declared before dropping you into `component()` and the Component Definition Object (CDO). And of course, these components do not work with the React or Vue.

Why are all these frameworks and libraries so quick to introduce you to components of their own design, when a web-standards approach exists and is widely implemented? To ensure interoperability and operational longevity of your components, build on the standards - use frameworks and libraries to add value to the development process where standards are still nascent or absent entirely. Reevaluate as the standards mature.

Now you might be inclined to think that the standards for components are great, but that they are not idiomatic - they do not work in the same manner - to your chosen framework or library. And you would be right! What is needed is an abstraction that allows you to write the components to the standards, but that provides integrations with Angular, React, and Vue, while leaving the door open for any new technologies that may emerge in the future. The tool you would then be thinking of is, [Stencil](https://stenciljs.com).

You might *not* be inclined to think that the standards for component are great - it is all so verbose. And you would be right! You want to keep that syntactic sugar that increases productivity by decreasing the time it takes to write a component in the first place. You want to lean into reactive patterns with data binding, keep everything organized with separation of styles, and you want modern language constructs like type checking and decorators that come with TypeScript. The tool you would then be wanting is, [Stencil](https://stenciljs.com).

> There are interesting side-effects to investing in standards-based web components. For example, you will see a community develop; all teams contributing to the core patterns of the business regardless of their framework choice. Some of these patterns will be architectural in nature, while others will surface in your design system.

By leveraging Stencil to build standards-based web components, you bring together the best of both worlds. You can easily share that core functionality across teams using whatever framework they want, while taking advantage of modern development approaches. When you want features like state management and routing, frameworks bring to the table what they do best. At least until the next version when they do not. Either way, that investment in standards with Stencil will still be there, chugging along and adding value.

If at some point you decide that building components in general - especially UI components - is simply not core to your business, then the tool you want is [Ionic Framework](https://ionicframework.com). Ionic Framework components are standards-based components created using Stencil. And because they are web components, they integrate with React, Angular, and Vue.
