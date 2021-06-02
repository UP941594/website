const groupName = document.querySelector('#groupName');
const addMembers = document.querySelector('#addMembers');
const suggestedMembers = document.querySelector('.suggestedMembers');
const create = document.querySelector('#create');
const result = document.querySelector('.result');
const groupPage = document.querySelector('.groupPage');
const listOfGroups = document.querySelector('.listOfGroups');
const logout = document.querySelector('#loginLink');


const allMembers = [];
let senderName;
let mobileUser = false;
if (/Mobi/.test(navigator.userAgent)) {
  mobileUser = true;
}

const currentUser = JSON.parse(localStorage.getItem('user'));
const ws = new WebSocket("ws://" + window.location.hostname + ":" + (window.location.port || 80) + "/");
ws.addEventListener('open', () => {
  ws.send(JSON.stringify({ userId: currentUser.id, active: true, activeInGroup: null }));
});


function goingOverPages() {
  const home = document.querySelector('#homeLink');
  const groupLink = document.querySelector('#groupLink');

  groupLink.href = window.location.href;
  home.href = window.location.origin + '/' + 'upload.html#' + JSON.parse(localStorage.getItem('user')).id;

  if (!JSON.parse(localStorage.getItem('user'))) {
    location.href = '/';
  }
  logout.addEventListener('click', () => {
    if (logout.textContent === 'Log Out') {
      window.location = '/';
    }
  });
}

function memberNotExist(current, members) {
  current = String(current);
  for (const member of members) {
    if (member === current) {
      return false;
    }
  }
  return true;
}

function addOnClick(box, arr) {
  const div = document.querySelector('.suggested');
  div.addEventListener('click', () => {
    if (memberNotExist(div.id, allMembers)) {
      div.style.backgroundColor = '#659AF8';
      arr.push(div.id);
      box.value = '';
      box.focus();
    } else {
      return
    }
  });
}

async function findMembers() {
  const response = await fetch('/users');
  if (response.ok) {
    const users = await response.json();
    result.textContent = '';
    for (const user of users) {
      if (user.name.toLowerCase() === addMembers.value.toLowerCase() || user.username.toLowerCase() === addMembers.value.toLowerCase()) {
        createFolder(user, result);
      }
    }
    addOnClick(addMembers, allMembers);
  }
}
addMembers.addEventListener('input', findMembers);

async function getCurrentUser() {
  const response = await fetch('/users');
  if (response.ok) {
    const users = await response.json();
    for (const user of users) {
      if (user.id === currentUser.id) {
        return user;
      }
    }
  }
}

// add your peers later ..........
async function suggestPeers() {
  const response = await fetch('/users');
  if (response.ok) {
    const user = await response.json();
    const thisUser = await getCurrentUser();
    senderName = thisUser;
    for (let i = 0; i < user.length; i++) {
      if (user[i].id !== JSON.parse(localStorage.getItem('user')).id && thisUser.university === user[i].university && thisUser.course === user[i].course) {
        createFolder(user[i], suggestedMembers);
      } if (i === 6) {
        break;
      }
    }
    createGroup();
  }
}

async function getThisGroupMembers(groupId) {
  const response = await fetch('allGroupMembers');
  if (response.ok) {
    const members = await response.json();
    const membersId = [];
    members.forEach(function (member) {
      if (member.groupId === groupId) {
        membersId.push(member.memberId);
      }
    });
    return membersId;
  }
}

async function getGroupCreator(groupId) {
  const res = await fetch('groups');
  if (res.ok) {
    const groups = await res.json();
    for (const group of groups) {
      if (group.groupId === groupId) {
        return group.creator;
      }
    }
  }
}

function addMembersToArray(div) {
  const folders = document.querySelectorAll(div);
  for (const folder of folders) {
    folder.addEventListener('click', () => {
      if (memberNotExist(folder.id, allMembers)) {
        folder.style.backgroundColor = '#659AF8';
        allMembers.push(folder.id);
      } else {
        alert('Member already added');
      }
    });
  }
}

