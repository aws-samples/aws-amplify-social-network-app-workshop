+++
title="Implementing Follow/Timeline"
date = 2020-03-18T10:09:49+09:00
weight = 5
chapter = true
pre = "<b>5. </b>"
+++


### Story
After the service was published, the number of users is steadily increasing.
As the number of users grows, it has become hard to follow every Post.
So Yuki and you decide to implement a timeline feature that displays only the Post of the people that the user is following.
Let's also implement the necessary follow-up function according to the timeline function.

{{% notice info %}}
For those who start with this chapter, please look at [10.1 chapter 5 or 7 chapter to start](/100_supplemental_resource/20_start_from_day23.html).
It describes how to shortcut the contents of the previous chapter.
{{% /notice %}}

### What implements in this section
- API and DB (FollowRelationship Table) for storing and retrieving Follow relationships.
- API and DB (Timeline Table) for saving and retrieving the Post list of users that each user follows
- Lambda Resolver writes the follower's Timeline Table when someone creates a Post, based on the Follow relationship
  - So far **boyaki** reads and writes directly to the Post Table
  - After this section, Post creation is done via Lambda Resolver

{{< figure src="/images/50_follow_timeline/architecture.png" title="" class="center" width="50%">}}


### Table of Contents in this Section
{{% children showhidden="false" %}}{{% /children%}}