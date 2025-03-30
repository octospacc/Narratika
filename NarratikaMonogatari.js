(() => {

const compile = (source) => {
    const script = {};
    let [labelThis, labelLast] = ['', ''];

    const compile = () => {
        for (let line of source.replaceAll('\t', ' ').split('\n')) {
            if (line = line.trim()) {
                let shift = null;
                let direct = true;

                if (isDirective(line)) {
                    const directive = unprefix(line, 1);
                    const [key, ...parts] = directive.split(' ');
                    if (['label'].includes(key)) {
                        labelLast = labelThis;
                        script[labelThis = parts.join(' ')] = [];
                        if (labelLast) {
                            script[labelLast].push(`jump ${labelThis}`);
                        }
                    } else if (['if'].includes(key)) {
                        //script[labelThis].push({ Conditional: { Condition:  } });
                    } else if (['else'].includes(key)) {
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
                } else if (isSwitch(line)) {
                    let [text, action] = unprefix(line, 1).split('->');
                    text = text.trim();
                    // TODO use recursive line parsing for action
                    Object.values(script[labelThis][script[labelThis].length - 1])[0][text] = { Text: text, Do: unprefix(action.trim(), 1) };
                } else if (isNarration(line)) {
                    script[labelThis].push(' ' + unprefix(line, 1));
                } else if (isDialog(line)) {
                    const [name, ...parts] = unprefix(line, 1).split('>');
                    script[labelThis].push(name.trim() + ' ' + parts.join('>').trim());
                } else if (isComment(line)) {
                    // No-op
                } else {
                    //shift = -1
                    //direct = False
                    script[labelThis].push(line);
                }
            }
        }
        return script;
    }

    const isDirective = (line) => line.startsWith('@');
    const isSwitch = (line) => line.startsWith('*');

    const isNarration = (line) => line.startsWith('^');
    const isDialog = (line) => (line.startsWith('<') && line.includes('>'));
    
    const isFragment = (line) => line.startsWith('$$');
    const isComment = (line) => line.startsWith('//');
    
    const unprefix = (line, shift) => {
        if (shift == -1) {
            shift = 0;
        }
        return line.slice(shift).trim();
    };

    return compile();
};

window.Narratika = { compile };

})();