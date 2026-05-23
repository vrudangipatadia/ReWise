1) Project Title - ReWise : Flashcard Learning App

2) Summary -
Regular flashcard apps are usually pretty boring and give a geeky feel. I built this to make active recall a bit more visual and fun for the learner. It solves the issue of a "cluttered monotonous study" feel by using color-coded cards that flip with a smooth 3D animation. It has a full login system, so multiple people can create their own accounts and keep their custom card decks completely private and separate from each other.

3) Technical Stack - Following stack is used in this webapp:
Frontend: HTML, CSS, JavaScript (Vanilla ES6)
Backend: Node.js (Express)
Database: MongoDB (Mongoose)
Security: Bcrypt (For hashing and scrambling passwords)
Icons library: FontAwesome CDN

4) Feature List:
"User Accounts" - Users can sign up and log in securely. Password scrambling ensures data stays safe in the database.

"Add Card" - Flashcards can be added with multiple input fields - question, answer, color, and tag. This helps the user customize the cards and categorize them by subjects. The dropdown menu features 6 bright color choices.

"Flip card" - Click directly on any card to flip it over with a 3D animation to reveal the answer.

"Edit Flashcards" - An edit popup window lets users tweak the text or tags of any card they already made.

"Delete Flashcard" - A safety delete prompt ensures users don't accidentally wipe out a card without confirming first.

"Dynamic Filtering" - A search bar at the top filters through your questions, answers, and tags in real-time as you type.

"Account Settings Modal" - Clicking the user profile circle pops open an overlay where users can change their username, update their password, or log out.

5) Folder structure -
index.html: It defines the main container, the card forms, the popover settings overlay, and the general layout.

package.json: Tracks dependencies like express, cors, bcrypt, and mongoose, and includes the script needed to boot the application.

script.js: It handles all frontend tasks like DOM manipulation, keeps track of the active user session, and performs the fetch requests to talk to the backend server.

server.js: It initializes the Express server, connects to the MongoDB database, sets up CORS permissions, and defines the API routes that handle your card and user account data.

style.css: It contains the responsive grid layout logic, the 3D flip card animations, the modal positioning rules, and all other dark-themed UI styling.

6) Summary of challenges overcome and Reflection:
A major challenge was shifting from basic temporary frontend variables to a permanent database system where everything is strictly linked to a user account. At first, when I added user roles to the schema, it created conflicts with old data records already stored in MongoDB, which caused the server to crash on launch until I manually wiped the broken cloud database indexes. Another challange was managing the asynchronous timing during account updates; if a user updated their username or password, the frontend global variable would update faster than the server could write to the database, causing immediate network mismatch errors. To tackle this I build a logic into the Javascript script that grabs information straight out of the UI text tags as a backup to keep the user session synced up. I also had to do many manual trial & error tweaks to match the UI of the application to my original design that on Figma. I really wanted to have the gradient design for the flashcards intact but somehow it was extreemely difficult to achieve them with code. So, I ended up using Gradient PNGs which made the code a lot mode stable and easrier to deal with.
Lastly, I want to acknowledge and thank my tutor Mr.Henil for making this course for me and fellow classmates truely fun and enjoyable.