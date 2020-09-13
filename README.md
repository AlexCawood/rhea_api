# Rhea Api

## API calls

## Auth Api Calls

### Auth signup
post request
http://localhost:3000/api/auth/signup

```
{
	    "prof_firstname":"fred",
	   "prof_lastname": "manson",
	   "usr_email": "fred@Yahoo.com",
	   "prof_gender":"M",
	   "prof_bio": "idiot",
	   "prof_dob": "1981-01-05",
	   "prof_image_loc":null,
	   "prof_edu_fac": null,
	   "prof_qualification": null,
	   "prof_grad_year": null,
	   "prof_is_grad": false,
	   "usr_hash": "12345678"
}
```

### Auth Sign in
post request
http://localhost:3000/api/auth/signin

```
{
	"usr_email": "Bert@Yahoo.com",
	"usr_hash": "12345678"
}
```

## Profile Api Calls

### Get profile data
get request
http://localhost:5000/api/profile/

### Add profile picture:
Forum Post request
http://localhost:3000/api/profile/

-prof_id

-file_name (this should be the users email address)

-image


### Edit Profile:
put request
http://localhost:5000/api/profile/edit/:proj_id

```
 {
        "prof_firstname":"fred",
           "prof_lastname": "manson",
           "prof_gender":"M",
           "prof_bio": "idiot",
           "prof_dob": "1981-01-05",
           "prof_image_loc":null,
           "prof_edu_fac": null,
           "prof_qualification": null,
           "prof_grad_year": null,
           "prof_is_grad": false
           
    }
```

### Deactivate Profile
delete request
http://localhost:3000/api/profile/


## Project API calls

### Create Project 
Post Request
http://localhost:3000/api/project/addproject

```
{
	"proj_name":"Kellys project",
	"proj_bio":"a pokemon project",
	"proj_prof_id":3
}
```


### Get all project
get request
http://localhost:3000/api/project/

### get user Projects
get request
http://localhost:3000/api/project/all

### Get project by id
get request
http://localhost:3000/api/project/:id

### Edit project
put request
http://localhost:3000/api/project/:id/edit

Edit details of the project that has already been created. 

Must send project ID and the project profile ID to the backend. Then can send name of field to edit as the key and the edit of that field as its value.

{
    "proj_id":"13",
	"proj_name":"Kell's 13",
	"proj_bio":"Something something pokemon",
	"proj_prof_id":4
}

### Search Projects
get Request
http://localhost:5000/api/project/search/:searchterm

### Deactivate project
delete request
http://localhost:3000/api/project/:id

### Create Tags
Post request
http://localhost:3000/api/project/addtags

```
{
	"tag_name_1":"Sick",
	"tag_name_2":"cool",
	"tag_proj_id":"10"
}
```

### Get tags
Get request
http://localhost:3000/api/project/tags/:proj_id

### Deactivate tag
Delete request
http://localhost:3000/api/project/:id/edit/tag

```
{
    "tag_name_2": "awesome",
    "tag_name_3": "radical"
}

```

### Create Media
Post request
http://localhost:3000/api/media/addmedia

Creating the meta data for the image. This meta data is used when uploading an image.

```
{
    "proj_id": 10,
    "med_media": [
        {
            "med_location": "/media/project_name",
            "med_title": "Test Post of image",
            "med_descp": "The cat in the hat sat on the matt",
            "med_type": "image",
            "med_position": 0,
            "med_proj_id": 10
        },
        {
            "med_location": "/media/project_name",
            "med_title": "Test 2 Post of image",
            "med_descp": "The rat in the cat sat on the fat",
            "med_type": "image",
            "med_position": 0,
            "med_proj_id": 10
        }
    ]
}
```

### Add image 
Form Post request
http://localhost:3000/api/media/addmedia/image

has to be a form request. submit a form request for each image.

	- proj_id
	- file_name
	- image **this is a file uploaded through the browser**

### Get Media
Get request, Id is the project ID
http://localhost:3000/api/media/:id

### Get Image
Get request, id is the project ID and med_id is the media ID
http://localhost:3000/api/media/:id/:med_id

### Edit Media
put request, id is the project ID
http://localhost:3000/api/media/:id

```
{
    "proj_id": 16,
    "med_media": [
        {
            "med_id":"19",
            "med_location": null,
            "med_title": null,
            "med_descp": "One bad ass pic",
            "med_type": null,
            "med_position": 1,
            "med_proj_id": 13
        }
    ]
}
```



### Delete Media
Delete request. id is the project ID
http://localhost:3000/api/media/:id

need to pass the media ID to delete and the project id

```

{
            "med_id":"1",
            "med_proj_id": 13
}
```


