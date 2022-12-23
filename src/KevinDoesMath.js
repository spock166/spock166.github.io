import './App.css';

import AppRouter from './Components/AppRouter';

function KevinDoesMath() {

  return (
    <div className="KevinDoesMath">
      <div className='App-header'>
        <a className='menu-btn' href='/'>Home</a>
        <a className='menu-btn' href='/anime'>Anime</a>
        <a className='menu-btn' href='/math'>Math</a>
        <a className='menu-btn' href='/todo'>To Do Utility</a>
        <a className='menu-btn' href='/headpat'>Headpats</a>

        <a className='menu-btn' href="https://www.insidejazzkc.com/home/jazz" target="_blank">You Like Jazz?</a>
        <a className='menu-btn' href="https://youtu.be/SCrzYRTewzU" target="_blank">You Don't Like Jazz?</a>
      </div>

      <AppRouter />
    </div>
  );
}

export default KevinDoesMath;
