import React from 'react';

function Home(): React.JSX.Element {
  return (
    <div>
      <div className='content-container'>
        <h1>Who is Kevin?</h1>
        <p>
          I received a B.S. in mathematics in 2016 from Northwest Missouri State University (Go Bearcats!).  In 2022 I finished my Ph.D. in mathematics at the University of Kansas where I worked with <a href="https://jlmartin.ku.edu/"> Jeremy Martin</a> and I studied algebraic combinatorics.
        </p>
      </div>

      <div className='content-container'>
        <h1>Nerds Who Nerd</h1>
        <ul>
          {FriendList()}
        </ul>
      </div>
    </div>
  );
}

function FriendList(): React.JSX.Element[] {
  const friends: Record<string, string> = {
    "Sandy": "https://sandyuraz.com/",
    "Jimmy": "https://jameshurd.net/",
    "Josie": "https://jswalz.github.io/",
  }
  const friendsList: React.JSX.Element[] = Object.keys(friends).map((friend: string) => {
    return <li key={friend}><a href={friends[friend]} target="_blank" rel="noopener noreferrer">{friend}</a></li>
  })

  return shuffleList(friendsList)
}

function shuffleList<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export default Home;