function createGroup() {
  const group = [];
  addMembersToArray('.suggested');
  allMembers.push(currentUser.id);
  create.addEventListener('click', async () => {
    const emptySpaceChecker = /^ *$/;
    if (emptySpaceChecker.test(groupName.value)) {
      alert('empty group name');
      return;
    }
    const groupDetail = {
      id: undefined,
      name: groupName.value.trim(),
      creator: currentUser.id,
      joindate: new Date().toISOString(),
      numberOfReviews: 0
    };

    const groupMember = {
      groupId: undefined,
      memberId: allMembers,
      groupCreator: currentUser.id,
      hasJoined: false,
      responded: false
    };
    group.push(groupDetail);
    group.push(groupMember);
    const response = await fetch('groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(group)
    });
    if (!alert('Group created')) {
      window.location.reload();
    }
  });
}

async function createFolder(port, div, exist, inputField) {
  const folder = document.createElement('div');
  if (exist) {
    folder.className = 'suggestedMember';
  } else {
    folder.className = 'suggested';
  }
  folder.id = port.id;
  div.appendChild(folder);

  const para = document.createElement('p');
  para.textContent = port.name;
  para.className = 'name';
  folder.appendChild(para);

  if (exist) {
    const groupMembers = await getThisGroupMembers(localStorage.getItem('groupSet'));
    const suggested = document.querySelector('.suggestedMember');
    suggested.addEventListener('click', async () => {
      if (memberNotExist(suggested.id, groupMembers)) {
        suggested.style.backgroundColor = '#659AF8';
        invitedMembers.push(suggested.id);
        const group = ['inviteRequest'];
        const groupIdentity = localStorage.getItem('groupSet');
        const groupMember = {
          groupId: groupIdentity,
          memberId: suggested.id,
          groupCreator: await getGroupCreator(groupIdentity),
          hasJoined: false,
          responded: false
        };
        group.push(groupMember);
        const response = await fetch('groups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(group)
        });
        alert('Request sent')
      } else {
        alert('Member already exist');
        inputField.value = '';
        inputField.focus();
      }
    });
  }
}


async function getMyGroups() {
  const res = await fetch('allGroupMembers');
  if (res.ok) {
    const groups = await res.json();
    const mine = [];
    groups.forEach((group) => {
      if (group.memberId === currentUser.id) {
        mine.push(group);
      }
    });
    return mine;
  }
}

async function displayMyGroups() {
  const groups = await getMyGroups();
  groups.forEach((group) => {
    createAlist(listOfGroups, group.groupId, group.groupName, group.groupCreator);
  });
  const myGroups = document.querySelectorAll('.myGroup');
  myGroups.forEach((myGroup) => {
    myGroup.addEventListener('click', async (e) => {
      const id = e.currentTarget.id
      ws.send(JSON.stringify({userId: currentUser.id, activeInGroup: myGroup.id, hasClicked: true}));
      localStorage.setItem('groupSet', myGroup.id)
      unclickAll(myGroups);
      myGroup.style.backgroundColor = 'white';
      if (mobileUser) {
        groupPage.style.display = 'block';
        listOfGroups.style.display = 'none';
      }
      showGroupPage(groupPage, myGroup);
      showGroupMsges(id);
      document.querySelector('.allGroups').addEventListener('click', () => {
        groupPage.style.display = 'none';
        listOfGroups.style.display = 'block';
      });
    });
  });
  showUsersPreviousGroup(myGroups);
}

async function showGroupMsges(identity) {
  const chatDiv = document.querySelectorAll('.chatDiv');
  const res = await fetch('groupData');
  if (res.ok) {
    const files = await res.json();
    for (const file of files) {
      if (identity === file.groupId) {
        if (file.senderId === currentUser.id) {
          displayMsg(chatDiv, file, true);
        } else {
          displayMsg(chatDiv, file, false);
        }
      }
    }
    takeToFilePage();
  }
}

function takeToFilePage() {
  const folders = document.querySelectorAll('.fileLoad');
  for (const folder of folders) {
    folder.addEventListener('click', () => {
      window.location = `/peerFile.html#${folder.id}/${'groupMember'}`;
    });
  }
}


function showUsersPreviousGroup(groups) {
  const clickThis = localStorage.getItem('groupSet')
  groups.forEach((myGroup) => {
    if (myGroup.id === clickThis) {
      myGroup.click();
    }
  });
}

function unclickAll(rts) {
  for (const rt of rts) {
    rt.style.backgroundColor = '#F1F6FF';
  }
}

