import React, { useState } from 'react';
import '../Styles/diffy.css';
import { Line } from "../Components/Diffy/line";
import { BipolarArray } from "../Components/Diffy/bipolar_array";

function lines(str: string): Line[] {
    const lineArray: Line[] = [];
    let line_number = 0;
    for (const l of str.split('\n')) {
        line_number++;
        lineArray.push(new Line(l, line_number));
    }
    return lineArray;
}

function shortestEdit(oldText: Line[], newText: Line[]): number {
    let n = oldText.length;
    let m = newText.length;
    const max = n + m;
    let v = new BipolarArray(new Array(2 * max + 1).fill(0)); // Store record of x values
    for (let d = 0; d <= max; d++) {
        for (let k = -d; k <= d; k += 2) {
            let x = 0;
            let y = 0;
            
            // Prioritize moving down (deleting from oldText) over moving right (adding to oldText)
            // In other words, go down if possible, otherwise go right
            if (k == -d || (k != d && v.get(k - 1) < v.get(k + 1))) {
                x = v.get(k + 1); // Move down
            } else {
                x = v.get(k - 1) + 1; // Move right
            }

            y = x - k;

            // Go as diagonal as we can
            while (x < n && y < m && oldText[x].text === newText[y].text) {
                x++;
                y++;
            }
            v.set(k, x); // Record the furthest x we reached
            if (x >= n && y >= m) {
                return d; // Found the solution
            }
        }
    }
    return -1; // Should never reach here
}

// Enhanced version that returns the actual diff path
function computeDiff(oldText: Line[], newText: Line[]): { editDistance: number; diff: React.JSX.Element; sideBySideDiff: React.JSX.Element } {
    const editDistance = shortestEdit(oldText, newText);
    
    // Create a React JSX diff visualization
    const diffLines: React.JSX.Element[] = [];
    
    // For now, let's show a basic line-by-line comparison
    const maxLines = Math.max(oldText.length, newText.length);
    
    for (let i = 0; i < maxLines; i++) {
        const oldLine = i < oldText.length ? oldText[i] : null;
        const newLine = i < newText.length ? newText[i] : null;
        
        if (oldLine && newLine) {
            if (oldLine.text === newLine.text) {
                // Unchanged line
                diffLines.push(
                    <div key={`unchanged-${i}`} className="diff-line unchanged">
                        <span className="line-number">{oldLine.lineNumber}</span>
                        <span className="line-content">{oldLine.text}</span>
                    </div>
                );
            } else {
                // Changed line
                diffLines.push(
                    <div key={`removed-${i}`} className="diff-line removed">
                        <span className="line-number">-{oldLine.lineNumber}</span>
                        <span className="line-content">{oldLine.text}</span>
                    </div>
                );
                diffLines.push(
                    <div key={`added-${i}`} className="diff-line added">
                        <span className="line-number">+{newLine.lineNumber}</span>
                        <span className="line-content">{newLine.text}</span>
                    </div>
                );
            }
        } else if (oldLine) {
            // Removed line
            diffLines.push(
                <div key={`removed-only-${i}`} className="diff-line removed">
                    <span className="line-number">-{oldLine.lineNumber}</span>
                    <span className="line-content">{oldLine.text}</span>
                </div>
            );
        } else if (newLine) {
            // Added line
            diffLines.push(
                <div key={`added-only-${i}`} className="diff-line added">
                    <span className="line-number">+{newLine.lineNumber}</span>
                    <span className="line-content">{newLine.text}</span>
                </div>
            );
        }
    }
    
    const diffElement = <div className="diff-container">{diffLines}</div>;
    const sideBySideDiffElement = computeSideBySideDiff(oldText, newText);
    
    return {
        editDistance,
        diff: diffElement,
        sideBySideDiff: sideBySideDiffElement
    };
}

