![Header](https://github.com/alicialawjy/mail/blob/main/Screenshots/Inbox.png)
# mail
A Gmail-like email platform that makes API calls to send and receive emails. <br>
This project was done as part of the Harvard x EdX Course: CS50 Web Programming with Python and JavaScript.

## Project Setup
1. Download the zip file to this repository.
2. In your terminal, cd into the 'mail' directory.
3. Run ```python manage.py runserver``` and visit <a>http://127.0.0.1:8000/</a>

## Tech Stack
- Backend Framework: Django and Python
- Database Modelling: SQLite
- Front End Languages: HTML, CSS and Javascript

## Functionality
All functionalities were done by calling the application's API (written in Python) using JavaScript.
#### 1. Send Mail
- Done by the 'Compose' button in the sidepane. 
- When a user submits the email composition form, a POST request is made to '/emails' (views.py: name=compose) to process the form into the database.

#### 2. View Mailbox: Inbox/ Sent/ Archived
- Done by clicking the mailbox in the sidepane. The active mailbox will be highlighted in red in the sidepane.
- A GET request is sent to '/emails/<str:mailbox>' (views.py: name=mailbox) to request the email for the relevant mailbox.
- If a mail has been read, the email will be shown with a gray background. Else, it will appear white. 

#### 3. View Mail
- Done by clicking on the email in the mailbox.
- A GET request is sent to '/emails/<int:email_id>' (views.py: name=email) to request the email.
- Shows the individual view and all contents of the email.

#### 4. Archive and Unarchive Mail
- Done via the archive/unarchive button in the individual email view. Only for inbox/ archived mail.
- Once marked as archived, the email will move from the inbox to the archive mailbox (and vice versa)
- A PUT request is sent to '/emails/<int:email_id>' (views.py: name=email).

#### 5. Mark as Unread
- If a post has been read, the post can be 'marked as unread' via the button in the individual email view. Only for inbox/ archived mail.
- In the mailbox view, the email div will then have a white background instead of grey.
- A PUT request is sent to '/emails/<int:email_id>' (views.py: name=email).

#### 6. Reply an Email
- Done via the reply button in the individual email view.
- Users will be brought to the email composition form, where fields are prefilled: 
    - Recipient: set to whoever sent the original email,
    - Subject: Start with 'Re:' followed by the original email's subject line
    - Body: prefilled with the original email's body.


