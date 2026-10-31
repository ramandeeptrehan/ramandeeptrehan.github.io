---
layout: post
title: "Get Comfortable with Hard Problems"
date: 2026-10-30
tags: [learning, engineering]
---

<div class="tldr" markdown="1">
- The struggle is where understanding gets built, not a toll you pay to get there.
- Stay with hard problems a little longer than feels comfortable. It compounds.
</div>

Lately I've been thinking about why it matters to get comfortable working on hard problems for long stretches of time. Sometimes you read pages of technical material and still don't understand what's going on. You keep reading, look into related ideas, connect them, and eventually things start to click.

That has always felt true to me, but "it felt true" isn't much of an argument. I think there's a lot of value in developing that patience. So in this post I want to work out *why* it's true, starting from zero, and also where it stops being true. Along the way we'll follow one very ordinary hard problem.

## A bug that can't happen

Your team runs a service that keeps its configuration in a small cluster using Raft, an algorithm that keeps several servers agreeing on the same data even when some of them fail [1]. Raft was designed specifically to be easy to understand, which is a relief, because the algorithm it replaced, Paxos, was first described by its inventor as the parliament of a fictional ancient Greek island [2]. His follow-up paper opens with "The Paxos algorithm, when presented in plain English, is very simple" [3]. Many engineers would like a word.

One night there's a short network glitch, and afterwards a customer reports that the service returned an old value that had already been overwritten. You check the dashboards. You check the code. Everything looks fine. Raft is supposed to be consistent. This can't happen.

And yet it did. You have two options. You can file it under "network weirdness", add a retry and move on. Or you can stay with it until you actually understand what happened. Most of us know the second option is better in some vague, eat-your-vegetables sense. I want to make the case that it's better in a much more concrete way.

## Two kinds of knowing

Start with a simple question: what does it mean to understand something?

There's a useful idea from two memory researchers, Robert and Elizabeth Bjork, who suggest that everything you know has two separate strengths [4]. One is how easily you can bring it to mind *right now*. The other is how deeply it's rooted, how many connections it has to everything else you know. These two aren't the same thing, and they often move in opposite directions. The name of someone you met ten minutes ago is very easy to recall and very shallowly rooted. The rules of a sport you played as a child might be hard to recall on the spot, but they come back whole after a few minutes of watching.

Engineers already have a good picture for this. The first strength is like a cache. The second is like an index on disk. Skimming a design doc just before a meeting warms the cache beautifully. You can talk about it confidently at 2pm. By Friday it's gone, because nothing was ever written to the index.

Now the part that matters. Going over something that's already easy to recall barely deepens it at all. The deepening happens when you have to *work* to pull something back, connect it, and rebuild it. In the Bjorks' model, the harder the retrieval, the more you gain from it. Effort isn't a fee you pay on the way to understanding. In a very literal sense, the effort is the understanding being built.

> The struggle isn't a toll on the road to understanding. It's the road.

## Why easy feels like progress

If that's right, it explains something frustrating about hard problems: the activities that feel most productive are often the ones doing the least.

Reading the Raft paper again feels productive. Every diagram looks familiar, every paragraph makes sense, and you finish with a pleasant sense of having done work. But familiarity is a reading of the cache, not the index. You're measuring the wrong thing, and it's reporting good news.

The best demonstration of this I know is an experiment by Henry Roediger and Jeffrey Karpicke [5]. They had people read a short passage and then either read it again or try to recall it without looking. Five minutes later, the re-readers did better. A week later, the people who had struggled to recall it remembered far more. And the re-readers were *more confident* the whole time. They were wrong, and they were sure about it.

<figure>
  <img src="/assets/posts/hard-things/crossover.svg" alt="Two lines over time. Re-reading starts higher at 5 minutes but falls steeply by 1 week. Recalling starts slightly lower but stays much higher by 1 week.">
  <figcaption>Figure 1: The easy approach wins in the moment and loses later.</figcaption>
