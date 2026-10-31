---
layout: post
title: "Get Comfortable with Hard Things"
date: 2026-10-30
tags: [learning, engineering, psychology]
---

<div class="tldr" markdown="1">
- Being stuck on hard material for a long time is normal. Decades of memory research suggest it's often where the learning actually happens.
- Memory has two strengths: how easily you can recall something *right now*, and how deeply it's stored. Effortful recall builds the deep one. Easy re-reading mostly doesn't.
- That's why methods that feel hard (recalling, spacing, mixing topics, trying before being taught) beat methods that feel easy on later tests, even though people reliably predict the opposite.
- Confusion that you work your way out of leads to better learning, and breaks help most *after* serious effort.
- You can learn to enjoy effort. "I've run out of willpower" did not survive a large replication.
- The limits matter: difficulty only helps when you have a way in, and practice explains only part of skill.
</div>

Lately I've been thinking about why it matters to get comfortable working on hard problems for long stretches of time. Sometimes you read pages of technical material and still don't understand what's going on. You keep reading, look into related ideas, connect them, and eventually things start to click.

That has always felt true to me. But "it felt true to me" is also what people say about astrology, so in this post I want to check it properly. Is struggling actually useful, or is it just a story we tell ourselves so being stuck feels noble? When does it help, and when is it just suffering with extra steps? Psychology can't give us proofs the way math can, but it does give us careful experiments, large replications and meta-analyses that pool hundreds of studies. Some of the answers are surprisingly clear.

We'll carry one example all the way through. You're an engineer, and you sit down to learn how distributed consensus works. The famous algorithm is Paxos. Its inventor, Leslie Lamport, first described it as the parliament of a fictional ancient Greek island, complete with legislators and archaeologists [1]. People found this hard to follow, so he wrote a follow-up whose first sentence is: "The Paxos algorithm, when presented in plain English, is very simple" [2]. Many engineers who have read it disagree. Years later, Diego Ongaro and John Ousterhout designed Raft specifically to be *understandable* [3]. It's genuinely clearer, and most people still don't get it on the first read.

So you open the Raft paper, read section 5, and understand about a third of it. Let's work out what you should do next.

## Start from zero: what does "learning" even mean?

Before we can say whether struggle helps learning, we need to say what learning is. It sounds like a silly question, but the answer explains everything else in this post.

Robert and Elizabeth Bjork, two psychologists at UCLA who have studied memory for decades, proposed that every memory has two separate strengths [4]:

- **Retrieval strength** is how easily you can bring something to mind *right now*. Your phone number has high retrieval strength. The name of someone you met at a party ten minutes ago also has high retrieval strength, for about another ten minutes.
- **Storage strength** is how deeply something is embedded, how well it's connected to everything else you know. Once built, the theory says it doesn't really decay. It's why a song you haven't heard in fifteen years comes back after two notes.

If you're an engineer, a loose analogy helps. Retrieval strength is like whether something is in cache. Storage strength is like how well it's indexed on disk. Cramming the night before an exam warms the cache beautifully and builds almost no index, which is why it works on Thursday and is gone by the following Monday.

Now the key part. In the Bjorks' theory, the two strengths interact in a specific way: **the harder it is to retrieve something, the more storage strength you gain when you do manage to retrieve it** [4]. If something is already easy to recall, recalling it again teaches you very little. If it has started to fade and you have to work to drag it back, that effort is exactly what deepens the memory.

> Some forgetting isn't the opposite of learning. Working to recall something you've half forgotten is one of the main ways learning happens.

That one idea predicts a lot. It predicts that the way of studying that *feels* best (re-reading until everything looks familiar) will work worst, because it only ever touches things that are already easy to recall. It predicts that waiting a bit before reviewing will help, because the material has had time to fade. And it predicts that people will be bad at judging their own learning, because the feeling we use to judge it, how fluent things seem right now, measures retrieval strength, not storage strength. Let's see if those predictions hold.

## Prediction 1: the hard way of studying wins later

