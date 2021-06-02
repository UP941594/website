const fileInput = document.querySelector('#fileInput');
const uploadFile = document.querySelector('#uploadFile');
const welcome = document.querySelector('#welcome');
const logout = document.querySelector('#loginLink');
const home = document.querySelector('#homeLink');
const yourFiles = document.querySelector('.yourFiles');
const showOption = document.querySelector('.show');
const sortOption = document.querySelector('.sort');
const groupLink = document.querySelector('#groupLink');
const currentUser = JSON.parse(localStorage.getItem('user'));

if (!JSON.parse(localStorage.getItem("user"))) {
  location.href = '/';
}
home.href = window.location.href;
groupLink.href = window.location.origin + '/' + 'group.html#' + JSON.parse(localStorage.getItem('user')).id;

logout.addEventListener('click', () => {
  if (logout.textContent === 'Log Out') {
    window.location = '/';
  }
});

async function welcomeUser() {
  const response = await fetch('/users');
  if (response.ok) {
    const users = await response.json();
    for (const user of users) {
      if (user.id === currentUser.id) {
        welcome.textContent = `Welcome ${user.name}`;
      }
    }
  }
}

const allFiles = [];

function loadDOM() {
  fileInput.addEventListener('change', (e) => {
    const files = e.currentTarget.files;
    for (const file of files) {
      allFiles.push(file);
    }
  });

  uploadFile.addEventListener('click', () => {
    if (fileInput.value === '') {
      document.querySelector('#warn').textContent = 'No file selected';
      return;
    }
    for (const file of allFiles) {
      if (file.type !== 'application/pdf') {
        document.querySelector('#warn').textContent = 'Only PDF files are acceptable';
        fileInput.value = '';
        allFiles.length = 0;
        return false;
      }
    }
    for (const file of allFiles) {
      const data = new FormData();
      data.append('user', currentUser.id);
      data.append('file', file);
      const response = fetch('files', {
        method: 'POST',
        body: data,
      });
    }
    fileInput.value = '';
    if (!alert('Your file is POSTED')) {
      window.location.reload();
    }
  });
}

const userFiles = [];
async function displayAllFiles() {
  const res = await fetch(`/files/${currentUser.id}`);
  if (res.ok) {
    const files = await res.json();
    for (const file of files) {
      userFiles.push(file);
      createFolder(file);
    }
    redirectUsers();
    showOption.addEventListener('change', showLessFiles);
    sortOption.addEventListener('change', sortFiles);
  }
}

function redirectUsers() {
  const names = document.querySelectorAll('.name');
  const deleteButtons = document.querySelectorAll('.delete');

  for (const name of names) {
    name.addEventListener('click', () => {
      const fileId = name.parentElement.parentElement.id;
      window.location = `/file.html#${fileId}`;
    });
  }
  for (const cross of deleteButtons) {
    cross.addEventListener('click', (e) => {
      deleteFile(e);
    });
  }
}

function showLessFiles() {
  if (sortOption.value === 'date') {
    sortGivenFiles(userFiles, 'date');
  }
  if (sortOption.value === 'name') {
    sortGivenFiles(userFiles, 'name');
  }
  if (sortOption.value === 'reverse') {
    sortGivenFiles(userFiles, 'reverse');
  }
}

function sortFiles() {
  if (sortOption.value === 'date') {
    sortGivenFiles(userFiles, 'date');
  }
  if (sortOption.value === 'name') {
    sortGivenFiles(userFiles, 'name');
  }
  if (sortOption.value === 'reverse') {
    sortGivenFiles(userFiles, 'reverse');
  }
}

function sortGivenFiles(arr, type) {
  let result;
  if (type === 'date') {
    result = arr.sort((a, b) => {
      return a.secs - b.secs;
    });
  } if (type === 'name') {
    result = arr.sort((a, b) => {
      return a.name.substring(0, 1).toLowerCase() > b.name.substring(0, 1).toLowerCase() ? 1 : -1;
    });
  } if (type === 'reverse') {
    result = [];
    arr.forEach((item) => {
      result.unshift(item);
    });
  }
  yourFiles.textContent = '';
  let number = showOption.value;
  if (number === 'All' || number > userFiles.length) {
    number = userFiles.length;
  }
  for (let i = 0; i < number; i++) {
    createFolder(result[i]);
  }
  redirectUsers();
}


