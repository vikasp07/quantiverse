# 🎓 Complete Internship Module Guide - Access, Management & Login

**Date:** December 13, 2025  
**Project:** Quantiverse MockInterview  
**Module:** Internship Simulations (Job Simulations)

---

## 📊 INTERNSHIP SYSTEM OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                   INTERNSHIP MODULE ARCHITECTURE                │
└─────────────────────────────────────────────────────────────────┘

Two User Types:

1️⃣ ADMIN (Role: "admin")
   ├─ Access: /edit-internship
   ├─ Can: Add, Edit, Delete Simulations & Tasks
   ├─ Can: Upload task materials
   └─ Can: Review/Confirm student submissions

2️⃣ STUDENT (Role: "user")
   ├─ Access: /internship (Dashboard) → /simulation/{id} (Details)
   ├─ Can: View all simulations
   ├─ Can: Start simulations
   ├─ Can: Submit task work
   ├─ Can: Track progress
   └─ Can: View feedback from admin

┌─────────────────────────────────────────────────────────────────┐
│                        DATA FLOW                                │
└─────────────────────────────────────────────────────────────────┘

ADMIN CREATES SIMULATION:
   Admin Login → /edit-internship → Add Simulation
   └─→ Tables: simulations, tasks
   └─→ Storage: task-materials bucket

STUDENT VIEWS & PARTICIPATES:
   Student Login → /internship (Dashboard)
   └─→ See all simulations
   └─→ Click simulation → /simulation/{id}
   └─→ See tasks & materials
   └─→ Start → /internship/{id}/task/{taskNumber}
   └─→ Upload work → submissions bucket
   └─→ Track progress → /progress

ADMIN REVIEWS SUBMISSIONS:
   Admin Login → /confirmation
   └─→ See all pending submissions
   └─→ Download & review
   └─→ Approve or reject
   └─→ Add feedback/comments
```

---

## 🚀 STEP-BY-STEP LOGIN & ACCESS GUIDE

### **PART 1: CREATE ACCOUNTS**

#### **A. Create Admin Account**

**Step 1:** Go to `http://localhost:5173/signup`

```
✅ Fill in:
   - Full Name: "Admin User"
   - Email: "admin@example.com"
   - Phone: "9876543210"
   - Password: "Admin@123"

✅ Click "Sign Up"

✅ Verify email (check inbox or use test email)
```

**Step 2:** Create `user_roles` record in Supabase

After admin signs up, you MUST add them to `user_roles` table:

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'admin');
```

_(Replace user_id with the actual UUID from auth.users)_

**Step 3:** Admin can now login at `/signin`

```
✅ Email: admin@example.com
✅ Password: Admin@123
✅ After login → Automatically redirected to /admin
```

---

#### **B. Create Student Account**

**Step 1:** Go to `http://localhost:5173/signup`

```
✅ Fill in:
   - Full Name: "John Doe"
   - Email: "student@example.com"
   - Phone: "9876543210"
   - Password: "Student@123"

✅ Click "Sign Up"

✅ Verify email
```

**Step 2:** Student `user_roles` record is auto-created OR add manually:

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('660e8400-e29b-41d4-a716-446655440001', 'user');
```

**Step 3:** Student can now login at `/signin`

```
✅ Email: student@example.com
✅ Password: Student@123
✅ After login → Automatically redirected to /home
```

---

### **PART 2: ADMIN ADDS INTERNSHIP SIMULATIONS**

#### **Step 1: Login as Admin**

```
URL: http://localhost:5173/signin
Email: admin@example.com
Password: Admin@123
↓
Redirected to: /admin (Admin Dashboard)
```

#### **Step 2: Access Add Internship Page**

From Admin Dashboard Sidebar:

```
Left Sidebar → "Add Internship" button
↓
URL changes to: /edit-internship
```

#### **Step 3: Fill Simulation Details**

```
Form Fields:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 SIMULATION INFO:
   □ Title: "E-Commerce Platform Development"
   □ Description: "Build a full-stack e-commerce site with payment integration"
   □ Category: "Software Development"
   □ Difficulty: "Advanced"
   □ Duration: "1-2 months"
   □ Image URL: "https://example.com/image.jpg"
   □ Overview: "Create complete e-commerce solution"
   □ Features: "Product Management, Cart, Payments, Auth"
   □ Skills: "React, Node.js, MongoDB, Stripe API"
