const ticketList = document.querySelector('.tickets');
const loggedOutLinks = document.querySelectorAll('.logged-out');
const loggedInLinks = document.querySelectorAll('.logged-in');
const accountDetails = document.querySelector('.account-details');

var myImage = new Image();
myImage.src = 'img/landing-red.png';
myImage.style.width = "100%";

const setupUI = (user) => {
    if (user) {
        //account info
        db.collection('users').doc(user.uid).get().then(doc => {
            const html = `
                <div>Logged in as ${doc.data().fName} ${doc.data().lName}</div>
                <div>${user.email}</div)
            `;
            accountDetails.innerHTML = html;
            document.body.removeChild(myImage); // If user is logged in, remove landing image
                                                // useful for single page implementation
            // location.href = 'project.html'; // Redirects when logged in
            document.getElementById('user-console').style.display = 'block';
        });

        //toggle UI elements
        loggedInLinks.forEach(item => item.style.display = 'block');
        loggedOutLinks.forEach(item => item.style.display = 'none');
        document.getElementById('user-console').style.display = 'block';
    } else {
        //toggle UI elements
        loggedInLinks.forEach(item => item.style.display = 'none');
        loggedOutLinks.forEach(item => item.style.display = 'block');
        document.getElementById('user-console').style.display = 'none';
        document.body.appendChild(myImage); // shows landing image when not logged in
    }
};

// setup materialize components
document.addEventListener('DOMContentLoaded', function() {
    var modals = document.querySelectorAll('.modal');
    M.Modal.init(modals);

    var items = document.querySelectorAll('.collapsible');
    M.Collapsible.init(items);
});
