---
layout: post
title: "Why I'm Learning C++"
date: 2026-10-26
---

In 1979, Bjarne Stroustrup was working at Bell Labs on a problem in distributed systems. He wanted the program structure of Simula, a language with classes, and the speed of C. No language gave him both, so he added classes to C. He called it "C with Classes", and in 1983 it was renamed C++ [1].

Almost fifty years later, a surprising amount of the world still runs on it. Most of my career has been in Java and Python, and I've been using C++ systems every day without really looking at them. The database under a service, the storage engine under the database, the kernels under a model. I wanted to understand why these all ended up in the same language.

In this post I'll try to answer that from first principles: what a program actually costs, where that cost matters, and why I think it matters even more now that so much of computing is AI.

## What a Program Costs

A computer does two things: it computes, and it moves data. Computing is cheap. Moving data is not.

Reading a value from the CPU's L1 cache takes about a nanosecond. Reading it from main memory takes about 100 nanoseconds. That's a factor of 100, and in a tight loop it decides almost everything. A program that reads memory in order, so the next value is already in cache, can be many times faster than one that jumps around, even when both do the same arithmetic.

Now look at how each language lays out a simple list of numbers.

In Python, every integer is a full object. On a 64-bit machine, `sys.getsizeof(1)` is 28 bytes for a number that needs 8. A list of a million integers is really a million pointers, each pointing to a separate object somewhere on the heap.

In Java, an `int[]` is a tight array, which is great. But a `List<Integer>` or an array of objects is again an array of pointers, and every object carries a header (usually 12 bytes, padded to 16) before any of your fields.

In C++, a `std::vector<Point>` stores the points themselves, one after another in memory. There are no headers and no pointers to chase. The CPU reads them in order and the cache does the rest.

That's the first idea behind C++, and Stroustrup states it as the **zero-overhead principle**: what you don't use, you don't pay for, and what you do use, you couldn't write better by hand [1].

The second idea is **deterministic cleanup**. In Java and Python, a garbage collector frees memory at some point later. That's convenient, but it means you don't fully control when work happens. In C++, an object is destroyed at the exact moment it goes out of scope. This pattern is called RAII (Resource Acquisition Is Initialization), and it applies to everything, not just memory:

```cpp
void append_record(const std::string& path, const Record& r) {
    std::ofstream file(path, std::ios::app);  // file opens here
    file << r.serialize();
}                                             // file closes here, even on an exception
```

No `finally`, no `with`, no collector. The cleanup is tied to the scope.

None of this matters for most programs. If a request spends 50 milliseconds waiting on the network, saving a microsecond in memory layout changes nothing. It starts to matter when the same small piece of code runs billions of times a day, on thousands of machines, and someone pays for every one of those machines.

## Where It Runs

Once you know to look for it, you find C++ under almost every piece of infrastructure that has to be fast or cheap at scale.

<figure>
  <img src="/assets/posts/cpp/map.svg" alt="A grid of eight areas where C++ runs: databases, storage engines, streaming, query engines, AI frameworks, browsers, networking, and games, finance and space, with examples in each.">
  <figcaption>Figure 1: Some well known systems written mostly in C++.</figcaption>
</figure>

A few of these stories are worth telling, because they show a pattern.

**Databases.** Apache Cassandra is written in Java. ScyllaDB is a rewrite of Cassandra in C++, on a framework called Seastar that gives each CPU core its own shard of data and avoids locks between cores. Redpanda took the same approach to Kafka: it speaks the Kafka protocol, but it's written in C++ with no JVM underneath. In both cases the rewrite kept the interface and changed only the engine.

**Storage.** RocksDB started at Facebook in 2012 as a fork of Google's LevelDB [2]. It's a small embedded key-value store, and it sits underneath a long list of other systems: MyRocks inside MySQL, Kafka Streams state stores, and many databases that needed a storage engine and didn't want to write their own. ClickHouse and DuckDB, two of the most popular analytical databases, are also written in C++.

**Query engines.** This is my favourite example. Databricks runs Apache Spark, which lives on the JVM. When they wanted faster queries, they wrote a new execution engine called Photon in C++ and plugged it underneath Spark [3]. Meta did something similar with Velox, a C++ execution library that now powers a native version of Presto and, through the Apache Gluten project, Spark as well [4].

The pattern is the same each time. The JVM stays where it's good: planning, scheduling, coordination. The hot loop that touches every row moves to C++.

**Streaming and real-time.** WebRTC, the library behind real-time audio and video in Chrome and many calling apps, is C++. Envoy, the proxy that sits in front of a large share of modern microservices, is C++.

**Places where failure is expensive.** The F-35's flight software was written in C++, following a strict coding standard from Lockheed Martin [5]. NASA JPL's F´ (F Prime) framework is C++, and it flew on the Ingenuity helicopter on Mars [6]. Trading systems use C++ because a microsecond is money. Most large game engines, including Unreal, are C++ because a frame has 16 milliseconds and not one more.

And the tools themselves: Chrome and its JavaScript engine V8 are C++, which means Node.js is too, underneath. LLVM, the compiler infrastructure behind Clang, Swift and Rust, is C++.

## Why It Matters More in AI