</figure>

That pattern, where the comfortable approach wins in the moment and loses later, turns up again and again in this research [6]. The lesson for hard problems is uncomfortable but useful: how productive something feels is a poor guide to how productive it is. If you're making smooth, satisfying progress on something that's genuinely hard, it's worth being a little suspicious.

So instead of rereading, close everything and try to draw, on a blank page, what each server believed during the network glitch. You'll get stuck within about ninety seconds. That's not a sign it isn't working. That's the part where it works.

## Confusion is information

Every engineer knows the specific discomfort of a system doing something impossible. The natural reaction is to make the feeling go away as fast as possible, with a retry, a restart, or a ticket marked "could not reproduce".

But look at what the confusion actually is. It's the gap between what you believe about the system and what the system did. That makes it unusually precise. It's not saying "you don't understand Raft". It's saying "one specific thing you believe about Raft is false, and here is the moment it broke." Confusion that you resolve forces you to throw out a wrong model and build a better one, which is about as deep as learning gets [7]. Confusion you leave alone just waits for the next incident.

So stay with it. The belief that broke was "Raft means every read is up to date". Draw the timeline carefully and the real story appears. During the glitch, the old leader was cut off from the others. They elected a new leader and kept accepting writes. The old leader had no idea it had been replaced, so it carried on answering reads from its own copy of the data, which was now out of date. The Raft paper covers exactly this: before answering a read, a leader has to confirm with a majority that it's still the leader, or it may be answering from the past [1].

The fix is small. The lesson is bigger: *being the leader is a belief, not a fact*, and a machine can be confidently wrong about it. Once you've worked that out yourself, you'll see it everywhere: in leases, locks, failovers and any system where something thinks it's in charge. If someone had just told you, you'd remember it until lunch.

## Try before you look

When you're stuck, the fastest move is to search for the answer, ask a colleague, or ask an AI. Sometimes that's exactly right. But *when* you look matters a lot.

Think about what happens when you try first and fail. You go through everything you know that might be relevant, which strengthens it. You find out exactly where your knowledge runs out. And you build a kind of slot in your head shaped like the missing piece. When the answer arrives, it has somewhere to go. The same answer read cold just slides past, because nothing was waiting for it. Researchers who study this call it **productive failure**, and trying first tends to beat being told first by a wide margin [8].

There's an important catch, and it comes from a basic fact about how we think. You can only hold a handful of new things in your head at once. If a problem is so unfamiliar that you can't even make a real attempt, you're not struggling productively, you're just juggling too many unknowns and dropping them all. In that case a worked example or a good explanation really is the better starting point [9]. So the rule isn't "always struggle alone". It's "struggle once you have a foothold, then go and get the answer". Give yourself a fixed amount of time to write down your own theory of the bug before reading anyone else's. If you can't even start, you're missing a prerequisite, so get that first.

## Walk away, after real work

Henri Poincaré, one of the great mathematicians, described working on a problem for days without success, giving up, going on a geology trip, and having the key idea arrive the moment he stepped onto a bus, while talking about something else entirely [10]. Richard Hamming said something similar in his talk on doing great work: stay with a problem long enough and your mind keeps working on it even when you aren't [11].

Every engineer has their own version of this, usually involving a shower. But the important part of Poincaré's story is the days of work *before* the bus. A break only helps if the problem is fully loaded into your head first, and the more seriously you worked on it, the more the break pays off [12]. The universe does not reward you for napping on a bug you never looked at. Work on it properly, then go for a walk, and come back tomorrow.

## Learning to like it

None of this would matter much if hard work were simply unpleasant and always would be. But that isn't quite how people work.

