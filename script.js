let currentsong = new Audio()
let songs;
let currentfolder;

// time conversion:
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
      return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}


// getsongs:
async function getSongs(folder) {
  currentfolder = folder
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
     let songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }  
    }
    return songs
  
}
function update(){
  let songUl = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUl.innerHTML=""
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li>
                <img class="invert" src="music.svg" alt="" />
                <div class="info">
                  <div>${song.replaceAll('%20' , " ")}</div>
                  <div>Yashwant</div>
                </div>
                <div class="playnow">
                  <span>Play now</span>
                  <img class="invert" src="playbutton.svg" alt="">
                </div>
              </li>`
    }

  //Attaching an event listner to each song :-
  Array.from(document.querySelector(".songlist").getElementsByTagName('li')).forEach(e=>{
    e.addEventListener('click' , element=>{
      console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
    })
  })
}
// playmusic:
const playmusic = (track)=>{
  currentsong.src = `/${currentfolder}/` + track
  currentsong.play()
  play.src = "pause.svg"
  document.querySelector(".songinfo").innerHTML= decodeURI(track)
  document.querySelector(".songtime").innerHTML= "00 : 00"
}
async function displayAlbums() {
  console.log("displaying albums")
  let a = await fetch(`http://127.0.0.1:3000/songs/`)
  let response = await a.text();
  let div = document.createElement("div")
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a")
  let cardcontainer = document.querySelector(".cardcontainer")
  let array = Array.from(anchors)
  for (let index = 0; index < array.length; index++) {
      const e = array[index]; 
      if (e.href.includes("/songs")) {
          let folder = e.href.split("/").slice(-2)[0]
          console.log(folder)
          // Get the metadata of the folder
          let a = await fetch(`/songs/${folder}/info.json`)
          let response = await a.json(); 
          cardcontainer.innerHTML = cardcontainer.innerHTML + `   <div data-folder="${folder}" class="card">
              <div class="playbut">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="40"
                  height="40"
                  fill="none"
                >
                  <circle cx="12" cy="12" r="10" fill="#1ed760" />
                  <path d="M16.5 12l-7 5.5V6.5z" fill="#000000" />
                </svg>
              </div>
              <img
                src="/songs/${folder}/cover.jpeg"
              />
              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>`
      }
  }
  Array.from(document.getElementsByClassName("card")).forEach(e=>{
    e.addEventListener("click" , async item=>{
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playmusic(songs[0])
      update()
    })
})



}

//main :
async function main(){
    songs = await getSongs("songs/ncs");
    console.log(songs);
    displayAlbums()
    
  //attach eventlistner to next , previous , play:
  play.addEventListener('click' , ()=>{
      if(currentsong.paused){
        currentsong.play()
        play.src = "pause.svg"
      }
      else{
        currentsong.pause()
        play.src = "playbutton.svg"
      }
  })
  currentsong.addEventListener("timeupdate" , ()=>{
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime )} / ${secondsToMinutesSeconds(currentsong.duration)} `
    document.querySelector(".circle").style.left = (currentsong.currentTime/currentsong.duration) * 100 + "%"
  })
  document.querySelector(".seekbar").addEventListener('click' , e=>{
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100 
    document.querySelector(".circle").style.left = percent +"%"
    currentsong.currentTime = (currentsong.duration * percent) / 100
  })

  //add eventlistner to hambuger:
  document.querySelector(".hamburger").addEventListener('click' ,()=>{
    document.querySelector(".left").style.left = "0"
  })
  //add eventlistner to cross:
  document.querySelector(".cross").addEventListener('click' ,()=>{
    document.querySelector(".left").style.left = "-120%"
  })
  // add event listner to next:-
  next.addEventListener('click' , ()=>{
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
    if(index+1<songs.length){
      playmusic(songs[index + 1])
    }
  })
  previous.addEventListener('click' , ()=>{
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
    if(index-1 >= 0){
      playmusic(songs[index - 1])
    }
  })

  //add event listner to the range :
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change" , (e)=>{
    currentsong.volume = parseInt(e.target.value)/100
  })
  // showing songs according to the playlist 

  document.querySelector(".volume>img").addEventListener("click", e=>{ 
    if(e.target.src.includes("volume.svg")){
        e.target.src = e.target.src.replace("volume.svg", "mute.svg")
        currentsong.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    }
    else{
        e.target.src = e.target.src.replace("mute.svg", "volume.svg")
        currentsong.volume = .10;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }
    update()
})
  
}

main(); 
    