// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDH_3VpNHYwzHEcnSvCRepZaG0zTpH1QHI",
  authDomain: "ticketmaster-ab086.firebaseapp.com",
  databaseURL: "https://ticketmaster-ab086-default-rtdb.firebaseio.com",
  projectId: "ticketmaster-ab086",
  storageBucket: "ticketmaster-ab086.appspot.com",
  messagingSenderId: "617810340463",
  appId: "1:617810340463:web:46b82e47df91c46796bb9a",
  measurementId: "G-D0WZYDWX5G"
};

// Initialize Firebase
if (!firebase.apps.length) {
   firebase.initializeApp(firebaseConfig);
 } else {
   firebase.app();
 }
firebase.analytics();
firebase.database();

const auth = firebase.auth();
const db = firebase.firestore();

// update firestore settings
db.settings({ timestampsInSnapshot: true });

/*--------------------  USER INFO  --------------------*/
// Array to hold user info
var currentUserData = [];

//Auth stuff to get Current User Data
auth.onAuthStateChanged((user) => {
  // clear currentUserData Array
  currentUserData = [];

  if(user){
    var uid = user.uid;
    currentUserData.push(uid);
    var accountRef = db.collection("users").doc(user.uid);
    accountRef.get().then((doc) => {
      if(doc.exists){
        var userName = doc.data().fName + " " + doc.data().lName;
        currentUserData.push(userName);
        console.log("User ID: " + currentUserData[0] + " \nName: " + currentUserData[1]);
        GetAllProjects();
      }
    });
    var useremail = user.email;
  }
  else{
    console.log("No user signed in..");
  }
})

// Get Current User's ID
function GetUserID(currentUserData){
  return currentUserData[0];
}
// Get Current User's Name
function GetUserName(currentUserData){
  return currentUserData[1];
}

/*---------------------------------------------  PROJECT PAGE FUNCTIONS  ---------------------------------------------*/
/*--------------------  PROJECT TABLE  --------------------*/
// Fetch Project Titles and Input into Table
var projectref = firebase.database().ref('Projects');


function GetAllProjects(){
  ResetTable();

  // projectref.where('/members/' + , '==', true)
  projectref.once('value', function(AllRecords){
  AllRecords.forEach(
    function(CurrentRecord){
      var pid = CurrentRecord.val().ProjectID;
      var pname = CurrentRecord.val().ProjectTitle;
      var pstatus = CurrentRecord.val().ProjectStatus;
      var pcreator = CurrentRecord.val().ProjectCreator;
      var pcreatorid = CurrentRecord.val().ProjectCreatorID;

      AddProjectToTable(pid, pname, pstatus, pcreator, pcreatorid);
    }
  );
  console.log(projList); // DEBUG
  });
}

// Save Project contents here for reference
var projList = [];
var pindex = 0;

function AddProjectToTable(pid, pname, pstatus, pcreator, pcreatorid){
  var tbody = document.getElementById('tbody1');
  var trow = document.createElement('tr');
  var td0 = document.createElement('td');
  var td1 = document.createElement('td');
  var td2 = document.createElement('td');
  var td3 = document.createElement('td');
  td0.setAttribute('class', 'projectID');
  td1.setAttribute('class', 'myproject');
  td2.setAttribute('class', 'mystatus');
  td3.setAttribute('class', 'projectCreator');
  pindex++;
  projList.push([pid, pname, pstatus, pcreator, pcreatorid]);
  td0.innerHTML= pid;
  td1.innerHTML= pname;
  td2.innerHTML= pstatus;
  td3.innerHTML= pcreator;
  trow.appendChild(td0);
  trow.appendChild(td1);
  trow.appendChild(td2);
  trow.appendChild(td3);

  var ControlDiv = document.createElement("div");
  ControlDiv.innerHTML = '<button type="button" id="selectprojectbtn" class="functionbtn" onclick="GetProjectTickets('+pindex+')">View Tickets</button>';
  if(GetUserID(currentUserData) == pcreatorid){
    ControlDiv.innerHTML += '<button type="button" id="editprojectbtn" class="functionbtn" onclick="EditProject('+pindex+')">Edit</button>';
    ControlDiv.innerHTML += '<button type="button" id="deleteprojectbtn" class="functionbtn" onclick="DeleteProject('+pindex+')">Delete</button>';
  }


  trow.appendChild(ControlDiv);
  tbody.appendChild(trow);

}

