# GCSW Backend

This is the backend component of the Greenfield Community Science Workshop Database Project, created as part the service learning requirement for CST-462S at California State University, Monterey Bay.

## How to Run Locally 

	npm start

Creates server on `http://localhost:6060`
	
## Live Heroku Link

`https://gcsw-backend.herokuapp.com`

## Database Schema

## REST API Endpoints

These are the API endpoints for the application.

## Participants `/api/participants`

Endpoints for making requests for participant collection in the MongoDB database.

### GET All Participants

#### Request

`/` <b>Protected Endpoint</b>

Returns a list of all participants currently registered in the database along with their metadata.
	
#### HEADER

##### Authorization	
Bearer {{accessToken}}
	
### GET a Participant

#### Request 1

`/id/{{object_id}}` <b>Protected Endpoint</b>

Returns a specific participant via their unique MongoDB document ObjectID.

#### HEADER

##### Authorization	
Bearer {{accessToken}}

#### Request 2

`/participant_id/{{participant_id}}`

Returns a specific participant via their custom participant_id.

#### Response
	
### GET Attendance by Date

#### Request

`/date/{date}` <b>Protected Endpoint </b>

Returns a list of participants who have signed in on the given date. Date format is `Mon Dec 05 2022`.

#### HEADER

##### Authorization	
Bearer {{accessToken}}

### POST Sign In a Participant

#### Request

`/signin`

Signs in a participant for the day. If it is their first time signing in, they are saved as a new participant. If they have signed in before, the current sign-in date is added to their array of dates_with_objectives.

#### Body

	{{participant_id}}
	The participant's custom ID created by the staff.
	
	{{first_name}}
	The participant's first name.
	
	{{last_name}}
	The participant's last name.
	
	{{gender}}
	The participant's gender identity.
	
	{{age}}
	The participant's age.
	
	{{school}}
	The school the participant is currently attending.
	
	{{date}}
	The date that the participant is being signed in.
	
	{{objective}}
	The participant's objective of the day.

#### Response

	Participant added! OR Participant signed in

### PUT Update a Participant

#### Request

`/edit/{{object_id}}` <b>Protected Endpoint</b>

Updates an already registered participant's information.

#### Body

	{{participant_id}}
	The participant's custom ID created by the staff.
	
	{{first_name}}
	The participant's first name.
	
	{{last_name}}
	The participant's last name.
	
	{{gender}}
	The participant's gender identity.
	
	{{age}}
	The participant's age.
	
	{{school}}
	The school the participant is currently attending.

#### Response

	Participant updated!

#### HEADER

##### Authorization	
Bearer {{accessToken}}

### PUT Delete Participant Sign-in Entry

#### Request

`/delete_entry/{{object_id}}/{{date}}` <b>Protected Endpoint</b>

Deletes an entry from the participant's dates_with_objectives array with the given date parameter. Participant is found via their MongoDB document Object ID. This endpoint does <b>NOT</b> permanently delete a participant.

#### Response

	Participant entry deleted!
	
#### HEADER

##### Authorization	
Bearer {{accessToken}}

### DELETE a Participant

#### Request

`/delete/{{object_id}}` <b>Protected Endpoint</b>

Permanently deletes a participant from the database along with all of their metadata. Participant is found via their MongoDB document Object ID.

#### Response

	Participant deleted!
	
#### HEADER

##### Authorization	
Bearer {{accessToken}}
