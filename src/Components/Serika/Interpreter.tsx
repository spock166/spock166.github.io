import React from 'react';
import { useState } from "react";

interface InterpreterProps {
    input: string;
}

const tabs = {
    Preview: "Preview",
    RawHTML: "Raw HTML",
} as const;

type TabType = typeof tabs[keyof typeof tabs];

function countMatches(str: string, re: RegExp): number {
    return ((str || '').match(re) || []).length;
}

function parseLine(rawLine: string | null): string {
    if (rawLine == null) {
        return "";
    }

    const phantomChar = String.fromCharCode(2);
    var output = rawLine;
    const re = new RegExp(`${phantomChar}`, "g");

    //Processing slashes first makes dealing with end tags easier.
    output = output.replace(/\\\//g, phantomChar);

    if (countMatches(output, /\//g) % 2 == 1 || output.match(/\/\s*\//)) {
        return "<div style=\"background:#cc0000;color:#cccccc\"> Sytax error:  Please check your code </div>";
    }
    output = output.replace(/\/([^\/]+)\//g, "<em> $1 <\/em>");

    output = output.replace(re, "\/");

    //Process astrix next.
    output = output.replace(/\\\*/g, phantomChar);

    if (countMatches(output, /\*/g) % 2 == 1 || output.match(/\*\s*\*/)) {
        return "THIS LINE IS SHIT AND MAKES SERIKA SAD";
    }
    output = output.replace(/\*([^\*]+)\*/g, "<b> $1 <\/b>");
    output = output.replace(re, "\*");

    //Finally take care of any remaining escape characters
    output = output.replace(/\\{2}/g, phantomChar);
    if (countMatches(output, /\\/g) != 0) {
        return "THIS LINE IS SHIT AND MAKES SERIKA SAD";
    }
    output = output.replace(re, "\\");

    return output;
}

function parseString(rawText: string): string {
    var isParagraphOpen = false;
    var output = "";
    var previousLine: string = "";

    let lines = rawText.split("\n");

    for (var line of lines) {
        if (line.match(/^\@{2}/)) {
            output += "<h2>" + parseLine(line.substring(2)) + "</h2>\n";
        } else if (line.match(/^\@{1}/)) {
            output += "<h1>" + parseLine(line.substring(1)) + "</h1>\n";
        } else if (previousLine == "" && !line.match(/^\s*$/)) {
            output += "</p>\n<p>\n";
            output += parseLine(line) + "\n";
            isParagraphOpen = true;
        } else if (!line.match(/^\s*$/)) {
            if (!isParagraphOpen) {
                output += "<p>\n";
                isParagraphOpen = true;
            }
            output += parseLine(line) + "\n";
        }
        previousLine = line;
    }

    if (isParagraphOpen) {
        output += "</p>\n";
    }

    return output;
}

function Interpreter({ input }: InterpreterProps): React.JSX.Element {
    const [activeTab, setActiveTab] = useState<TabType>(tabs.Preview);

    var output = "<!DOCTYPE HTML>\n<html>\n<body>\n" + parseString(input) + "</body>\n</html>"

    const isVisible = (tabName: TabType): boolean => { return activeTab === tabName; };

    const handleOnClick = (tabName: TabType): void => { if (!isVisible(tabName)) { setActiveTab(tabName); } };

    return (
        <div>
            <div className="tabStrip">
                <button onClick={() => handleOnClick(tabs.Preview)}>Preview</button>
                <button onClick={() => handleOnClick(tabs.RawHTML)}>Raw HTML</button>
            </div>
            <div>
                <iframe className="preview-container" style={{ display: isVisible(tabs.Preview) ? "block" : "none" }} srcDoc={output}></iframe>
                <div className="preview-container" style={{ display: isVisible(tabs.RawHTML) ? "block" : "none", whiteSpace: "pre-line" }}><code>{output}</code></div>
            </div>
        </div>
    );
}

export default Interpreter;