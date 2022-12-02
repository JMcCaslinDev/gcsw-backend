# GCSW Backend

This is the backend component of the Greenfield Community Science Workshop Database Project, created as part the service learning requirement for CST-462S at California State University, Monterey Bay.

## How to Run

	npm start

# REST API Endpoints

These are the API endpoints for the app.

## Participants `/api/participants`

Endpoints for making requests for participant collection in the MongoDB database.

### Get All Participants

#### Request

`GET /`

#### Response

	List of all participants in the `participants collection`.
	
### Get a Participant

#### Requests

`GET /id/{object_id}`<br>
`GET /participant_id/{participant_id}`

	Get a specific participant via their unique document ObjectID or their custom ParticipantID.
	
### Get Attendance

#### Request

`GET /date/{date}`

#### Response

### Sign in a Participant

#### Request

`POST /signin`

#### Response
