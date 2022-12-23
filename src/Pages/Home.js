import '../App.css';

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
        <h1>Fun Things</h1>
        <ul>
          <li><a href="https://sandyuraz.com/">Sandy's Awesome Page</a></li>
        </ul>
      </div>
    </div>
  );
}

export default Home;
