// I know it sucks but who cares

var MidiPlayer = MidiPlayer
var loadFile, loadDataUri, Player
var AudioContext = window.AudioContext || window.webkitAudioContext || false 
var ac = new AudioContext || new webkitAudioContext
var eventsDiv = document.getElementById('events')

var playingnotes = {}
var rendered = {}
var notesActualRender = 0

const noteToKey = {
  'A': 'note1',
  'B': 'note2',
  'C': 'note3',
  'D': 'note3',
  'E': 'note4',
  'F': 'note5',
  'G': 'note6'
}

const handTranslator = {
  note1: {
    hand: 'right',
    notemap: '1'
  },
  note2: {
    hand: 'right',
    notemap: '2'
  },
  note3: {
    hand: 'right',
    notemap: '3'
  },
  note4: {
    hand: 'left',
    notemap: '3'
  },
  note5: {
    hand: 'left',
    notemap: '2'
  },
  note6: {
    hand: 'left',
    notemap: '1'
  }
}

let current = {
  right: 'idl',
  left: 'idl'
}

let currentkey = {
  right: '',
  left: ''
}

const colorMap = {
  note1: '#6cff39',
  note2: '#f70039',
  note3: '#fcde2d',
  note4: '#4bfef8',
  note5: '#f8410f',
  note6: '#5500ff'
}

var play = function () {
  Player.play()
}

var pause = function () {
  Player.pause()
}

var stop = function () {
  Player.stop()
}

function changeHand(hand, status, key) {
  let handname = hand[0] + 'hand' + status
  let currname = hand[0] + 'hand' + current[hand]
  document.getElementById(currname).style.display = 'none'
  if (current[hand] !== 'idl') document.getElementById(currname + '_').style.display = 'none'
  document.getElementById(handname).style.display = 'initial'
  if (status !== 'idl') {
    document.getElementById(handname + '_').style.display = 'initial'
  }
  if (currentkey[hand]) document.getElementById(currentkey[hand]).style.fill = ''
  if (key) {
    currentkey[hand] = key
    document.getElementById(currentkey[hand]).style.fill = colorMap[currentkey[hand]]
  }
  current[hand] = status
}

Soundfont.instrument(ac, 'https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/FluidR3_GM/acoustic_grand_piano-mp3.js').then((instrument) => {
  console.log('ready')
  loadFile = function () {
    let file = document.querySelector('input[type=file]').files[0]
    let reader = new FileReader()
    if (file) reader.readAsArrayBuffer(file)

    reader.addEventListener('load', function () {
      Player = new MidiPlayer.Player(function (event) {
        let noteid = event.channel + event.noteName + event.track
        let noteLetter = event.noteName ? event.noteName[0] : false
        let handdata = handTranslator[noteToKey[noteLetter]]
        if (event.name === 'Note on') {
          playingnotes[noteid] = instrument.play(event.noteName, ac.currentTime, { gain: event.velocity / 100 })
          // TODO: make this optional via a GUI
          if (event.noteNumber < 50) return
          changeHand(handdata.hand, handdata.notemap, noteToKey[noteLetter])
        }
        if (event.name === 'Note off') {
          playingnotes[noteid].stop()
          changeHand(handdata.hand, 'idl')
        }
      })

      Player.loadArrayBuffer(reader.result)

      play()
    }, false)
  }
})