Henry Roediger and Jeffrey Karpicke had students read short science passages and then either read them again or try to recall them from memory without looking [5]. Five minutes later, the re-readers did better. That's the cache at work. Two days later, and again a week later, the result flipped: the students who had practised recalling remembered substantially more. The best part is that the re-readers felt *more confident* they had learned the material. They were wrong, and they were sure about it.

<figure>
  <img src="/assets/posts/hard-things/crossover.svg" alt="Two lines over time. Re-reading starts higher at 5 minutes but falls steeply by 1 week. Recalling starts slightly lower but stays much higher by 1 week.">
  <figcaption>Figure 1: The shape of the testing-effect result. The easy method wins in the moment and loses later.</figcaption>
</figure>

Spacing shows the same pattern. Nicholas Cepeda and colleagues pooled results from 317 experiments on spreading study sessions out versus cramming them together [6]. Spreading them out consistently won. They also found that the longer you want to remember something, the larger the best gap between sessions. That fits the theory: let the cache go a little cold, then do the work of bringing it back.

Generating answers also beats reading them. In a classic set of experiments, Slamecka and Graf found that people remember words better when they produce them themselves from a clue (for example, "hot – c___" → "cold") than when they simply read the same word pair [7]. The extra effort of producing the answer is the point.

Mixing topics wins too. Nate Kornell and Robert Bjork had people learn the styles of different painters, either by seeing one painter's work at a time or with several painters mixed together [8]. Mixing felt harder and messier, and it led to better recognition of new paintings people hadn't seen before. When asked afterwards, most participants still said that seeing one painter at a time had worked at least as well. They had just scored worse with it.

The Bjorks call all of these **desirable difficulties** [9]: things that slow down how fast you *seem* to be learning while improving what you actually keep [10]. Nicholas Soderstrom and Robert Bjork reviewed this whole area and put it bluntly: performance while you practise is a poor guide to long-term learning, and the conditions that cause the most mistakes during practice are often the ones that produce the most learning [11].

Back to Raft. The comfortable move is to read section 5 a fourth time, nodding along. The evidence-backed move is to close the paper and try to explain, on a blank sheet, why a server needs votes from a *majority* to become leader and not just "most of the servers it can reach". You'll get stuck within about ninety seconds. That's not a sign it isn't working. That's the part where it works.

## Prediction 2: confusion can be useful

If effortful retrieval helps, what about the feeling of being lost, the "I've read this three times and I'm now less sure than when I started" feeling?

Sidney D'Mello and colleagues tested this directly [12]. Learners worked through scientific reasoning problems with two animated tutors on screen, and in some trials the tutors deliberately contradicted each other, which is a reliable way to confuse anyone (ask anyone with two senior engineers on the same code review). When the contradictions didn't confuse people, they had no effect. When they *did* confuse people, those learners scored substantially higher on later tests, including tests that asked them to apply the ideas to new situations.

The researchers are careful about the conditions, and they matter. The confusion has to be about the material itself, the learner has to actually try to resolve it, and help should be available if they get truly stuck. Confusion you never resolve is just frustration. Confusion you work your way out of forces you to tear down a wrong mental model and build a better one, and the rebuilt model is what you keep.

For Raft, the useful confusion often looks like this: "If leaders are chosen by a simple vote, what stops a server with an old, out-of-date log from winning and overwriting newer data?" That question nags at you, and it should, because it points straight at a rule you missed: servers refuse to vote for a candidate whose log is less up to date than their own. If you go looking for that answer, you'll remember the rule for years. If someone just tells you, you'll remember it until lunch.

## Prediction 3: try first, get taught second

The normal order of teaching is to explain the idea and then hand out practice problems. Manu Kapur has spent about twenty years testing the reverse: give people a problem they can't fully solve yet, let them try and mostly fail, and *then* teach the proper method. He calls this **productive failure**.

In 2021, Tanmay Sinha and Kapur pooled 53 studies with 166 comparisons between "try first, then get taught" and "get taught first, then practise" [13]. Trying first came out clearly ahead, with a large effect even after adjusting for the usual bias toward publishing positive results. In terms of the two strengths, your failed attempt does two things. It makes you dig through what you already know, and it shows you exactly where your knowledge runs out. When the explanation arrives, it has a ready-made place to go.

