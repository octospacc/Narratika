(() => {

const compile = (source) => {
    const script = {};
    let [labelThis, labelLast] = ['', ''];
    let lastHandler, lastDialog;

    const compile = () => {
        for (let line of source.replaceAll('\t', ' ').split('\n')) {
            if (line = line.trim()) {
                handleLine(line);
            }
        }
        Object.values(script).slice(-1)[0].push('end');
        return script;
    };

    const handleLine = (line) => {
        let shift = null;
        let continuation = false;

        if (isDirective(line)) {
            return handleDirective(line);
        } else if (isSwitch(line)) {
            return handleSwitch(line);
        } else if (isNarration(line)) {
            lastHandler = handleNarration
        } else if (isDialog(line)) {
            lastHandler = handleDialog
        } else if (isFragment(line)) {
            lastHandler = handleFragment
        } else if (isComment(line)) {
            return // No-op
        } else {
            shift = -1;
            continuation = true;
        }
        return lastHandler(line, shift, continuation);
    };

    const isDirective = (line) => line.startsWith('@');
    const isSwitch = (line) => line.startsWith('*');

    const isNarration = (line) => line.startsWith('^');
    const isDialog = (line) => (line.startsWith('<') && line.includes('>'));
    
    const isFragment = (line) => line.startsWith('$$');
    const isComment = (line) => line.startsWith('//');

    // TODO normalize all labels when proper line parsing is implemented
    const normalizeLabel = (label) => label.toLowerCase() === 'start' ? (label[0].toUpperCase() + label.slice(1).toLowerCase()) : label;
    
    const handleDirective = (line) => {
        const directive = unprefix(line, 1);
        const [key, ...parts] = directive.split(' ');
        if (['label'].includes(key)) {
            labelLast = labelThis;
            script[labelThis = normalizeLabel(parts.join(' '))] = [];
            if (labelLast) {
                script[labelLast].push(`jump ${labelThis}`);
            }
        } else if (['jump'].includes(key)) {
            script[labelThis].push(`jump ${normalizeLabel(parts.join(' '))}`);
        } else if (['if'].includes(key)) { // TODO
            //script[labelThis].push({ Conditional: { Condition:  } });
        } else if (['else'].includes(key)) { // TODO
            //Object.values(script[labelThis][script[labelThis].length - 1])[0].False = ;
        // } else if (['end'].includes(key)) {
        //     // No-op
        } else if (['menu', 'choice'].includes(key)) {
            script[labelThis].push({ Choice: {} });
        } else if (['return'].includes(key)) {
            script[labelThis].push('end');
        } else {
            script[labelThis].push(directive);
        }
    };

    const handleSwitch = (line) => {
        let [text, action] = unprefix(line, 1).split('->');
        text = text.trim();
        // TODO use recursive line parsing for action (should make a parseLine function)
        Object.values(script[labelThis][script[labelThis].length - 1])[0][text] = { Text: text, Do: unprefix(action.trim(), 1) };
    };

    const handleNarration = (line, shift) => {
        script[labelThis].push(' ' + unprefix(line, shift || 1));
    };

    const handleDialog = (line, shift, continuation) => {
        let dialog = {};
        if (continuation) {
            dialog = lastDialog;
            dialog.text = line.trim();
        } else {
            dialog = lastDialog = parseDialog(line, shift);
        }
        if (dialog.text) {
            script[labelThis].push(dialog.name + ' ' + dialog.text);
        }
    };

    const handleFragment = (line, shift) => {
        script[labelThis].push(eval('(' + unprefix(line, shift || 2) + ')'));
    };

    const unprefix = (line, shift) => {
        if (shift == -1) {
            shift = 0;
        }
        return line.slice(shift).trim();
    };

    const parseDialog = (line, shift) => {
        const [name, ...parts] = unprefix(line, shift || 1).split('>');
        return {
            name: name.trim(),
            text: parts.join('>').trim(),
        };
    };

    return compile();
};

window.Narratika = { compile };

})();