function createFolder(port) {
  console.log(port);
  const folder = document.createElement('div');
  folder.className = 'book';
  folder.id = port.id;
  folder.innerHTML = `
  <div class="topOfBook ">
  <p class="name">${port.name}</p>
  <span class="delete">x</span>
  </div>
  <p class="by">${port.joindate.split('T')[0].split('-')[2] + '-' + port.joindate.split('T')[0].split('-')[1] + '-' + port.joindate.split('T')[0].split('-')[0]}</p>
  <p class="time">at ${port.joindate.split('T')[1].split('.')[0].substring(0, 5)}</p>`;
  yourFiles.appendChild(folder);
}

async function deleteFile(event) {
  event.preventDefault();
  const id = event.target.parentElement.parentElement.id;
  const vanish = await fetch('files', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });
  event.target.parentElement.parentElement.remove();
}

async function displayPeerFiles() {
  const res = await fetch('/sharedFiles');
  if (res.ok) {
    const files = await res.json();
    const shareDiv = document.querySelector('.sharedFiles');
    let filesExist = false;

    for (const file of files) {
      if (file.peerId === currentUser.id) {
        filesExist = true;
        const myPeer = await getMyPeer(file);
        const time = file.timeNow.split('T')[0];
        const div = document.createElement('div');
        div.className = 'peerBook';
        div.id = file.sharedId;
        div.innerHTML = `
          <p class="fileName" >${file.fileName}</p>
          <p class="by">${myPeer.name}</p>
          <p class="time">on ${time.split('-')[2] + '-' + time.split('-')[1] + '-' + time.split('-')[0]}</p>`;
        shareDiv.appendChild(div);
      }
    }

    if (!filesExist) {
      shareDiv.textContent = 'No shared file yet';
    }

    const folders = document.querySelectorAll('.peerBook');
    for (const folder of folders) {
      folder.addEventListener('click', () => {
        window.location = `/peerFile.html#${folder.id}`;
      });
    }
  }
}

async function getMyPeer(book) {
  const res = await fetch('/users');
  const users = await res.json();
  if (res.ok) {
    for (const user of users) {
      if (book.senderId === user.id) {
        return user;
      }
    }
  }
}

async function displayNotification() {
  const notifications = document.querySelector('.notifications');
  const res = await fetch('notifications');
  if (res.ok) {
    const groups = await res.json();
    for (const group of groups) {
      if (group.memberId === currentUser.id) {
        notify(group, notifications);
      }
    }
  }
}

async function notify(port, div) {
  const creator = await getCreator(port.groupCreator);
  const folder = document.createElement('div');
  folder.className = 'request';
  folder.id = port.groupId;
  div.appendChild(folder);

  const para = document.createElement('p');
  para.textContent = `${creator.name} has requested you to join ${port.groupName}`;
  para.className = 'name';
  folder.appendChild(para);

  const accept = document.createElement('button');
  accept.className = 'accept';
  accept.textContent = 'Accept';
  folder.appendChild(accept);

  const reject = document.createElement('button');
  reject.className = 'reject';
  reject.textContent = 'Reject';
  folder.appendChild(reject);

  respondToRequest(accept);
  respondToRequest(reject);
}

function respondToRequest(button) {
  button.addEventListener('click', (e) => {
    const data = {
      groupId: e.target.parentElement.id,
      person: currentUser.id,
      hasJoined: button.textContent,
      responded: true
    };
    const send = fetch('groups', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (button.className === 'accept') {
      localStorage.setItem('groupSet', e.target.parentElement.id)
      window.location = 'group.html#' + JSON.parse(localStorage.getItem('user')).id
    }
    e.target.parentElement.remove();
  });
}

async function getCreator(currentUser) {
  const response = await fetch('/users');
  if (response.ok) {
    const users = await response.json();
    for (const user of users) {
      if (user.id === String(currentUser)) {
        return user;
      }
    }
  }
}

function init() {
  welcomeUser();
  loadDOM();
  displayAllFiles();
  displayPeerFiles();
  displayNotification();
}

window.addEventListener('DOMContentLoaded', init, false);