function createAlist(div, id, name, creator) {
  const folder = document.createElement('div');
  folder.className = 'myGroup';
  folder.id = id;
  div.appendChild(folder);

  const para = document.createElement('p');
  // (a) MEANS THE USER IS ADMIN OF THIS GROUP
  if (creator === currentUser.id) {
    para.textContent = name.substring(0,1).toUpperCase() + name.substring(1) + ' (a)';
  } else {
    para.textContent = name.substring(0,1).toUpperCase() + name.substring(1);
  }
  para.className = 'myGroupName';
  folder.appendChild(para);
}

const invitedMembers = [];
function showGroupPage(div, group) {
  div.innerHTML = `
  <div class="inviteMembers">
  <div class="innerInvite">
    <h1 id="inviteHeading">Invite More Members</h1>
    <span class="delete">x</span>
  </div>
    <input id="invite" type="text" placeholder="Invite member">

    <div class="recommend"></div>
    <div class="listOfGroupMembers">
    <h1 id="inviteHeading">Group Dashboard</h1>
    <table class="dashboard">
      <tr>
      <th>Member</th>
      <th>Points</th>
      </tr>
    </table>
    <table class="dashboard">
      <tr>
      <th class="total">Total Group Points:</th>
      <th class="total" id="groupTotal"></th>
      </tr>
    </table>
    </div>
    <button class="leave" type="button" name="button">Leave</button>
  </div>
  <div class="groupHeading">
    <button class="allGroups" type="button" name="button"><</button>
    <h2> ${group.childNodes[0].textContent}</h2>
    <button class="more" type="button" name="button">more</button>
  </div>
  <div class="chatDiv">

  </div>
  <div class="groupChat">
    <input class="messageInput" type="text" name="" placeholder="Enter message here">
    <input id="groupFileInput" type="file">
    <button class="groupSubmit" type="button" name="button">Send</button>
  </div>
  `;
  const groupTotal = document.querySelector('#groupTotal');
  listOfGroupMembers(document.querySelector('.dashboard'), groupTotal);
  invitationOfMember();
  leaveGroup(document.querySelector('.leave'), currentUser.id, localStorage.getItem('groupSet'));
  const inviteMembers = document.querySelector('.inviteMembers');
  document.querySelector('.delete').addEventListener('click', showHide);
  document.querySelector('.more').addEventListener('click', showHide);
  function showHide(e) {
    if (e.currentTarget.className === 'more') {
      inviteMembers.style.display = 'block';
    } else {
      inviteMembers.style.display = 'none';
    }
  }

  if (!mobileUser) {
    document.querySelector('.allGroups').style.display = 'none';
  }
  document.querySelector('.groupHeading').id = group.id;
  document.querySelector('.groupSubmit').id = group.id;
  document.querySelector('.messageInput').id = group.id;
  document.querySelector('.chatDiv').id = group.id;

  sendMessages(document.querySelector('#groupFileInput'));
}

function leaveGroup(div, user, group) {
  div.addEventListener('click', async (e) => {
    const send = await fetch('groups', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user, groupId: group })
    });
    const groupPage = e.target.parentNode.parentNode;
    const groups = e.target.parentNode.parentNode.previousElementSibling.childNodes;
    groupPage.innerHTML = '';
    for (const mygroup of groups) {
      if (group === mygroup.id) {
        console.log(group);
        mygroup.remove();
      }
    }
    if (mobileUser) {
      document.querySelector('.listOfGroups').style.display = 'block';
    }
  });
}

async function listOfGroupMembers(div, total) {
  const currentGroupId = localStorage.getItem('groupSet');
  const res = await fetch('allGroupMembers');
  if (res.ok) {
    const members = await res.json();
    const thisGroupMembers = []
    for (const member of members) {
      if (member.groupId === currentGroupId) {
        thisGroupMembers.push(member);
      }
    }
    const sortByPoints = thisGroupMembers.sort(function(a,b) {
      return b.memberPoints - a.memberPoints;
    });
    sortByPoints.forEach((member) => {
      const tr = document.createElement('TR');
      div.appendChild(tr);

      const name = document.createElement('TD');
      name.textContent = member.groupMember;
      tr.appendChild(name);

      const points = document.createElement('TD');
      points.textContent = member.memberPoints;
      tr.appendChild(points);
    });
    total.textContent = thisGroupMembers[0].groupPoints;
  }
}

