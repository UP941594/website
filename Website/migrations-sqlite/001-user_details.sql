-- Up

CREATE TABLE User (
  id NOT NULL PRIMARY KEY,
  name NOT NULL,
  username NOT NULL,
  university NOT NULL,
  course NOT NULL,
  joindate NOT NULL,
  points
);

CREATE TABLE File (
  id NOT NULL PRIMARY KEY,
  user_id NOT NULL,
  name NOT NULL,
  sharedWithPeers,
  joindate NOT NULL,
  secs NOT NULL
);

CREATE TABLE sharedFile (
  sharedId NOT NULL,
  peerId NOT NULL,
  senderId NOT NULL,
  fileId NOT NULL,
  fileName NOT NULL,
  timeNow NOT NULL
);

CREATE TABLE feedback (
  feedbacks NOT NULL,
  rating NOT NULL,
  senderName NOT NULL,
  fromFile NOT NULL
);

CREATE TABLE peerGroup (
  id NOT NULL,
  name NOT NULL,
  creator NOT NULL,
  joindate NOT NULL,
  numberOfReviews
);

CREATE TABLE groupMember (
  groupId NOT NULL,
  memberId NOT NULL,
  creator,
  hasJoined BOOLEAN NOT NULL,
  responded BOOLEAN NOT NULL,
  memberPoints
);

CREATE TABLE groupData (
  messageId NOT NULL,
  message,
  senderId NOT NULL,
  senderName,
  groupId NOT NULL,
  sentAt,
  fileId,
  groupFileName
);

-- Down