function ResetTable(){
  projList = [];
  pindex = 0;
  var projTable = document.getElementById('tbody1');
  projTable.innerHTML = "";
}

// Add new project - Edited by MTo
function addProject(){
  var projid = "proj"+Date.now().toString();
  var projtitle = document.getElementById('ptitle').value;
  var projstatus = "Todo";
  var projcreator = GetUserName(currentUserData);
  var projcreatorid = GetUserID(currentUserData);

  // Temporary to set ProjTitle when creating tickets
  var ProjectPath = "Projects/" + projid + "/";
  var firebaseRef = firebase.database().ref(ProjectPath);

  // Adds to realtime database
  firebaseRef.set({ProjectID:projid, ProjectTitle:projtitle, ProjectStatus:projstatus, ProjectCreator:projcreator, ProjectCreatorID:projcreatorid});
  GetAllProjects();
}

// Edit Project Info
function EditProject(index){
  ResetSubmitProjContainer();
  document.getElementById("submitprojectbtn").remove();
  document.getElementById("submitprojcontainer").innerHTML += '<select id="pstatus"><option value="Todo">Todo</option><option value="In-Progress">In-Progress</option><option value="Finished">Finished</option></select>';
  document.getElementById("submitprojcontainer").innerHTML += '<button id = "submitprojectbtn" onclick="addProject()"><i class="fa fa-plus" aria-hidden="true"></i> Update</button>'

  if(index == null){
    document.getElementById('ptitle').value = "";
  }
  else{
    --index;
    selectedProjectID = projList[index][0];
    sessionStorage.setItem('selectedProjID', selectedProjectID)

    document.getElementById('ptitle').value = projList[index][1];
    document.getElementById('pstatus').value = projList[index][2];
    document.getElementById("submitprojectbtn").onclick = UpdateProject;
  }
}

// Update Project Info
function UpdateProject(){
  var projtitle = document.getElementById('ptitle').value;
  var projstatus = document.getElementById('pstatus').value;

  var ProjectPath = "Projects/"+ sessionStorage.getItem("selectedProjID") + "/";
  var firebaseRef = firebase.database().ref(ProjectPath);

  firebaseRef.update({ProjectTitle:projtitle, ProjectStatus:projstatus});

  document.getElementById("submitprojectbtn").innerHTML = '<i class="fa fa-plus" aria-hidden="true"></i> Submit';
  document.getElementById("submitprojectbtn").onclick = addProject;

  document.getElementById('ptitle').value = "";
  document.getElementById('pstatus').remove();
  alert("Project was updated"); // Debug
  GetAllProjects();
}

// Delete Project using My "Delete" button
function DeleteProject(index){
  ResetSubmitProjContainer();
  if(index == null){
    pid = "";
  }
  else{
    index--;
    pid = projList[index][0];
  }

  var ProjectPath = "Projects/"+ pid;
  var firebaseRef = firebase.database().ref(ProjectPath);

  firebaseRef.remove().then(
    function(){
      alert("Project was deleted");
      GetAllProjects();
    }
  )
}

function ResetSubmitProjContainer(){
  var subprojcontainer = document.getElementById("submitprojcontainer");
  subprojcontainer.innerHTML = '';

  subprojcontainer.innerHTML += `<input type="text" id="ptitle" placeholder="Enter project">
  <button id = "submitprojectbtn" onclick="addProject()"><i class="fa fa-plus" aria-hidden="true"></i> Submit</button>`
  document.getElementById('ptitle').value = "";
}

/*---------------------------------------------  TICKET PAGE FUNCTIONS  ---------------------------------------------*/

/*--------------------  REDIRECT TO TICKET PAGE  --------------------*/
// Save Required Selected Project Info
var selectedProjectID;
var selectedProjectTitle;
var selectedProjectCreatorID;

