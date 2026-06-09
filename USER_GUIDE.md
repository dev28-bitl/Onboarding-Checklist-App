# Onboarding Checklist App - User Guide

This guide explains the main frontend and backend features of the Onboarding Checklist App.

## 1. Product Overview

The app helps teams manage onboarding using role-based access:

- Admin: full operational control
- Manager: template and assignment operations
- Developer: checklist execution

Core capabilities:

- Authentication with JWT
- Template-based checklist assignment
- Task progress tracking
- Team and progress reporting

## 2. Frontend Features

Frontend location: `onboarding-frontend/`

### 2.1 Authentication Screens

- Login page
  - Sign in with email and password
  - Displays validation and API error messages
- Register page
  - Create role-based user (`admin`, `manager`, `developer`)

### 2.2 Dashboard (Role-Aware)

After login, users are redirected to the dashboard with role-specific sections.

- Shared for all users:
  - Personal checklist overview
  - Task summary (total/completed/pending)
  - Checklist cards with progress bars
  - Task completion toggles (checkboxes)

- Manager/Admin dashboard additions:
  - Create template panel
  - Assign template to developer
  - Manage templates (edit/delete)
  - Team status report
  - Progress report
  - Selected developer checklist summary

### 2.3 Template Management (UI)

- Create template with title, description, and task set
- Edit template title and description
- Delete template

Note: task-level template editing is supported by backend API, while the current UI primarily focuses on title/description edits.

### 2.4 Checklist Interaction

- Users view their checklist cards
- Each task can be marked complete/incomplete
- Progress bar updates as tasks are completed

## 3. Backend Features

Backend location: `onboarding-backend/`

### 3.1 Authentication & Authorization

- JWT-based authentication
- Password hashing and verification
- Role-based authorization checks

Roles:

- `admin`
- `manager`
- `developer`

### 3.2 Auth APIs

- `POST /api/auth/register` - register user
- `POST /api/auth/login` - login and get token
- `GET /api/auth/me` - current user profile
- `GET /api/auth/developers` - list developers (admin/manager)

### 3.3 Template APIs

- `GET /api/templates` - list templates (authenticated users)
- `POST /api/templates` - create template (admin/manager)
- `PUT /api/templates/{id}` - update template (admin/manager)
- `DELETE /api/templates/{id}` - delete template (admin/manager)

### 3.4 Checklist APIs

- `POST /api/checklists/assign` - assign template to user (admin/manager)
- `GET /api/checklists/user/{id}` - get user checklists
  - Developers can only access their own checklists
- `PUT /api/checklists/task/{id}` - update task completion/notes
  - Developers: own tasks only
  - Managers/Admins: can update across users

### 3.5 Reports APIs

- `GET /api/reports/progress` - checklist progress report (admin/manager)
- `GET /api/reports/team-status` - team status summary (admin/manager)

### 3.6 Health Endpoint

- `GET /health` - service health check

## 4. Role Matrix

### Admin

- Can create/edit/delete templates
- Can assign checklists
- Can view reports
- Can manage all users operationally through available endpoints

### Manager

- Can create/edit/delete templates
- Can assign checklists to developers
- Can view team and progress reports

### Developer

- Can view own checklists only
- Can update own checklist tasks
- Cannot assign templates
- Cannot access manager/admin report endpoints

## 5. Typical User Flows

### 5.1 Manager/Admin Flow

1. Login
2. Create template
3. Select developer
4. Assign template
5. Monitor team progress from reports

### 5.2 Developer Flow

1. Login
2. Open assigned checklist(s)
3. Mark tasks complete
4. Track completion progress in dashboard

## 6. Deployment Notes

- Frontend and backend can run via Docker Compose locally.
- Ubuntu VPS deployment steps are documented in `DEPLOYMENT_UBUNTU_VPS.md`.
- For production, ensure:
  - Proper `SECRET_KEY`
  - Production database configuration
  - Correct frontend API base URL
  - HTTPS enabled at the reverse proxy

## 7. Troubleshooting Quick Tips

- Login fails:
  - Verify user exists in production database
  - Check `/api/auth/login` response status and message
- Template create/assign fails:
  - Confirm role is `admin` or `manager`
- Data not visible on dashboard:
  - Verify token validity and role permissions
  - Check backend and reverse-proxy logs
