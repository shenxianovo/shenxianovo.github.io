# 正则表达式

一个用于匹配的东西...  
在线测试工具：[regex101](https://regex101.com)

## 摘要

- 字面量（literal）
  - `123` `a1b2c3` `你好`
- 元字符（meta caractor）
  - 量词（quantifier），控制重复次数：
    - `?`（0或1次）
    - `*`（0次或多次）
    - `+`（1次或多次）
    - `{n}`（n次）/ `{m,n}`（[m, n]区间） 
  - 锚点（anchors），匹配位置而非字符：
    - `^`（行/字符串开头）
    - `$`（行/字符串结尾）
    - `\b`（单词边界）。
  - 字符类（character class）：
    - `[...]` 指定一组可接受字符，`[^...]` 为否定类。常见范围 `0-9`、`a-z`。
  - 分组（grouping）与捕获：
    - `(...)` 分组子模式并保存（捕获）下来，可捕获子串供后续引用
    - `(?:...)` 分组但不捕获内容
  - 断言（assertions），`(?...)`：
    - `(?=...)`肯定前瞻，`foo(?=bar)` 表示匹配 foo，后面紧跟 bar
    - `(?!...)`否定前瞻，`foo(!=bar)` 表示匹配 foo，后面不是 bar
    - `(?<=...)`肯定后顾，`(?<=foo)bar` 表示匹配 bar，前面紧跟 foo
    - `(?<!...)`否定后顾，`(?<!foo)bar` 表示匹配 bar，前面不是 foo
  - 模式修饰符：
    - `(?i)`：忽略大小写（case-insensitive）。
    - `(?m)`：多行模式（`^` 和 `$` 匹配每行的开头和结尾）。
    - `(?s)`：单行模式（`.` 匹配换行符）。
    - `(?x)`：忽略模式中的空白和注释（扩展模式）。
  - 替代（alternation）：使用 `|` 表示“或”，在多个备选子模式中选择匹配。
  - 转义与简写：
    - `\` 转义元字符以匹配字面意义
    - `\d`：digits，`[0-9]`
    - `\w`：words，`[a-zA-Z0-9_]`
    - `\s`：seperator，`\r\n\t\f\v `（\v后面还有个空格）

## 常用正则

下面是一些常用的正则表达式，加上了状态图便于理解... ~~用状态机来写也更好维护（x）~~

- Email：`[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,4}`
  ![](/tech/regex/image.png)

## 不同语言使用

``` python
import re # Python 标准库自带的正则模块
# re提供 match, search, find, findall等多种方法，参数列表相同

re.match(pattern, string, flags=0)
# pattern为正则表达式，string为目标字符串
# flags提供了一些简化匹配的参数，其中大部分可以通过正则式实现
```

``` csharp
using System.Text.RegularExpressions; // .NET 标准库自带的正则

Regex.Match(string input, string pattern, RegexOptions options)
// 与Python类似，都有input, pattern以及可选的options
```