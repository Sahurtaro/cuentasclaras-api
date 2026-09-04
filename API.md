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

## Create household

**POST /v1/households**

Creates a new household. The creator is automatically assigned the `admin` role. An `inviteCode` is generated so the creator can share it with other users.

### Request — Body (application/json)

{
"name": "Casa de playa"
}

### Response 201 Created

{
"id": "<uuid>",
"name": "Casa de playa",
"inviteCode": "K7xQ2pRz",
"role": "admin"
}
Header: Location: /v1/households/{id}

### Errors

{ "error": { "code": "UNAUTHORIZED", "message": "Authentication required", "details": {} } }
{ "error": { "code": "VALIDATION_ERROR", "message": "Please provide a valid household format", "details": {} } }

## Join household

**POST /v1/households/join**

Joins a household using its `inviteCode`. The user becomes a `member`.

### Request — Body (application/json)

{
"inviteCode": "K7xQ2pRz"
}

### Response 200 OK

{
"id": "<uuid>",
"name": "Casa de playa",
"role": "member"
}

### Errors

{ "error": { "code": "UNAUTHORIZED", "message": "Authentication required", "details": {} } }
{ "error": { "code": "INVALID_INVITE_CODE", "message": "The invite code is invalid or the household no longer exists", "details": {} } }
{ "error": { "code": "ALREADY_MEMBER", "message": "The user is already a member of this household", "details": {} } }
{ "error": { "code": "VALIDATION_ERROR", "message": "Please provide a valid invite code", "details": {} } }

## List households

**GET /v1/households**

Lists the households the authenticated user belongs to, with their role in each. The `inviteCode` is included only when the user is `admin` in that household.

### Response 200 OK

{
"households": [
  { "id": "<uuid>", "name": "Casa de playa", "role": "admin", "inviteCode": "K7xQ2pRz" },
  { "id": "<uuid>", "name": "Depto centro", "role": "member" }
]
}

### Errors

{ "error": { "code": "UNAUTHORIZED", "message": "Authentication required", "details": {} } }

## Get household detail

**GET /v1/households/:id**

Returns the household and its members. The `inviteCode` is included only when the authenticated user is `admin` in that household.

### Response 200 OK

{
"id": "<uuid>",
"name": "Casa de playa",
"inviteCode": "K7xQ2pRz",
"members": [
  { "id": "<uuid>", "name": "Juan Pérez", "email": "user@example.com", "role": "admin", "joinedAt": "2026-09-02T12:00:00Z" },
  { "id": "<uuid>", "name": "Ana López", "email": "ana@example.com", "role": "member", "joinedAt": "2026-09-03T09:30:00Z" }
]
}

### Errors

{ "error": { "code": "UNAUTHORIZED", "message": "Authentication required", "details": {} } }
{ "error": { "code": "NOT_FOUND", "message": "Household not found", "details": {} } }
{ "error": { "code": "FORBIDDEN", "message": "You are not a member of this household", "details": {} } }
{ "error": { "code": "VALIDATION_ERROR", "message": "Please provide a valid household id", "details": {} } }

## Create expense

**POST /v1/households/:householdId/expenses**

Creates an expense in a household. If no `splits` are provided, the amount is split EQUAL among all current members. The requester is the `paidBy` unless overridden.

Money amounts (`amount`, split `amount`) are integers in COP. For `PERCENTAGE`, sum of `percent` must equal 100 and split `amount` is omitted/derived. For `EXACT`, every member must have a split with an explicit `amount`.

### Request — Body (application/json)

{
"description": "Mercado semanal",
"amount": 30000,
"paidBy": "<userId>",
"date": "2026-09-04T12:00:00Z",
"strategy": "EQUAL",
"title": "Compras",
"splits": [
  { "userId": "<uuid1>", "amount": 10000 },
  { "userId": "<uuid2>", "amount": 20000 }
]
}

### Response 201 Created

{
"id": "<uuid>",
"householdId": "<uuid>",
"description": "Mercado semanal",
"amount": 30000,
"paidBy": "<userId>",
"date": "2026-09-04T12:00:00Z",
"strategy": "EQUAL",
"title": "Compras",
"splits": [
  { "id": "<uuid>", "userId": "<uuid1>", "amount": 10000, "paid": false },
  { "id": "<uuid>", "userId": "<uuid2>", "amount": 20000, "paid": false }
]
}

### Errors

{ "error": { "code": "UNAUTHORIZED", "message": "Authentication required", "details": {} } }
{ "error": { "code": "NOT_FOUND", "message": "Household not found", "details": {} } }
{ "error": { "code": "FORBIDDEN", "message": "You are not a member of this household", "details": {} } }
{ "error": { "code": "USER_NOT_MEMBER", "message": "One or more splits reference a user that is not a member of this household", "details": {} } }
{ "error": { "code": "INVALID_SPLIT", "message": "The splits do not match the selected strategy", "details": {} } }
{ "error": { "code": "PERCENTAGE_MISMATCH", "message": "The percentages must sum to 100", "details": {} } }
{ "error": { "code": "VALIDATION_ERROR", "message": "Please provide a valid expense format", "details": {} } }