```

#### **Step 4: Add Tasks**

```
For Each Task:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 TASK DETAILS:
   □ Task Title: "Setup Project Structure"
   □ Full Title: "Setup Project Structure And Environment"
   □ Duration: "30-60 mins"
   □ Difficulty: "Beginner"
   □ Description: "Initialize repo and dependencies"
   □ What You'll Learn: "Project setup, dependency management"
   □ What You'll Do: "Create structure, install packages"
   □ Material File (optional): Upload PDF guide

✅ Click "Add Task" button to add more tasks
✅ Click "Submit" to save all
```

#### **Step 5: Verify in Database**

After submission, check Supabase:

```sql
-- Check simulations table
SELECT * FROM simulations;
-- Should show your new simulation

-- Check tasks table
SELECT * FROM tasks WHERE simulation_id = 1;
-- Should show all tasks for that simulation
```

---

### **PART 3: STUDENT VIEWS & ACCESSES INTERNSHIP**

#### **Step 1: Login as Student**

```
URL: http://localhost:5173/signin
Email: student@example.com
Password: Student@123
↓
Redirected to: /home (Student Dashboard)
```

#### **Step 2: Access Internship Dashboard**

From Sidebar:

```
Left Sidebar → Look for "Internship" or similar menu item
OR
URL: http://localhost:5173/internship
↓
Shows: Internship Dashboard with all simulations
```

#### **Step 3: Browse Simulations**

```
Dashboard displays:
┌─────────────────────────────┐
│ Explore Job Simulations     │
│ [Filter by Career Interest] │
│                             │
│ ┌─────────────┐             │
│ │ Simulation  │ Card        │
│ │ Card        │ Layout:     │
│ │             │ • Title     │
│ │ Filters     │ • Category  │
│ │ Difficulty  │ • Duration  │
│ │ Duration    │ • Difficulty│
│ └─────────────┘             │
└─────────────────────────────┘

✅ Filter by: All, Software Development, Design, etc.
✅ Click on card to view details
```

#### **Step 4: View Simulation Details**

Click on simulation card:

```
URL: http://localhost:5173/simulation/{id}

Shows:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 SIMULATION OVERVIEW
   • Full description
   • Skills you'll learn
   • Tasks breakdown
   • "Start Program" button
   • "Track Progress" button (if started)

📋 TASKS LIST
   Task 1: Setup Project Structure
     └─ 30-60 mins | Beginner
     └─ "View details" / "Start"

   Task 2: Create Database Schema
     └─ 1-2 hours | Intermediate
     └─ "View details" / "Start"

   ... more tasks
```

#### **Step 5: Start Internship & Submit Tasks**

Click "Start Program":

```
URL: http://localhost:5173/internship/{simulationId}/task/1

Shows:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LEFT SIDEBAR: Task Stepper
   ☐ Task 1: Setup Project [Not Started]
   ☐ Task 2: Database [Not Started]
   ☑ Task 3: API [In Progress]
   ✓ Task 4: Testing [Completed]

MAIN CONTENT:
   Task Overview:
   ├─ What You'll Learn (bullets)
   ├─ What You'll Do (bullets)
   ├─ Video/Material (if available)
   └─ Upload Work button

📤 UPLOAD WORK:
   ✅ Click "Upload Work" button
   ✅ Select file (PDF, ZIP, DOC, etc.)
   ✅ Click "Upload"
   ✅ Status changes to "Submitted"
   ✅ Awaiting admin review
