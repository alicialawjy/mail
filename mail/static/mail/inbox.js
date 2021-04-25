////////////////////////////////////////////////////////////////////
//          TOGGLE BETWEEN VIEWS (via buttons in sidebar)         //
////////////////////////////////////////////////////////////////////
document.addEventListener('DOMContentLoaded', function() {

  //Default view: inbox
  load_mailbox('inbox');

  // Direct to appropriate view based on button clicked:
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archived'));
  document.querySelector('#compose').addEventListener('click', () => compose_email());

});

//------------------- FUNCTION: GET 'COMPOSE' VIEW --------------------//
function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#indiv-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Highlight the button in the sidebar
  highlight_button('compose');

}

//-------------- FUNCTION: GET 'INBOX/SENT/ARCHIVED' VIEW --------------//
function load_mailbox(mailbox) {

  // Send a GET request to views.py: name=mailbox & load all the mailbox content
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails in console
    console.log(emails);
    // Show each post as a separate row
    emails.forEach(add_post);
  })

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#indiv-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Highlight the button in the sidebar
  highlight_button(mailbox);

}

//-------------- FUNCTION: HIGHLIGHT BUTTON IN SIDEBAR --------------//
function highlight_button(mailbox) {

  // 'Switch off' all the buttons in the sidebar
  document.querySelectorAll('.btn-sidebar').forEach(button => {
    button.style.backgroundColor = 'white';
    button.style.border = 'none';
    button.style.color = 'gray';
  });
  // Highlight the active button belonging to the current active view
  const button = document.querySelector(`#${mailbox}`);
  button.style.backgroundColor = 'rgb(255, 196, 196)';
  button.style.border = '1px solid rgb(158, 15, 15)';
  button.style.color = 'rgb(158, 15, 15)';
}

//------------ FUNCTION: SHOW EACH MAIL AS ITS OWN DIV -------------//
function add_post(contents) {

  // Create the div
  const mail = document.createElement('div');
  mail.className = 'email';
  mail.id = `${contents.id}`;

  // Style the div based on its 'Read' status
  mail.style.border = '1px solid rgb(26, 95, 243)';
  if (contents.read === true) {
    mail.style.backgroundColor = 'rgb(235, 234, 234)';
    mail.style.border = '1px solid rgb(148, 148, 148)';
  }

  // Populate the content based on the mailbox
  // If in sent mailbox, show reciepient emails
  const mailbox = document.querySelector('#emails-view').querySelector('h3').innerHTML;
  if (mailbox === 'Sent') {
    mail.innerHTML = `
      <div class='to-from-email'> ${contents.recipients} </div>
      <div class='email-content'> ${contents.subject} </div>
      <div class='email-timestamp'> ${contents.timestamp} </div>`;
  }
  // Else, show sender emails 
  else {
    mail.innerHTML = `
    <div class='to-from-email'> ${contents.sender} </div>
    <div class='email-content'> ${contents.subject} </div>
    <div class='email-timestamp'> ${contents.timestamp} </div>`;
  }
  
  // Append the div with the other emails
  document.querySelector('#emails-view').append(mail);
}

////////////////////////////////////////////////////////////////////
//                DIRECT TO INDIVIDUAL EMAIL VIEW                 //
////////////////////////////////////////////////////////////////////
document.addEventListener('DOMContentLoaded', function() {
  // Look at all email divs
  document.querySelectorAll('.email').forEach(email => {
    // When a div is clicked
    email.addEventListener('click', function() { 
      // Show individual view for that email and hide other views
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#indiv-view').style.display = 'block';

      // Get the mail info,
      const mail_id = email.id;
      fetch(`/emails/${mail_id}`)
      .then(response => response.json())
      .then(contents => {
        document.querySelector('#indiv-view').id = mail_id;
        document.querySelector('#indiv-info').innerHTML = `
          From: ${contents.sender} <br>
          To: ${contents.recipients} <br>
          Subject: ${contents.subject} <br>
          Timestamp: ${contents.timestamp}`;
        document.querySelector('#indiv-body').innerHTML = `${contents.body}`;

        //Settle the Archived button 
        if (contents.archived === true) {
          document.querySelector('#archived_status').innerHTML = 'Unarchive';
        }
        else {
          document.querySelector('#archived_status').innerHTML = 'Archive';
        }

        //Settle the Read button 
        if (contents.read === true) {
          document.querySelector('#read_status').innerHTML = 'Mark As Unread';
          document.querySelector('#read_status').style.display = 'inline';
        }
        else {
          document.querySelector('#read_status').innerHTML = 'Read';
          document.querySelector('#read_status').style.display = 'none';
        }

        // Asign data to the archived, read and reply buttons
        document.querySelector('#archived_status').dataset.mail_id = `${contents.id}`;
        document.querySelector('#read_status').dataset.mail_id = `${contents.id}`;
        document.querySelector('#reply').dataset.mail_id = `${contents.id}`;
      });
      // Mark email as read: send PUT request
      fetch(`/emails/${mail_id}`, {
        method: 'PUT',
        body: JSON.stringify({
          read: true
        })
      });
    });
  });
});