// Function id using a local sessionStorage to save required Project info
// b/c values cant be saved over other html pages otherwise
function GetProjectTickets(index){
  // Saves selected Project ID for reference
  index--;
  selectedProjectID = projList[index][0];
  sessionStorage.setItem('selectedProjID', selectedProjectID)

  // Saves selected Project Title for reference
  selectedProjectTitle = projList[index][1];
  sessionStorage.setItem('selectedProjTitle', selectedProjectTitle)

  // Saves selected Project Creator ID for reference
  selectedProjectCreatorID = projList[index][4];
  sessionStorage.setItem('selectedProjCreatorID', selectedProjectCreatorID)

  // Rediects to Ticket Page from same iframe
  location.replace("ticket.html");
}

function GetProjectTitle(){
  ticketheader = document.getElementById('header-title');
  ticketsubheader = document.getElementById('subheader-title');
  ticketheader.innerHTML = "The Project You Are Viewing: " + sessionStorage.getItem("selectedProjTitle");
  ticketsubheader.innerHTML = "Project ID No.: " + sessionStorage.getItem("selectedProjID");
}

/*--------------------  REDIRECT TO PROJECT PAGE  --------------------*/
function GoBackToProjectPage(){
  // Rediects to Project Page from same iframe
  location.replace("project.html");
}

/*--------------------  TICKET TABLE  --------------------*/
// Fetch Ticket Contents and Input into Table
function GetAllTickets(){
  // Changes h1 to see what project you are currently viewing
  GetProjectTitle();
  // Clears ticket table before loading new tickets
  document.getElementById('tbody2').innerHTML= '';
  // Clears ticket contents before loading new ticket contents
  ticketList = [];
  tindex = 0;
  var projid = sessionStorage.getItem("selectedProjID");
  var ticketpath = "Projects/"+ projid +"/Tickets";
  var ticketref = firebase.database().ref(ticketpath);
  ticketref.once('value', function(AllTRecords){
  AllTRecords.forEach(
    function(CurrentTRecord){
      var tid = CurrentTRecord.val().TicketID;
      var tname = CurrentTRecord.val().TicketTitle;
      var tdesc = CurrentTRecord.val().TicketDescription;
      var tdead = CurrentTRecord.val().TicketDeadline;
      var tstatus = CurrentTRecord.val().TicketStatus;
      var tcreator = CurrentTRecord.val().TicketCreator;
      var tcreatorid = CurrentTRecord.val().TicketCreatorID;
      AddTicketToTable(tid, tname, tdesc, tdead, tstatus, tcreator, tcreatorid);
    }
  );
  console.log(ticketList); // DEBUG
  });
}

// Save ticket contents into here for refernece
var ticketList = [];
var tindex = 0;

function AddTicketToTable(tid, tname, tdesc, tdead, tstatus, tcreator, tcreatorid){
  var tbody = document.getElementById('tbody2');
  var trow = document.createElement('tr');
  var td0 = document.createElement('td');
  var td1 = document.createElement('td');
  var td2 = document.createElement('td');
  var td3 = document.createElement('td');
  var td4 = document.createElement('td');
  var td5 = document.createElement('td');
  ticketList.push([tid, tname, tdesc, tdead, tstatus, tcreator, tcreatorid]);
  tindex++;
  td0.innerHTML= tid;
  td1.innerHTML= tname;
  td2.innerHTML= tdesc;
  td3.innerHTML= tdead;
  td4.innerHTML= tstatus;
  td5.innerHTML= tcreator;
  trow.appendChild(td0);
  trow.appendChild(td1);
  trow.appendChild(td2);
  trow.appendChild(td3);
  trow.appendChild(td4);
  trow.appendChild(td5);

  var ControlDiv = document.createElement("div");
  if(GetUserID(currentUserData) == tcreatorid || GetUserID(currentUserData) == sessionStorage.getItem("selectedProjCreatorID")) {
    ControlDiv.innerHTML = '<button type="button" id="selectticketbtn" onclick="FillTickBox('+tindex+')">Edit</button>';
    ControlDiv.innerHTML += '<button type="button" id="deleteticketbtn" onclick="DeleteTicket('+tindex+')">Delete</button>';

  }

  trow.appendChild(ControlDiv);
  tbody.appendChild(trow);
}

