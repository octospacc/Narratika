#!/usr/bin/env python3

def compile(source):
    from types import SimpleNamespace

    def compile():
        script = ""
        state = SimpleNamespace(
            afterif = 0,
            nextpadding = 0,
            lasthandler = None,
            lastdialog = None,
        )

        for line in source.replace("\t", " ").splitlines():
            script += parseline(line, state) + "\n"
        return script

    def parseline(line, state=SimpleNamespace(afterif=0)):
        line = line.strip()
        result = ""
        shift = None
        continuation = False
        # padding = (" " * nextpadding)

        # single-line
        if isdirective(line):
            state.lasthandler = None
            directive = parsedirective(line)
            line = makedirective(directive, state)
            if directive.key in ["if", "else"]:
                state.afterif = 2
            # if directive.key not in ["else"]:
            # line = padding + line
            result = line
        elif isswitch(line):
            state.lasthandler = None
            # return padding + makeswitch(line)
            result = makeswitch(line)

        # multi-line
        elif isnarration(line):
            state.lasthandler = makenarration
        elif isdialog(line):
           state.lasthandler = makedialog
        elif isfragment(line):
            state.lasthandler = makefragment
        elif iscomment(line):
            state.lasthandler = makecomment
        else:
            shift = -1
            continuation = True

        if state.afterif >= 0:
            if not continuation:
                state.afterif -= 1
            state.nextpadding = 4 if (state.afterif == 0) else 0
        padding = (" " * state.nextpadding)

        if state.lasthandler:
            # if a line can't be parsed correctly, it will throw here due to lasthandler being None; this is intended to make mistakes detectable
            return (padding + state.lasthandler(line, shift, continuation, state)) if line else ""
        else:
            return padding + result

    def isdirective(line):
        return line.startswith("@")

    def isswitch(line):
        return line.startswith("*")

    def isnarration(line):
        return line.startswith("^")

    def isdialog(line):
        return (line.startswith("<") and (">" in line))

    def isfragment(line):
        return line.startswith("$$")

    def iscomment(line):
        return line.startswith("//")

    def unprefix(line, shift, /, strip=True):
        if shift == -1:
            shift = 0
        line = line[shift:]
        if strip:
            line = line.strip()
        return line

    def parsedirective(line):
        directive = unprefix(line, 1)
        [key, *parts] = directive.split(" ")
        # parts = directive.split(" ")
        # key = parts[0]
        # parts = parts[1:]
        return SimpleNamespace(
            directive = directive,
            key = key.lower(),
            body = " ".join(parts),
        )

    def parseswitch(line):
        parts = unprefix(line, 1).split("->")
        # check = None
        # if parts[0].startswith("[") and parts[0].endswith("]"):
        #     check = parts[0]
        #     parts = parts[1:]
        return SimpleNamespace(
            text = parts[0].strip(),
            action = parts[1].strip(),
            #check = check,
        )

    def parsedialog(line, shift):
        [name, *parts] = unprefix(line, shift or 1).split(">")
        # parts = unprefix(line, shift or 1).split(">")
        # name = parts[0]
        # parts = parts[1:]
        return SimpleNamespace(
            name = name.strip(),
            text = ">".join(parts).strip(),
        )

    def makestring(line):
        return '"' + line.replace('"', '\\"') + '"'

    # def makelabel(line):
    #     return f"label {unprefix(line, 1)}:"

    def normalizelabel(label:str):
        lower = label.lower()
        return lower if lower == "start" else label

    def makedirective(directive, state):
        #nonlocal nextpadding
        if directive.key in ["label"]:
            return f"{directive.key} {normalizelabel(directive.body)}:"
        elif directive.key in ["jump", "call"]:
            return f"    {directive.key} {normalizelabel(directive.body)}"
        elif directive.key in ["show", "hide"]:
            return f"    {directive.key} {' '.join(directive.body.split(' ')[1:])}"
        elif directive.key in ["menu", "choice"]:
            parts = directive.body.split("->")
            return f"    menu:\n" + \
                   f"        {parseline(parts[1]).strip() if len(parts) >= 2 else ''}"
        elif directive.key in ["if", "else"]:
            # if directive.key == "if":
            #     nextpadding += 4
            state.nextpadding = 4
            return f"    {directive.key} {directive.body}:"
        # elif directive.key in ["end"]:
        #     nextpadding -= 4
        #     return "" # TODO
        elif directive.key in ["set"]:
            [name, *body] = directive.body.split(" ")
            operator = "="
            if body[0].endswith(operator): # allow for composite assignments (eg. +=, -=, ...)
                operator = body[0]
                body = body[1:]
            return f"    $ {name} {operator} {' '.join(body)}"
        else:
            return f"    {directive.directive}"

    def makeswitch(line):
        switch = parseswitch(line)
        return f"        {makestring(switch.text)}:\n" + \
               f"            {parseline(switch.action).strip()}"

    def makenarration(line, shift, *_):
        return f"    {makestring(unprefix(line, shift or 1))}"

    def makedialog(line, shift, continuation, state):
        #nonlocal lastdialog
        if continuation:
            dialog = state.lastdialog
            dialog.text = line.strip()
        else:
            dialog = state.lastdialog = parsedialog(line, shift)
        if dialog.text:
            return ("    " + f"{dialog.name} {makestring(dialog.text)}".strip())
        else:
            return ""

    def makefragment(line, shift, *_):
        return unprefix(line, shift or 2, strip=False) # TODO automatic indentation?

    def makecomment(line, shift, *_):
        return f"    # {unprefix(line, shift or 2)}"

    return compile()

if __name__ == "__main__":
    from sys import argv

    input = output = None
    if len(argv) == 2 or len(argv) == 3:
        input = argv[1]
        if len(argv) == 3:
            output = argv[2]

    if input:
        result = compile(open(argv[1], "rb").read().decode("utf8"))
        if output:
            open(output, "wb").write(result.encode("utf8"))
        else:
            print(result)
    else:
        print(f"Usage: {argv[0]} <path_to_input.narratika> [path_to_output.rpy]")
