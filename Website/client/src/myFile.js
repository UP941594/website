const home = document.querySelector('#homeLink');
const logout = document.querySelector('#loginLink');
const listOfPeers = document.querySelector('.listOfPeers');
const groupLink = document.querySelector('#groupLink');
const iframe = document.querySelector('.iframeFile');
const listOfFeedbacks = document.querySelector('.feedbacksHeading');

const fileId = window.location.hash.split('#')[1];
let currentUser = JSON.parse(localStorage.getItem('user'));
let currentFile;

function verifyUser() {
  if (!JSON.parse(localStorage.getItem('user'))) {
    location.href = '/';
  }
  home.href = '/upload.html#' + currentUser.id;
  groupLink.href = window.location.origin + '/' + 'group.html#' + JSON.parse(localStorage.getItem('user')).id;

  logout.addEventListener('click', () => {
    if (logout.textContent === 'Log Out') {
      window.location = '/';
    }
  });
}


async function checkFileExist() {
  const response = await fetch('files');
  if (response.ok) {
    const files = await response.json();
    let exist = false;
    files.forEach((file) => {
      if (file.id === fileId) {
        document.querySelector('.fileTitle').textContent = file.name;
        currentFile = file;
        exist = true;
      }
    });
    return exist;
  }
}

async function loadFile() {
  if (await checkFileExist()) {
    iframe.src = `uploads/${fileId}.pdf`;
    document.querySelector('.download').href = `uploads/${fileId}.pdf`;
  } else {
    document.querySelector('.mainContainer').textContent = 'Cannot find this file';
  }
}

async function showPeers() {
  const res = await fetch('/users');
  if (res.ok) {
    const users = await res.json();
    let thisUser;
    for (const user of users) {
      if (user.id === currentUser.id) {
        thisUser = user;
      }
    }
    const peers = [];
    for (const user of users) {
      if (user.course === thisUser.course && user.university === thisUser.university && user.id !== thisUser.id) {
        peers.push(user);
      }
    }
    if (peers.length === 0) {
      listOfPeers.textContent = 'YOU DO NOT HAVE ANY PEERS YET';
    }
    for (const peer of peers) {
      createFolder(peer);
    }
  }
}

async function createFolder(port) {
  const folder = document.createElement('div');
  folder.className = 'book';
  folder.id = port.id;
  listOfPeers.appendChild(folder);

  const para = document.createElement('p');
  para.textContent = port.name;
  para.className = 'name';
  folder.appendChild(para);

  if (await checkIfAlreadyShared(folder.id) === true) {
    folder.style.backgroundColor = '#8DCBFB';
  }

  folder.addEventListener('click', () => {
    shareFileWithPeer(folder);
  });
}

async function shareFileWithPeer(fold) {
  if (await checkIfAlreadyShared(fold.id) === true) {
    return
  }
  const info = {
    sharedId: null,
    peerId: fold.id,
    senderId: currentUser.id,
    fileId: window.location.hash.split('#')[1],
    fileName: currentFile.name,
    timeNow: new Date().toISOString()
  };
  const response = await fetch('sharedFiles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(info)
  });

  fold.style.backgroundColor = '#8DCBFB';
}


async function displayFeedbacks() {
  const res = await fetch('feedbacks');
  const feedbacks = await res.json();

  feedbacks.forEach((feedback) => {
    if (feedback.fromFile === fileId) {
      const div = document.createElement('div');
      div.className = 'listOfFeedbacks';
      div.innerHTML = `
        <p class="feedback" >${feedback.feedbacks}</p>
        <p class="rating">Rating: ${feedback.rating}</p>
        <p class="sender">by ${feedback.senderName}</p>
        `;
      listOfFeedbacks.appendChild(div);
    }
  });
}

async function checkIfAlreadyShared(peerId) {
  const res = await fetch('files');
  if (res.ok) {
    const files = await res.json();
    for (const file of files) {
      if (file.id === fileId) {
        const peers = file.sharedWithPeers.split(',');
        for (const peer of peers) {
          if (peer === peerId) {
            return true;
          }
        }
      }
    }
    return false;
  }
}

function init() {
  verifyUser();
  loadFile();
  showPeers();
  displayFeedbacks();
}

document.addEventListener('DOMContentLoaded', init);