Now the counterweight, because research on struggle comes with a very good opposing argument. Cognitive load theory, developed by John Sweller and others, starts from a simple fact: working memory is tiny. You can hold only a handful of new things in mind at once. Complete beginners who are thrown into open-ended problems with no structure tend to fill working memory with flailing and learn very little, and for them, carefully worked examples often beat problem solving [14]. There's also an **expertise reversal effect**: guidance that helps a beginner can get in the way of someone more experienced, and vice versa [15]. Even in Kapur's own meta-analysis, the youngest learners tended to do better with instruction first.

These two lines of research fit together once you add one condition. **Struggle helps when you know enough to make a real attempt, and when good teaching follows.** For Raft, that means first making sure you know what a replicated log is and why networks lose messages, then spending twenty minutes trying to design leader election yourself, and *then* reading section 5. You'll read it like someone checking their answers rather than someone deciphering ancient Greek, which, given the history of Paxos, is a real upgrade.

## Prediction 4: walk away, but only after real work

Henri Poincaré, one of the great mathematicians, described working on a problem for days without success, giving up, going on a geology trip, and having the key insight arrive the moment he stepped onto a bus, while talking about something else entirely [16]. Richard Hamming made a similar point in his famous talk on doing great research: if you stay with a problem long enough and without distraction, your subconscious starts working on it too [17].

That's the shower-thought theory of discovery, and it's been tested properly. Ut Na Sio and Thomas Ormerod combined 117 studies on "incubation", taking a break partway through solving a problem, and found a real, positive effect [18]. Two details are worth knowing. First, **the longer people worked on the problem before the break, the bigger the benefit**. Second, filling the break with demanding mental work reduced the benefit, while light, easy activities often helped more than doing nothing at all.

So the lesson isn't "relax and the answer will come". The universe does not reward you for napping on a problem you never started. The lesson is to work on a hard problem properly, then go for a walk, and come back. The break pays off in proportion to the effort you put in before it.

## Prediction 5: effort can become enjoyable

The last line of my original note said there's real joy in this process. Is that just a personality type, or can it be learned?

The standard view in psychology and economics is that effort is a cost, and people and animals try to avoid it. Michael Inzlicht, Amitai Shenhav and Christopher Olivola argue that's only half the picture [19]. People also seek out effort. They climb mountains, run ultramarathons and do cryptic crosswords precisely *because* these things are hard, and we tend to value things more when they took effort to make (which is also why your own code always looks better to you than anyone else's). They call this **the effort paradox**.

Robert Eisenberger's theory of **learned industriousness** explains part of how this happens [20]. When high effort is repeatedly followed by reward, the feeling of effort itself picks up some of that reward and becomes less unpleasant. Over time this produces lasting differences in how much effort people are willing to put in, and it carries over to new tasks. In plain terms: each time you stay with a hard problem and it finally clicks, you're training yourself to find the next hard problem a little less painful to start.

It's also worth knowing which popular idea *didn't* hold up. "Ego depletion", the claim that willpower is like a fuel tank that empties as you use it, was one of the most famous findings in psychology. Then 23 labs ran the same pre-registered experiment with more than 2,000 people, and the effect came out close to zero [21]. That doesn't mean you never get tired. It just means "I used up all my willpower on that bug" is, sadly, no longer a scientifically approved excuse.

> Every hard problem you finish makes the next one a little easier to start.

## What the evidence does *not* say

A post about going deep should go deep on its own weak spots, so here are three.

**Difficulty only helps when you have a way in.** The Bjorks' phrase is *desirable* difficulties, not just difficulties. Reading a paper in a language you don't speak is very hard and teaches you nothing. Lev Vygotsky described the same idea as the **zone of proximal development**: the range of things you can't do alone yet, but can do with some support [22]. Mihaly Csikszentmihalyi found that people do their most absorbed, satisfying work when the challenge sits just above their current skill [23]. Too easy and nothing changes. Too hard and you just thrash.

