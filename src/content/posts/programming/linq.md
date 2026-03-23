---
title: LINQ
published: 2026-03-22
description: '所有LINQ方法的例子'
image: ''
tags: [C#, LINQ]
category: '编程'
draft: false 
lang: ''
---

参考视频：<https://www.youtube.com/watch?v=7-P6Mxl5elg>

```sh
dotnet add console

dotnet add package Dumpify # Dump函数，能很方便的打印集合
```

LINQ有两种执行方式：延迟执行 | Differred Execution 与 立即执行 | Immediate Execution。本文使用 [DE] 与 [IE] 标注

## 筛选 | Filtering

### Where [DE]：通用筛选

```cs
IEnumerable<int> collection = [1, 2, 3, 4, 5];

collection.Where(x => x >= 2).Dump();
```
### OfType [DE]：类型筛选

```cs
IEnumerable<object> collection = [1, "Hi", 3.14, 4, 5];

collection.OfType<string>().Dump(); // 会自动转换类型为 IEnumerable<string>
```

## 分区 | Partitioning

### Skip [DE]，Take [DE]，SkipLast [DE] 与 TakeLast [DE]

```cs
IEnumerable<int> collection = [1, 2, 3, 4, 5];

collection.Take(3).Dump();
collection.Skip(3).Dump();

collection.SkipLast(3).Dump("SkipLast");
collection.TakeLast(3).Dump("TakeLast");
```

### SkipWhile [DE] 与 TakeWhile [DE]

```cs
IEnumerable<int> collection = [1, 2, 3, 1, 1];

collection.SkipWhile(x => x < 3).Dump("SkipWhile");     // skip 1 2 3
collection.TakeWhile(x => x <= 3).Dump("TakeWhile");    // take 1 2 3 
```

SkipWhile 与 TakeWhile 均为**前缀过滤**（只要开头一段符合条件的）  

## 投影 | Projection

将数据映射为另一种形式

### Select [DE]

```cs
IEnumerable<int> collection = [1, 2, 3, 4, 5];

collection.Select(x => x < 3).Dump("Select"); // 这里返回的是true/false集合
collection.Select((x, i) => $"{i}: {x}").Dump("Select with index"); // 带索引
```

### SelectMany [DE]：展平

```cs
IEnumerable<List<int>> collection = [
    [1, 2, 3, 4, 5],
    [1, 2, 3, 4],
    [1, 2, 3, 4, 5, 6]
];

collection.SelectMany(x => x).Dump("SelectMany");
collection
    .SelectMany(
        (list, listIndex) 
            => list.Select(element
                => $"{listIndex}: {element}".ToString()
            )
        )
    .Dump("SelectMany with index");
```

### Cast [DE]：类型转换

```cs
IEnumerable<object> collection = [1, 2, 3, 4, 5];

collection.Cast<int>().Dump();
```

### Chunk [DE]：切分

```cs
IEnumerable<int> collection = [1, 2, 3, 4, 5, 6, 7];

collection.Chunk(3).Dump();
```

## 检查 | Check

### Any [IE]，与 All [IE]

```cs
IEnumerable<int> collection = [1, 2, 3, 4, 5];

collection.Any(x => x > 3).Dump(); // True
collection.All(x => x > 3).Dump(); // False
```

### Contains [IE]

```cs
IEnumerable<int> collection = [1, 2, 3, 4, 5];

collection.Contains(3).Dump();
```

这个功能也可以用 `Any(x => x == 3)` 实现，但是 Contains 会优先走集合优化（哈希查找），Any 一直是 `foreach`

## 序列操作 | Sequence Manipulation

### Append [DE] 与 Prepend [DE]：插入

```cs
IEnumerable<int> collection = [1, 2, 3, 4, 5];

collection.Append(6).Prepend(0).Dump();
```

## 聚合 | Aggregation

### Count [IE]， TryGetNonEnumeratedCount [IE] 与 LongCount [IE]：计数

```cs
IEnumerable<int> collection = [1, 2, 3, 4, 5];

collection.Count().Dump(); // 5
collection.Where(x => x >= 2).TryGetNonEnumeratedCount(out var count).Dump(); // False
count.Dump(); // 0
```

一般的 `Count` 会优先调取集合的 `Length` 属性，但是有些集合没有这个属性，`Count` 就只能遍历了（）  
如果不想遍历可以用 `TryGetNonEnumeratedCount` ~~神秘的名字~~  
如果需要返回值为 `long`，使用 `LongCount`

### Max [IE]，MaxBy [IE]，Min [IE] 与 MinBy [IE]：最值

```cs
IEnumerable<int> collection = [-2, -1, 0, 1, 2];

collection.Max().Dump(); // 2
collection.Max(x => -Math.Pow(x, 2) + 1).Dump(); // 1
collection.MaxBy(x => -Math.Pow(x, 2) + 1).Dump(); // 0
```

`Max` 返回投影结果，`MaxBy` 根据投影结果返回对应原始元素[^1]  
`Min` 与 `MinBy` 同理，不展示

### Sum [IE] 与 Average [IE]

```cs
IEnumerable<int> collection = [-2, -1, 0, 1, 2];

collection.Sum().Dump();
collection.Average().Dump();
```

### Aggregate [IE]

```cs
IEnumerable<int> collection = [1, 2, 3, 4, 5, 6];

collection
    .Aggregate(
        (accumulator, element) => accumulator + element
    )
    .Dump(); // 等价Sum()
```

```cs
collection
    .Select(x => x.ToString())
    .Aggregate(
        new StringBuilder("["),
        (sb, x) =>
        {
            if (sb.Length > 1) sb.Append(", ");
            sb.Append(x);
            return sb;
        },
        sb => sb.Append(']')
    )
    .Dump();
```

`Aggregate` 能接收三个参数：`seed` `func` `resultSelector`。（累加器初值 累加器 最终结果）  
emm目前还没在实战中找到太多用处，但感觉这个用好了会很方便..?

## 元素操作 | Element Operators

### First [IE]，FirstOrDefault [IE]，Last [IE] 与 LastOrDefault [IE]

```cs
IEnumerable<int> collection = [1, 2, 3, 4, 5, 6];
IEnumerable<int> empty = [];

collection.First().Dump(); // 1
empty.FirstOrDefault().Dump(); // default(int)
empty.FirstOrDefault(666).Dump(); // default(int)

collection.Last().Dump(); // 6
```

集合为空时，`First` 会抛异常，`FirstOrDefault` 返回该类型默认值或者是指定的。`Last` 同理

### Single [IE] SingleOrDefault [IE]

```cs
IEnumerable<int> collection = [1, 2, 3, 4, 5, 6];
IEnumerable<int> single = [1];
IEnumerable<int> empty = [];


collection.Single().Dump(); // System.InvalidOperationException
single.Single().Dump(); // 1
empty.SingleOrDefault(123).Dump(); // 123
```

`Single` 只能用于只有一个元素的集合

### ElementAt [IE] 与 ElementAtOrDefault [IE]

```cs
IEnumerable<int> collection = [1, 2, 3, 4, 5, 6];

collection.ElementAt(1).Dump(); // 2
collection.ElementAt(4).Dump(); // 5
collection.ElementAtOrDefault(8).Dump(); // default(int)
```
### DefaultIfEmpty [DE]

```cs
IEnumerable<int> empty = [];

empty.DefaultIfEmpty().Dump(); // default(int)
```

不会 Append，只是在集合为空时返回默认值

## Conversion | 转换

### ToList [IE]，ToArray [IE]，ToDictionary [IE]，ToHashSet [IE] 与 ToLookup [IE]

```cs
IEnumerable<int> collection = [1, 2, 3, 4, 5, 6];

collection.ToList().Dump();
collection.ToArray().Dump();
collection.ToDictionary(key => key, value => value).Dump();
```

```cs
IEnumerable<Person> people = [
    new("A", 15),
    new("B", 20),
    new("C", 20),
];

people
    .ToLookup(p => p.Age)   // Lookup<int, Person>
    [20]                    // Grouping<int, Person>
    .Dump(); 

record Person(string Name, int Age);
```

## Generation | 生成

### AsEnumerable [DE] 与 AsQueryable [DE]

```cs
List<int> collection = [1, 2, 3, 4, 5];

var foo = collection.AsEnumerable();
var bar = collection.AsQueryable();
```

### Range [IE]，Repeat [IE] 与 Empty [IE]

```cs
IEnumerable<int> collection = Enumerable.Range(1, 100); // (start, count)
collection.Dump(); // 1 到 100 的整数

collection = Enumerable.Repeat(1, 100);
collection.Dump(); // 100个1

collection = Enumerable.Empty<int>(); // Empty 为静态方法，不会 new 实例
// collection = []; // C# 12以上有了集合表达式，都用这个了（）
collection.Dump(); // []
```

## 集合操作 | Set Operations

### Distinct [DE] 与 DistinctBy [DE]：去重

```cs
IEnumerable<int> collection = [1, 2, 3, 4, 5, 1, 1, 2];

collection.Distinct().Dump();

IEnumerable<Person> people = [
    new("A", 16),
    new("B", 15),
    new("C", 15),
    new("D", 18),
];

people.DistinctBy(p => p.Age).Dump();

record Person(string Name, int Age);
```

### Union [DE]，Intersect [DE]，Except [DE]，UnionBy [DE]，IntersectBy [DE] 与 ExceptBy [DE]：集合运算

```cs
IEnumerable<int> collection1 = [1, 2, 3];
IEnumerable<int> collection2 = [2, 3, 4];

collection1.Union(collection2).Dump(); // 1, 2, 3, 4
collection1.Intersect(collection2).Dump(); // 2, 3
collection1.Except(collection2).Dump(); // 1
```

By 方法[同上](#distinct-de-与-distinctby-de去重)

### SequenceEqual [IE]：序列相等

```cs
IEnumerable<int> collection1 = [1, 2, 3];
IEnumerable<int> collection2 = [1, 2, 3];
IEnumerable<int> collection3 = [1, 2, 3, 4];

collection1.SequenceEqual(collection2).Dump(); // true
collection1.SequenceEqual(collection3).Dump(); // false
```

## 合并与分组 | Joinng and Grouping

### Zip [DE]：配对组装

```cs
IEnumerable<int> collection1 = [1, 2, 3];
IEnumerable<string> collection2 = ["a", "b", "c", "d"];

collection1.Zip(collection2).Dump(); // (1, "a"), (2, "b"), (3, "c")
```

### Join [DE] 与 GroupJoin [DE]

```cs
IEnumerable<Person> people = [
    new(1, "Alice", 30),
    new(2, "Bob", 25),
    new(3, "Charlie", 35)
];
IEnumerable<Product> products = [
    new(1, 1, "Product A"),
    new(2, 1, "Product B"),
    new(3, 2, "Product C"),
    new(4, 3, "Product D")
];

people.Join(
    products,
    person => person.Id,
    product => product.PersonId,
    (person, product) => $"{person.Name} bought {product.Name}"
    )
    .Dump();

people.GroupJoin(
    products,
    person => person.Id,
    product => product.PersonId,
    (person, products) => $"{person.Name} bought {string.Join(',', products.Select(p => p.Name))}"
    )
    .Dump();

record Person(int Id, string Name, int Age);
record Product(int Id, int PersonId, string Name);
```

### Concact [DE]

```cs
IEnumerable<int> collection1 = [1, 2, 3];
IEnumerable<int> collection2 = [4, 5];

collection1.Concat(collection2).Dump();
```

### GroupBy [DE]

```cs
IEnumerable<Person> people = [
    new(1, "Alice", 30),
    new(2, "Bob", 25),
    new(3, "Charlie", 25)
];

people.GroupBy(p => p.Age).Dump();

record Person(int Id, string Name, int Age);
```

## 排序 | Sorting

### Order [DE]，OrderBy [DE]，OrderDescending [DE] 与 OrderByDescending [DE]

```cs
IEnumerable<int> collection = [3, 1, 2, 4];

collection.Order().Dump();
```

Descending 与 By 方法使用略

### ThenBy [DE] 与 ThenByDescending

```cs
IEnumerable<FinancialSheetItem> sheet = [
    new(2, 28, 2500m),
    new(1, 15, 1000m),
    new(2, 15, 2000m),
    new(1, 30, 1500m),
    new(1, 30, 500m),
    new(3, 15, 1000m),
];

sheet
    .OrderBy(i => i.Month)
    .ThenBy(i => i.Date)
    .ThenByDescending(i => i.Amount)
    .Dump();

record FinancialSheetItem(int Month, int Date, decimal Amount);
```

### Reverse [DE]：翻转

```cs
IEnumerable<int> collection = [1, 2, 3, 4];

collection.Reverse().Dump();
```

## PLINQ

- AsParallel
- WithDegreeOfParallelism
- WithExecutionMode
- WithMergeOptions
- AsOrdered

[^1]: 除了返回值不同，By方法还有另一种语义，就是根据某个对象的某个属性，参考[这里](#distinct-de-与-distinctby-de去重)