---
layout: post
title: "C++ Still Powers Today's Core Systems"
date: 2026-10-26
tags: [programming, systems, ai]
---

<div class="tldr" markdown="1">

**TL;DR**

- Computers are fast at math and slow at fetching data from memory. Most performance comes down to how data is laid out.
- C++ lets you decide exactly how data sits in memory and exactly when work happens, without paying for anything you didn't ask for.
- That's why so much infrastructure is written in it: databases, storage, streaming, query engines, browsers, compilers.
- AI makes this more important, not less. Python decides what to run, but C++ and CUDA do the actual work, and every token served costs money.
- The price is memory safety. Rust is the serious alternative, and the ideas behind both languages are the same ones.

</div>

Most of my career has been in Java and Python, and over the years I've used C++ systems every day without really looking at them: the database under a service, the storage engine under the database, the kernels under a model. I wanted to understand why all of these ended up in the same language. In this post I'll work it out from the ground up, starting with how a computer actually runs a program and building up from there to databases and AI.

## Step 1: Start With the Machine

A computer does two things: it computes, and it moves data around. Computing is cheap, and a modern CPU can do billions of additions per second. Moving data is expensive. The CPU keeps a small, fast memory right next to it called the **cache**, and reading a value from the cache takes about 1 nanosecond, while reading it from main memory (RAM) takes about 100 nanoseconds.

Scale those up to human time. If reading from the cache is like picking up a book from your desk in 1 second, reading from RAM is like walking to another room and back, which takes 100 seconds. If your program keeps making that walk, it doesn't matter how fast your math is.

One more detail matters. When the CPU fetches from RAM, it doesn't bring back a single value but a whole block of 64 bytes, called a **cache line**. If the next value you need sits right after the current one, it arrives for free. If it lives somewhere else, you walk to the other room again. That gives us the first rule of fast programs:

> Keep data close together, and read it in order.

## Step 2: Same Data, Three Languages

Let's take one small example and carry it through the rest of the post: a million 2D points, each with an `x` and a `y` stored as 8-byte numbers, and we want to add up all the `x` values. The data is the same in every language, but how it sits in memory is not.

<figure>
  <img src="/assets/posts/cpp/layout.svg" alt="Memory layout of points in three languages. C++ stores x and y values side by side. Java stores an array of references to separate objects with headers. Python stores references to tuples, which reference separate float objects.">
  <figcaption>Figure 1: A list of points in memory, in C++, Java and Python.</figcaption>
</figure>

- **C++.** A `std::vector<Point>` stores the points themselves, one after another. Each point is 16 bytes, so one cache line holds 4 points, and summing the `x` values is a straight walk through memory. The CPU can even fetch the next lines before you ask for them.
- **Java.** An `ArrayList<Point>` stores *references* to points. Each point is a separate object on the heap with a header (usually 12 bytes) in front of its fields, which works out to about 36 bytes per point. To read an `x`, the CPU first reads the reference and then jumps to the object.
- **Python.** A list of `(x, y)` tuples holds references to tuple objects, which hold references to float objects. `sys.getsizeof` says a tuple of two floats is 56 bytes and each float is 24, so with the list slot it's about 112 bytes per point, and reading one `x` means following two references.

The same million points take about 16 MB in C++, about 36 MB in Java and about 112 MB in Python. The bigger layouts aren't just bigger, they're scattered, which means more walks to the other room. None of this makes Java or Python bad. They trade memory layout for convenience, and most of the time that's the right trade. C++ is built for the cases where it isn't.

## Step 3: The Idea Behind C++

In 1979, Bjarne Stroustrup was working at Bell Labs and wanted two things no single language gave him: the program structure of Simula, a language with classes, and the speed of C. So he added classes to C. He called it "C with Classes", and in 1983 it was renamed C++ [1]. The principle he built it on is called **zero overhead**:

> What you don't use, you don't pay for. And what you do use, you couldn't write any better by hand.

Our `vector<Point>` is a good example. It gives you a resizable list with a clean interface, and in memory it's exactly what you'd get if you managed a raw array yourself. The abstraction costs nothing at runtime.

## Step 4: Control Over *When*

Layout is half the story, and timing is the other half. In Java and Python, a **garbage collector** frees memory you're no longer using. That's convenient, but it runs when it decides to, and sometimes it pauses your program to do it. For a web page that's fine; for a database answering a million requests a second, a pause shows up as slow requests.