<figure>
  <img src="/assets/posts/hard-things/zone.svg" alt="A chart with what you already know on the x axis and how hard the problem is on the y axis. The top-left region is Overwhelm, the bottom-right is Comfort, and a diagonal band between them is Productive struggle. A dashed arrow climbs along the band.">
  <figcaption>Figure 2: The useful zone is a moving band. As you learn more, the problems that stretch you get harder.</figcaption>
</figure>

**Practice isn't everything.** The popular "10,000 hours" idea grew out of research on deliberate practice. Brooke Macnamara, David Hambrick and Frederick Oswald pooled 88 studies and found deliberate practice explained about 12% of the differences in performance overall: about 26% in games, 21% in music, 18% in sports, 4% in education and under 1% in professions [24]. Practice matters a great deal. It's just not the whole story, and anyone promising that effort alone guarantees mastery is overselling.

**Believing isn't doing.** "Growth mindset", the belief that ability can grow, usually turns up in posts like this one. A large 2018 pair of meta-analyses found only a weak link between mindset and academic results, and small effects from mindset interventions, mostly concentrated among students at academic risk or from low-income backgrounds [25]. Believing hard things are worth doing is pleasant. It won't do them for you.

To me, these limits make the case stronger, not weaker. The claim isn't that suffering is good, or that grinding guarantees success. It's narrower, and much better supported: **staying with the right kind of difficulty, long enough for it to resolve, builds understanding that easier routes don't.**

## A playbook for hard technical material

Here's what all of this looks like for something like the Raft paper, a database storage engine, or a large system you've just inherited with no documentation and a lot of comments that say `// TODO: fix later`.

- **Try before you read the answer.** Before reading how something works, spend a fixed amount of time designing it yourself. Your broken design is what makes the real one make sense.
- **Recall instead of re-reading.** After a section, close it and write down what you understood. The gaps you find are exactly what to read next.
- **Chase contradictions.** When two things seem to conflict, write the conflict down. Resolving it is usually the key idea.
- **Space and mix.** Come back to the material over several days, and switch between related topics (Raft and Paxos, B-trees and LSM trees) instead of finishing one completely before starting the other.
- **Make sure you have a way in.** If you're in the overwhelm zone, step back to the prerequisites or a worked example. Struggling without a foothold is just struggling.
- **Work hard, then walk away.** Put in a serious session, do something light, and come back the next day.
- **Build it.** Feynman's blackboard famously said, "What I cannot create, I do not understand." Write a small toy implementation and see exactly where your understanding breaks.

None of this has to be a grind. There's a real joy in it: the moment something that looked impossible last week suddenly seems obvious, and you can't remember why it was ever hard. That joy is also what sets you apart. Most people stop at the first page that doesn't make sense, or settle for an explanation that's just good enough to get by. If you're willing to stay a little longer, you end up understanding things others don't, and that compounds over a whole career.

## Recap

- Memory has two strengths: how easy something is to recall now, and how deeply it's stored. Effortful recall builds the deep one [4].
- So methods that feel hard (recalling, spacing, generating, mixing) beat methods that feel easy on later tests, even though people consistently believe the opposite [5–11].
- Confusion that you resolve leads to deeper learning [12].
- Trying before being taught tends to beat being taught first, as long as you know enough to make a real attempt [13–15].
- Breaks help most after serious effort [18].
- Effort can become rewarding with experience, and the "willpower runs out" story replicated poorly [19–21].
- The limits are real: difficulty has to be the right kind, practice is only part of skill, and believing isn't doing [22–25].

> Think hard. Do hard things. Stay curious!

## References

[1] Leslie Lamport, "The Part-Time Parliament", *ACM Transactions on Computer Systems* 16(2), 1998.

[2] Leslie Lamport, "Paxos Made Simple", *ACM SIGACT News* 32(4), 2001.

[3] Diego Ongaro and John Ousterhout, "In Search of an Understandable Consensus Algorithm", *USENIX Annual Technical Conference*, 2014.

[4] Robert A. Bjork and Elizabeth L. Bjork, "A New Theory of Disuse and an Old Theory of Stimulus Fluctuation", in A. Healy, S. Kosslyn and R. Shiffrin (eds.), *From Learning Processes to Cognitive Processes: Essays in Honor of William K. Estes*, Vol. 2, Erlbaum, 1992.

