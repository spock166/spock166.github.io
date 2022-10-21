var headpats=0;

document.querySelector('#push').onclick = function(){
    var patsText = document.querySelector('#pats');
    var persyImg = document.querySelector('#persy-img');

    headpats+=1;
    pats.innerHTML="Headpats: "+headpats;
    persyImg.src='PersyHappy.png';
    setTimeout(()=>{persyImg.src='PersyContent.png';},250);
}