C++ has no garbage collector. Instead, an object is cleaned up at the exact moment it goes out of scope. This pattern is called **RAII** (Resource Acquisition Is Initialization), and it works for any resource, not just memory:

```cpp
void append_record(const std::string& path, const Record& r) {
    std::ofstream file(path, std::ios::app);  // file opens here
    file << r.serialize();
}                                             // file closes here, even if an exception is thrown
```

There's no `finally`, no `with` and no collector. The cleanup is tied to the scope, so you always know when it happens.

## Step 5: When Does This Actually Matter?

For most programs, it doesn't. If a request spends 50 milliseconds waiting on the network, saving a microsecond on memory layout changes nothing. It starts to matter when the same small piece of code runs billions of times, on thousands of machines, and someone pays for every one of those machines or every millisecond of delay. If a system runs on 1,000 servers and you make its hot loop 30% faster, that's roughly 300 servers you no longer need. At that point the choice of language stops being a matter of taste and becomes a line on a budget.

## Step 6: Where C++ Runs

Once you know what to look for, you find C++ under almost every piece of infrastructure that has to be fast or cheap at scale.

<figure>
  <img src="/assets/posts/cpp/map.svg" alt="A grid of eight areas where C++ runs: databases, storage, streaming, query engines, AI frameworks, browsers, networking, and games, finance and space, with examples in each.">
  <figcaption>Figure 2: Some well known systems written mostly in C++.</figcaption>
</figure>

Several of these stories share a pattern. Apache Cassandra is written in Java, and ScyllaDB is a rewrite of it in C++, built so that each CPU core owns its own slice of the data and cores don't wait on each other. Redpanda did the same for Kafka: it speaks the Kafka protocol, but there's no JVM underneath. Databricks runs Apache Spark, which lives on the JVM, and when they wanted faster queries they wrote a new execution engine called Photon in C++ and placed it underneath Spark [2]. The open source Apache Gluten project does something similar for regular Spark, handing the actual execution to native C++ engines. In every case the interface stayed the same and only the engine changed:

> The JVM stays where it's good: planning, scheduling, coordination. The hot loop that touches every row moves to C++.

Beyond that pattern, C++ shows up almost everywhere you look:

- **Storage and analytics.** Ceph, the distributed storage system behind many private clouds; FoundationDB, the transactional key-value store Apple open sourced in 2018 and runs underneath CloudKit; LevelDB, Google's small embedded key-value store; and ClickHouse and DuckDB, two of the most popular analytical databases.
- **Streaming and networking.** WebRTC, the library behind real-time audio and video in Chrome and many calling apps, and Envoy, the proxy in front of a large share of modern microservices.
- **Places where failure is expensive.** The F-35's flight software was written in C++ under a strict coding standard from Lockheed Martin [3], and NASA JPL's F´ (F Prime) framework is C++ and flew on the Ingenuity helicopter on Mars [4]. Trading systems use it because a microsecond is money, and game engines like Unreal use it because at 60 frames per second each frame gets about 16 milliseconds and not one more.
- **The tools themselves.** Chrome and its JavaScript engine V8 are C++, which means Node.js is too, underneath. So is LLVM, the compiler toolkit behind Clang, Swift and Rust.

## Step 7: Why It Matters More in AI

If you work with models, you mostly write Python, and it's easy to conclude that Python runs AI. It doesn't, really. Python *steers* AI.

<figure>
  <img src="/assets/posts/cpp/stack.svg" alt="Four layers: Python code on top, C++ libraries below it, CUDA C++ kernels below that, and hardware at the bottom.">
  <figcaption>Figure 3: What happens when you call a model from Python.</figcaption>
</figure>

Follow one call down the stack. You call a layer in PyTorch from Python, and Python makes a single function call into ATen, PyTorch's C++ tensor library. ATen picks a GPU kernel, written in CUDA C++ or taken from NVIDIA libraries like cuBLAS and cuDNN, and the GPU runs that kernel over millions of numbers. Python decided *what* to run, but it never touched the numbers. It's the same split we saw with Spark and Photon: Python is the control plane, and C++ is the data plane.

