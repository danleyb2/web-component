---
layout: post
title:  "Introducing Web Component"
date:   2020-02-15 13:41:21 +0300
categories: release
---

A starter project for building standalone web components using lit-element.
 

## Features
- LitElement for a declarative UI, automatic updates when properties change.
- Follows Web Components standards, works with any framework
- Building with bundling and transpilation using polymer build 
- Testing with Web-Component-Tester
- Storybook


## Usage

1. load module

{% highlight html %}

<!-- Bottom of body -->
<script type="module" src="https://unpkg.com/@danleyb2/web-component"></script>

{% endhighlight %}


2. use component

{% highlight html %}
<web-component></web-component>
    
{% endhighlight %}