// Side-by-side diff computation
function computeSideBySideDiff(oldText: Line[], newText: Line[]): React.JSX.Element {
    const leftLines: React.JSX.Element[] = [];
    const rightLines: React.JSX.Element[] = [];
    
    const maxLines = Math.max(oldText.length, newText.length);
    
    for (let i = 0; i < maxLines; i++) {
        const oldLine = i < oldText.length ? oldText[i] : null;
        const newLine = i < newText.length ? newText[i] : null;
        
        if (oldLine && newLine) {
            if (oldLine.text === newLine.text) {
                // Unchanged line - show in both sides
                leftLines.push(
                    <div key={`left-unchanged-${i}`} className="side-by-side-line unchanged">
                        <span className="line-number">{oldLine.lineNumber}</span>
                        <span className="line-content">{oldLine.text}</span>
                    </div>
                );
                rightLines.push(
                    <div key={`right-unchanged-${i}`} className="side-by-side-line unchanged">
                        <span className="line-number">{newLine.lineNumber}</span>
                        <span className="line-content">{newLine.text}</span>
                    </div>
                );
            } else {
                // Changed line - show old on left, new on right
                leftLines.push(
                    <div key={`left-changed-${i}`} className="side-by-side-line removed">
                        <span className="line-number">{oldLine.lineNumber}</span>
                        <span className="line-content">{oldLine.text}</span>
                    </div>
                );
                rightLines.push(
                    <div key={`right-changed-${i}`} className="side-by-side-line added">
                        <span className="line-number">{newLine.lineNumber}</span>
                        <span className="line-content">{newLine.text}</span>
                    </div>
                );
            }
        } else if (oldLine) {
            // Removed line - show on left, empty on right
            leftLines.push(
                <div key={`left-removed-${i}`} className="side-by-side-line removed">
                    <span className="line-number">{oldLine.lineNumber}</span>
                    <span className="line-content">{oldLine.text}</span>
                </div>
            );
            rightLines.push(
                <div key={`right-empty-${i}`} className="side-by-side-line empty">
                    <span className="line-number"></span>
                    <span className="line-content"></span>
                </div>
            );
        } else if (newLine) {
            // Added line - empty on left, show on right
            leftLines.push(
                <div key={`left-empty-${i}`} className="side-by-side-line empty">
                    <span className="line-number"></span>
                    <span className="line-content"></span>
                </div>
            );
            rightLines.push(
                <div key={`right-added-${i}`} className="side-by-side-line added">
                    <span className="line-number">{newLine.lineNumber}</span>
                    <span className="line-content">{newLine.text}</span>
                </div>
            );
        }
    }
    
    return (
        <div className="side-by-side-container">
            <div className="side-by-side-column">
                <div className="side-by-side-header">Text A (Original)</div>
                <div className="side-by-side-content">
                    {leftLines}
                </div>
            </div>
            <div className="side-by-side-column">
                <div className="side-by-side-header">Text B (Modified)</div>
                <div className="side-by-side-content">
                    {rightLines}
                </div>
            </div>
        </div>
    );
}

function Diffy(): React.JSX.Element {
    const [textA, setTextA] = useState<string>('');
    const [textB, setTextB] = useState<string>('');
    const [result, setResult] = useState<{ editDistance: number; diff: React.JSX.Element; sideBySideDiff: React.JSX.Element } | null>(null);
    const [showResults, setShowResults] = useState<boolean>(false);

    const processTexts = (): void => {
        if (!textA.trim() && !textB.trim()) {
            alert('Please enter some text in both fields to compare.');
            return;
        }

        if (!textA.trim() || !textB.trim()) {
            alert('Please enter text in both fields for comparison.');
            return;
        }

        // Convert texts to Line arrays
        const oldLines = lines(textA);
        const newLines = lines(textB);

        // Compute the diff
        const diffResult = computeDiff(oldLines, newLines);
        setResult(diffResult);
        setShowResults(true);
    };

    const clearTexts = (): void => {
        setTextA('');
        setTextB('');
        setResult(null);
        setShowResults(false);
    };

    return (
        <div>
            <div className='content-container'>
                <h1>Diffy - Text Diff Tool</h1>
                <p>
                    Compare two pieces of text and see the differences between them. 
                    This tool uses the Myers diff algorithm to calculate the minimum edit distance 
                    and shows line-by-line changes.
                </p>
            </div>

            <div className='content-container'>
                <div className='diffy-input-container'>
                    <div className='text-input-section'>
                        <label htmlFor="textA"><strong>Text A (Original):</strong></label>
                        <textarea
                            id="textA"
                            value={textA}
                            onChange={(e) => setTextA(e.target.value)}
                            rows={15}
                            cols={50}
                            placeholder="Enter the first text to compare..."
                        />
                    </div>

                    <div className='text-input-section'>
                        <label htmlFor="textB"><strong>Text B (Modified):</strong></label>
                        <textarea
                            id="textB"
                            value={textB}
                            onChange={(e) => setTextB(e.target.value)}
                            rows={15}
                            cols={50}
                            placeholder="Enter the second text to compare..."
                        />
                    </div>
                </div>

                <div className='diffy-buttons'>
                    <button onClick={processTexts} className='diffy-button primary'>
                        Compare Texts
                    </button>
                    <button onClick={clearTexts} className='diffy-button secondary'>
                        Clear All
                    </button>
                </div>
            </div>

            {showResults && result && (
                <div className='content-container'>
                    <div className="diff-summary">
                        <h3>Comparison Results</h3>
                        <p><strong>Edit Distance:</strong> {result.editDistance}</p>
                        <p><strong>Lines in Text A:</strong> {lines(textA).length}</p>
                        <p><strong>Lines in Text B:</strong> {lines(textB).length}</p>
                    </div>
                    <div className="diff-content">
                        <h4>Line-by-line Comparison:</h4>
                        {result.diff}
                    </div>
                    <div className="diff-content">
                        <h4>Side-by-side Comparison:</h4>
                        {result.sideBySideDiff}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Diffy;