```

#### **Step 6: Track Progress**

```
URL: http://localhost:5173/progress

Shows:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROGRESS TRACKING:
   Simulation: "E-Commerce Platform"

   Task 1: Setup Project Structure
   └─ Submission: ✓ Completed
   └─ Confirmation: ⏳ Pending (Awaiting Review)

   Task 2: Database Schema
   └─ Submission: ✓ Completed
   └─ Confirmation: ✅ Confirmed (Approved!)

   Task 3: API Development
   └─ Submission: ⏳ In Progress
   └─ Confirmation: - (Not submitted yet)

   Task 4: Testing
   └─ Submission: ❌ Not Started
   └─ Confirmation: - (Not applicable)
```

---

### **PART 4: ADMIN REVIEWS & CONFIRMS SUBMISSIONS**

#### **Step 1: Login as Admin**

```
URL: http://localhost:5173/signin
Email: admin@example.com
Password: Admin@123
↓
Redirected to: /admin
```

#### **Step 2: Go to Confirmation Page**

From Sidebar:

```
Left Sidebar → "Task Confirmation" button
OR
URL: http://localhost:5173/confirmation
```

#### **Step 3: Review Submissions**

```
Shows:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 PENDING SUBMISSIONS

[Submission 1]
User: John Doe (student@example.com)
Simulation: E-Commerce Platform
Task: Setup Project Structure
Status: ⏳ Awaiting Review
Submitted: Dec 10, 2024 at 3:45 PM

📥 Work File:
   [View/Download] setup_project.pdf

📝 Admin Comment:
   [Text box for feedback]

Action Buttons:
   [✅ Approve] [❌ Reject]

[Submission 2]
... more submissions
```

#### **Step 4: Approve or Reject**

```
Option A: APPROVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ✅ Click [Approve] button
   ✅ Optional: Add comment "Great work!"
   ✅ Status changes to "Confirmed"
   ✅ Student sees "✅ Confirmed" in progress page

Option B: REJECT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ❌ Click [Reject] button
   ❌ Must add comment: "Need to fix X and Y"
   ❌ Status changes to "Rejected"
   ❌ Student can resubmit
   ❌ Student sees feedback in progress page
```

---

## 📱 COMPLETE USER FLOW DIAGRAM

```
┌──────────────────────────────────────────────────────────────┐
│                  INTERNSHIP MODULE FLOW                      │
└──────────────────────────────────────────────────────────────┘

SIGNUP PROCESS
─────────────
User → /signup
   ├─ Fill name, email, phone, password
   ├─ Email verification
   └─ Account created in auth.users

ROLE ASSIGNMENT (ADMIN ACTION)
──────────────────────────────
Admin adds record to user_roles:
   INSERT INTO user_roles (user_id, role) VALUES (..., 'admin')
   OR
   INSERT INTO user_roles (user_id, role) VALUES (..., 'user')


STUDENT FLOW
───────────────
Login @ /signin
    ↓
/home (Dashboard)
    ↓
Click "Internship" in sidebar
    ↓
/internship (Dashboard - see all simulations)
    ↓
Filter & click simulation card
    ↓
/simulation/{id} (View details, tasks, materials)
    ↓
Click "Start Program"
    ↓
/internship/{id}/task/1 (Task details & upload)
    ├─ See "What you'll learn"
    ├─ See "What you'll do"
    ├─ See materials (if provided)
    └─ Upload work file
    ↓
Status: "Submitted" (Awaiting admin review)
    ↓
/progress (Track status)
    ├─ See all tasks
    ├─ See submission status
    └─ See confirmation status (Pending/Approved/Rejected)
    ↓
If rejected: Can resubmit with feedback
If approved: Task marked as completed


ADMIN FLOW
──────────
Login @ /signin
    ↓
/admin (Admin Dashboard)
    ↓
