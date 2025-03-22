function Home() {
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

function FriendList() {
  const friends = {
    "Sandy": "https://sandyuraz.com/",
    "Jimmy": "https://jameshurd.net/",
    "Josie": "https://jswalz.github.io/",
  }
  const friendsList = Object.keys(friends).map(friend => {
    return <li><a href={friends[friend]} target="_blank">{friend}</a></li>
  })

  return shuffleList(friendsList)
}

function shuffleList(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export default Home;
