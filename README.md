# Narratika

Narratika is a simple and agile markup language for creating visual novels, or digital interactive stories more broadly. 
It's designed to put writing first, and coding second, as an higher-level language that gets compiled to the native language of many visual novel engines.

Currently, transpilers are available to target the following platforms or engines:
* Ren'Py (Python) — CLI program to convert scripts to `.rpy` from `.narratika` files
* Monogatari (HTML5, JavaScript) — Must be included as a library in a Monogatari game, and used with a call to `Narratika.compile()` to get a JSON object from a Narratika script string

Examples on writing a full, playable novel with Narratika will be available soon, as well as starter guides and development packages for the supported engines.  
Specific, small examples on language syntax and usage are available below.

## Specification (with Examples)

(The project is an early work-in-progress and the specification is subject to changes.)

The language takes loose inspiration from other pure-markup languages (eg. Markdown), instead of programming languages, as is instead common for visual novel engines.
The goal is to make editing of story text itself as painless as possible, almost like writing a pure text document, by making without of excessive syntax such as string quoting.

The language is designed around a few core elements, which are mainly distinguished in 2 categories: single-line and multi-line.
The start of a given element is declared by a corresponding prefix or format, and is terminated, respectively, at the end of the line in question (single-line), or when the start of a new element appears.

### Directive

Some kind of standard command or action to be executed as supported by the game engine. Directives implemented inside Narratika itself are explained in the sections below.

Single-line, declared with `@`. The first word, which is the name of the command, is case-insensitive.

```
@label start
@scene park with fade
@play music theme loop
...
@jump scene1
```

#### label

...

#### jump

...

#### menu/choice

...

#### if

...

### Switch Item

Single-line, declared with `*`. Format is `case -> action`, where `case` is a menu choice and `action` may be a directive or other valid single line action.

```
* Go left -> @jump choice_left
* Go right -> @jump choice_right
```

### Narration

Multi-line, declared with `^`.

```
^ It was a quiet night, like many others, when the tragedy happend.
^ The spirits were resting, just like they always do.
  Their enemies, however, were not having so good of a time.
```

### Dialog

Multi-line, declared with `<name>`.

```
<you> Hey! Who are you?
<me> I'm you, but stronger...
     You just don't know by how much.
```

### Code Fragment

A piece of raw code that will be evaluated directly by the underlying visual novel engine, instead of the Narratika parser.

Multi-line, declared with `$$`.

```
$$ $a = 123;
   $b = $a * 2;
```
```
$$ () => aFunction(123);
```

### Comment

Multi-line, declared with `//`.

```
// This is a comment. What were you expecting?
   Yes, it can automatically span multiple lines, obviously.
```