If you train or use models, you mostly write Python. It's easy to conclude that Python runs AI. It doesn't, really. Python *steers* AI.

<figure>
  <img src="/assets/posts/cpp/stack.svg" alt="Four layers: Python code on top, C++ libraries below it, CUDA C++ kernels below that, and hardware at the bottom.">
  <figcaption>Figure 2: What happens when you call a model from Python.</figcaption>
</figure>

When you call a layer in PyTorch, Python makes one function call into ATen, PyTorch's C++ tensor library. ATen picks a kernel, and that kernel is written in CUDA C++ (or comes from NVIDIA libraries like cuBLAS and cuDNN, themselves written in C++). The hardware runs the kernel. Python's job was to decide what to run. It never touches the numbers.

This split is the same one we saw with Spark and Photon. Python is the control plane. C++ is the data plane.

Why does this matter more now? Because of where the cost moved.

Training a large model is a one-time cost, even if a large one. Serving it is a cost on every single token, for every user, forever. At that scale, a kernel that is 20% faster isn't a nice-to-have, it's 20% fewer GPUs. That's why inference engines are written close to the metal. NVIDIA's TensorRT-LLM has a C++ runtime. llama.cpp, written by Georgi Gerganov in 2023, showed that you can run large language models on a laptop CPU if you're careful enough about memory and arithmetic, and it did that in C and C++. FlashAttention, one of the most important speedups in recent years, is not a new model architecture at all. It's a rearrangement of the same math so it reads less from GPU memory [7]. That's the same lesson as the cache example above, applied to a GPU.

There is a fair counterpoint. Tools like OpenAI's Triton let you write GPU kernels in a Python-like language, and that's a real improvement. But Triton is a compiler, and compilers like it are built on LLVM and MLIR, which are C++. The layer just moved down.

And then there's AI writing code. Models can now write a lot of C++ for us. I don't think that makes the language less important to learn. If anything, it makes understanding the machine more important, because the hard part of systems work was never typing the code. It was knowing why one memory layout is 10× faster than another, and noticing when the generated code gets it wrong.

## The Honest Part

C++ gives you control, and control includes the ability to get things badly wrong.

The language lets you read past the end of an array, use memory after freeing it, and write code with **undefined behavior** that works on your machine and fails on another. The Chromium team found that around 70% of their high-severity security bugs were memory safety problems [8]. Microsoft has reported a similar number.

This is why Rust exists, and why parts of Android, Windows and the Linux kernel are adopting it. It's a real shift, and I think it's a good one. The C++ committee is responding with safer defaults and hardened standard libraries, but none of that will remove the billions of lines of C++ already running everything above.

For me, that doesn't change the decision. The concepts that make C++ hard, ownership, lifetimes, memory layout, are the same concepts Rust makes you write down explicitly. Learning one makes the other much easier.

## Coming From Java and Python

Here's what I expect to be different, written down so I can check back later:

- **Values, not references.** In Java, `a = b` copies a reference to an object. In C++, it copies the object. You choose explicitly when you want a reference (`&`) or a pointer (`*`).
- **Ownership.** Someone has to own every piece of memory. `std::unique_ptr` means one owner, `std::shared_ptr` means shared. Raw `new` and `delete` should almost never appear in modern code.
- **Move semantics.** Instead of copying a large object, you can move it, handing over its internals and leaving the original empty. This is where most of the language's performance tricks live.
- **Templates.** Java generics are erased at runtime. C++ templates generate a separate version of the code for each type, which is why they're fast and also why the error messages are long.
- **The build.** Headers, translation units, linkers, CMake. Java and Python hide this. C++ does not.

My plan is simple. Read *A Tour of C++* by Stroustrup for the shape of the modern language, then *Effective Modern C++* by Scott Meyers for the details. After that, read real code: RocksDB and DuckDB are both readable and well documented. And build something small and real, probably a log-structured key-value store, since that touches memory layout, files, and concurrency all at once.

## Conclusion

I started this thinking C++ was an old language that stuck around because of legacy code. That is part of the story, but it's not the main part. C++ is still where it is because it's the language that lets you decide exactly how data sits in memory and exactly when work happens, without paying for anything you didn't ask for. When the same loop runs a trillion times, that's the only thing that matters.

AI hasn't changed that. It has made it more true, because the most expensive loop in computing right now is multiplying matrices on a GPU, and that loop is written in C++.

I'll write more as I go.

## References

[1] Bjarne Stroustrup, *The Design and Evolution of C++*, Addison-Wesley, 1994.

[2] [RocksDB: A Persistent Key-Value Store for Flash and RAM Storage](https://github.com/facebook/rocksdb)

[3] A. Behm et al., "Photon: A Fast Query Engine for Lakehouse Systems", SIGMOD 2022.

[4] P. Pedreira et al., "Velox: Meta's Unified Execution Engine", VLDB 2022.

[5] [Joint Strike Fighter Air Vehicle C++ Coding Standards](https://www.stroustrup.com/JSF-AV-rules.pdf)

[6] [F´ (F Prime): a flight software framework from NASA JPL](https://github.com/nasa/fprime)

[7] T. Dao et al., "FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness", NeurIPS 2022.

[8] [The Chromium Projects: Memory safety](https://www.chromium.org/Home/chromium-security/memory-safety/)
