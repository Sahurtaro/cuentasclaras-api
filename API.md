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
{ "error": { "code": "VALIDATION_ERROR", "message": "Please provide a valid user format", "details": {} } }

## Log in

**POST /v1/auth/login**

Authenticates a user and returns access and refresh tokens. The access token must be sent in the `Authorization: Bearer <accessToken>` header for protected endpoints.

### Request — Body (application/json)

{
"email": "user@example.com",
"password": "secretoSeguro123"
}

### Response 200 OK

{ "accessToken": "<jwt>", "refreshToken": "<jwt>" }

### Errors

{ "error": { "code": "INVALID_CREDENTIALS", "message": "Email or password is incorrect", "details": {} } }
{ "error": { "code": "VALIDATION_ERROR", "message": "Please provide a valid login format", "details": {} } }

## Get user profile

**GET /v1/users/:id**

Returns the profile of the authenticated user. Only the user themselves can access this endpoint (the `:id` must match the authenticated user). The password is never returned.

### Response 200 OK

{ "id": "<uuid>", "email": "user@example.com", "name": "Juan Pérez" }

### Errors

{ "error": { "code": "FORBIDDEN", "message": "You are not authorized to access this user's profile", "details": {} } }
{ "error": { "code": "NOT_FOUND", "message": "User not found", "details": {} } }
{ "error": { "code": "UNAUTHORIZED", "message": "Authentication required", "details": {} } }
{ "error": { "code": "VALIDATION_ERROR", "message": "Please provide a valid user id", "details": {} } }

## Refresh token

**POST /v1/auth/refresh**

Exchanges a valid, non-expired refresh token for a new access token (and optionally a renewed refresh token), without requiring the user to log in again. The identity is verified from the JWT signature, which embeds the user id.

### Request — Body (application/json)

{
"refreshToken": "<jwt>"
}

### Response 200 OK

{ "accessToken": "<jwt>", "refreshToken": "<jwt>" }

### Errors

{ "error": { "code": "INVALID_REFRESH_TOKEN", "message": "The refresh token is invalid or has expired", "details": {} } }
{ "error": { "code": "VALIDATION_ERROR", "message": "Please provide a valid refresh token", "details": {} } }