Click "Add Internship"
    ↓
/edit-internship (Form to create simulation + tasks)
    ├─ Fill simulation details
    ├─ Add tasks with materials
    └─ Submit
    ↓
Simulation stored in database
    ├─ simulations table
    ├─ tasks table
    └─ task-materials bucket
    ↓
Click "Task Confirmation"
    ↓
/confirmation (View pending submissions)
    ├─ See all submissions from all students
    ├─ Download work files
    ├─ Add comments
    └─ Approve or Reject
    ↓
Database updated:
    └─ user_task_progress.confirmation_status = 'confirmed' | 'rejected'
    └─ user_task_progress.comment = "admin feedback"
```

---

## 📂 FILE STRUCTURE FOR INTERNSHIP

```
src/components/internship/
├── InternshipDashboard.jsx
│  └─ Shows all simulations in grid layout
│  └─ Filter by category
│  └─ Fetch from simulations table
│
├── SImulationCard.jsx
│  └─ Card component for each simulation
│  └─ Shows title, category, difficulty, duration
│  └─ Links to /simulation/{id}
│
├── SimulationDetail.jsx
│  └─ Full simulation details page
│  └─ Shows overview, skills, tasks
│  └─ Check if user has started
│  └─ "Start Program" button
│  └─ Links to /internship/{id}/task/1
│
├── SimulationTaskPage.jsx
│  └─ Individual task page
│  └─ Shows task details: what you'll learn, what you'll do
│  └─ Shows materials (if available)
│  └─ WorkUpload component for file submission
│  └─ Task stepper on left sidebar
│
├── WorkUpload.jsx
│  └─ File upload component
│  └─ Validates file size (10MB limit)
│  └─ Uploads to submissions bucket
│  └─ Updates user_task_progress in database
│
├── ProgressPage.jsx
│  └─ Shows all user's progress across simulations
│  └─ Displays submission status (not_started, in_progress, completed)
│  └─ Displays confirmation status (pending, confirmed, rejected)
│  └─ Shows admin feedback
│
└── HowItWorksSection.jsx
   └─ Informational component explaining the process

Admin Components:
src/components/admin/
├── AddInternship.jsx
│  └─ Form to create simulations
│  └─ Form to add tasks
│  └─ Upload task materials
│  └─ Insert into simulations & tasks tables
│
├── SimulationsManager.jsx
│  └─ Edit existing simulations
│  └─ Edit existing tasks
│  └─ Delete simulations/tasks
│
└── Confirmation.jsx
   └─ View pending submissions
   └─ Download & review work files
   └─ Add comments
   └─ Approve or reject
   └─ Update user_task_progress confirmation_status
```

---

## 🗄️ DATABASE TABLES USED

### **simulations** table

```
id: Primary Key
title: String
description: Text
category: String (filter key)
difficulty: String (Beginner/Intermediate/Advanced)
duration: String (1-2 weeks, 1-2 months)
image: URL
overview: Text
features: Text
skills: Text
rating: Float (null)
created_at: Timestamp
updated_at: Timestamp
```

### **tasks** table

```
id: Primary Key
simulation_id: Foreign Key → simulations.id
title: String (Task One, Task Two)
full_title: String
duration: String (30-60 mins, 1-2 hours)
difficulty: String
description: Text
what_youll_learn: Text
what_youll_do: Text
material_url: URL (in task-materials bucket)
created_at: Timestamp
updated_at: Timestamp
```

### **user_task_progress** table

```
id: Primary Key
user_id: UUID → auth.users
simulation_id: FK → simulations.id
task_id: FK → tasks.id
status: String (not_started, in_progress, completed)
confirmation_status: String (null, pending, confirmed, rejected)
uploaded_work_url: URL (in submissions bucket)
comment: Text (admin feedback)
updated_at: Timestamp
UNIQUE(user_id, task_id)
```

### **user_roles** table

```
id: Primary Key
user_id: UUID → auth.users
role: String (admin, user)
created_at: Timestamp
```

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### **Role-Based Access Control:**

```
ADMIN Role:
✅ /admin → Admin Dashboard
✅ /add-internship → Create simulations
✅ /edit-internship → Edit/Delete simulations
✅ /confirmation → Review submissions
✅ View all students' submissions

