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

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#indiv-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Send a GET request to views.py: name=mailbox & load all the mailbox content
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails in console
    console.log(emails);
    emails.forEach(add_post);
  })

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
    mail.style.backgroundColor = 'rgb(241, 241, 241)';
    mail.style.border = '1px solid rgb(148, 148, 148)';
  }

  // Populate the content based on the mailbox
  // If in sent mailbox, show reciepient emails
  const mailbox = document.querySelector('#emails-view').querySelector('h3').innerHTML;
  if (mailbox === 'Sent') {
    mail.innerHTML = `
      <div class='to-from-email'> ${contents.recipients} </div>
      <div class='email-content'> ${contents.subject} - ${contents.body} </div>
      <div class='email-timestamp'> ${contents.timestamp} </div>`;
  }
  // Else, show sender emails 
  else {
    mail.innerHTML = `
    <div class='to-from-email'> ${contents.sender} </div>
    <div class='email-content'> ${contents.subject} - ${contents.body} </div>
    <div class='email-timestamp'> ${contents.timestamp} </div>`;
  }
  
  // Append the div with the other emails
  document.querySelector('#emails-view').append(mail);

  // Add an click event listener to each div
  mail.addEventListener("click", () => indiv_mail(mail.id,mailbox));
}

//------------ FUNCTION: SHOW INDIVIDUAL MAIL VIEW -------------//
function indiv_mail(mail_id, mailbox) {

  // Show individual view for that email and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#indiv-view').style.display = 'block';

  // Get the mail info,
  fetch(`/emails/${mail_id}`)
  .then(response => response.json())
  .then(contents => {
    document.querySelector('#indiv-info').innerHTML = `
      From: ${contents.sender} <br>
      To: ${contents.recipients} <br>
      Subject: ${contents.subject} <br>
      Timestamp: ${contents.timestamp}`;
    document.querySelector('#indiv-body').innerHTML = `${contents.body}`;

    // Asign data to the archived, read and reply buttons
    document.querySelector('#archived_status').dataset.mail_id = mail_id;
    document.querySelector('#read_status').dataset.mail_id = mail_id;
    document.querySelector('#reply').dataset.mail_id = mail_id;

    // Settle the button visibility
    // Switch of Archive/ Mark as Unread button if it's a Sent mail.
    if (mailbox === 'Sent') {
      document.querySelector('#archived_status').style.display = 'none';
      document.querySelector('#read_status').style.display = 'none';
    }
    else {
      // Settle the Archive/ Read button inner HTML according to read/archived status
      // Archived
      document.querySelector('#archived_status').style.display = 'inline';
      if (contents.archived === true) {
        document.querySelector('#archived_status').innerHTML = 'Unarchive';
      }
      if (contents.archived === false) {
        document.querySelector('#archived_status').innerHTML = 'Archive';
      }
    
      // Read
      if (contents.read === true) {
        document.querySelector('#read_status').innerHTML = 'Mark As Unread';
        document.querySelector('#read_status').style.display = 'inline';
      }
      if (contents.read === false) {
        document.querySelector('#read_status').innerHTML = 'Read';
        document.querySelector('#read_status').style.display = 'none';
      }
    }
  })

  // Mark email as read: send PUT request
  fetch(`/emails/${mail_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
}

////////////////////////////////////////////////////////////////////
//                       COMPOSE NEW EMAIL                        //
////////////////////////////////////////////////////////////////////
document.addEventListener('DOMContentLoaded', function() {
  // When form is submitted,
  document.querySelector("#compose-form").addEventListener('submit', function() {
      // Send the form to views.py: name=email for processing
      fetch('/emails', {
      method: 'POST',
      headers: {
          'Accept': 'application/json'
      },
      body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value
      })
      })
      .then(response => response.json())
      .then(result => {
          if (result.error) {
              console.log(`Error sending email: ${result.error}`);
          } 
          else {
              console.log(`Message:${result.message}`);
          }
      })

      // Stop form from submitting
      return false
  });
});

////////////////////////////////////////////////////////////////////
//           'ARCHIVE' AND 'MARK AS UNREAD' BUTTON                //
////////////////////////////////////////////////////////////////////
document.addEventListener('DOMContentLoaded', function() { 
  // When the buttons are clicked, call the respective functions
  document.querySelector('#archived_status').addEventListener('click', archive_button);
  document.querySelector('#read_status').addEventListener('click', read_button);
}); 

//------------ FUNCTION: EXECUTE THE ARCHIVE BUTTON -------------//
function archive_button() {

  const archive = document.querySelector('#archived_status');
  mail_id = archive.dataset.mail_id;
  console.log(mail_id);

  // If button call to 'Unarchive',
  if (archive.innerHTML === 'Unarchive') {

    // Send a PUT request to change archive status to false
    fetch(`/emails/${mail_id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: false
      })
    })
    
    // Send user to inbox where the email should now be visible (aka no longer archived)
    load_mailbox('inbox');

    // Change button to Archive
    archive.innerHTML = 'Archive';
  }

  else {

    // Send PUT request to archive the mail
    fetch(`/emails/${mail_id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: true
      })
    })

    // Send user to archive mailbox where the email should now be visible (aka archived)
    load_mailbox('archived');

    // Change button to show 'Unarchive'
    archive.innerHTML = 'Unarchive';
  }
}

//----------- FUNCTION: EXECUTE THE 'MARK AS UNREAD' BUTTON -------------//
function read_button() {
  const read = document.querySelector('#read_status');
  mail_id = read.dataset.mail_id;

  // If call to mark email as unread:
  if (read.innerHTML === 'Mark As Unread') {

    // Send PUT request to mark mail status as unread
    fetch(`/emails/${mail_id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: false
      })
    })

    // Change text in button to 'Read' and hide the button
    read.innerHTML = 'Read';
    read.style.display = 'none';

    // Direct user to view based on archive status
    // If it's an archived email, show the archive mailbox
    if (document.querySelector('#archived_status').innerHTML === 'Unarchive'){
      load_mailbox('archived');
    }
    // Else, it's in the inbox, therefore show inbox
    else {
      load_mailbox('inbox');
    }
  }
}


////////////////////////////////////////////////////////////////////
//                     REPLY TO AN EMAIL                          //
////////////////////////////////////////////////////////////////////
document.addEventListener('DOMContentLoaded', function() { 
  // When click on reply button,
  document.querySelector('#reply').addEventListener('click', function() {
    // Show the 'compose email' form
    compose_email();
    // Get info of the email we are replying to so we can prefill the text area with this
    mail_id = document.querySelector('#reply').dataset.mail_id;
    fetch(`/emails/${mail_id}`)
    .then(response => response.json())
    .then(email => {
      // Print emails
      console.log(email);
      //Prefill recipients
      document.querySelector('#compose-recipients').value = email.sender;
      //Prefill subject. Insert Re: if doesn't already contain it
      if (email.subject.slice(0,3)==='Re:'){
        document.querySelector('#compose-subject').value = email.subject;
      }
      else{
        document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
      }
      //Prefill body
      document.querySelector('#compose-body').value = `\n On ${email.timestamp} ${email.sender} wrote:" ${email.body}`;
    })
  });
});