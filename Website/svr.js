import express from 'express';
import * as db from './database.js';
import ws from 'ws';
import http from 'http';
import multer from 'multer';
import uuid from 'uuid-random';
const app = express();
const server = http.createServer(app);

// MULTER STORING USER FILES IN SEPARATE FOLDER AND
// GROUP FILES IN A SEPARATE FOLDER
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (req.body.groupId) {
      cb(null, 'client/uploads/groupFiles');
    } else {
      cb(null, 'client/uploads');
    }
  },
  filename: function (req, file, cb) {
    const fileId = uuid();
    req.body.fileId = fileId;
    cb(null, fileId + '.pdf');
  }
});
let upload = multer({ storage: storage });

// USER ACCOUNTS HANDLERS
app.get('/users', async (req, res) => {
  const details = await db.getDetails('User');
  res.json(details);
});
app.post('/users', express.json(), async (req, res) => {
  const addUser = await db.addUserAccount(req.body);
  res.json(addUser);
});


// ADDS, GETS AND DELETES USER FILES
app.post('/files', upload.single('file'), async (req, res) => {
  const addFileIntoDB = await db.addFile(req, req.body.fileId);
  res.json(addFileIntoDB);
});

app.get('/files', async (req, res) => {
  const details = await db.getDetails('File');
  res.json(details);
});

app.get('/files/:id', async (req, res) => {
  const details = await db.getUserFiles(req.params.id);
  res.json(details);
});

app.delete('/files', express.json(), async (req, res) => {
  const deleteIt = await db.deleteFile(req.body.id);
  res.json(deleteIt);
});


// FILES SHARED WITH PEERS HANDLERS
app.get('/sharedFiles', async (req, res) => {
  const details = await db.getDetails('sharedFile');
  res.json(details);
});

app.post('/sharedFiles', express.json(), async (req, res) => {
  const addUser = await db.addSharedFiles(req.body);
  res.json(addUser);
});


// FEEDBACKS ON EACH FILE
app.get('/feedbacks', async (req, res) => {
  const details = await db.getDetails('feedback');
  res.json(details);
});

app.post('/feedbacks', express.json(), async (req, res) => {
  const addUser = await db.addFeedbacks(req.body);
  res.json(addUser);
});


// NOTIFICATIONS OF GROUP REQUESTS
app.get('/notifications', async (req, res) => {
  const getGroups = await db.requestNoti();
  res.json(getGroups);
});


// TAKES CARE OF ALL GROUP REQUESTS FROM CREATING, LEAVING, MESSAGING
// AND POSTING FILES WITH ALL PEERS IN A SINGLE GROUP
app.get('/groups', async (req, res) => {
  const details = await db.getDetails('groupMember');
  res.json(details);
});

app.get('/allGroupMembers', async (req, res) => {
  const details = await db.getAllGroupMembers();
  res.json(details);
});

// REQ HANDLER FOR CREATING GROUPS
app.post('/groups', express.json(), async (req, res) => {
  const create = await db.createGroups(req.body);
  res.json(create);
});

// WHEN USER ACCEPTS OR REJECTS GROUP JOIN REQUESTS
app.put('/groups', express.json(), async (req, res) => {
  const change = await db.changeGroupInfo(req.body);
  res.json(change);
});

// WHEN USER LEAVES A GROUP
app.delete('/groups', express.json(), async (req, res) => {
  const deleteIt = await db.leaveGroup(req.body);
  res.json(deleteIt);
});

// ALL MESSAGES RECIEVED FROM GROUPS AND STORED INTO DATABASE
app.get('/groupData', async (req, res) => {
  const details = await db.getDetails('groupData');
  res.json(details);
});

// HANDLER FOR GROUP FILES
app.post('/groupData', upload.single('file'), async (req, res) => {
  const addFileIntoDB = await db.addgroupFile(req.body, req.body.fileId);
  res.json(addFileIntoDB);
});

// FETCHES ALL GROUP FILES
app.get('/getGroupFiles', async (req, res) => {
  const getFiles = await db.getGroupFiles();
  res.json(getFiles);
});


// WEB SOCKET IS RECIEVEING AND SENDING LIVE CHATS
// TO ACTIVE USERS ON THE SITE.
const clients = [];
function sendMsgesToRightUsers(socket) {
  socket.on('message', (msg) => {
    msg = JSON.parse(msg);
    if (msg.active) {
      socket.user = msg;
      clients.push(socket);
    } if (msg.hasClicked) {
      clients.forEach((client) => {
        if (client.user.userId === msg.userId) {
          client.user.activeInGroup = msg.activeInGroup;
        }
      });
    } if (msg.isMsg) {
      clients.forEach((client) => {
        if (client.user.activeInGroup === msg.groupId) {
          client.send(JSON.stringify(msg));
        }
      });
    }
  });
}

const wsServer = new ws.Server({ server: server });
wsServer.on('connection', sendMsgesToRightUsers);

app.use(express.static('client'));
server.listen(8080, () => { console.log('Server is running') });