[5] Henry L. Roediger III and Jeffrey D. Karpicke, "Test-Enhanced Learning: Taking Memory Tests Improves Long-Term Retention", *Psychological Science* 17(3), 2006.

[6] Nicholas J. Cepeda, Harold Pashler, Edward Vul, John T. Wixted and Doug Rohrer, "Distributed Practice in Verbal Recall Tasks: A Review and Quantitative Synthesis", *Psychological Bulletin* 132(3), 2006.

[7] Norman J. Slamecka and Peter Graf, "The Generation Effect: Delineation of a Phenomenon", *Journal of Experimental Psychology: Human Learning and Memory* 4(6), 1978.

[8] Nate Kornell and Robert A. Bjork, "Learning Concepts and Categories: Is Spacing the 'Enemy of Induction'?", *Psychological Science* 19(6), 2008.

[9] Robert A. Bjork, "Memory and Metamemory Considerations in the Training of Human Beings", in J. Metcalfe and A. Shimamura (eds.), *Metacognition: Knowing about Knowing*, MIT Press, 1994.

[10] Elizabeth L. Bjork and Robert A. Bjork, "Making Things Hard on Yourself, But in a Good Way: Creating Desirable Difficulties to Enhance Learning", in *Psychology and the Real World*, Worth Publishers, 2011.

[11] Nicholas C. Soderstrom and Robert A. Bjork, "Learning versus Performance: An Integrative Review", *Perspectives on Psychological Science* 10(2), 2015.

[12] Sidney D'Mello, Blair Lehman, Reinhard Pekrun and Art Graesser, "Confusion Can Be Beneficial for Learning", *Learning and Instruction* 29, 2014.

[13] Tanmay Sinha and Manu Kapur, "When Problem Solving Followed by Instruction Works: Evidence for Productive Failure", *Review of Educational Research* 91(5), 2021.

[14] Paul A. Kirschner, John Sweller and Richard E. Clark, "Why Minimal Guidance During Instruction Does Not Work", *Educational Psychologist* 41(2), 2006.

[15] Slava Kalyuga, Paul Ayres, Paul Chandler and John Sweller, "The Expertise Reversal Effect", *Educational Psychologist* 38(1), 2003.

[16] Henri Poincaré, "Mathematical Creation", in *Science and Method*, 1908.

[17] Richard Hamming, "You and Your Research", talk at Bell Communications Research, March 7, 1986.

[18] Ut Na Sio and Thomas C. Ormerod, "Does Incubation Enhance Problem Solving? A Meta-Analytic Review", *Psychological Bulletin* 135(1), 2009.

[19] Michael Inzlicht, Amitai Shenhav and Christopher Y. Olivola, "The Effort Paradox: Effort Is Both Costly and Valued", *Trends in Cognitive Sciences* 22(4), 2018.

[20] Robert Eisenberger, "Learned Industriousness", *Psychological Review* 99(2), 1992.

[21] Martin S. Hagger, Nikos L. D. Chatzisarantis et al., "A Multilab Preregistered Replication of the Ego-Depletion Effect", *Perspectives on Psychological Science* 11(4), 2016.

[22] Lev Vygotsky, *Mind in Society: The Development of Higher Psychological Processes*, Harvard University Press, 1978.

[23] Mihaly Csikszentmihalyi, *Flow: The Psychology of Optimal Experience*, Harper & Row, 1990.

[24] Brooke N. Macnamara, David Z. Hambrick and Frederick L. Oswald, "Deliberate Practice and Performance in Music, Games, Sports, Education, and Professions: A Meta-Analysis", *Psychological Science* 25(8), 2014.

[25] Victoria F. Sisk, Alexander P. Burgoyne, Jingze Sun, Jennifer L. Butler and Brooke N. Macnamara, "To What Extent and Under Which Circumstances Are Growth Mind-Sets Important to Academic Achievement? Two Meta-Analyses", *Psychological Science* 29(4), 2018.