We tend to think of effort as a cost. Yet people climb mountains, run ultramarathons and do cryptic crosswords for fun, precisely *because* they're hard [13]. And there's a good explanation for how a taste for hard work develops. When effort is followed by a reward again and again, some of the reward rubs off on the effort itself, until the feeling of working hard on something becomes satisfying in its own right [14]. In plain terms: every time you stay with a hard problem and it finally cracks, you're training yourself to find the next one a little less painful to start.

It's also worth knowing that one popular excuse didn't survive scrutiny. The idea that willpower is a fuel tank that empties with use was famous for years, but when many labs repeated the original experiment carefully, the effect all but disappeared [15]. You still get tired, of course. It's just that "I used up all my willpower on that bug" is, sadly, no longer a scientifically approved reason to stop.

> Every hard problem you finish makes the next one a little easier to start.

## Why it compounds

So far this has been about understanding. But there's a practical side too.

Easy problems are easy for everyone, which is exactly why they don't need you. The problems that matter are usually the ugly ones: the incident nobody can explain, the system nobody fully understands, the project where every option has a real cost. Hamming used to ask the scientists at Bell Labs over lunch, "What are the important problems of your field?" and then, "Why aren't you working on them?" [11]. He was not a popular lunch guest. But he had a point. Important problems and hard problems are mostly the same problems.

Hard problems also rarely come with a clear question attached. The requirements are vague, the obvious assumption turns out to be wrong, and every option trades one cost for another. The only way to get good at that kind of thinking is to spend time in it. The more comfortable you become with complexity, the better you get at thinking through it: you learn to work through ambiguity, question assumptions, reason about trade-offs, and start on problems that don't have an obvious answer.

And deep understanding compounds in a way shallow understanding doesn't. Go back to the cache and the index. Something you truly understand is connected to everything around it, so it makes the next related thing cheaper to learn. After you've properly understood one stale-leader bug, the next distributed systems incident isn't a mystery, it's a variation. Shallow understanding just sits in the cache until something else pushes it out.

## Where this goes wrong

It would be easy to turn all this into "suffering is good", and that's not the claim.

Difficulty only helps when you have a way in. A problem far beyond what you know gives you nothing to hold on to, and a problem well within what you know doesn't change you at all. The useful zone sits in between, just past your current reach, and it moves as you grow [16, 17].

<figure>
  <img src="/assets/posts/hard-things/zone.svg" alt="A chart with what you already know on the x axis and how hard the problem is on the y axis. The top-left region is Overwhelm, the bottom-right is Comfort, and a diagonal band between them is Productive struggle. A dashed arrow climbs along the band.">
  <figcaption>Figure 2: The useful zone is a moving band. As you learn more, the problems that stretch you get harder.</figcaption>
</figure>

Effort isn't everything, either. Practice matters a great deal, but talent, teaching, luck and choosing the right problems all matter too, and anyone promising that hard work alone guarantees mastery is overselling it [18]. And believing in hard work isn't the same as doing it. Feeling inspired by a post like this one is pleasant, but it won't fix the bug for you [19].

So the honest version of the claim is narrower: **staying with the right kind of difficulty, long enough for it to resolve, builds understanding that easier routes don't.**

## In practice

Here's what that looks like on an ordinary day with a strange incident, an unfamiliar codebase, or a design problem with no clear answer.

- **Write your own theory first.** Before searching or asking, spend a fixed amount of time writing down what you think is going on. A wrong theory still makes the right answer stick.
- **Explain it without looking.** After reading a design doc or a tricky piece of code, close it and sketch how it works. The parts you can't draw are the parts you don't understand yet.
- **Take "impossible" seriously.** When something can't happen and does, write down the belief it breaks. That belief is usually the bug.
- **Get a foothold if you're lost.** If you can't even start, step back to the basics or find a worked example. Struggling with no way in is just struggling.
- **Work hard, then walk away.** Load the problem fully, put in a serious session, then do something light.
- **Build a small version.** Feynman's blackboard said, "What I cannot create, I do not understand." Write a toy version and see exactly where your understanding breaks.

