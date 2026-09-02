# API Contract

> Base URL: `http://localhost:3000/v1` · Auth: `Authorization: Bearer <accessToken>`

## Create user (Register)

**POST /v1/users**

Creates a new user. The _Confirm_ fields are used for validation only (must match their base field) and are NOT persisted in the database.

### Request — Body (application/json)

{
"email": "user@example.com",
"emailConfirm": "user@example.com",
"password": "secretoSeguro123",
"passwordConfirm": "secretoSeguro123",
"name": "Juan Pérez"
}

### Response 201 Created

{ "email": "user@example.com", "message": "User created successfully" }
Header: Location: /v1/users/{id}

### Errors

{ "error": { "code": "USER_ALREADY_EXISTS", "message": "The user already exists in the system", "details": {} } }
{ "error": { "code": "VALIDATION_ERROR", "message": "Please provide a valid user format", "details": {} } }: { "code": "VALIDATION_ERROR", "message": "Please provide a valid user format", "details": {} }
