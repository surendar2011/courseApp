npm init -y

npm install express mongoose jsonwebtoken

http://localhost:3000/user/signup


Got it ✅ Since your backend is already in place with **users, admins, and courses**, let’s map out the **frontend pages** you’ll need. I’ll break them down into **HTML, CSS, and JS responsibilities**.

---

## 🔹 User Side Pages

1. **User Signup Page**

   * **HTML:** form (email, password, first name, last name)
   * **CSS:** form styling, error/success message styles
   * **JS:** send signup request → `POST /user/signup`

2. **User Login Page**

   * **HTML:** form (email, password)
   * **CSS:** form layout, error states
   * **JS:** send login request → `POST /user/signin`, store JWT token in `localStorage/sessionStorage`

3. **Course List / Preview Page**

   * **HTML:** list of all courses (title, description, price, image)
   * **CSS:** grid or card-based layout
   * **JS:** fetch from `GET /course/preview`

4. **Course Purchase Page**

   * **HTML:** course details + “Buy” button
   * **CSS:** checkout UI
   * **JS:** send purchase request → `POST /course/purchase` (with token in headers)

5. **My Purchases Page**

   * **HTML:** list of purchased courses
   * **CSS:** styled cards/list
   * **JS:** fetch from `GET /user/purchases`

---

## 🔹 Admin Side Pages

6. **Admin Signup Page**

   * **HTML:** form (email, password, first name, last name)
   * **CSS:** form UI
   * **JS:** send request → `POST /admin/signup`

7. **Admin Login Page**

   * **HTML:** form (email, password)
   * **CSS:** form layout
   * **JS:** send request → `POST /admin/signin`, store JWT token

8. **Create Course Page**

   * **HTML:** form (title, description, imageUrl, price)
   * **CSS:** form styling
   * **JS:** send request → `POST /admin/course` (with admin token)

9. **Update Course Page**

   * **HTML:** form with fields (courseId, title, description, imageUrl, price)
   * **CSS:** edit form styles
   * **JS:** send request → `PUT /admin/course`

10. **Admin Courses Dashboard**

    * **HTML:** list of all courses created by admin
    * **CSS:** table or grid display
    * **JS:** fetch from `GET /admin/course/bulk`

---

## 🔹 Optional Shared Pages

11. **Home / Landing Page**

* Overview of platform + links to signup/login.

12. **Logout Functionality**

* No separate page; just JS to clear token & redirect.

---

✅ So in total, you’ll likely need **10–12 pages**:

* **User:** signup, login, preview, purchase, my purchases
* **Admin:** signup, login, create course, update course, dashboard
* **Shared:** home, logout

---

👉 Do you want me to **draw a full folder structure** for the frontend (HTML, CSS, JS) so you can see how to organize it with these pages?

project/
│
├── backend/                 # Your Node.js + Express backend
│   ├── routes/
│   ├── middleware/
│   ├── config.js
│   ├── index.js
│   └── ...
│
├── frontend/                # All HTML, CSS, JS for user/admin
│   ├── css/
│   │   ├── style.css
│   │   └── forms.css
│   │
│   ├── js/
│   │   ├── auth.js          # signup/login logic
│   │   ├── user.js          # user course logic
│   │   ├── admin.js         # admin course logic
│   │   └── shared.js        # logout / token helpers
│   │
│   ├── user/
│   │   ├── signup.html
│   │   ├── login.html
│   │   ├── courses.html
│   │   ├── purchase.html
│   │   └── purchases.html
│   │
│   ├── admin/
│   │   ├── signup.html
│   │   ├── login.html
│   │   ├── create-course.html
│   │   ├── update-course.html
│   │   └── dashboard.html
│   │
│   ├── index.html           # landing page
│   └── logout.html          # optional (or JS redirect only)


