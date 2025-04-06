# Narratika

Narratika is a simple and agile markup language for creating visual novels, or digital interactive stories more broadly. 
It's designed to put writing first, and coding second, as an higher-level language that gets compiled to the native language of many visual novel engines.

Currently, transpilers are available to target the following platforms or engines:
* Ren'Py (Python) — CLI program to convert scripts to `.rpy` from `.narratika` files
* Monogatari (HTML5, JavaScript) — Must be included as a library in a Monogatari game, and used with a call to `Narratika.compile()` to get a JSON object from a Narratika script string

Many examples on writing a full, playable novel with Narratika will be available soon in the `examples` branch, as well as starter guides and development packages for the supported engines: <https://gitlab.com/octospacc/Narratika/-/tree/examples>.  
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

Defines a named execution unit under which following statements will be grouped.

```
@label chapter1
  ...
```

Note: You always need to define at least one label for Narratika to put code in. You also need to define a starting label in particular, for the game engine to know where to start execution; for most visual novel engines, this will usually be called `start`.

#### jump

Allows diverting execution from any point in the script to any of the defined labels.

```
  ...
  @jump chapter1
```

#### set

Sets a given variable to a given value or the result of an expression (the latter being evaluated by the underlying engine, thus being dependent on its syntax).

```
  @set isPlayerNice true
  @set lifePoints -= standardDamage * 1.5
```

#### menu/choice

Defines a new choice menu with buttons, with an optional narration or dialog line to be shown. Available options must be specified immediately below with the switch item syntax.

```
  @menu -> ^ What do I do now?
    * Try to fight -> @jump fight
    * Retreat -> @jump retreat
```

#### if

Evaluates a single-line boolean expression, executing the immediately following statement if a true value is returned.

```
  @if (lifePoints <= 0)
    <demon> Well. Looks like you're finished.
```

### Switch Item

Single-line, declared with `*`. Format is `case -> action`, where `case` is a menu choice and `action` may be a directive or other valid single line action.

```
* Go left -> @jump choice_left
* Go right -> @jump choice_right
```

### Narration

Specifies text to be shown as generic narration. Used for expressing the protagonist's inner monologue or the thoughts of a third-person narrator.

Multi-line, declared with `^`.

```
^ It was a quiet night, like many others, when the tragedy happend.
^ The spirits were resting, just like they always do.
  Their enemies, however, were not having so good of a time.
```

### Dialog

Specifies text to be shown as spoken by a given character (or special entity as provided by the game engine).

Multi-line, declared with `<name>`.

```
<you> Hey! Who are you?
<me> I'm you, but stronger...
     You just don't know by how much.
```

Tip: you can use the dialog syntax without a name, starting a line with just `<>`, as an alternative syntax for narration.

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

A comment allows you to add some explanations to your code, adding context, or temporarily disable some lines without deleting them.

Multi-line, declared with `//`.

```
// This is a comment. What were you expecting?
   Yes, it can automatically span multiple lines, obviously.
```