function sendMessages(groupFileInput) {
  const groupSubmit = document.querySelector('.groupSubmit');
  const messageInput = document.querySelector('.messageInput');

  groupSubmit.addEventListener('click', sendChat);
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendChat(e);
    }
  });
  function sendChat(e) {
    const emptySpaceChecker = /^ *$/;
    if (emptySpaceChecker.test(messageInput.value) && groupFileInput.value === '') {
      return
    }
    const file = groupFileInput.files[0];
    let fileSent = false;
    if (groupFileInput.value !== '') {
      fileSent = true;
    }
    let groupFileName;
    if (file !== undefined) {
      groupFileName = file.name;
      if (file.type !== 'application/pdf') {
        groupFileInput.value = '';
        return
      }
    }
    const time = new Date().toISOString();
    const data = new FormData();
    data.append('messageId', undefined)
    data.append('message', messageInput.value.trim())
    data.append('senderId', currentUser.id);
    data.append('senderName', senderName.name);
    data.append('groupId', e.currentTarget.id);
    data.append('sentAt', time);
    data.append('file', file);
    data.append('groupFileName', groupFileName);
    data.append('fileSent', fileSent);
    const response = fetch('groupData', {
      method: 'POST',
      body: data,
    })

    const info = {
      message: messageInput.value.trim(),
      senderId: currentUser.id,
      senderName: senderName.name,
      groupId: e.currentTarget.id,
      isMsg: true,
      file: fileSent,
      sentAt: time,
      groupFileName: groupFileName,
      On: 'socket'
    };
    messageInput.value = '';
    ws.send(JSON.stringify(info));
    groupFileInput.value = '';
  }
}

ws.addEventListener('message', (msg) => {
  const chatDiv = document.querySelectorAll('.chatDiv');
  msg = JSON.parse(msg.data);
  if (msg.senderId === currentUser.id) {
    displayMsg(chatDiv, msg, true);
  } else {
    displayMsg(chatDiv, msg, false);
  }
});


function invitationOfMember() {
  const result = document.querySelector('.recommend');
  const addMembers = document.querySelector('#invite');

  addMembers.addEventListener('input', async () => {
    const response = await fetch('/users');
    const users = await response.json();

    result.textContent = '';
    for (const user of users) {
      if (user.name.toLowerCase() === addMembers.value.toLowerCase() || user.username.toLowerCase() === addMembers.value.toLowerCase()) {
        createFolder(user, result, true, addMembers);
      }
    }
  });
}

function displayMsg(div, message, mine) {
  const messageBoxTop = document.createElement('div');
  messageBoxTop.className = 'messageBoxTop';
  div[0].appendChild(messageBoxTop);

  const messageBox = document.createElement('div');
  messageBox.innerHTML = `
  <p class="sentBy" > ${message.senderName}</p>
  <p class="groupMessage" >${message.message}</p>
  <p class="sendAt" >${message.sentAt.split('T')[1].split('.')[0].substring(0, 5)}</p>
  `;
  messageBoxTop.appendChild(messageBox);
  if (message.file) {
    console.log('file send');
    const fileLoad = document.createElement('span');
    fileLoad.className = 'fileLoad';
    fileLoad.id = message.fileId;
    fileLoad.textContent = 'file uploading...';
    messageBox.appendChild(fileLoad);
    setTimeout(async () => {
      const res = await fetch('groupData');
      const files = await res.json();
      for (const file of files) {
        if (file.senderId === message.senderId && file.sentAt === message.sentAt) {
          fileLoad.id = file.fileId;
          fileLoad.textContent = file.groupFileName;
        }
      }
    }, 2000);
    fileLoad.addEventListener('click', () => {
      window.location = `/peerFile.html#${fileLoad.id}/${'groupMember'}`;
    });
  } if (message.fileId !== null && message.file === undefined) {
    const fileLoad = document.createElement('span');
    fileLoad.className = 'fileLoad';
    fileLoad.id = message.fileId;
    fileLoad.textContent = `${message.groupFileName}`;
    messageBox.appendChild(fileLoad);
  }

  if (!mine) {
    messageBox.className = 'notMine';
  } else {
    messageBox.className = 'mine';
  }
  div[0].scrollTop = div[0].scrollHeight;
}

function hideDisplay() {
  const createAgroup = document.querySelector('#createAgroup');
  const createGroupDetails = document.querySelector('.createGroupDetails');

  createAgroup.addEventListener('click', () => {
    if (createGroupDetails.style.display === 'block') {
      createGroupDetails.style.display = 'none';
    } else {
      createGroupDetails.style.display = 'block';
    }
  });
}

function init() {
  goingOverPages();
  suggestPeers();
  displayMyGroups();
  hideDisplay();
}
init();
