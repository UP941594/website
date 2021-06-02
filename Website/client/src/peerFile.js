const home = document.querySelector('#homeLink');
const logout = document.querySelector('#loginLink');
const peerTitle = document.querySelector('#peerTitle');
const show = document.querySelector('.download');
const feedbacks = document.querySelector('#feedbackText');
const ratings = document.querySelector('.reviews').getElementsByTagName('span');
const currentUser = JSON.parse(localStorage.getItem('user'));
const features = document.querySelector('.features');
const iframe = document.querySelector('.iframe');
let sharedId = window.location.hash.split('#')[1];
const emptySpaceChecker = /^ *$/;
let viewedByMember;
let senderName;
let fileId;
let rated;


function verifyUser() {
  document.querySelector('#groupLink').href = window.location.origin + '/' + 'group.html#' + JSON.parse(localStorage.getItem('user')).id;
  if (!JSON.parse(localStorage.getItem('user'))) {
    location.href = '/';
  }
  home.href = '/upload.html#' + currentUser.id;
  logout.addEventListener('click', () => {
    if (logout.textContent === 'Log Out') {
      window.location = '/';
    }
  });
  if (sharedId.split('/')[1] === 'groupMember') {
    viewedByMember = true;
    sharedId = sharedId.split('/')[0];
  }
  if (viewedByMember) {
    displayFeedbacks();
  } else {
    features.style.display = 'none';
  }
}

async function getMyDetails() {
  const response = await fetch('/users');
  if (response.ok) {
    const users = await response.json();
    for (const user of users) {
      if (user.id === currentUser.id) {
        senderName = user.name;
      }
    }
  }
}


async function getFileDetails(path) {
  const res = await fetch(path);
  if (res.ok) {
    const files = await res.json();
    if (viewedByMember) {
      for (const file of files) {
        if (file.fileId === sharedId) {
          return file;
        }
      }
    } else {
      for (const file of files) {
        if (file.sharedId === sharedId) {
          return file;
        }
      }
    }
  }
}

async function getGroupData(id) {
  const thisGroupMembers = [];
  const res = await fetch('allGroupMembers');
  if (res.ok) {
    const allMembers = await res.json();
    allMembers.forEach((member) => {
      if (member.groupId === id) {
        thisGroupMembers.push(member);
      }
    });
    return thisGroupMembers;
  }
}

async function getFileData(path, book) {
  const res = await fetch(path);
  if (res.ok) {
    const files = await res.json();
    for (const file of files) {
      if (file.id === book.fileId) {
        return file;
      }
    }
    return false;
  }
}

async function getMyPeer(book) {
  const res = await fetch('/users');
  if (res.ok) {
    const users = await res.json();
    for (const user of users) {
      if (book.senderId === user.id) {
        return user;
      }
    }
  }
}

async function displayContent() {
  let details;
  let fileDetails;
  if (viewedByMember) {
    details = await getFileDetails('/getGroupFiles');
    fileDetails = details;
  } else {
    details = await getFileDetails('/sharedFiles');
    fileDetails = await getFileData('/files', details);
  }
  const peerDetails = await getMyPeer(details);
  const group = await getGroupData(fileDetails.groupId);
  if (viewedByMember) {
    peerTitle.textContent = `You are viewing ${peerDetails.name}'s file from ${group[0].groupName}`;
    fileId = fileDetails.fileId;
    iframe.src = `uploads/groupFiles/${fileDetails.fileId}.pdf`;
    show.href = `uploads/groupFiles/${fileId}.pdf`;
  } else {
    peerTitle.textContent = `You are viewing ${peerDetails.name}'s file`;
    fileId = fileDetails.id;
    iframe.src = `uploads/${fileDetails.id}.pdf`;
    show.href = `uploads/${fileId}.pdf`;
  }
  if (!fileDetails && !viewedByMember) {
    peerTitle.style.display = 'none';
    show.style.display = 'none';
    document.querySelector('.PeerFileDiv').textContent = 'The file has been deleted by the sender';
  }
}

function modifyRating() {
  for (const rating of ratings) {
    rating.addEventListener('click', () => {
      unclickAll(ratings);
      rating.style.backgroundColor = '#72C0FC';
      rated = rating.textContent;
    });
  }
}

function unclickAll(rts) {
  for (const rt of rts) {
    rt.style.backgroundColor = 'white';
  }
}

function showEachFeedback(feedbacks, data) {
  console.log(data);
  const div = document.createElement('div');
  div.className = 'listOfFeedbacks';
  div.innerHTML = `
  <p class="feedback" >${data.feedbacks}</p>
  <p class="rating">Rating: ${data.rating}</p>
  <p class="sender">by ${data.senderName}</p>`;
  feedbacks.appendChild(div);
}

async function sendFeedbacks() {
  if (rated === undefined) {
    document.querySelector('.warn').textContent = 'Please rate';
  } else if (emptySpaceChecker.test(feedbacks.value)) {
    document.querySelector('.warn').textContent = 'Please add feedbacks';
  } else if (emptySpaceChecker.test(feedbacks.value) && rated === undefined) {
    document.querySelector('.warn').textContent = 'Please rate and add feedbacks';
  } else {
    let score;
    if (viewedByMember) {
      score = {
        feedbacks: feedbacks.value,
        rating: rated,
        senderName: senderName,
        fromFile: fileId,
        groupId: localStorage.getItem('groupSet'),
        memberId: currentUser.id,
        groupFeedback: true
      };
    } else {
      score = {
        feedbacks: feedbacks.value,
        rating: rated,
        senderName: senderName,
        fromFile: fileId,
        groupFeedback: false
      };
    }
    const response = await fetch('feedbacks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(score)
    });
    document.querySelector('.warn').textContent = 'POSTED';
    feedbacks.value = '';
    rated = undefined;
    unclickAll(ratings);
    showEachFeedback(document.querySelector('.feedbacksHeading'), score);
  }
}

async function displayFeedbacks() {
  const features = document.querySelector('.features');
  const listOfFeedbacks = document.querySelector('.feedbacksHeading');
  const res = await fetch('feedbacks');
  if (res.ok) {
    const feedbacks = await res.json();
    feedbacks.forEach((feedback) => {
      if (feedback.fromFile === sharedId) {
        showEachFeedback(listOfFeedbacks, feedback);
      }
    });
  }
}

function init() {
  verifyUser();
  displayContent();
  getMyDetails();
  modifyRating();
  document.querySelector('#sendFeedbacks').addEventListener('click', sendFeedbacks);
  feedbacks.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendFeedbacks();
    }
  });
}
init();
