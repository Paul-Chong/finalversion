// listen for auth status changes
auth.onAuthStateChanged(user => {
    if (user) {
        db.collection('tickets').onSnapshot(snapshot => {    //change tickets to database name
            setupUI(user);
        }, err => {
            console.log(err.message)
        });
    } else {
        setupUI();
    }
});

// signup
const signupForm = document.querySelector('#signup-form');
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // get user info
    const email = signupForm['signup-email'].value;
    const password = signupForm['signup-password'].value;

    // sign up the user
    auth.createUserWithEmailAndPassword(email, password).then(cred => {
         return db.collection('users').doc(cred.user.uid).set({
            fName: signupForm['signup-fName'].value,
            lName: signupForm['signup-lName'].value
        });         // This returns the info input by the user during sign up into the database
    }).then(() => {
        const modal = document.querySelector('#modal-signup');
        M.Modal.getInstance(modal).close();
        signupForm.reset();
    });
});

// logout button
const logout = document.querySelector('#logout');
logout.addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut();
    document.getElementById('myiframe').src = "project.html";
});

// login button
const loginForm = document.querySelector('#login-form');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // get user info
    const email = loginForm['login-email'].value;
    const password = loginForm['login-password'].value;

    auth.signInWithEmailAndPassword(email, password).then(cred => {
        // close modal and reset form fields
        const modal = document.querySelector('#modal-login');
        M.Modal.getInstance(modal).close();
        loginForm.reset();
    });
});
