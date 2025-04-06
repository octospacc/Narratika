#!/usr/bin/env node
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

		// single-line
        if (isDirective(line)) {
            return handleDirective(line);
        } else if (isSwitch(line)) {
            return handleSwitch(line);

		// multi-line
        } else if (isNarration(line)) {
            lastHandler = handleNarration;
        } else if (isDialog(line)) {
            lastHandler = handleDialog;
        } else if (isFragment(line)) {
            lastHandler = handleFragment;
        } else if (isComment(line)) {
            lastHandler = () => void(0); // No-op
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

	const normalizeLabel = (label) => {
		const start = (typeof monogatari !== 'undefined' ? monogatari.settings().Label : 'Start');
		return (label.toLowerCase() === start.toLowerCase() ? start : label);
	};
	
	const makeLine = (line) => {
		let handler;
		if (isNarration(line)) {
            handler = makeNarration;
        } else if (isDialog(line)) {
            handler = makeDialog;
        }
		return handler(line);
	};
    
    const handleDirective = (line) => {
        const directive = unprefix(line, 1);
        let [key, ...parts] = directive.split(' ');
		key = key.toLowerCase();
        if (['label'].includes(key)) {
            labelLast = labelThis;
            script[labelThis = normalizeLabel(parts.join(' '))] = [];
            if (labelLast) {
                script[labelLast].push(`jump ${labelThis}`);
            }
        } else if (['jump'].includes(key)) {
            script[labelThis].push(`jump ${normalizeLabel(parts.join(' '))}`);
        } else if (['scene'].includes(key)) {
            script[labelThis].push(`show ${key} ${parts.join(' ')}`);
        } else if (['show', 'hide'].includes(key) && ['sprite'].includes(parts[0])) {
            script[labelThis].push(`${key} character ${parts.slice(1).join(' ')}`);
        } else if (['if'].includes(key)) { // TODO
            //script[labelThis].push({ Conditional: { Condition:  } });
        } else if (['else'].includes(key)) { // TODO
            //Object.values(script[labelThis][script[labelThis].length - 1])[0].False = ;
        // } else if (['end'].includes(key)) {
        //     // No-op
        } else if (['menu', 'choice'].includes(key)) {
			parts = parts.join(' ').split('->');
            script[labelThis].push({ Choice: { Dialog: (parts.length >= 2 && makeLine(parts[1].trim())) } });
        } else if (['set'].includes(key)) {
			let [name, ...body] = parts;
			let operator = '=';
			if (body[0].endsWith('=')) { // allow for composite assignments (eg. +=, -=, ...)
				operator = body[0];
				body = body.slice(1);
			}
			script[labelThis].push(() => eval(`${name} ${operator} ${body.join(' ')}`));
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
        Object.values(script[labelThis][script[labelThis].length - 1])[0]['_' + text] = { Text: text, Do: unprefix(action.trim(), 1) };
    };
	
	const makeNarration = (line, shift) => (' ' + unprefix(line, shift || 1));

    const handleNarration = (line, shift) => script[labelThis].push(makeNarration(line, shift));

	const makeDialog = (line, shift, continuation) => {
        let dialog = {};
        if (continuation) {
            dialog = lastDialog;
            dialog.text = line.trim();
        } else {
            dialog = lastDialog = parseDialog(line, shift);
        }
        if (dialog.text) {
            return (dialog.name + ' ' + dialog.text);
        }
	};

    const handleDialog = (line, shift, continuation) => {
		const dialog = makeDialog(line, shift, continuation);
		if (dialog) {
			script[labelThis].push(dialog);
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

if (typeof window !== 'undefined') {
	window.Narratika = { compile };
} else if (typeof process !== 'undefined' && Array.isArray(process.argv) && typeof require !== 'undefined' && require.main === module) {
	if (process.argv.length === 3) {
		console.log(JSON.stringify(compile(require('fs').readFileSync(process.argv[2], 'utf8')), null, '  '));
	} else {
		console.log(`Usage: ${process.argv[1]} <path_to_input.narratika>`);
	}
}

})();
