# INTRO ABOUT THE WEB APP

- This web app is designed especially for university students/users, therefore all the features designed would only apply to students studying at the University.
- User can only login with single account in a browser (because of localstorage). Please use other browsers to login as a different user's account during testing.

## KEY FEATURES IN THE WEB APP

### INDEX.HTML (HOME PAGE OF THE WEB APP)

User:
- shall sign up using their academic credentials(university they study at, course and full name) and a username(an ID to identify different users).  
- shall login using their credentials.

Note: User cannot get access to any other features in the web app without completing the listed tasks above.

### UPLOAD.HTML (ONCE USER HAS LOGGED IN)

#### Your Files

User can:
- submit single or multiple pdf files at a time.
- view a list of all the files uploaded so far.
- sort these files by date, name or reverse all the files.
- choose to display least number of files if there are multiple on the page.
- delete any file.
- can log out of their account.
- view their file (please see **FILE.HTML** heading)

#### Shared Files

User can:
- view a list of all the files shared by their peers with them.   
- can view the name of their peer who has shared this file and when.
- can click and view each pdf file (please see **PEERFILE.HTML** heading)

#### Notifications

User:
- will receive a group join request in this section.
- can view person's name and group name in the request.
- can choose to accept or reject this request. If accepted, user will be redirected to the group chat. Else the request will disappear.


### FILE.HTML (WHERE USER CAN VIEW THEIR OWN PDF FILE)

User can:
- download their file (if they no longer have it on their machine).
- view their full pdf file.
- see a list of his peers.
- click and share this particular pdf file with selected peer.
- also read ratings and feedbacks of this particular file.


### PEERFILE.HTML (USER CAN READ FILE OF THEIR PEERS)

User can:
- view, rate and enter feedback.
- send multiple feedbacks.
- download the file.

### GROUP.HTML

#### Create a group

User has the ability:
- to create a group.
- choose group members from suggestions (only peers are listed).
- find members even from other university or courses using their name or username(ID).

#### My Groups

User can:
- view a list of all the groups he is part of.
- have chat with other group members.
- share pdf file in the group chat and receive feedback from all other members.
- rate, read and write feedback and gain points on other member's files shared in the group chat.  
- view a list of all the feedbacks received on a file from other members in the group.
- choose to invite more members.
- see a group member dashboard and number of points each member has gained (after submitting feedbacks).
- choose to leave the group chat.


## LISTS UNFINISHED & FUTURE WORK

User cannot:
- edit their username(ID), name or course details.
- edit feedbacks sent and remove feedbacks received from his peers.
- delete shared files once the feedbacks has been sent.
- submit a link instead of a PDF file.

Currently, there are no limitations on number of feedbacks a user can enter on a file or group file. I had thought about adding restriction where user can only send 1 feedback on a file, also user shall have ability to edit that feedback if required.

If there are more number of feedbacks on a file then a user cannot sort them to see only useful ones or delete feedback that are unnecessary.

The tasks above applies to group files as well.


## REFLECTION

The initial API design was somewhat useful and accurate apart from some components which I have not considered while implementing. The file structure for client-side have not changed much in the final submission, however the server-side did lack a list of express routes which I should have mentioned earlier on to strengthen the server-side of this web application.

Main component which I have not implemented is the ability of users to see all the files submitted by all users who have chosen to make their file public instead of private. This would have allowed any student from any discipline to see all files. However, it was quite reasonable that this feature was unnecessary, i.e. a student from computer science course would not have much interest in business management.

The things I would do differently is to have a clear formative submission to help me plan the development of this web application. The formative submission has lacked some API's and planning of this application and it was not clear enough to help me work on different stages of the app. Furthermore, current login system is making use of localstorage which is not quite secure and useful for identifying users. Therefore, I would try integrate Google Sign-in into this web application to add high level of security and to know the users in a better way.  

I would also try and make an early start to the coursework, so that I do not end up with a long list of future work.    