// Fills ticketboxes for pulling tickets
function FillTickBox(index){
  ResetTicketContainer();
  document.getElementById("createtbtn").innerHTML = `<i class="fa fa-plus" aria-hidden="true"></i> Update Ticket`;
  document.getElementById('ticket-form').innerHTML += `<select id="tstatus"><option value="Todo">Todo</option><option value="In-Progress">In-Progress</option><option value="Finished">Finished</option></select>`;
  if(index == null){
    document.getElementById('ttitle').value = "";
    document.getElementById('tdesc').value = "";
    document.getElementById('tdeadline').value = "";
  }
  else{
    --index;
    document.getElementById('ttitle').value = ticketList[index][1];
    document.getElementById('tdesc').value = ticketList[index][2];
    document.getElementById('tdeadline').value = ticketList[index][3];
    document.getElementById('tstatus').value = ticketList[index][4];

    var tid = ticketList[index][0];
    sessionStorage.setItem('selectedTickID', tid);
    document.getElementById("createtbtn").onclick = updateTicket;
  }
}

// Realtime Database Ticket System variables
var ProjectPath = "Projects/";
var firebaseRef = firebase.database().ref(ProjectPath);

// Create Ticket using "Add Ticket" button
function addTicket(){
  // Setting input values
  var tickid = "tick"+Date.now().toString();
  var ticktitle = document.getElementById('ttitle').value;
  var tickdescription = document.getElementById('tdesc').value;
  var tickdeadline = document.getElementById('tdeadline').value;
  var tickstatus = 'Todo';
  var tickcreator = GetUserName(currentUserData);
  var tickcreatorid = GetUserID(currentUserData);

  // Updates Path & Realtime Database Ref
  ProjectPath = "Projects/" + sessionStorage.getItem("selectedProjID") + "/Tickets/" + tickid + "/";
  firebaseRef = firebase.database().ref(ProjectPath);

  // Adds to realtime database
  firebaseRef.set({TicketID:tickid, TicketTitle:ticktitle, TicketDescription:tickdescription, TicketDeadline:tickdeadline,
    TicketStatus:tickstatus, TicketCreator:tickcreator, TicketCreatorID:tickcreatorid});
  // GetAllProjects();
  GetAllTickets();
  alert("Saved! ProjectPath: "+ProjectPath); //Debug
}

// Updates Selected Ticket Info
function updateTicket(tid){
  var ticktitle = document.getElementById('ttitle').value;
  var tickdescription = document.getElementById('tdesc').value;
  var tickdeadline = document.getElementById('tdeadline').value;
  var tickstatus = document.getElementById('tstatus').value;
  var tid = sessionStorage.getItem("selectedTickID");

  var TicketPath = "Projects/"+ sessionStorage.getItem("selectedProjID") + "/Tickets/"+ tid + "/";
  var firebaseRef = firebase.database().ref(TicketPath);

  firebaseRef.update({TicketTitle:ticktitle, TicketDescription:tickdescription, TicketDeadline:tickdeadline, TicketStatus:tickstatus});

  document.getElementById("createtbtn").innerHTML = `<i class="fa fa-plus" aria-hidden="true"></i> Add Ticket`;
  document.getElementById("createtbtn").onclick = addTicket;
  document.getElementById('ttitle').value = "";
  document.getElementById('tdesc').value = "";
  document.getElementById('tdeadline').value = "";
  document.getElementById('tstatus').remove();

  alert("Ticket was updated"); // Debug
  GetAllTickets();
}

// Delete Ticket using My "Delete" button
function DeleteTicket(index){
  if(index == null){
    tickid = "";
  }
  else{
    index--;
    tickid = ticketList[index][0];
  }
  var ProjectPath = "Projects/"+ sessionStorage.getItem("selectedProjID") + "/Tickets/"+ tickid;
  var firebaseRef = firebase.database().ref(ProjectPath);

  console.log(firebaseRef.toString());
  firebaseRef.remove().then(
    function(){
      alert("Ticket was deleted"); // Debug
      GetAllTickets();
    }
  )
}

function ResetTicketContainer(){
  var tickcontainer = document.getElementById("ticket-form");
  tickcontainer.innerHTML = '';

  tickcontainer.innerHTML += `<input type="text" id="ttitle" data-new-ticket-input placeholder="Enter Ticket" required>
  <input type="text" id="tdesc" data-new-ticket-input placeholder="Enter Ticket Description" required>
  <input type="date" id="tdeadline" data-new-ticket-input placeholder="Enter Ticket Deadline" required>`;
}
