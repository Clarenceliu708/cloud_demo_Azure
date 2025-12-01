# COMP3810SEF Group Project

## 1. Project Info
- **Project Name**: Class-Note System  
- **Group No.**: Group 58  
- **Students**:  
  - Lin Yimin (SID: 13333342)  
  - Liu Jinhao (SID: 1340806)  
  - Li Zihan (SID:1342671 )  

---

## 2. Project File Introduction

- **server.js**  
  - Main entry point of the application.  
  - Provides Facebook OAuth login/logout using Passport.js.  
  - Implements CRUD operations for notes (create, read, update, delete).  
  - Exposes RESTful API endpoints (`/api/files`) and EJS-rendered pages (`/search`, `/content`).  
  - Handles file upload/download using Multer.  

- **package.json**  
  - Lists dependencies:  
    - `express` (web framework)  
    - `express-session` (session management)  
    - `passport` & `passport-facebook` (authentication)  
    - `mongoose` (MongoDB ODM)
    - `mongodb` 
    - `multer` (file upload)  
    - `ejs` (templating engine)  

- **public/**  
  - Contains static assets (CSS, JS, images).  
  - Example: `search.jpg`, `search2.jpg` ,`1.jpg`,`2.jpg`,`3.jpg`,`login.jpg`,`welcome.jpg`used as background images in search page.  

- **views/**  
  - EJS templates for UI rendering:  
    - `login.ejs` – login page with Facebook login button.  
    - `frontpage.ejs` – main content page after login.  
    - `search.ejs` – search interface with background image switching and logout button, including searching notes.
    - `list.ejs` – displays search results in list format, including creating notes, updating notes, adn deleting notes.   

- **models/**  
  - `Note.js` – Mongoose schema for notes:  
    - `subjectCode` (String)  
    - `description` (String)  
    - `filename` (String)  
    - `filePath` (String)  

---

## 3. Cloud-based Server URL
The project is deployed on Azure App Service:  

https://sample-deploy-13408067-app-gpe9buhdgah2djfc.francecentral-01.azurewebsites.net

---

## 4. Operation Guides

### 🔑 Login / Logout
- Navigate to `/login` → click **Login through Facebook**.  
- After successful login, user is redirected to `/content`.  
- Logout by clicking the **Logout** button (top-right corner in `search.ejs`,`frontpage.ejs` or `/logout` route).  

### 📄 CRUD Web Pages
- **Search Page (`/search-page`)**:  
  - Enter `subjectCode` in the input box.  
  - Results are displayed dynamically via REST API.  
- **Front Page (`/content`)**:  
  - Shows user info after login.  
- **Buttons/UI**:  
  - Create: Upload form with file + suject code.  
  - Read: Search results list.  
  - Update: upload new form to change the existing note.  
  - Delete: Delete button next to note entry.  

### 🌐 RESTful CRUD Services
| Operation | HTTP Method | Path | Description |
|-----------|-------------|------|-------------|
| Create    | POST        | `/api/files` | Upload a new note file |
| Read      | GET         | `/api/files?subjectCode=XXX` | Get notes by subject code |
| Read      | GET         | `/api/files/:id/download` | Download file by ID |
| Update    | PUT         | `/api/files/:id` | Update note info or file |
| Delete    | DELETE      | `/api/files/:id` | Delete note by ID |

#### Example CURL Commands
```bash
# Create a note
curl -X POST -F "subjectCode=COMP3810" -F "description=Lecture notes" -F "file=@test.pdf" https://sample-deploy-13408067-app-gpe9buhdgah2djfc.francecentral-01.azurewebsites.net/api/files

# Read notes
curl https://sample-deploy-13408067-app-gpe9buhdgah2djfc.francecentral-01.azurewebsites.net/api/files?subjectCode=COMP3810

# Update note
curl -X PUT -F "file=@<new note name>" https://sample-deploy-13408067-app-gpe9buhdgah2djfc.francecentral-01.azurewebsites.net/api/files/<old note name id>>

# Delete note
curl -X DELETE https://sample-deploy-13408067-app-gpe9buhdgah2djfc.francecentral-01.azurewebsites.net/api/files/<delete_note_id>

#download note
curl -O https://sample-deploy-13408067-app-gpe9buhdgah2djfc.francecentral-01.azurewebsites.net/api/files/<download note id>