So go deep into the details. Read more. Understand systems at a fundamental level. Spend time with problems that stretch your current understanding. None of this has to be a grind. There's a sheer joy in it: the moment something that looked impossible last week suddenly seems obvious, and you can't quite remember why it was ever hard. That joy is also what sets you apart. Most people stop at the first page that doesn't make sense, or settle for an explanation that's just good enough to close the ticket. If you're willing to stay a little longer, you end up understanding things others don't, and that compounds over a whole career.

> Think hard. Do hard things. Stay curious!

## References

[1] Diego Ongaro and John Ousterhout, "In Search of an Understandable Consensus Algorithm", *USENIX Annual Technical Conference*, 2014.

[2] Leslie Lamport, "The Part-Time Parliament", *ACM Transactions on Computer Systems* 16(2), 1998.

[3] Leslie Lamport, "Paxos Made Simple", *ACM SIGACT News* 32(4), 2001.

[4] Robert A. Bjork and Elizabeth L. Bjork, "A New Theory of Disuse and an Old Theory of Stimulus Fluctuation", in A. Healy, S. Kosslyn and R. Shiffrin (eds.), *From Learning Processes to Cognitive Processes*, Vol. 2, Erlbaum, 1992.

[5] Henry L. Roediger III and Jeffrey D. Karpicke, "Test-Enhanced Learning: Taking Memory Tests Improves Long-Term Retention", *Psychological Science* 17(3), 2006.

[6] Nicholas C. Soderstrom and Robert A. Bjork, "Learning versus Performance: An Integrative Review", *Perspectives on Psychological Science* 10(2), 2015.

[7] Sidney D'Mello, Blair Lehman, Reinhard Pekrun and Art Graesser, "Confusion Can Be Beneficial for Learning", *Learning and Instruction* 29, 2014.

[8] Tanmay Sinha and Manu Kapur, "When Problem Solving Followed by Instruction Works: Evidence for Productive Failure", *Review of Educational Research* 91(5), 2021.

[9] Paul A. Kirschner, John Sweller and Richard E. Clark, "Why Minimal Guidance During Instruction Does Not Work", *Educational Psychologist* 41(2), 2006.

[10] Henri Poincaré, "Mathematical Creation", in *Science and Method*, 1908.

[11] Richard Hamming, "You and Your Research", talk at Bell Communications Research, March 7, 1986.

[12] Ut Na Sio and Thomas C. Ormerod, "Does Incubation Enhance Problem Solving? A Meta-Analytic Review", *Psychological Bulletin* 135(1), 2009.

[13] Michael Inzlicht, Amitai Shenhav and Christopher Y. Olivola, "The Effort Paradox: Effort Is Both Costly and Valued", *Trends in Cognitive Sciences* 22(4), 2018.

[14] Robert Eisenberger, "Learned Industriousness", *Psychological Review* 99(2), 1992.

[15] Martin S. Hagger, Nikos L. D. Chatzisarantis et al., "A Multilab Preregistered Replication of the Ego-Depletion Effect", *Perspectives on Psychological Science* 11(4), 2016.

[16] Lev Vygotsky, *Mind in Society: The Development of Higher Psychological Processes*, Harvard University Press, 1978.

[17] Mihaly Csikszentmihalyi, *Flow: The Psychology of Optimal Experience*, Harper & Row, 1990.

[18] Brooke N. Macnamara, David Z. Hambrick and Frederick L. Oswald, "Deliberate Practice and Performance in Music, Games, Sports, Education, and Professions: A Meta-Analysis", *Psychological Science* 25(8), 2014.

[19] Victoria F. Sisk, Alexander P. Burgoyne, Jingze Sun, Jennifer L. Butler and Brooke N. Macnamara, "To What Extent and Under Which Circumstances Are Growth Mind-Sets Important to Academic Achievement? Two Meta-Analyses", *Psychological Science* 29(4), 2018.