This matters more now because of where the cost moved. Training a model is a large cost, but you pay it once. Serving a model is a cost on every token, for every user, every day, and at that scale a kernel that's 20% faster means roughly 20% fewer GPUs. That's why inference engines are written close to the hardware. NVIDIA's TensorRT-LLM has a C++ runtime, and llama.cpp, started by Georgi Gerganov in 2023, showed that you can run large language models on a laptop if you're careful enough about memory and arithmetic, doing it in C and C++.

It also ties straight back to Step 1. FlashAttention, one of the most important speedups of the last few years, isn't a new model at all. It computes the exact same attention, just arranged so it moves less data between the GPU's slow memory and its fast memory [5]. It's the desk and the other room again, on a GPU.

There's a fair counterpoint. Tools like OpenAI's Triton let you write GPU kernels in a Python-like language, and that's a real step forward. But Triton is a compiler built on LLVM and MLIR, which are C++, so the C++ didn't disappear; it moved one layer down. And as for AI writing code, models can now write plenty of C++ for us, but I don't think that makes the language less worth learning. The hard part of systems work was never typing the code. It's knowing why one layout is ten times faster than another, and noticing when the generated code gets it wrong.

## Step 8: The Cost

C++ gives you control, and control includes the ability to get things badly wrong. The language will let you read past the end of an array, use memory after you've freed it, or write code with **undefined behavior** that works on your laptop and fails in production. The Chromium team found that around 70% of their serious security bugs were memory safety problems [6], and Microsoft has reported a similar number.

This is why Rust exists, and why parts of Android, Windows and the Linux kernel are adopting it. I think that's a good shift. C++ is responding with safer defaults and hardened standard libraries, but the billions of lines of C++ already running the systems above aren't going anywhere soon. For me, none of this changes the decision. The ideas that make C++ hard (ownership, lifetimes, memory layout) are the same ideas Rust makes you write down explicitly, and learning one makes the other much easier.

## Step 9: Coming From Java and Python

Here's what I expect to be different, written down so I can check back later:

- **Values, not references.** In Java, `a = b` copies a reference; in C++, it copies the object. You choose explicitly when you want a reference (`&`) or a pointer (`*`).
- **Ownership.** Every piece of memory has an owner. `std::unique_ptr` means one owner and `std::shared_ptr` means shared ownership, and raw `new` and `delete` should almost never appear in modern code.
- **Move semantics.** Instead of copying a large object, you can move it, handing over its insides and leaving the original empty. A lot of C++'s speed lives here.
- **Templates.** Java generics are erased at runtime, while C++ templates generate a separate copy of the code for each type. That's why they're fast, and also why the error messages are long.
- **The build.** Headers, compilation units, linkers and CMake are all things Java and Python hide, and C++ doesn't.

My plan is to read *A Tour of C++* by Stroustrup to get the shape of the modern language, then *Effective Modern C++* by Scott Meyers for the details. After that I'll read real code, since DuckDB and LevelDB are both readable and well documented, and build something small and real, probably a log-structured key-value store, because it touches memory layout, files and concurrency all at once.

## Wrapping Up

Here's the path we took:

1. Computers are fast at math and slow at fetching data, so layout decides speed.
2. The same million points take about 16 MB in C++, 36 MB in Java and 112 MB in Python, and the bigger layouts are scattered too.
3. C++ was built on zero overhead, giving you abstractions without paying for them at runtime, and on control over *when* cleanup happens.
4. That control matters when the same code runs billions of times on thousands of machines, which is why the hot path of databases, storage, query engines and browsers is C++ even when everything around it isn't.
5. AI follows the same split: Python steers, C++ does the work, and serving cost makes every percent count.

I started this thinking C++ survived mostly because of old code. That's part of it, but not the main part. It's still here because it's the language that lets you decide exactly where data lives and exactly when work happens, and when the same loop runs a trillion times, that's what matters. I'll write more as I go.

## References

[1] Bjarne Stroustrup, *The Design and Evolution of C++*, Addison-Wesley, 1994.

[2] A. Behm et al., "Photon: A Fast Query Engine for Lakehouse Systems", SIGMOD 2022.

[3] [Joint Strike Fighter Air Vehicle C++ Coding Standards](https://www.stroustrup.com/JSF-AV-rules.pdf)

[4] [F´ (F Prime): a flight software framework from NASA JPL](https://github.com/nasa/fprime)

[5] T. Dao et al., "FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness", NeurIPS 2022.

[6] [The Chromium Projects: Memory safety](https://www.chromium.org/Home/chromium-security/memory-safety/)