## List expenses

**GET /v1/households/:householdId/expenses**

Lists the expenses of a household, newest first.

### Response 200 OK

{
"expenses": [
  {
    "id": "<uuid>",
    "description": "Mercado semanal",
    "amount": 30000,
    "paidBy": "<userId>",
    "date": "2026-09-04T12:00:00Z",
    "strategy": "EQUAL",
    "title": "Compras"
  }
]
}

### Errors

{ "error": { "code": "UNAUTHORIZED", "message": "Authentication required", "details": {} } }
{ "error": { "code": "NOT_FOUND", "message": "Household not found", "details": {} } }
{ "error": { "code": "FORBIDDEN", "message": "You are not a member of this household", "details": {} } }
{ "error": { "code": "VALIDATION_ERROR", "message": "Please provide a valid household id", "details": {} } }

## Get expense detail

**GET /v1/expenses/:id**

Returns an expense with its splits. Only members of the expense's household can access it.

### Response 200 OK

{
"id": "<uuid>",
"householdId": "<uuid>",
"description": "Mercado semanal",
"amount": 30000,
"paidBy": "<userId>",
"date": "2026-09-04T12:00:00Z",
"strategy": "PERCENTAGE",
"title": "Compras",
"splits": [
  { "id": "<uuid>", "userId": "<uuid1>", "amount": 9000, "percent": 30, "paid": false },
  { "id": "<uuid>", "userId": "<uuid2>", "amount": 21000, "percent": 70, "paid": true }
]
}

### Errors

{ "error": { "code": "UNAUTHORIZED", "message": "Authentication required", "details": {} } }
{ "error": { "code": "NOT_FOUND", "message": "Expense not found", "details": {} } }
{ "error": { "code": "FORBIDDEN", "message": "You are not a member of the expense's household", "details": {} } }
{ "error": { "code": "VALIDATION_ERROR", "message": "Please provide a valid expense id", "details": {} } }

## Update expense

**PATCH /v1/expenses/:id**

Updates an expense. Only the user who created it (`paidBy`) can update it. When `splits` are present, they fully replace the existing ones (they are deleted and recreated). The `paidBy` cannot be changed via this endpoint.

### Request — Body (application/json)

{
"description": "Mercado semanal",
"amount": 35000,
"strategy": "EQUAL",
"title": "Compras"
}

### Response 200 OK

{
"id": "<uuid>",
"householdId": "<uuid>",
"description": "Mercado semanal",
"amount": 35000,
"paidBy": "<userId>",
"date": "2026-09-04T12:00:00Z",
"strategy": "EQUAL",
"title": "Compras",
"splits": [
  { "id": "<uuid>", "userId": "<uuid1>", "amount": 17500, "paid": false },
  { "id": "<uuid>", "userId": "<uuid2>", "amount": 17500, "paid": false }
]
}

### Errors

{ "error": { "code": "UNAUTHORIZED", "message": "Authentication required", "details": {} } }
{ "error": { "code": "NOT_FOUND", "message": "Expense not found", "details": {} } }
{ "error": { "code": "FORBIDDEN", "message": "You are not the creator of this expense", "details": {} } }
{ "error": { "code": "INVALID_SPLIT", "message": "The splits do not match the selected strategy", "details": {} } }
{ "error": { "code": "PERCENTAGE_MISMATCH", "message": "The percentages must sum to 100", "details": {} } }
{ "error": { "code": "VALIDATION_ERROR", "message": "Please provide a valid expense format", "details": {} } }

## Delete expense

**DELETE /v1/expenses/:id**

Deletes an expense and all its splits. Only the user who created it (`paidBy`) can delete it.

### Response 204 No Content

(empty)

### Errors

{ "error": { "code": "UNAUTHORIZED", "message": "Authentication required", "details": {} } }
{ "error": { "code": "NOT_FOUND", "message": "Expense not found", "details": {} } }
{ "error": { "code": "FORBIDDEN", "message": "You are not the creator of this expense", "details": {} } }
{ "error": { "code": "VALIDATION_ERROR", "message": "Please provide a valid expense id", "details": {} } }

## Mark split as paid

**PATCH /v1/expense-splits/:expenseId/:userId**

Marks a user's split of an expense as paid (or unpaid). Only the user themself or an `admin` of the expense's household can change the `paid` status.

### Request — Body (application/json)

{
"paid": true
}

### Response 200 OK

{
"id": "<uuid>",
"expenseId": "<uuid>",
"userId": "<uuid1>",
"amount": 9000,
"percent": 30,
"paid": true
}

### Errors

{ "error": { "code": "UNAUTHORIZED", "message": "Authentication required", "details": {} } }
{ "error": { "code": "NOT_FOUND", "message": "Expense or split not found", "details": {} } }
{ "error": { "code": "FORBIDDEN", "message": "You are not the owner of this split or an admin of the household", "details": {} } }
{ "error": { "code": "VALIDATION_ERROR", "message": "Please provide a valid paid value", "details": {} } }
