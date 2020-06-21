# rhea_api

## API calls

## Auth Api Calls

### Auth signup
post request
http://localhost:3000/api/auth/signup

### Auth Sign in
post request
http://localhost:3000/api/auth/signin

## Profile Api Calls

### Get profile data
get request

### Edit Project:
put request
http://localhost:5000/api/profile/edit/:proj_id

## Project API calls

### Create Project 
Post Request
http://localhost:3000/api/project/addproject


### Get all project
get request
http://localhost:3000/api/project/

### get user Projects
get request
http://localhost:3000/api/project/all

### Get project by id
get request
http://localhost:3000/api/project/:id

### Edit project
put request
http://localhost:3000/api/project/:id/edit

### Search Projects
get Request
http://localhost:5000/api/project/search/:searchterm

### Deactivate project
delete request

### Create Tags
Post request
http://localhost:3000/api/project/addtags

### Get tags
Get request
http://localhost:3000/api/project/tags/:proj_id

### Deactivate tag
http://localhost:3000/api/project/:id/edit/tag

### Create Media
Post request
http://localhost:3000/api/project/addmedia

### Add image 
Form Post request
http://localhost:5000/api/project/addmedia/image

### Get Media
Get request
http://localhost:5000/api/project/:id/media

### Edit Media
put request
http://localhost:5000/api/project/:id/edit/media

### Delete Media
Delete request
http://localhost:5000/api/project/:id/rem/media



