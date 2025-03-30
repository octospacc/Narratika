#!/usr/bin/env python3

def compile(source):
    from types import SimpleNamespace

    script = ""
    afterif = 0
    nextpadding = 0
    lasthandler = lastdialog = None

    def compile():
        nonlocal script
        for line in source.replace("\t", " ").splitlines():
            script += parseline(line) + "\n"
        return script

    def parseline(line):
        nonlocal lasthandler, afterif, nextpadding

        line = line.strip()
        result = ""
        shift = None
        continuation = False
        # padding = (" " * nextpadding)

        # single-line
        # if islabel(line):
        #     lasthandler = None
        #     return padding + makelabel(line)
        #     result = makelabel(line)
        if isdirective(line):
            lasthandler = None
            directive = parsedirective(line)
            line = makedirective(directive)
            if directive.key in ["if", "else"]:
                afterif = 2
            # if directive.key not in ["else"]:
            # line = padding + line
            result = line
        elif isswitch(line):
            lasthandler = None
            # return padding + makeswitch(line)
            result = makeswitch(line)

        # multi-line
        elif isnarration(line):
            lasthandler = makenarration
        elif isdialog(line):
           lasthandler = makedialog
        elif isfragment(line):
            lasthandler = makefragment
        elif iscomment(line):
            lasthandler = makecomment
        else:
            shift = -1
            continuation = True

        if afterif >= 0:
            if not continuation:
                afterif -= 1
            nextpadding = 4 if (afterif == 0) else 0
        padding = (" " * nextpadding)

        if lasthandler:
            # if a line can't be parsed correctly, it will throw here due to lasthandler being None; this is intended to make mistakes detectable
            return (padding + lasthandler(line, shift, continuation)) if line else ""
        else:
            return padding + result

    # def islabel(line):
    #     return line.startswith("#")

    def isdirective(line):
        return line.startswith("@")

    def isswitch(line):
        return line.startswith("*")

    def isnarration(line):
        return line.startswith("^")

    def isdialog(line):
        return (line.startswith("<") and (">" in line)) # or (line.startswith(">") and (":" in line))

    def isfragment(line):
        return line.startswith("$$")

    def iscomment(line):
        return line.startswith("//")

    # def unprefix(line, prefix=" "):
    #    return prefix.join(line.split(prefix)[1:])

    def unprefix(line, shift):
        # if shift == None:
        #     shift = 1
        if shift == -1:
            shift = 0
        return line[shift:].strip()

    def parsedirective(line):
        directive = unprefix(line, 1)
        [key, *parts] = directive.split(" ")
        return SimpleNamespace(
            directive = directive,
            key = key,
            body = ' '.join(parts),
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
        return SimpleNamespace(
            name = name.strip(),
            text = ">".join(parts).strip(),
        )

    def makestring(line):
        return '"' + line.replace('"', '\\"') + '"'

    # def makelabel(line):
    #     return f"label {unprefix(line, 1)}:"

    def makedirective(directive):
        nonlocal nextpadding
        if directive.key in ["menu", "choice"]:
            return f"    choice:\n" + \
                   f"        {makestring(directive.body)}"
        elif directive.key in ["label"]:
            return f"{directive.key} {directive.body}:"
        elif directive.key in ["if", "else"]:
            # if directive.key == "if":
            #     nextpadding += 4
            nextpadding = 4
            return f"    {directive.key} {directive.body}:"
        # elif directive.key in ["end"]:
        #     nextpadding -= 4
        #     return "" # TODO
        else:
            return f"    {directive.directive}"

    def makeswitch(line):
        switch = parseswitch(line)
        return f"        {makestring(switch.text)}:\n" + \
               f"            {parseline(switch.action).strip()}"

    def makenarration(line, shift, _):
        return f"    {makestring(unprefix(line, shift or 1))}"

    def makedialog(line, shift, continuation):
        nonlocal lastdialog
        if continuation:
            dialog = lastdialog
            dialog.text = line.strip()
        else:
            dialog = lastdialog = parsedialog(line, shift)
        if dialog.text:
            return f"    {dialog.name} {makestring(dialog.text)}"
        else:
            return ""

    def makefragment(line, shift, _):
        return f"    {unprefix(line, shift or 2)}"

    def makecomment(line, shift, _):
        return f"    # {unprefix(line, shift or 2)}"

    return compile()

if __name__ == "__main__":
    from sys import argv
    if len(argv) == 2:
        print(compile(open(argv[1], "rb").read().decode('utf8')))
    else:
        print(f"Usage: {argv[0]} <path_to_script.narratika>")
