+++
title = "Add full text search"
date = 2020-03-24T10:09:52+09:00
weight = 6
chapter = true
pre = "<b>6. </b>"
+++


### Story
Users love the Timeline/follow feature.
On the other hand, you have received feedback that besides Global Timeline, users also want the feature to reach users of interest.
Integrate full-text search into your application so that users can search for Post with interested words.

### What implements in this section
- Add full-text search function to Post using `@searchable`.

{{< figure src="/images/60_full_text_search/architecture.png" title="Back-end" class="center" width="50%">}}

{{< figure src="/images/60_full_text_search/front.png" title="Front-end" class="center" width="100%">}}

{{% children showhidden="false" %}}{{% /children%}}