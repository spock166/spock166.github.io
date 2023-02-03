import { useState } from "react";

function countMatches(str, re){
    return ((str || '').match(re) || []).length;
}

function parseLine(rawLine){
    if(rawLine == null){
        return "";
    }

    const phantomChar = String.fromCharCode(2);
    var output = rawLine;
    const re = new RegExp(`${phantomChar}`,"g");

    //Processing slashes first makes dealing with end tags easier.
    output=output.replace(/\\\//g,phantomChar);

    if(countMatches(output,/\//g)%2 == 1 || output.match(/\/\s*\//)){
        return "<div style=\"background:#cc0000;color:#cccccc\"> Sytax error:  Please check your code </div>";
    }
    output = output.replaceAll(/\/([^\/]+)\//g, "<em> $1 <\/em>");
    
    output = output.replace(re,"\/");

    //Process astrix next.
    output=output.replace(/\\\*/g,phantomChar);

    if(countMatches(output,/\*/g)%2 == 1 || output.match(/\*\s*\*/)){
        return "THIS LINE IS SHIT AND MAKES SERIKA SAD";
    }
    output = output.replaceAll(/\*([^\*]+)\*/g, "<b> $1 <\/b>");
    output = output.replace(re,"\*");

    //Finally take care of any remaining escape characters
    output=output.replace(/\\{2}/g,phantomChar);
    if(countMatches(output,/\\/g) != 0){
        return "THIS LINE IS SHIT AND MAKES SERIKA SAD";
    }
    output = output.replace(re,"\\");

    return output;
}

function parseString(rawText){
    var isParagraphOpen=false;
    var output = "";
    var previousLine;

    let lines = rawText.split("\n");

    for(var line of lines){
        if(line.match(/^\@{2}/)){
            output += "<h2>" + parseLine(line.substring(2)) + "</h2>";
        }else if(line.match(/^\@{1}/)){
            output += "<h1>" + parseLine(line.substring(1)) + "</h1>";
        }else if(previousLine == "" && !line.match(/^\s*$/)){
            output += "</p><p>";
            output += parseLine(line);
            isParagraphOpen=true;
        }else if(!line.match(/^\s*$/)){
            if(!isParagraphOpen){
                output += "<p>";
                isParagraphOpen=true;
            }
            output += parseLine(line);
        }
        previousLine=line;
    }
    
    return output;
}

function Interpreter({input}){
    var output = "<!DOCTYPE HTML><html><body>"+parseString(input)+"</body></html>"

    return (
    <div>
        <iframe className="preview-container" srcDoc={output}></iframe>
    </div>
    );
}

export default Interpreter;