USER Role:
✅ /home → Home Dashboard
✅ /internship → View all simulations
✅ /simulation/{id} → View simulation details
✅ /internship/{id}/task/{num} → Do tasks, upload work
✅ /progress → Track own progress
❌ Cannot access /admin, /add-internship, /confirmation
❌ Can only see own submissions
```

### **How Role is Determined:**

1. User signs up via `/signup`
2. Auth account created in `auth.users`
3. Admin must manually add to `user_roles` table with role
4. On login, code fetches role from `user_roles` table
5. Sidebar and routes adjust based on role

---

## 🔒 SECURITY NOTES

⚠️ **Important:**

1. **Always verify role before allowing admin operations**

   ```javascript
   // In protected routes:
   if (role !== "admin") return <Navigate to="/home" />;
   ```

2. **File uploads are validated**

   - Max file size: 10MB
   - Stored in Supabase Storage

3. **RLS Policies should be set:**

   - Users can only see their own submissions
   - Admin can see all submissions

4. **Email verification recommended**
   - Require verified email before access to internship

---

## 🎯 QUICK TEST SCENARIO

```
SCENARIO: Admin adds internship, student completes task

STEP 1: Create admin account
────────────────────────────
→ /signup: admin@test.com, "Admin123!"
→ Add to user_roles: role='admin'
→ /signin: admin@test.com

STEP 2: Admin creates internship
───────────────────────────────
→ Sidebar → "Add Internship"
→ Fill: Title="Web Dev", Category="Software Development"
→ Add Task 1: "Setup Project", Duration="1 hour"
→ Submit
→ Check: simulations & tasks table populated

STEP 3: Create student account
──────────────────────────────
→ /signup: student@test.com, "Student123!"
→ Add to user_roles: role='user'
→ /signin: student@test.com

STEP 4: Student views & starts internship
──────────────────────────────────────────
→ Sidebar → Click "Internship"
→ See internship card for "Web Dev"
→ Click card → View details
→ Click "Start Program"
→ See Task 1 with upload button

STEP 5: Student uploads work
──────────────────────────────
→ Select file (PDF/ZIP)
→ Click "Upload"
→ File stored in submissions bucket
→ user_task_progress.status = "completed"
→ user_task_progress.confirmation_status = "pending"

STEP 6: Admin reviews
─────────────────────
→ /signin: admin@test.com
→ Sidebar → "Task Confirmation"
→ See student's submission
→ Download file
→ Add comment: "Well done!"
→ Click "Approve"
→ user_task_progress.confirmation_status = "confirmed"

STEP 7: Student sees approval
──────────────────────────────
→ /progress
→ See Task 1 with ✅ Confirmed
→ See admin comment
```

---

## 📊 ROUTES SUMMARY

```
PUBLIC Routes (No Auth Required):
  /signup              → Sign up
  /signin              → Login
  /                    → Redirect to /signup

STUDENT Routes (Auth + user role):
  /home                → Dashboard
  /internship          → Simulations list
  /simulation/{id}     → Simulation details
  /internship/{id}/task/{num} → Task page
  /progress            → Track progress

ADMIN Routes (Auth + admin role):
  /admin               → Admin dashboard
  /add-internship      → Create simulation
  /edit-internship     → Manage simulations
  /edit-internship/{id} → Edit specific simulation
  /confirmation        → Review submissions
```

---

**Complete Guide Created:** December 13, 2025  
**Status:** Ready to follow  
**Next Step:** Follow the step-by-step guide above to set up accounts and test the internship module!
