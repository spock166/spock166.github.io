import React from 'react';
import MinesweeperGame from '../Components/Minesweeper/MinesweeperGame';

const Minesweeper: React.FC = () => {
  return (
    <div>
      <div className="content-container">
        <h1>💣 Minesweeper 💣</h1>
        <p>
          Classic minesweeper with a twist! Try the infinite mode for an endless challenge.
          <br />
          <strong>Controls:</strong> Click/tap to reveal, right-click/long-press to flag.
        </p>
      </div>
      <MinesweeperGame />
    </div>
  );
};

export default Minesweeper;
